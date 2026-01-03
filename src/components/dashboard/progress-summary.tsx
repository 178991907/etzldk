'use client';
import { CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LucideIcon, Target, Zap, Info } from 'lucide-react';
import { ReactNode } from 'react';

const iconMap: { [key: string]: LucideIcon } = {
  Target,
  Zap,
  Info,
};

interface ProgressSummaryProps {
  iconName: string;
  title: ReactNode;
  value: string;
  description: ReactNode;
  progress?: number;
}

export function ProgressSummaryContent({
  iconName,
  title,
  value,
  description,
  progress,
}: ProgressSummaryProps) {
    const Icon = iconMap[iconName];

    return (
        <div>
            <div className="flex items-center justify-between pb-2">
                 <div className="text-lg font-semibold leading-none tracking-tight">
                    {title}
                </div>
                {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="text-2xl font-bold">
                {value}
            </div>
            <div>
                <p className="text-xs text-muted-foreground mt-1">
                    {description}
                </p>
                {progress !== undefined && (
                    <Progress value={progress} className="mt-2 h-2 w-full" />
                )}
            </div>
        </div>
    );
}


export default function ProgressSummary(props: ProgressSummaryProps) {
  return (
    <div className="p-6">
        <ProgressSummaryContent {...props} />
    </div>
  );
}
