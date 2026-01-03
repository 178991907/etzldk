import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '儿童自律打卡',
  description: '一款帮助孩子养成良好习惯的游戏化系统。',
};

import DynamicFavicon from '@/components/dynamic-favicon';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <Providers>
          <DynamicFavicon />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
