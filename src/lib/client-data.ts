'use client';

import { User, Task, Achievement, Reward, PomodoroSettings } from './data-types';
import { calculateNewXpAndLevel, isTaskForToday } from './logic';

// --- Local Storage Definitions ---

const LOCAL_STORAGE_USER_KEY = 'userProfile-v2';
const LOCAL_STORAGE_TASKS_KEY = 'tasks-v2';
const LOCAL_STORAGE_ACHIEVEMENTS_KEY = 'achievements-v3';
const HARDCODED_USER_ID = 'user_2fP7sW5gR8zX9yB1eA6vC4jK0lM';

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
    frontendLogo: '',
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
    // 1. 成就与进步类
    { id: 'custom-std-study-1', userId: HARDCODED_USER_ID, title: '学习标兵', description: '在学习上表现优异，不仅完成了任务，还展现了极大的热情。', icon: 'Book', unlocked: false },
    { id: 'custom-std-study-2', userId: HARDCODED_USER_ID, title: '知识小达人', description: '掌握了很多新知识，是大家的小百科全书。', icon: 'Book', unlocked: false },
    { id: 'custom-std-study-3', userId: HARDCODED_USER_ID, title: '勤奋好学奖', description: '勤奋刻苦，总是按时完成学习任务。', icon: 'Star', unlocked: false },
    { id: 'custom-std-study-4', userId: HARDCODED_USER_ID, title: '阅读之星', description: '热爱阅读，坚持每天读书的好习惯。', icon: 'Book', unlocked: false },
    { id: 'custom-std-progress-1', userId: HARDCODED_USER_ID, title: '进步奖', description: '虽然起点不同，但每天都在努力进步。', icon: 'Zap', unlocked: false },
    { id: 'custom-std-progress-2', userId: HARDCODED_USER_ID, title: '优异奖', description: '在各项活动中都表现出色。', icon: 'Trophy', unlocked: false },
    { id: 'custom-std-talent-1', userId: HARDCODED_USER_ID, title: '艺术小才子', description: '拥有独特的艺术眼光及绘画天赋。', icon: 'Brush', unlocked: false },
    { id: 'custom-std-talent-2', userId: HARDCODED_USER_ID, title: '音乐小天才', description: '对音乐有敏锐的感知力。', icon: 'Play', unlocked: false },
    { id: 'custom-std-talent-3', userId: HARDCODED_USER_ID, title: '运动小健将', description: '充满活力，热爱运动。', icon: 'Zap', unlocked: false },

    // 2. 品格与行为类
    { id: 'custom-std-char-1', userId: HARDCODED_USER_ID, title: '乐于助人奖', description: '热心肠，总是愿意伸出援手帮助他人。', icon: 'Flower', unlocked: false },
    { id: 'custom-std-char-2', userId: HARDCODED_USER_ID, title: '友爱伙伴奖', description: '与小伙伴们友好相处，团结友爱。', icon: 'Flower', unlocked: false },
    { id: 'custom-std-char-3', userId: HARDCODED_USER_ID, title: '善良小天使', description: '心地善良，对待这一世界充满爱心。', icon: 'Flower', unlocked: false },
    { id: 'custom-std-char-4', userId: HARDCODED_USER_ID, title: '尊老爱幼奖', description: '尊敬长辈，爱护幼小，懂事有礼貌。', icon: 'ShieldCheck', unlocked: false },
    { id: 'custom-std-courage-1', userId: HARDCODED_USER_ID, title: '勇敢宝宝', description: '面对困难不退缩，勇敢挑战自己。', icon: 'Swords', unlocked: false },
    { id: 'custom-std-courage-2', userId: HARDCODED_USER_ID, title: '责任小卫士', description: '对自己做的事情负责，有担当。', icon: 'ShieldCheck', unlocked: false },
    { id: 'custom-std-behavior-1', userId: HARDCODED_USER_ID, title: '勤劳小蜜蜂', description: '不怕脏不怕累，积极做家务。', icon: 'Bug', unlocked: false },
    { id: 'custom-std-behavior-2', userId: HARDCODED_USER_ID, title: '礼貌小公民', description: '言行举止文明，见人主动问好。', icon: 'Star', unlocked: false },
    { id: 'custom-std-behavior-3', userId: HARDCODED_USER_ID, title: '好习惯养成奖', description: '坚持每天的好习惯，自律又优秀。', icon: 'ShieldCheck', unlocked: false },

    // 3. 创意与探索类
    { id: 'custom-std-create-1', userId: HARDCODED_USER_ID, title: '小发明家', description: '脑袋里装满了奇思妙想，总能想出新点子。', icon: 'Zap', unlocked: false },
    { id: 'custom-std-create-2', userId: HARDCODED_USER_ID, title: '创意小能手', description: '动手能力强，能做出很有创意的作品。', icon: 'Brush', unlocked: false },
    { id: 'custom-std-explore-1', userId: HARDCODED_USER_ID, title: '探险家奖', description: '对世界充满好奇，勇于探索未知。', icon: 'Mountain', unlocked: false },
    { id: 'custom-std-art-1', userId: HARDCODED_USER_ID, title: '美术小能手', description: '画笔下的世界五彩斑斓。', icon: 'Brush', unlocked: false },
    { id: 'custom-std-art-2', userId: HARDCODED_USER_ID, title: '手工达人', description: '心灵手巧，能做出精致的手工。', icon: 'Brush', unlocked: false },
    { id: 'custom-std-art-3', userId: HARDCODED_USER_ID, title: '故事大王', description: '能讲出动听的故事，语言表达能力强。', icon: 'Book', unlocked: false },

    // 4. 综合与激励类
    { id: 'custom-std-comp-1', userId: HARDCODED_USER_ID, title: '闪亮小天使', description: '你是大家眼中的小太阳，温暖又闪亮。', icon: 'Gem', unlocked: false },
    { id: 'custom-std-comp-2', userId: HARDCODED_USER_ID, title: '未来之星', description: '潜力无限，未来可期。', icon: 'Star', unlocked: false },
    { id: 'custom-std-comp-3', userId: HARDCODED_USER_ID, title: '小小领袖', description: '有号召力，能带领大家一起进步。', icon: 'Trophy', unlocked: false },
    { id: 'custom-std-comp-4', userId: HARDCODED_USER_ID, title: '全能宝贝', description: '德智体美劳全面发展。', icon: 'Star', unlocked: false },
    { id: 'custom-std-honor-1', userId: HARDCODED_USER_ID, title: '最受喜爱奖', description: '大家都非常喜欢你。', icon: 'Flower', unlocked: false },
    { id: 'custom-std-honor-2', userId: HARDCODED_USER_ID, title: '魅力之星', description: '独特的人格魅力，让人印象深刻。', icon: 'Star', unlocked: false },

    // 5. 特殊节日与国际认证
    { id: 'custom-std-fest-1', userId: HARDCODED_USER_ID, title: '家长选择奖', description: 'Parents\' Choice Awards - 爸爸妈妈最满意的表现。', icon: 'Trophy', unlocked: false },
    { id: 'custom-std-fest-2', userId: HARDCODED_USER_ID, title: '六一快乐之星', description: '儿童节里最快乐的那颗星。', icon: 'Star', unlocked: false },
    { id: 'custom-std-fest-3', userId: HARDCODED_USER_ID, title: '世界儿童日小小贡献者', description: '为世界增添了一份美好。', icon: 'Mountain', unlocked: false },
];

