'use client';

import { Layout } from '@/components/layout/layout';
import { CalendarView } from '@/components/calendar/calendar-view';
import ProjectSelector from '@/components/project/ProjectSelector';
import { useEffect, useState } from 'react';
import { Task, TimeBlock } from '@/lib/types';
import { TaskService } from '@/lib/services/task-service';
import { TimeBlockService } from '@/lib/services/timeblock-service';
import { CalendarService, CalendarEvent } from '@/lib/services/calendar-service';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load calendar data từ API
  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('CalendarPage: Đang tải dữ liệu lịch...');

      // Load tasks và time blocks song song
      const [fetchedTasks, fetchedTimeBlocks] = await Promise.all([
        TaskService.getTasks(),
        TimeBlockService.getTimeBlocks(),
      ]);

      setTasks(fetchedTasks);
      setTimeBlocks(fetchedTimeBlocks);

      // Tạo events từ tasks và time blocks
      const calendarEvents = CalendarService.createEventsFromData(fetchedTasks, fetchedTimeBlocks);
      setEvents(calendarEvents);

      console.log('CalendarPage: Đã tải dữ liệu lịch thành công:', {
        tasks: fetchedTasks.length,
        timeBlocks: fetchedTimeBlocks.length,
        events: calendarEvents.length
      });
    } catch (err: any) {
      console.error('CalendarPage: Lỗi khi tải dữ liệu lịch:', err);
      setError(err.message || 'Không thể tải dữ liệu lịch');
    } finally {
      setLoading(false);
    }
  };

  // Callback để refresh data khi có thay đổi
  const handleDataChange = async () => {
    console.log('CalendarPage: Data changed, reloading...');
    await loadCalendarData();
  };

  useEffect(() => {
    loadCalendarData();
  }, []);
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header với refresh button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 md:p-6 pb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Lịch công việc</h1>
            <p className="text-muted-foreground">
              Quản lý công việc và khối thời gian của bạn
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCalendarData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Error alert */}
        {error && (
          <div className="px-4 md:px-6 pb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadCalendarData}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Thử lại
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="p-4 md:p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-8 w-5/6" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </div>
        ) : (
          <CalendarView
            tasks={tasks}
            setTasks={setTasks}
            timeBlocks={timeBlocks}
            setTimeBlocks={setTimeBlocks}
            events={events}
            onDataChange={handleDataChange}
          />
        )}
      </div>
    </Layout>
  );
}