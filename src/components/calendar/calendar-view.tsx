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
import { Task } from '@/lib/types';
import { CalendarDays, ChevronLeft, ChevronRight, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface CalendarViewProps {
  tasks?: Task[];
  setTasks?: (tasks: Task[]) => void;
}

export function CalendarView({ tasks: propTasks, setTasks: propSetTasks }: CalendarViewProps = {}) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  const [internalTasks, setInternalTasks] = useState<Task[]>([]);
  const tasks = propTasks ?? internalTasks;
  const setTasks = propSetTasks ?? setInternalTasks;
  const preferences = PreferenceService.getPreferences();
  
  useEffect(() => {
    const loadTasks = () => {
      const tasks = TaskService.getTasks();
      setTasks(tasks);
    };
    
    loadTasks();
    // Cập nhật dữ liệu khi có thay đổi
    const intervalId = setInterval(loadTasks, 5000);
    return () => clearInterval(intervalId);
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
              <span className="hidden sm:inline">Ngày</span>
            </Button>
            <Button 
              variant={view === 'week' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('week')}
              className="gap-1"
            >
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Tuần</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">
          {view === 'day' 
            ? format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: vi })
            : `${format(weekStart, 'dd/MM', { locale: vi })} - ${format(weekEnd, 'dd/MM/yyyy', { locale: vi })}`
          }
        </h2>
        <div className="flex items-center gap-2">
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
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{task.title}</h4>
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
        <TimeBlockList date={selectedDate} />
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
              
              <TimeBlockList date={day} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 