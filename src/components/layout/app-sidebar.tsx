'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  CheckSquare,
  Trophy,
  BarChart,
  Settings,
  Star,
  LogOut,
  Gift,
  Timer,
} from 'lucide-react';
import { UserNav } from './user-nav';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import i18n from '@/i18n'; // Import the i18n instance
import { getClientUser as getUser } from '@/lib/client-data';
import { User } from '@/lib/data-types';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';

// This wrapper prevents hydration errors by rendering the fallback language on the server
// and only rendering the selected language on the client after hydration.
export const ClientOnlyT = ({ tKey, tOptions }: { tKey: string; tOptions?: any }) => {
  const { t, i18n: i18nInstance } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // On the server, always render the English text to ensure consistency with server-rendered HTML.
    const fallbackText = i18n.t(tKey, { lng: 'en', ...tOptions });
    return <span>{fallbackText}</span>;
  }

  if (i18nInstance.language === 'en-zh') {
    const zhText = i18n.t(tKey, { lng: 'zh', ...tOptions });
    const enText = i18n.t(tKey, { lng: 'en', ...tOptions });
    // Avoid showing the key if translation is missing for both
    if (zhText !== tKey && enText !== tKey) {
      return (
        <span className="flex flex-wrap items-center gap-x-2">
          <span>{zhText}</span>
          <span className="text-muted-foreground">({enText})</span>
        </span>
      );
    }
    // Fallback to whichever translation is available if one is missing
    return <span>{zhText !== tKey ? zhText : enText}</span>;
  }

  // For 'en' or 'zh', use the standard t function
  return <span>{t(tKey, tOptions)}</span>;
};

export default function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleUserUpdate = async () => {
      const userData = await getUser();
      setUser(userData);
    };
    window.addEventListener('userProfileUpdated', handleUserUpdate);
    handleUserUpdate(); // Initial load
    return () => window.removeEventListener('userProfileUpdated', handleUserUpdate);
  }, []);


  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' },
    { href: '/dashboard/tasks', icon: CheckSquare, labelKey: 'sidebar.tasks' },
    { href: '/dashboard/achievements', icon: Trophy, labelKey: 'sidebar.achievements' },
    { href: '/dashboard/reports', icon: BarChart, labelKey: 'sidebar.reports' },
    { href: '/dashboard/rewards', icon: Gift, labelKey: 'sidebar.rewards' },
    { href: '/dashboard/pomodoro', icon: Timer, labelKey: 'sidebar.pomodoro' },
    { href: '/dashboard/settings', icon: Settings, labelKey: 'sidebar.settings' },
  ];

  return (
    <>
      <SidebarContent>
        <SidebarHeader>
          {isClient && user ? (
            <div className="flex flex-col items-center justify-center gap-2 w-full">
              <div className={`flex items-center justify-center rounded-lg shrink-0 overflow-hidden ${user.appLogo ? 'h-[100px] w-[100px] bg-transparent' : 'h-10 w-10 bg-primary'}`}>
                {user.appLogo ? (
                  <img src={user.appLogo} alt="App Logo" className="object-cover w-full h-full" />
                ) : (
                  <Star className="h-6 w-6 text-primary-foreground" />
                )}
              </div>
              <span className="font-bold text-xl font-headline text-foreground">
                {user.appName || <ClientOnlyT tKey="appName" />}
              </span>
            </div>
          ) : (
            <Skeleton className="w-full aspect-[3/1] rounded-lg" />
          )}
        </SidebarHeader>
        <SidebarMenu className="pt-4">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={t(item.labelKey)}
              >
                <Link href={item.href}>
                  <item.icon />
                  <ClientOnlyT tKey={item.labelKey} />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="flex flex-col gap-4">
        <UserNav />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t('sidebar.logout')}>
              <Link href="/">
                <LogOut />
                <ClientOnlyT tKey="sidebar.logout" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
