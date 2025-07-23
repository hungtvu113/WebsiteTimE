'use client';

import { useState, useEffect } from 'react';
import { TimeBlockList } from '@/components/timeblock/time-block-list';
import { Button } from '@/components/ui/button';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { 
  addDays, 
  format, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isToday,
  isSameDay,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { PreferenceService } from '@/lib/services/preference-service';
import { TaskService } from '@/lib/services/task-service';
import { TimeBlockService } from '@/lib/services/timeblock-service';
import { Task, TimeBlock, UserPreferences } from '@/lib/types';
import { CalendarEvent } from '@/lib/services/calendar-service';
import { CalendarDays, ChevronLeft, ChevronRight, Calendar, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { CalendarEvents } from '@/components/calendar/calendar-events';

interface CalendarViewProps {
  tasks?: Task[];
  setTasks?: (tasks: Task[]) => void;
  timeBlocks?: TimeBlock[];
  setTimeBlocks?: (timeBlocks: TimeBlock[]) => void;
  events?: CalendarEvent[];
  onDataChange?: () => void;
}

export function CalendarView({
  tasks: propTasks,
  setTasks: propSetTasks,
  timeBlocks: propTimeBlocks,
  setTimeBlocks: propSetTimeBlocks,
  events: propEvents,
  onDataChange
}: CalendarViewProps = {}) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  const [internalTasks, setInternalTasks] = useState<Task[]>([]);
  const [internalTimeBlocks, setInternalTimeBlocks] = useState<TimeBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(PreferenceService.getPreferencesSync());

  const tasks = propTasks ?? internalTasks;
  const setTasks = propSetTasks ?? setInternalTasks;
  const timeBlocks = propTimeBlocks ?? internalTimeBlocks;
  const setTimeBlocks = propSetTimeBlocks ?? setInternalTimeBlocks;

  // Debug logs
  console.log('CalendarView: Current data:', {
    tasks: tasks.length,
    timeBlocks: timeBlocks.length,
    propEvents: propEvents?.length || 0,
    selectedDate: selectedDate.toISOString().split('T')[0]
  });
  
  // Tải dữ liệu nếu không có props từ parent
  useEffect(() => {
    if (propTasks && propTimeBlocks) {
      // Nếu có data từ props, không cần load
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedTasks, fetchedTimeBlocks] = await Promise.all([
          TaskService.getTasks(),
          TimeBlockService.getTimeBlocks(),
        ]);

        setTasks(fetchedTasks);
        setTimeBlocks(fetchedTimeBlocks);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu lịch:', err);
        setError('Không thể tải dữ liệu lịch. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    // Chỉ load nếu không có props
    if (!propTasks || !propTimeBlocks) {
      loadData();
    }
  }, [propTasks, propTimeBlocks, setTasks, setTimeBlocks]);

  // Callback để handle data change và reload nếu cần
  const handleDataChange = async () => {
    console.log('CalendarView: Data changed, triggering refresh...');

    // Nếu có onDataChange từ parent, gọi nó
    if (onDataChange) {
      onDataChange();
    } else {
      // Nếu không có parent callback, tự reload
      try {
        const [fetchedTasks, fetchedTimeBlocks] = await Promise.all([
          TaskService.getTasks(),
          TimeBlockService.getTimeBlocks(),
        ]);

        setTasks(fetchedTasks);
        setTimeBlocks(fetchedTimeBlocks);
      } catch (err) {
        console.error('Lỗi khi reload dữ liệu:', err);
      }
    }
  };
  
  // Tải tùy chọn người dùng
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const userPreferences = await PreferenceService.getPreferences();
        setPreferences(userPreferences);
      } catch (err) {
        console.error('Lỗi khi tải tùy chọn người dùng:', err);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Xác định ngày bắt đầu tuần dựa vào tùy chọn người dùng
  const getStartOfWeek = (date: Date) => {
    return startOfWeek(date, { weekStartsOn: preferences.startOfWeek === 'monday' ? 1 : 0 });
  };
  
  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };
  
  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };
  
  const handlePreviousWeek = () => {
    setSelectedDate(subDays(selectedDate, 7));
  };
  
  const handleNextWeek = () => {
    setSelectedDate(addDays(selectedDate, 7));
  };
  
  const handleToday = () => {
    setSelectedDate(new Date());
  };
  
  // Lấy danh sách công việc cho một ngày cụ thể
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return isSameDay(dueDate, date);
    });
  };
  
  // Lấy nhãn cho mức độ ưu tiên
  const getPriorityLabel = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'low': return 'Thấp';
      case 'medium': return 'Trung bình';
      case 'high': return 'Cao';
      default: return 'Không xác định';
    }
  };
  
  // Lấy biến thể màu sắc cho badge dựa vào mức độ ưu tiên
  const getPriorityVariant = (priority: 'low' | 'medium' | 'high'): 'success' | 'warning' | 'destructive' | 'default' => {
    switch (priority) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'destructive';
      default: return 'default';
    }
  };
  
  const weekStart = getStartOfWeek(selectedDate);
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: preferences.startOfWeek === 'monday' ? 1 : 0 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Xử lý hoàn thành công việc
  const handleToggleTaskCompletion = async (taskId: string) => {
    try {
      const updatedTask = await TaskService.toggleTaskCompletion(taskId);
      // Cập nhật danh sách công việc
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));

      // Trigger parent refresh nếu có
      if (onDataChange) {
        onDataChange();
      }

      console.log('CalendarView: Task completion toggled, stats will update');
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái công việc:', err);
    }
  };
  
  // Lấy time blocks cho một ngày cụ thể
  const getTimeBlocksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return timeBlocks.filter(timeBlock => {
      const blockDate = new Date(timeBlock.startTime).toISOString().split('T')[0];
      return blockDate === dateString;
    });
  };

  // Tính toán thống kê nhanh cho ngày được chọn (bao gồm cả tasks và time blocks)
  const getDailyStats = (date: Date) => {
    const tasksForDate = getTasksForDate(date);
    const timeBlocksForDate = getTimeBlocksForDate(date);

    const completedTasks = tasksForDate.filter(task => task.completed).length;
    const completedTimeBlocks = timeBlocksForDate.filter(block => block.isCompleted).length;

    const totalItems = tasksForDate.length + timeBlocksForDate.length;
    const completedItems = completedTasks + completedTimeBlocks;
    const pendingItems = totalItems - completedItems;

    return {
      totalTasks: tasksForDate.length,
      totalTimeBlocks: timeBlocksForDate.length,
      total: totalItems,
      completed: completedItems,
      pending: pendingItems,
      completionRate: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      taskStats: {
        total: tasksForDate.length,
        completed: completedTasks,
        pending: tasksForDate.length - completedTasks
      },
      timeBlockStats: {
        total: timeBlocksForDate.length,
        completed: completedTimeBlocks,
        pending: timeBlocksForDate.length - completedTimeBlocks
      }
    };
  };
  
  const dailyStats = getDailyStats(selectedDate);

  // Auto-refresh stats khi data thay đổi
  useEffect(() => {
    console.log('CalendarView: Stats updated for date:', selectedDate.toISOString().split('T')[0], dailyStats);
  }, [tasks, timeBlocks, selectedDate]);
  
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Lịch</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-muted rounded-lg p-1">
            <Button 
              variant={view === 'day' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('day')}
              className="gap-1"
            >
              <Calendar className="h-4 w-4" />
              <span>Ngày</span>
            </Button>
            <Button 
              variant={view === 'week' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('week')}
              className="gap-1"
            >
              <CalendarDays className="h-4 w-4" />
              <span>Tuần</span>
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToday}
          >
            Hôm nay
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={view === 'day' ? handlePreviousDay : handlePreviousWeek}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Trước</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{view === 'day' ? 'Ngày trước' : 'Tuần trước'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="text-sm font-medium">
            {view === 'day' ? (
              <div className="px-2">
                {format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })}
              </div>
            ) : (
              <div className="px-2">
                {format(weekStart, 'dd/MM/yyyy', { locale: vi })} - {format(weekEnd, 'dd/MM/yyyy', { locale: vi })}
              </div>
            )}
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={view === 'day' ? handleNextDay : handleNextWeek}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Tiếp</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{view === 'day' ? 'Ngày tiếp theo' : 'Tuần tiếp theo'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Đang tải dữ liệu...</span>
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p>{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => TaskService.refreshTasks().then(setTasks).catch(console.error)}
            className="mt-2"
          >
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          {/* Thống kê nhanh cho ngày được chọn */}
          {view === 'day' && (
            <div className="space-y-4 mb-6">
              {/* Header với refresh button */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Thống kê ngày {format(selectedDate, 'dd/MM/yyyy', { locale: vi })}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDataChange}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Làm mới
                </Button>
              </div>

              {/* Thống kê tổng quan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Tổng mục</h4>
                  <p className="text-2xl font-bold">{dailyStats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dailyStats.totalTasks} công việc + {dailyStats.totalTimeBlocks} khối thời gian
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Đã hoàn thành</h4>
                  <p className="text-2xl font-bold text-green-500">{dailyStats.completed}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dailyStats.taskStats.completed} CV + {dailyStats.timeBlockStats.completed} KTG
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Chưa hoàn thành</h4>
                  <p className="text-2xl font-bold text-orange-500">{dailyStats.pending}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dailyStats.taskStats.pending} CV + {dailyStats.timeBlockStats.pending} KTG
                  </p>
                </div>
                <div className="bg-card rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Tỷ lệ hoàn thành</h4>
                  <p className="text-2xl font-bold">{dailyStats.completionRate}%</p>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dailyStats.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Thống kê chi tiết */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Công việc</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tổng:</span>
                      <span className="font-medium">{dailyStats.taskStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600">Hoàn thành:</span>
                      <span className="font-medium text-green-600">{dailyStats.taskStats.completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-600">Chưa xong:</span>
                      <span className="font-medium text-orange-600">{dailyStats.taskStats.pending}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Khối thời gian</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tổng:</span>
                      <span className="font-medium">{dailyStats.timeBlockStats.total}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600">Hoàn thành:</span>
                      <span className="font-medium text-green-600">{dailyStats.timeBlockStats.completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-600">Chưa xong:</span>
                      <span className="font-medium text-orange-600">{dailyStats.timeBlockStats.pending}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Hiển thị công việc đến hạn cho ngày được chọn */}
          {view === 'day' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Công việc đến hạn</h3>
              <div className="space-y-2">
                {getTasksForDate(selectedDate).length > 0 ? (
                  getTasksForDate(selectedDate).map(task => (
                    <div 
                      key={task.id} 
                      className={`p-3 rounded-lg border ${task.completed ? 'bg-muted/30' : 'bg-card'}`}
                    >
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleTaskCompletion(task.id)}
                          className="focus:outline-none"
                        >
                          {task.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h4>
                            <Badge variant={getPriorityVariant(task.priority)}>
                              {getPriorityLabel(task.priority)}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Không có công việc nào đến hạn vào ngày này
                  </div>
                )}
              </div>
            </div>
          )}
          
          {view === 'day' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TimeBlockList date={selectedDate} onDataChange={handleDataChange} />
              {propEvents && propEvents.length > 0 && (
                <CalendarEvents events={propEvents} date={selectedDate} />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
              {daysOfWeek.map((day) => (
                <div 
                  key={day.toString()} 
                  className={`rounded-lg border p-4 ${
                    isToday(day) 
                      ? 'border-primary/50 bg-primary/5'
                      : isSameDay(day, selectedDate) && !isToday(day) 
                      ? 'border-muted-foreground/20 bg-muted/30' 
                      : ''
                  }`}
                >
                  <div 
                    className="mb-3 text-center cursor-pointer"
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-sm text-muted-foreground">
                      {format(day, 'EEEE', { locale: vi })}
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <div className={`text-lg font-semibold ${isToday(day) ? 'text-primary' : ''}`}>
                        {format(day, 'dd/MM', { locale: vi })}
                      </div>
                      {getTasksForDate(day).length > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                          {getTasksForDate(day).length}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <TimeBlockList date={day} compact onDataChange={handleDataChange} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}