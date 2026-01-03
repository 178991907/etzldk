
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { completeClientTaskAndUpdateXP as completeTaskAndUpdateXP } from '@/lib/client-data';
import { Task } from '@/lib/data-types';
import { iconMap } from '@/lib/data-types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ClientOnlyT } from '../layout/app-sidebar';
import { Skeleton } from '../ui/skeleton';
import { isTaskForToday } from '@/lib/logic';
import { useSound } from '@/hooks/use-sound';

interface TaskListProps {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}

export default function TaskList({ tasks, setTasks }: TaskListProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const { i18n } = useTranslation();
  const playSound = useSound();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTaskCompletion = async (task: Task, completed: boolean) => {
    if (completed) {
      playSound('success');
    }
    await completeTaskAndUpdateXP(task, completed);
    // Optimistically update UI
    setTasks(tasks.map(t => t.id === task.id ? { ...t, completed } : t));
  };

  const todaysTasks = tasks.filter(isTaskForToday);

  if (!isClient) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle><ClientOnlyT tKey='dashboard.todaysAdventures' /></CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pt-0 overflow-y-auto">
        <AnimatePresence>
          {todaysTasks.length > 0 ? (
            todaysTasks.map((task, index) => {
              const Icon = task.icon ? iconMap[task.icon] : null;
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeInOut"
                  }}
                  className="flex items-center p-3 -m-3 rounded-lg transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    id={task.id.toString()}
                    checked={task.completed}
                    onCheckedChange={(checked) => handleTaskCompletion(task, !!checked)}
                    className="h-6 w-6 rounded-md"
                    disabled={task.status === 'paused'}
                  />
                  <label
                    htmlFor={task.id.toString()}
                    className={cn(
                      'ml-4 flex-1 text-base font-medium transition-all',
                      task.completed ? 'text-muted-foreground line-through' : 'text-foreground',
                      task.status === 'paused' ? 'cursor-not-allowed' : ''
                    )}
                  >
                    {task.title}
                  </label>
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                    {Icon && <Icon className="h-5 w-5 text-primary" />}
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground text-center py-8">
                <ClientOnlyT tKey='dashboard.noAdventures' />
              </p>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
