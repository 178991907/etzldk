'use server';

import { db, dbInitializationError } from '@/lib/db';
import { users, tasks as tasksSchema, achievements as achievementsSchema } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { User, Task, Achievement, PomodoroSettings } from './data-types';
import { calculateNewXpAndLevel, isTaskForToday } from './logic';
import { kv } from './kv';

// --- Constants ---
const HARDCODED_USER_ID = 'user_2fP7sW5gR8zX9yB1eA6vC4jK0lM';

export async function getStorageStatus() {
    if (dbInitializationError) {
        if (kv.isAvailable()) return 'kv';
        return 'local';
    }
    return 'db';
}

const defaultPomodoroSettings: PomodoroSettings = {
    modes: [
        { id: 'work', name: 'Work', duration: 25 },
        { id: 'shortBreak', name: 'Short Break', duration: 5 },
        { id: 'longBreak', name: 'Long Break', duration: 15 },
    ],
    longBreakInterval: 4,
};

const getDefaultUser = (): User => ({
    id: HARDCODED_USER_ID,
    name: 'Alex',
    avatar: 'avatar1',
    level: 1,
    xp: 75,
    xpToNextLevel: 100,
    petStyle: 'pet1',
    petName: '泡泡',
    appLogo: '',
    pomodoroSettings: defaultPomodoroSettings,
    appName: '儿童自律打卡',
    landingTitle: "Gamify Your Child's Habits",
    landingDescription: 'Turn daily routines and learning into a fun adventure. Motivate your kids with rewards, achievements, and a virtual pet that grows with them.',
    landingCta: 'Get Started for Free',
    dashboardLink: '设置页面',
});

