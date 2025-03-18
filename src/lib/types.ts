export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface TimeBlock {
  id: string;
  taskId?: string | null;
  title: string;
  startTime: string;
  endTime: string;
  isCompleted: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  description?: string;
  color?: string;
}

export interface Preference {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  calendarView: 'day' | 'week' | 'month';
  startOfWeek: 0 | 1 | 6; // 0: Sunday, 1: Monday, 6: Saturday
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  color?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  startOfWeek: 'monday' | 'sunday';
  showCompletedTasks: boolean;
} 