// --- Local Storage Helper Functions ---
const readFromLocalStorage = (key: string): any => {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    try {
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error(`Failed to parse localStorage item: ${key}`, e);
        return null;
    }
};

const writeToLocalStorage = (key: string, data: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
    const eventName = key.replace(/-v\d+$/, '') + 'Updated';
    window.dispatchEvent(new CustomEvent(eventName));
};


// --- Fallback Client-side Data Functions ---

export async function getClientUser(): Promise<User> {
    const user = readFromLocalStorage(LOCAL_STORAGE_USER_KEY) || getDefaultUser();
    return Promise.resolve(user);
}

export async function updateClientUser(newUserData: Partial<Omit<User, 'id'>>) {
    const currentUser = await getClientUser();
    const updatedUser = { ...currentUser, ...newUserData };
    writeToLocalStorage(LOCAL_STORAGE_USER_KEY, updatedUser);
    return Promise.resolve();
}

export async function getClientTasks(): Promise<Task[]> {
    const tasks = (readFromLocalStorage(LOCAL_STORAGE_TASKS_KEY) || getDefaultTasks());
    return Promise.resolve(tasks.map((t: any) => ({ ...t, dueDate: new Date(t.dueDate) })));
}

export async function saveClientTask(taskData: Omit<Task, 'id' | 'userId'>, taskId?: string) {
    let tasks = await getClientTasks();
    if (taskId) {
        tasks = tasks.map(t => t.id === taskId ? { ...t, ...taskData, id: taskId, userId: HARDCODED_USER_ID } : t);
    } else {
        tasks.unshift({ ...taskData, id: `local-${Date.now()}`, userId: HARDCODED_USER_ID });
    }
    writeToLocalStorage(LOCAL_STORAGE_TASKS_KEY, tasks);
}

export async function deleteClientTask(taskId: string) {
    let tasks = await getClientTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    writeToLocalStorage(LOCAL_STORAGE_TASKS_KEY, tasks);
}

