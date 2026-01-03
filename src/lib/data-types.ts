// src/lib/data-types.ts
import type { LucideIcon } from 'lucide-react';
import { Book, Brush, Bed, Atom, Bike, Dumbbell, Gift } from 'lucide-react';

export type Recurrence = {
  interval: number;
  unit: 'week' | 'month' | 'year';
  daysOfWeek?: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
};

export type Task = {
  id: string;
  userId: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completed: boolean;
  status: 'active' | 'paused';
  dueDate: Date;
  recurrence?: Recurrence;
  time?: string;
  icon?: string;
};

export type Achievement = {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
  unlocked: boolean;
  dateUnlocked?: Date | string;
  tasksRequired?: number;
  daysRequired?: number;
};

export type PomodoroMode = {
  id: string;
  name: string;
  duration: number;
};

export type PomodoroSettings = {
  modes: PomodoroMode[];
  longBreakInterval: number;
};

export type User = {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  petStyle: string;
  petName: string;
  appLogo?: string;
  frontendLogo?: string;
  pomodoroSettings?: PomodoroSettings;
  // White-labeling and content configuration
  appName: string;
  landingTitle: string;
  landingDescription: string;
  landingCta: string;
  dashboardLink: string;
};

export type Reward = {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  tasksRequired?: number;
  daysRequired?: number;
};

export const iconMap: { [key: string]: LucideIcon } = {
  Learning: Book,
  Creative: Brush,
  Health: Dumbbell,
  School: Atom,
  Activity: Bike,
  Bed: Bed,
  Gift: Gift,
};
