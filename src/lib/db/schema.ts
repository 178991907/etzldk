import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar').notNull(),
  level: integer('level').default(1).notNull(),
  xp: integer('xp').default(0).notNull(),
  xpToNextLevel: integer('xp_to_next_level').default(100).notNull(),
  petStyle: text('pet_style').notNull(),
  petName: text('pet_name').notNull(),
  appLogo: text('app_logo'),
  pomodoroSettings: jsonb('pomodoro_settings'),
  appName: text('app_name'),
  landingTitle: text('landing_title'),
  landingDescription: text('landing_description'),
  landingCta: text('landing_cta'),
  dashboardLink: text('dashboard_link'),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  category: text('category').notNull(),
  difficulty: text('difficulty').notNull(),
  completed: boolean('completed').default(false).notNull(),
  status: text('status', { enum: ['active', 'paused'] }).default('active').notNull(),
  dueDate: timestamp('due_date').notNull(),
  recurrence: jsonb('recurrence'),
  time: text('time'),
});

export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon').notNull(),
  imageUrl: text('image_url'),
  unlocked: boolean('unlocked').default(false).notNull(),
  dateUnlocked: timestamp('date_unlocked'),
  tasksRequired: integer('tasks_required'),
  daysRequired: integer('days_required'),
});

export const rewards = pgTable('rewards', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon').notNull(),
  tasksRequired: integer('tasks_required'),
  daysRequired: integer('days_required'),
  isCustom: boolean('is_custom').default(true),
});