const getDefaultTasks = (): Task[] => {
    const today = new Date();
    return [
        { id: `default-${Date.now()}-1`, userId: HARDCODED_USER_ID, title: 'Read for 20 minutes', category: 'Learning', icon: 'Learning', difficulty: 'Easy', completed: false, status: 'active', dueDate: today, recurrence: { interval: 1, unit: 'week', daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'] }, time: '20:00' },
        { id: `default-${Date.now()}-2`, userId: HARDCODED_USER_ID, title: 'Practice drawing', category: 'Creative', icon: 'Creative', difficulty: 'Medium', completed: false, status: 'active', dueDate: today, recurrence: { interval: 1, unit: 'week', daysOfWeek: ['tue', 'thu'] }, time: '16:30' },
    ];
};

const getDefaultAchievements = (): Achievement[] => [
    { id: `default-${Date.now()}-1`, userId: HARDCODED_USER_ID, title: 'First Mission', description: 'Complete your very first task.', icon: 'Star', unlocked: true, dateUnlocked: new Date(new Date().setDate(new Date().getDate() - 5)) },
    { id: `default-${Date.now()}-2`, userId: HARDCODED_USER_ID, title: 'Task Master', description: 'Complete 10 tasks in total.', icon: 'Trophy', unlocked: true, dateUnlocked: new Date(new Date().setDate(new Date().getDate() - 2)) },
    { id: `default-${Date.now()}-3`, userId: HARDCODED_USER_ID, title: 'Perfect Week', description: 'Complete all your tasks for 7 days in a row.', icon: 'ShieldCheck', unlocked: false },
];


// --- Universal Data Functions ---

// --- User Data ---
const mapDbUserToAppUser = (user: any): User => {
    if (!user) return getDefaultUser();
    const parsedPomodoroSettings = typeof user.pomodoroSettings === 'string'
        ? JSON.parse(user.pomodoroSettings)
        : (user.pomodoroSettings || defaultPomodoroSettings);

    return { ...user, pomodoroSettings: parsedPomodoroSettings };
};

export async function getUser(): Promise<User> {
    if (dbInitializationError) {
        // Try KV first
        if (kv.isAvailable()) {
            const kvUser = await kv.get(`user:${HARDCODED_USER_ID}`);
            if (kvUser) return kvUser;
            // If no KV user, we might want to save default to KV
            const defaultUser = getDefaultUser();
            await kv.put(`user:${HARDCODED_USER_ID}`, defaultUser);
            return defaultUser;
        }
        // If DB down and no KV (server-side context), return default.
        // Client should handle hydration from LocalStorage if needed.
        return getDefaultUser();
    }
    try {
        let user = await db.query.users.findFirst({
            where: eq(users.id, HARDCODED_USER_ID),
        });

        if (!user) {
            const defaultUser = getDefaultUser();
            const dbUser = {
                ...defaultUser,
                pomodoroSettings: defaultUser.pomodoroSettings ? JSON.stringify(defaultUser.pomodoroSettings) : null,
            };
            await db.insert(users).values(dbUser as any);
            user = await db.query.users.findFirst({ where: eq(users.id, HARDCODED_USER_ID) });
        }

        return mapDbUserToAppUser(user);
    } catch (error) {
        console.error("DB Error: Failed to fetch/create user. Falling back.", error);
        return getDefaultUser();
    }
}

export async function updateUser(newUserData: Partial<Omit<User, 'id'>>) {
    if (dbInitializationError) {
        if (kv.isAvailable()) {
            const currentUser = await kv.get(`user:${HARDCODED_USER_ID}`) || getDefaultUser();
            const updatedUser = { ...currentUser, ...newUserData };
            await kv.put(`user:${HARDCODED_USER_ID}`, updatedUser);
            return;
        }
        // Cannot update in server memory only
        return;
    }
    try {
        const dataToUpdate: { [key: string]: any } = { ...newUserData };
        if (newUserData.pomodoroSettings) {
            dataToUpdate.pomodoroSettings = JSON.stringify(newUserData.pomodoroSettings);
        }
        await db.update(users).set(dataToUpdate).where(eq(users.id, HARDCODED_USER_ID));
    } catch (error) {
        console.error("Failed to update user in DB", error);
        throw error;
    }
}

// --- Task Data ---
const mapDbTaskToAppTask = (dbTask: any): Task => ({
    ...dbTask,
    id: dbTask.id.toString(), // Ensure id is a string for consistency
    recurrence: dbTask.recurrence && typeof dbTask.recurrence === 'string' ? JSON.parse(dbTask.recurrence) : dbTask.recurrence,
    dueDate: dbTask.dueDate ? new Date(dbTask.dueDate) : new Date(),
});


export async function getTasks(): Promise<Task[]> {
    if (dbInitializationError) {
        if (kv.isAvailable()) {
            const kvTasks = await kv.get(`tasks:${HARDCODED_USER_ID}`);
            if (kvTasks) return kvTasks.map((t: any) => ({ ...t, dueDate: new Date(t.dueDate) }));
            // Init default tasks
            const defaultTasks = getDefaultTasks();
            await kv.put(`tasks:${HARDCODED_USER_ID}`, defaultTasks);
            return defaultTasks;
        }
        return getDefaultTasks();
    }
    try {
        let userTasks = await db.query.tasks.findMany({ where: eq(tasksSchema.userId, HARDCODED_USER_ID) });
        if (userTasks.length === 0) {
            const defaultTasks = getDefaultTasks().map(t => ({
                ...t,
                userId: HARDCODED_USER_ID,
                recurrence: t.recurrence ? JSON.stringify(t.recurrence) : null,
            }));
            // @ts-ignore - Drizzle handles id for insertion
            await db.insert(tasksSchema).values(defaultTasks.map(({ id, ...rest }) => rest));
            userTasks = await db.query.tasks.findMany({ where: eq(tasksSchema.userId, HARDCODED_USER_ID) });
        }
        return userTasks.map(mapDbTaskToAppTask);
    } catch (error) {
        console.error("DB Error: Failed to fetch tasks. Falling back.", error);
        return getDefaultTasks();
    }
};

export async function completeTaskAndUpdateXP(task: Task, completed: boolean) {
    if (dbInitializationError) {
        if (kv.isAvailable()) {
            // KV Logic for complete task
            const currentUser = await kv.get(`user:${HARDCODED_USER_ID}`) || getDefaultUser();
            const allTasks = await kv.get(`tasks:${HARDCODED_USER_ID}`) || getDefaultTasks();
            const originalTask = allTasks.find((t: Task) => t.id === task.id);

            if (!originalTask || completed === originalTask.completed) return;

            const { newXp, newLevel, newXpToNextLevel, newPetStyle } = calculateNewXpAndLevel(
                currentUser.xp,
                currentUser.level,
                currentUser.xpToNextLevel,
                originalTask.difficulty,
                completed
            );

            const updatedUser = { ...currentUser, xp: newXp, level: newLevel, xpToNextLevel: newXpToNextLevel, petStyle: newPetStyle };
            await kv.put(`user:${HARDCODED_USER_ID}`, updatedUser);

            const updatedTasks = allTasks.map((t: Task) => t.id === task.id ? { ...t, completed } : t);
            await kv.put(`tasks:${HARDCODED_USER_ID}`, updatedTasks);
            return;
        }
        return;
    }

    const currentUser = await getUser();
    const originalTask = await db.query.tasks.findFirst({ where: eq(tasksSchema.id, parseInt(task.id)) });

    if (!originalTask || completed === originalTask.completed) return;

    const { newXp, newLevel, newXpToNextLevel, newPetStyle } = calculateNewXpAndLevel(
        currentUser.xp,
        currentUser.level,
        currentUser.xpToNextLevel,
        originalTask.difficulty,
        completed
    );

    try {
        await updateUser({
            xp: newXp,
            level: newLevel,
            xpToNextLevel: newXpToNextLevel,
            petStyle: newPetStyle,
        });

        await db.update(tasksSchema).set({ completed }).where(eq(tasksSchema.id, parseInt(task.id)));
    } catch (e) {
        console.error("Failed to complete task and update XP in DB", e);
        throw e;
    }
}

export async function saveTask(taskData: Omit<Task, 'id' | 'userId'>, taskId?: string) {
    if (dbInitializationError) {
        if (kv.isAvailable()) {
            let tasks = await kv.get(`tasks:${HARDCODED_USER_ID}`) || getDefaultTasks();
            if (taskId) {
                tasks = tasks.map((t: Task) => t.id === taskId ? { ...t, ...taskData, id: taskId, userId: HARDCODED_USER_ID } : t);
            } else {
                tasks.unshift({ ...taskData, id: `kv-${Date.now()}`, userId: HARDCODED_USER_ID });
            }
            await kv.put(`tasks:${HARDCODED_USER_ID}`, tasks);
            return;
        }
        return;
    }

    const dataForDb = {
        ...taskData,
        userId: HARDCODED_USER_ID,
        recurrence: taskData.recurrence ? JSON.stringify(taskData.recurrence) : null,
        dueDate: taskData.dueDate || new Date(),
    };

    try {
        if (taskId && !isNaN(parseInt(taskId))) {
            await db.update(tasksSchema).set(dataForDb).where(eq(tasksSchema.id, parseInt(taskId, 10)));
        } else {
            // @ts-ignore
            await db.insert(tasksSchema).values(dataForDb);
        }
    } catch (error) {
        console.error("Failed to save task to DB", error);
        throw error;
    }
}


export async function deleteTask(taskId: string) {
    if (dbInitializationError) {
        if (kv.isAvailable()) {
            let tasks = await kv.get(`tasks:${HARDCODED_USER_ID}`) || getDefaultTasks();
            tasks = tasks.filter((t: Task) => t.id !== taskId);
            await kv.put(`tasks:${HARDCODED_USER_ID}`, tasks);
            return;
        }
        return;
    }
    if (taskId && !isNaN(parseInt(taskId))) {
        try {
            await db.delete(tasksSchema).where(eq(tasksSchema.id, parseInt(taskId)));
        } catch (error) {
            console.error("Failed to delete task from DB", error);
            throw error;
        }
    }
}

export async function updateTasks(newTasks: Task[]) {
    // Only implemented for LS via Client Utils
    console.warn("updateTasks is not implemented for DB/KV via data-browser.");
}


// --- Achievement Data ---
const mapDbAchievementToAppAchievement = (a: any): Achievement => ({
    ...a,
    id: a.id.toString(), // Ensure id is a string for consistency
    dateUnlocked: a.dateUnlocked ? new Date(a.dateUnlocked) : undefined
});

export async function getAchievements(): Promise<Achievement[]> {
    if (dbInitializationError) {
        return []; // Client handles fallback
    }
    try {
        let userAchievements = await db.query.achievements.findMany({ where: eq(achievementsSchema.userId, HARDCODED_USER_ID) });
        if (userAchievements.length === 0) {
            const defaultAchievements = getDefaultAchievements().map(a => ({
                ...a,
                userId: HARDCODED_USER_ID,
                dateUnlocked: a.dateUnlocked ? new Date(a.dateUnlocked) : null,
            }));
            // @ts-ignore
            await db.insert(achievementsSchema).values(defaultAchievements.map(({ id, ...rest }) => rest));
            userAchievements = await db.query.achievements.findMany({ where: eq(achievementsSchema.userId, HARDCODED_USER_ID) });
        }
        return userAchievements.map(mapDbAchievementToAppAchievement);
    } catch (error) {
        console.error("DB Error: Failed to fetch achievements. Falling back.", error);
        return [];
    }
}


export async function updateAchievements(newAchievements: Achievement[]) {
    if (dbInitializationError) {
        return;
    }
    try {
        // This is a simplified approach: clear and re-insert for the user.
        await db.delete(achievementsSchema).where(eq(achievementsSchema.userId, HARDCODED_USER_ID));

        if (newAchievements.length > 0) {
            const achievementsToInsert = newAchievements.map(ach => {
                const { id, ...rest } = ach; // Drizzle needs id excluded for auto-increment
                return {
                    ...rest,
                    userId: HARDCODED_USER_ID,
                    dateUnlocked: ach.dateUnlocked ? new Date(ach.dateUnlocked) : null,
                };
            });
            await db.insert(achievementsSchema).values(achievementsToInsert as any);
        }
    } catch (error) {
        console.error("Failed to save achievements to DB", error);
        throw error;
    }
}

// Helper for today's tasks server-side
export async function getTodaysTasks(): Promise<Task[] | undefined> {
    try {
        const allTasks = await getTasks();
        if (!allTasks) return [];
        return allTasks.filter(isTaskForToday);
    } catch (e) {
        console.error("Error in getTodaysTasks", e);
        return [];
    }
}

// Re-export specific client utils only to break old imports if any, 
// OR we can just remove them and fix imports in files.
// Ideally, files should import from client-data.ts now.
