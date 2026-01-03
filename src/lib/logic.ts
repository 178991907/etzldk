
import { PetInfos } from './pets';
import { Task } from './data-types';

export const XP_MAP = { 'Easy': 5, 'Medium': 10, 'Hard': 15 };

export const getPetStyleForLevel = (level: number): string => {
  const sortedPets = [...PetInfos].sort((a, b) => b.unlockLevel - a.unlockLevel);
  const bestPet = sortedPets.find(p => level >= p.unlockLevel);
  return bestPet ? bestPet.id : 'pet1';
};

export function calculateNewXpAndLevel(
  currentXp: number, 
  currentLevel: number, 
  currentXpToNextLevel: number, 
  difficulty: string, 
  completed: boolean
) {
    const xpChange = XP_MAP[difficulty as keyof typeof XP_MAP] || 0;
    let newXp = currentXp + (completed ? xpChange : -xpChange);
    if (newXp < 0) newXp = 0;

    let newLevel = currentLevel;
    let newXpToNextLevel = currentXpToNextLevel;

    // Level up logic
    while (newXp >= newXpToNextLevel) {
        newLevel++;
        newXp -= newXpToNextLevel;
        newXpToNextLevel = Math.floor(newXpToNextLevel * 1.2);
    }

    // Level down logic (optional, arguably we shouldn't level down but if XP drops below 0 relative to current level start...)
    // The current implementation in data-browser.ts only handled leveling up. 
    // If we lose XP, we just stay at current level but lower XP, clamped at 0.
    // However, if we want to reverse level up, it's more complex because we need to know previous level's threshold.
    // For now, let's replicate the existing behavior: only level up.

    return {
        newXp,
        newLevel,
        newXpToNextLevel,
        newPetStyle: getPetStyleForLevel(newLevel)
    };
}

export function isTaskForToday(task: Task): boolean {
    if (task.status !== 'active') return false;

    const today = new Date();
    const todayString = today.toDateString();
    
    // Check recurrence first
    if (task.recurrence) {
        const { unit, daysOfWeek } = task.recurrence;
        // Logic for weekly recurrence
        if (unit === 'week' && daysOfWeek && daysOfWeek.length > 0) {
            const dayMapping = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
            const todayDay = dayMapping[today.getDay()];
            return daysOfWeek.includes(todayDay);
        }
    }
    
    // Fallback to due date check
    // If it has recurrence, we usually check recurrence rule. 
    // But if recurrence doesn't match today, we double check if dueDate is today?
    // The original logic was:
    /*
        if (unit === 'week' && ... ) {
             return daysOfWeek.includes(todayDay);
        }
        return new Date(task.dueDate).toDateString() === todayString;
    */
    // This implies if recurrence is set but not weekly (or weekly but empty days), it falls through to due date.
    // Or if unit is 'week' but today is not in daysOfWeek, it returns false immediately?
    // Wait, the original code:
    /*
       if (unit === 'week' && daysOfWeek && daysOfWeek.length > 0) {
           return daysOfWeek.includes(todayDay);
       }
    */
    // If it enters the if block, it returns. If not (e.g. daily recurrence not implemented or unit='month'), it matches due date.
    // Let's strictly follow original logic to preserve behavior.
    
    // Original:
    /*
        if (task.recurrence) {
            const { unit, daysOfWeek } = task.recurrence;
            if (unit === 'week' && daysOfWeek && daysOfWeek.length > 0) {
                return daysOfWeek.includes(todayDay);
            }
        }
        return new Date(task.dueDate).toDateString() === todayString;
    */

    return new Date(task.dueDate).toDateString() === todayString;
}
