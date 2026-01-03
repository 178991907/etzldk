'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { I18nProvider } from '@/components/i18n-provider';
import { PomodoroModalProvider, PomodoroModal } from '@/components/pomodoro/pomodoro-modal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>
        <PomodoroModalProvider>
          {children}
          <PomodoroModal />
        </PomodoroModalProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
