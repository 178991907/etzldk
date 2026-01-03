
'use server';

import { getUser, getTodaysTasks } from '@/lib/data-browser';
import { User, Task } from '@/lib/data-types';
import DashboardView from '@/components/dashboard/dashboard-view';
import { dbInitializationError } from '@/lib/db';

export default async function LandingPage() {
  const user: User = await getUser();
  // getTodaysTasks will use the database if available.
  const initialTasks: Task[] = await getTodaysTasks() || [];

  const useLocalStorage = !!dbInitializationError;

  return (
    <DashboardView
      initialUser={user}
      initialTasks={initialTasks}
      useLocalStorage={useLocalStorage}
    />
  );
}
