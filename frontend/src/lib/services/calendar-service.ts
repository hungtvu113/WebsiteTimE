import { ApiService } from './api-service';
import { Task, TimeBlock } from '@/lib/types';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: 'task' | 'timeblock';
  data: Task | TimeBlock;
  color?: string;
  completed?: boolean;
}

export interface CalendarData {
  tasks: Task[];
  timeBlocks: TimeBlock[];
  events: CalendarEvent[];
}

export interface DayData {
  date: string;
  tasks: Task[];
  timeBlocks: TimeBlock[];
  events: CalendarEvent[];
}

export interface WeekData {
  startDate: string;
  endDate: string;
  days: DayData[];
}

export const CalendarService = {
  // Lấy dữ liệu lịch cho khoảng thời gian
  getCalendarData: async (start?: string, end?: string): Promise<CalendarData> => {
    try {
      console.log('CalendarService: Đang tải dữ liệu lịch...', { start, end });
      
      const params = new URLSearchParams();
      if (start) params.append('start', start);
      if (end) params.append('end', end);
      
      const url = `/calendar/events${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/calendar/events${params.toString() ? `?${params.toString()}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('CalendarService: Đã tải dữ liệu lịch:', data);
      return data;
    } catch (error) {
      console.error('CalendarService: Lỗi khi tải dữ liệu lịch:', error);
      throw error;
    }
  },

  // Lấy dữ liệu cho một ngày cụ thể
  getDayData: async (date: string): Promise<DayData> => {
    try {
      console.log('CalendarService: Đang tải dữ liệu ngày...', date);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/calendar/day/${date}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('CalendarService: Đã tải dữ liệu ngày:', data);
      return data;
    } catch (error) {
      console.error('CalendarService: Lỗi khi tải dữ liệu ngày:', error);
      throw error;
    }
  },

  // Lấy dữ liệu cho một tuần
  getWeekData: async (date: string): Promise<WeekData> => {
    try {
      console.log('CalendarService: Đang tải dữ liệu tuần...', date);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/calendar/week/${date}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('CalendarService: Đã tải dữ liệu tuần:', data);
      return data;
    } catch (error) {
      console.error('CalendarService: Lỗi khi tải dữ liệu tuần:', error);
      throw error;
    }
  },

  // Tạo events từ tasks và time blocks
  createEventsFromData: (tasks: Task[], timeBlocks: TimeBlock[]): CalendarEvent[] => {
    console.log('CalendarService: Creating events from data:', {
      tasksCount: tasks.length,
      timeBlocksCount: timeBlocks.length
    });

    const events: CalendarEvent[] = [];

    // Tạo events từ tasks có dueDate
    tasks.forEach(task => {
      if (task.dueDate && task.id) {
        events.push({
          id: `task-${task.id}`,
          title: task.title,
          start: task.dueDate,
          type: 'task',
          data: task,
          color: task.completed ? '#10b981' : '#f59e0b',
          completed: task.completed,
        });
      }
    });

    // Tạo events từ time blocks
    timeBlocks.forEach((timeBlock, index) => {
      console.log('CalendarService: Creating event for timeBlock:', timeBlock);
      if (timeBlock.id) {
        events.push({
          id: `timeblock-${timeBlock.id}`,
          title: timeBlock.title,
          start: timeBlock.startTime,
          end: timeBlock.endTime,
          type: 'timeblock',
          data: timeBlock,
          color: timeBlock.isCompleted ? '#10b981' : '#3b82f6',
          completed: timeBlock.isCompleted,
        });
      } else {
        console.warn('CalendarService: TimeBlock without id:', timeBlock);
        // Tạo id tạm thời nếu không có
        events.push({
          id: `timeblock-temp-${index}`,
          title: timeBlock.title,
          start: timeBlock.startTime,
          end: timeBlock.endTime,
          type: 'timeblock',
          data: timeBlock,
          color: timeBlock.isCompleted ? '#10b981' : '#3b82f6',
          completed: timeBlock.isCompleted,
        });
      }
    });

    console.log('CalendarService: Created events:', events);
    return events;
  },

  // Lấy tasks và time blocks cho ngày cụ thể
  getDataForDate: async (date: string): Promise<{ tasks: Task[], timeBlocks: TimeBlock[] }> => {
    try {
      console.log('CalendarService: Đang tải dữ liệu cho ngày...', date);
      
      // Lấy tasks có dueDate trong ngày
      const tasks = await ApiService.tasks.getAll();
      const tasksForDate = tasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
        return taskDate === date;
      });

      // Lấy time blocks trong ngày
      const timeBlocks = await ApiService.timeBlocks.getByDate(date);

      console.log('CalendarService: Đã tải dữ liệu cho ngày:', { tasks: tasksForDate, timeBlocks });
      
      return {
        tasks: tasksForDate,
        timeBlocks: timeBlocks,
      };
    } catch (error) {
      console.error('CalendarService: Lỗi khi tải dữ liệu cho ngày:', error);
      throw error;
    }
  },

  // Lấy tất cả events cho tháng hiện tại
  getCurrentMonthEvents: async (): Promise<CalendarEvent[]> => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const start = startOfMonth.toISOString().split('T')[0];
      const end = endOfMonth.toISOString().split('T')[0];
      
      const calendarData = await CalendarService.getCalendarData(start, end);
      return CalendarService.createEventsFromData(calendarData.tasks, calendarData.timeBlocks);
    } catch (error) {
      console.error('CalendarService: Lỗi khi tải events tháng hiện tại:', error);
      // Fallback: lấy từ API riêng lẻ
      try {
        const tasks = await ApiService.tasks.getAll();
        const timeBlocks = await ApiService.timeBlocks.getAll();
        return CalendarService.createEventsFromData(tasks, timeBlocks);
      } catch (fallbackError) {
        console.error('CalendarService: Lỗi fallback:', fallbackError);
        return [];
      }
    }
  },
};
