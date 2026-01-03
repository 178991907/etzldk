
'use client';
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { completeTaskAndUpdateXP } from '@/lib/data-browser';
import { getClientTodaysTasks, completeClientTaskAndUpdateXP } from '@/lib/client-data';
import { Task } from '@/lib/data-types';
import { iconMap } from '@/lib/data-types';
import { ClientOnlyT } from '@/components/layout/app-sidebar';
import { useSound } from '@/hooks/use-sound';
import DigitalClock from '../dashboard/digital-clock';
import { usePomodoroModal } from '@/components/pomodoro/pomodoro-modal';
import { useRouter } from 'next/navigation';

export default function DailyTaskTable({ initialTasks, useLocalStorage }: { initialTasks: Task[], useLocalStorage: boolean }) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const playSound = useSound();
  const { openPomodoro } = usePomodoroModal();
  const router = useRouter();

  React.useEffect(() => {
    // If we need to use localStorage, fetch the data on the client
    if (useLocalStorage) {
      const fetchClientData = async () => {
        const clientTasks = await getClientTodaysTasks();
        setTasks(clientTasks);
      };
      fetchClientData();

      const handleTasksUpdate = () => fetchClientData();
      window.addEventListener('tasksUpdated', handleTasksUpdate);
      return () => {
        window.removeEventListener('tasksUpdated', handleTasksUpdate);
      };
    } else {
      setTasks(initialTasks);
    }
  }, [useLocalStorage, initialTasks]);

  const handleTaskCompletion = async (task: Task, completed: boolean) => {
    if (completed) {
      playSound('success');
    }

    if (useLocalStorage) {
      await completeClientTaskAndUpdateXP(task, completed);
      const clientTasks = await getClientTodaysTasks(); // Re-fetch to ensure consistency
      setTasks(clientTasks);
    } else {
      await completeTaskAndUpdateXP(task, completed);
    }

    // Optimistically update UI while waiting for server refresh
    setTasks(prevTasks => prevTasks.map(t => t.id === task.id ? { ...t, completed } : t));

    // Refresh server components to get latest user XP/level.
    router.refresh();
  };

  const handleStartTask = (task: Task) => {
    openPomodoro();
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell colSpan={4} className="p-0">
                <div className="p-4">
                  <DigitalClock />
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableHead className="w-[60px] text-center text-lg hidden md:table-cell"><ClientOnlyT tKey="tasks.dailyTable.order" /></TableHead>
              <TableHead className="text-lg min-w-[150px]"><ClientOnlyT tKey="tasks.dailyTable.dailyTask" /></TableHead>
              <TableHead className="w-[100px] text-center text-lg whitespace-nowrap"><ClientOnlyT tKey="tasks.dailyTable.execution" /></TableHead>
              <TableHead className="w-[100px] text-center text-lg whitespace-nowrap"><ClientOnlyT tKey="tasks.dailyTable.status" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length > 0 ? (
              tasks.map((task, index) => {
                const Icon = iconMap[task.category];
                return (
                  <TableRow key={task.id}>
                    <TableCell className="text-center font-medium hidden md:table-cell">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {Icon && <Icon className="h-5 w-5 text-primary" />}
                        <span className="font-medium">
                          {task.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" onClick={() => handleStartTask(task)}>
                        <ClientOnlyT tKey="tasks.dailyTable.start" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={task.completed}
                        onCheckedChange={(checked) => handleTaskCompletion(task, checked)}
                      />
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <ClientOnlyT tKey="dashboard.noAdventures" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
