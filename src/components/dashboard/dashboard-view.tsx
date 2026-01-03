'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgressSummaryContent } from '@/components/dashboard/progress-summary';
import PetViewer from '@/components/dashboard/pet-viewer';
import DailyTaskTable from '@/components/landing/daily-task-table';
import { ClientOnlyT } from '@/components/layout/app-sidebar';
import type { User, Task } from '@/lib/data-types';
import { getClientUser } from '@/lib/client-data';

interface DashboardViewProps {
    initialUser: User;
    initialTasks: Task[];
    useLocalStorage: boolean;
}

export default function DashboardView({
    initialUser,
    initialTasks,
    useLocalStorage,
}: DashboardViewProps) {
    const [user, setUser] = useState<User>(initialUser);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // If using local storage, we must hydrate the user from the client side
        // because the server's version of "LocalStorage" (default) might be stale/default.
        if (useLocalStorage) {
            const fetchClientUser = async () => {
                const clientUser = await getClientUser();
                setUser(clientUser);
            };

            fetchClientUser();

            const handleUserUpdate = async () => {
                await fetchClientUser();
            };

            window.addEventListener('userProfileUpdated', handleUserUpdate);
            return () => window.removeEventListener('userProfileUpdated', handleUserUpdate);
        }
    }, [useLocalStorage]);

    const completedTasks = initialTasks.filter(t => t.completed).length;
    const totalTasks = initialTasks.length;
    // Calculate stats based on initialTasks. 
    // NOTE: If using LocalStorage, initialTasks passed to DailyTaskTable will be ignored in favor of client data, 
    // but for the top-level stats shown here, we might need these to update too.
    // Ideally, DailyTaskTable would bubble up changes, or this view also listens to task updates.
    // For V1 of this hybrid approach, let's keep it simple:
    // The DailyTaskTable handles its own state. The stats logic here is slightly disconnected if we don't sync tasks here too.
    // However, `initialTasks` from the server is "empty/default" if DB is down. 
    // We should probably let this component manage the "tasks" state or listen to task updates too if we want the stats card to work in LS mode.

    // Let's rely on DailyTaskTable for the table part, but for the "Daily Goal" card, we need valid data.
    // Let's add task hydration here too if useLocalStorage is true.

    const [tasks, setTasks] = useState<Task[]>(initialTasks);

    useEffect(() => {
        if (useLocalStorage) {
            const fetchTasks = async () => {
                const { getClientTodaysTasks } = await import('@/lib/client-data');
                const clientTasks = await getClientTodaysTasks();
                setTasks(clientTasks);
            }
            fetchTasks();

            const handleTasksUpdate = () => fetchTasks();
            window.addEventListener('tasksUpdated', handleTasksUpdate);
            return () => window.removeEventListener('tasksUpdated', handleTasksUpdate);
        }
    }, [useLocalStorage]);

    const dynamicCompleted = tasks.filter(t => t.completed).length;
    const dynamicTotal = tasks.length;
    const dailyProgress = dynamicTotal > 0 ? (dynamicCompleted / dynamicTotal) * 100 : 0;

    const petProgress = user ? (user.xp / user.xpToNextLevel) * 100 : 0;

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-10 flex flex-nowrap h-auto py-2 md:py-0 md:h-[220px] items-center justify-between bg-background/80 backdrop-blur-sm px-4 md:px-8 gap-2">
                <div className="flex items-center gap-2 w-1/4 md:w-1/3">
                </div>
                <div className="flex justify-center items-center w-1/2 md:w-1/3 shrink-0">
                    {user.frontendLogo ? (
                        <Image
                            src={user.frontendLogo}
                            alt="Frontend Logo"
                            width={600}
                            height={200}
                            priority
                            className="object-contain w-[160px] h-auto md:w-[600px]"
                        />
                    ) : user.appLogo ? (
                        <Image
                            src={user.appLogo}
                            alt="App Logo"
                            width={600}
                            height={200}
                            priority
                            className="object-contain w-[160px] h-auto md:w-[600px]"
                        />
                    ) : (
                        <Image
                            src="https://pic1.imgdb.cn/item/6817c79a58cb8da5c8dc723f.png"
                            alt="Logo"
                            width={600}
                            height={200}
                            priority
                            className="object-contain w-[160px] h-auto md:w-[600px]"
                        />
                    )}
                </div>
                <nav className="flex justify-end w-1/4 md:w-1/3">
                    <Button asChild size="sm" className="md:h-10 md:px-4 md:py-2">
                        <Link href="/dashboard">
                            <span className="hidden md:inline"><ClientOnlyT tKey="dashboardLink" /></span>
                            <span className="md:hidden">Next</span>
                        </Link>
                    </Button>
                </nav>
            </header>

            <main className="flex-1 flex flex-col items-center justify-start px-4 md:px-8">
                <div className="w-full max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        {/* Left Column: Pet Viewer */}
                        <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                            {user ? (
                                <Suspense fallback={<Skeleton className="w-[350px] h-[350px] rounded-full" />}>
                                    <PetViewer petStyle={user.petStyle} progress={petProgress} className="w-full max-w-[500px] aspect-square" fullSize={true} />
                                </Suspense>
                            ) : (
                                <Skeleton className="w-[350px] h-[350px] rounded-full" />
                            )}
                        </div>

                        {/* Right Column: Stats */}
                        <div className="w-full md:w-1/2 flex flex-col items-center gap-4">
                            <div className="w-full">

                                <Card>
                                    <CardContent className="p-4">
                                        <ProgressSummaryContent
                                            iconName="Target"
                                            title={<ClientOnlyT tKey="dashboard.dailyGoal" />}
                                            value={`${Math.round(dailyProgress)}%`}
                                            description={<ClientOnlyT tKey="dashboard.dailyGoalDescription" tOptions={{ completedTasks: dynamicCompleted, totalTasks: dynamicTotal }} />}
                                        />
                                    </CardContent>
                                </Card>

                            </div>
                            <div className="w-full">
                                {user ? (
                                    <Card>
                                        <CardContent className="p-4">
                                            <ProgressSummaryContent
                                                iconName="Zap"
                                                title={<ClientOnlyT tKey="dashboard.xpGained" />}
                                                value={`${user.xp} XP`}
                                                description={<ClientOnlyT tKey="dashboard.xpToNextLevel" tOptions={{ xp: user.xpToNextLevel - user.xp }} />}
                                                progress={petProgress}
                                            />
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Skeleton className="h-28 w-full" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <DailyTaskTable
                            initialTasks={initialTasks}
                            useLocalStorage={useLocalStorage}
                        />
                    </div>

                </div>
            </main>

            <footer className="py-4 text-center text-xl text-muted-foreground">
                <a href="https://web.terry.dpdns.org/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    © 2025 英语全科启蒙. All Rights Reserved.『Terry开发与维护』
                </a>
            </footer>
        </div>
    );
}
