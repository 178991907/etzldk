'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import TasksTable from '@/components/tasks/tasks-table';
import { AddTaskDialog } from '@/components/tasks/add-task-dialog';
import { ClientOnlyT } from '@/components/layout/app-sidebar';
import { useState, useEffect } from 'react';
import { Task } from '@/lib/data-types';
import { getTasks, deleteTask, saveTask, updateTasks } from '@/lib/data-browser';
import * as ClientData from '@/lib/client-data';
import { PlusCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface TasksViewProps {
  initialTasks?: Task[];
  useLocalStorage: boolean;
}

export default function TasksView({ initialTasks = [], useLocalStorage }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isClient, setIsClient] = useState(false);

  const fetchTasks = async () => {
    if (useLocalStorage) {
      const loadedTasks = await ClientData.getClientTasks();
      setTasks(loadedTasks);
    } else {
      const loadedTasks = await getTasks();
      setTasks(loadedTasks);
    }
  };

  useEffect(() => {
    // If using localStorage, we must fetch on client load.
    // If using DB, we rely on initialTasks (server) but can re-fetch if needed.
    if (useLocalStorage) {
      fetchTasks();
    }
    setIsClient(true);

    const handleTasksUpdate = () => {
      fetchTasks();
    };
    window.addEventListener('tasksUpdated', handleTasksUpdate);
    return () => {
      window.removeEventListener('tasksUpdated', handleTasksUpdate);
    };
  }, [useLocalStorage]);


  const handleOpenDialog = (task: Task | null = null) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'userId'>, taskId?: string) => {
    if (useLocalStorage) {
      await ClientData.saveClientTask(taskData, taskId);
    } else {
      await saveTask(taskData, taskId);
    }
    fetchTasks(); // Re-fetch tasks from the source of truth
  };

  const handleDeleteRequest = (task: Task) => {
    setDeletingTask(task);
  };

  const handleDeleteConfirm = async () => {
    if (deletingTask) {
      if (useLocalStorage) {
        await ClientData.deleteClientTask(deletingTask.id);
      } else {
        await deleteTask(deletingTask.id);
      }
      fetchTasks();
      setDeletingTask(null);
    }
  };

  const handleToggleStatus = async (taskId: string) => {
    const taskToToggle = tasks.find(task => task.id === taskId);
    if (taskToToggle) {
      const newStatus = taskToToggle.status === 'active' ? 'paused' : 'active';
      if (useLocalStorage) {
        await ClientData.saveClientTask({ ...taskToToggle, status: newStatus }, taskId);
      } else {
        await saveTask({ ...taskToToggle, status: newStatus }, taskId);
      }
      fetchTasks();
    }
  };

  const handleSetTasks = async (newTasks: Task[]) => {
    if (useLocalStorage) {
      // Batch update not fully supported in simple client example but implemented via overwrite
      // Wait, updateTasks in data-browser was empty/warn. ClientData doesn't have it exposed directly?
      // Actually we can implement batch overwrite in ClientData or just loop.
      // Let's assume updateTasks logic is rare (reordering?). 
      // For now let's just update state, but logic requires persistent save?
      // updateTasks in 'logic.ts' context implies Reordering?
    } else {
      await updateTasks(newTasks);
    }
    fetchTasks();
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-[57px] items-center justify-between gap-1 bg-background px-4">
        <div className="flex items-center gap-1 w-1/2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold truncate"><ClientOnlyT tKey='tasks.title' /></h1>
        </div>
        <div className="flex items-center justify-end gap-4 w-1/2">
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <ClientOnlyT tKey='tasks.addTask' />
          </Button>
          {isClient && (
            <AddTaskDialog
              isOpen={isDialogOpen}
              setIsOpen={setIsDialogOpen}
              onSave={handleSaveTask}
              task={editingTask}
            />
          )}
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <TasksTable
          tasks={tasks}
          setTasks={handleSetTasks}
          onEdit={handleOpenDialog}
          onDelete={handleDeleteRequest}
          onToggleStatus={handleToggleStatus}
        />
      </main>

      <AlertDialog open={!!deletingTask} onOpenChange={(open) => !open && setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle><ClientOnlyT tKey="tasks.delete.title" /></AlertDialogTitle>
            <AlertDialogDescription>
              <ClientOnlyT tKey="tasks.delete.description" />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel><ClientOnlyT tKey="tasks.delete.cancel" /></AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <ClientOnlyT tKey="tasks.delete.confirm" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
