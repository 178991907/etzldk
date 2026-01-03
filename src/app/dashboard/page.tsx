'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Zap, Info, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getClientUser as getUser, getClientTasks as getTasks } from '@/lib/client-data';
import { User, Task } from '@/lib/data-types';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgressSummaryContent } from '@/components/dashboard/progress-summary';
import DigitalClock from '@/components/dashboard/digital-clock';
import TaskList from '@/components/dashboard/task-list';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTranslation } from 'react-i18next';
import { ClientOnlyT } from '@/components/layout/app-sidebar';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import PetCard from '@/components/dashboard/pet-card';

const DashboardGridLayout = dynamic(
  () => import('@/components/dashboard/dashboard-grid-layout'),
  { ssr: false }
);


export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    setIsClient(true);
    const loadData = async () => {
      const [userData, tasksData] = await Promise.all([getUser(), getTasks()]);
      setUser(userData);
      setTasks(tasksData);
    };

    loadData();

  }, []);

  const completedTasks = tasks.filter(t => t.completed && new Date(t.dueDate).toDateString() === new Date().toDateString()).length;
  const totalTasks = tasks.filter(t => new Date(t.dueDate).toDateString() === new Date().toDateString()).length;
  const dailyProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const petProgress = user ? (user.xp / user.xpToNextLevel) * 100 : 0;

  const petIntroDescription = t('dashboard.petIntroDescription');
  const petIntroItems = t('dashboard.petIntroItems', { returnObjects: true }) as string[];


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex h-[57px] items-center justify-between gap-1 border-b bg-background px-4">
        <div className="flex items-center gap-1 w-1/2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold truncate"><ClientOnlyT tKey='dashboard.title' /></h1>
        </div>
        <div className="flex items-center justify-end gap-4 w-1/2">
          {isClient ? (
            <DigitalClock />
          ) : (
            <>
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
            </>
          )}
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <DashboardGridLayout isEditing={false}>
          <div key="pet">
            <PetCard user={user} />
          </div>
          <div key="tasks">
            <TaskList tasks={tasks} setTasks={setTasks} />
          </div>
          <div key="dailyGoal">
            <Card className="h-full">
              <CardContent className="p-4 h-full flex flex-col justify-center">
                <ProgressSummaryContent
                  iconName="Target"
                  title={<ClientOnlyT tKey="dashboard.dailyGoal" />}
                  value={`${Math.round(dailyProgress)}%`}
                  description={<ClientOnlyT tKey="dashboard.dailyGoalDescription" tOptions={{ completedTasks, totalTasks }} />}
                />
              </CardContent>
            </Card>
          </div>
          <div key="xpGained">
            <Card className="h-full">
              <CardContent className="p-4 h-full flex flex-col justify-center">
                <ProgressSummaryContent
                  iconName="Zap"
                  title={<ClientOnlyT tKey="dashboard.xpGained" />}
                  value={`${user ? user.xp : 0} XP`}
                  description={<ClientOnlyT tKey="dashboard.xpToNextLevel" tOptions={{ xp: user ? user.xpToNextLevel - user.xp : '...' }} />}
                  progress={petProgress}
                />
              </CardContent>
            </Card>
          </div>
          <div key="petIntro">
            <Card className="h-full">
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <Info className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <CardTitle><ClientOnlyT tKey="dashboard.petIntroTitle" /></CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {isClient && Array.isArray(petIntroItems) ? (
                  <div className="text-sm text-muted-foreground">
                    {petIntroDescription && <p className="mb-3">{petIntroDescription}</p>}
                    {petIntroItems.length > 0 && (
                      <ul className="space-y-2 list-disc pl-5">
                        {petIntroItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DashboardGridLayout>
      </main>
    </div>
  );
}