export async function completeClientTaskAndUpdateXP(task: Task, completed: boolean) {
    let currentUser = await getClientUser();
    let allTasks = await getClientTasks();
    const originalTask = allTasks.find((t: Task) => t.id === task.id);
    if (!originalTask || completed === originalTask.completed) return;

    const { newXp, newLevel, newXpToNextLevel, newPetStyle } = calculateNewXpAndLevel(
        currentUser.xp,
        currentUser.level,
        currentUser.xpToNextLevel,
        originalTask.difficulty,
        completed
    );

    await updateClientUser({
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNextLevel,
        petStyle: newPetStyle,
    });

    const updatedTasks = allTasks.map((t: Task) => t.id === task.id ? { ...t, completed } : t);
    writeToLocalStorage(LOCAL_STORAGE_TASKS_KEY, updatedTasks);
}

export async function getClientAchievements(): Promise<Achievement[]> {
    const achievements = readFromLocalStorage(LOCAL_STORAGE_ACHIEVEMENTS_KEY) || getDefaultAchievements();
    return Promise.resolve(achievements.map((a: any) => ({ ...a, dateUnlocked: a.dateUnlocked ? new Date(a.dateUnlocked) : undefined })));
}

export async function updateClientAchievements(newAchievements: Achievement[]) {
    writeToLocalStorage(LOCAL_STORAGE_ACHIEVEMENTS_KEY, newAchievements);
    return Promise.resolve();
}

export async function getClientTodaysTasks(): Promise<Task[]> {
    const allTasks = await getClientTasks();
    if (!allTasks) return [];

    const today = new Date();
    const todayString = today.toDateString();
    const dayMapping = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
    const todayDay = dayMapping[today.getDay()];

    return allTasks.filter(isTaskForToday);
}

// --- Rewards Data ---

const LOCAL_STORAGE_REWARDS_KEY = 'rewards-v1';

export const getDefaultRewards = (): Reward[] => [
    // 物质奖励
    { id: 'reward-mat-1', userId: HARDCODED_USER_ID, title: '零食', description: '比如冰淇淋、巧克力或者你喜欢的零食。', icon: 'Gift', tasksRequired: 5 },
    { id: 'reward-mat-2', userId: HARDCODED_USER_ID, title: '小玩具', description: '一个小乐高、玩偶或者小汽车。', icon: 'Gift', tasksRequired: 10 },
    { id: 'reward-mat-3', userId: HARDCODED_USER_ID, title: '文具', description: '一支漂亮的笔、新本子或者贴纸。', icon: 'Brush', tasksRequired: 5 },
    { id: 'reward-mat-4', userId: HARDCODED_USER_ID, title: '心仪的图书', description: '去书店挑一本你喜欢的书。', icon: 'Book', tasksRequired: 15 },
    { id: 'reward-mat-5', userId: HARDCODED_USER_ID, title: '电子产品', description: '增加1小时的游戏时间或者看动画片。', icon: 'Zap', tasksRequired: 20 },
    { id: 'reward-mat-6', userId: HARDCODED_USER_ID, title: '一次外食', description: '吃麦当劳、披萨或者你喜欢的餐厅。', icon: 'Gift', tasksRequired: 10 },

    // 精神/体验奖励
    { id: 'reward-exp-1', userId: HARDCODED_USER_ID, title: '高质量陪伴', description: '与父母一起做游戏、阅读、看电影。', icon: 'Flower', tasksRequired: 0 },
    { id: 'reward-exp-2', userId: HARDCODED_USER_ID, title: '特殊活动', description: '一次主题公园之行、一次“约会”活动、参加兴趣班。', icon: 'Star', tasksRequired: 30 },
    { id: 'reward-exp-3', userId: HARDCODED_USER_ID, title: '自主权', description: '选择晚餐菜单、周末活动安排的权利。', icon: 'Trophy', tasksRequired: 5 },
];

export async function getClientRewards(): Promise<Reward[]> {
    const rewards = readFromLocalStorage(LOCAL_STORAGE_REWARDS_KEY) || getDefaultRewards();
    return Promise.resolve(rewards);
}

export async function addClientReward(reward: Reward) {
    const rewards = await getClientRewards();
    rewards.push(reward);
    writeToLocalStorage(LOCAL_STORAGE_REWARDS_KEY, rewards);
}

export async function updateClientReward(reward: Reward) {
    let rewards = await getClientRewards();
    rewards = rewards.map(r => r.id === reward.id ? reward : r);
    writeToLocalStorage(LOCAL_STORAGE_REWARDS_KEY, rewards);
}

export async function deleteClientReward(rewardId: string) {
    let rewards = await getClientRewards();
    rewards = rewards.filter(r => r.id !== rewardId);
    writeToLocalStorage(LOCAL_STORAGE_REWARDS_KEY, rewards);
}
