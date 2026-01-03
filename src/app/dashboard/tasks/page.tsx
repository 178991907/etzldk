
import TasksView from '@/components/tasks/tasks-view';
import { dbInitializationError } from '@/lib/db';
import { getTasks } from '@/lib/data-browser';
import { Task } from '@/lib/data-types';

export default async function TasksPage() {
    const useLocalStorage = !!dbInitializationError;
    let initialTasks: Task[] = [];

    if (!useLocalStorage) {
        initialTasks = await getTasks();
    }

    return <TasksView initialTasks={initialTasks} useLocalStorage={useLocalStorage} />;
}
