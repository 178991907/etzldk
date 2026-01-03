'use client';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { ClientOnlyT } from '@/components/layout/app-sidebar';
import * as React from 'react';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ProgressChart = dynamic(() => import('@/components/reports/progress-chart'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full" />,
});

export default function ReportsPage() {
  const { t } = useTranslation();
  const [range, setRange] = React.useState('weekly');
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  const [chartData, setChartData] = React.useState<{ date: string; completed: number }[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const { getStorageStatus } = await import('@/lib/data-browser');
      const status = await getStorageStatus();
      let allTasks: any[] = []; // Use any or Task type

      if (status === 'db' || status === 'kv') {
        const { getTasks } = await import('@/lib/data-browser');
        allTasks = await getTasks();
      } else {
        const { getClientTasks } = await import('@/lib/client-data');
        allTasks = await getClientTasks();
      }

      // Process tasks for the chart (Last 7 days logic simplified)
      // This is a basic implementation. Ideally we check completion dates.
      // Since we don't track *when* a task was completed in the schema (only boolean),
      // we can't accurately show historical completion. 
      // ERROR: The current schema has `completed: boolean` but no `completedAt`.
      // We only have `dueDate`. We can show completion based on due date for now as a proxy?
      // OR we assume tasks are completed on their due date if completed.

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });

      const data = last7Days.map(date => {
        const dateStr = format(date, 'EEE'); // Mon, Tue...
        // Count tasks due on this date that are completed
        const count = allTasks.filter(t => {
          const taskDate = new Date(t.dueDate);
          return t.completed &&
            taskDate.getDate() === date.getDate() &&
            taskDate.getMonth() === date.getMonth();
        }).length;
        return { date: dateStr, completed: count };
      });

      setChartData(data);
    };

    fetchData();
  }, [range, date]); // Reload if range changes (though logic above is fixed to 7 days for now)

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-10 flex h-[57px] items-center justify-between gap-1 bg-background px-4">
        <div className="flex items-center gap-1 w-full">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-xl font-semibold truncate"><ClientOnlyT tKey='reports.title' /></h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle><ClientOnlyT tKey='reports.performanceTitle' /></CardTitle>
            <div className="flex items-center gap-2">
              {/* Date picker and Select logic retained but chart currently fixed to last 7 days for demo */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={'outline'}
                    className={cn(
                      'w-[300px] justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, 'LLL dd, y')} -{' '}
                          {format(date.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(date.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={<ClientOnlyT tKey='reports.selectRange' />} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly"><ClientOnlyT tKey='reports.thisWeek' /></SelectItem>
                  <SelectItem value="monthly"><ClientOnlyT tKey='reports.thisMonth' /></SelectItem>
                  <SelectItem value="yearly"><ClientOnlyT tKey='reports.thisYear' /></SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ProgressChart data={chartData} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
