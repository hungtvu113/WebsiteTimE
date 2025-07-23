import { ApiService } from './api-service';

export interface TaskStatistics {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  byStatus: {
    backlog: number;
    todo: number;
    doing: number;
    done: number;
  };
  byCategory: Record<string, number>;
}

export interface TimeBlockStatistics {
  totalHours: number;
  completedHours: number;
  completionRate: number;
  byDay: Record<string, {
    total: number;
    completed: number;
  }>;
}

export interface ProductivityStatistics {
  productivityScore: number;
  taskCompletionRate: number;
  timeBlockCompletionRate: number;
  dailyScores: Record<string, number>;
}

export interface StatisticsQuery {
  startDate?: string;
  endDate?: string;
}

export const StatisticsService = {
  // Lấy thống kê công việc
  getTaskStatistics: async (query?: StatisticsQuery): Promise<TaskStatistics> => {
    try {
      console.log('StatisticsService: Đang tải thống kê công việc...', query);
      const data = await ApiService.statistics.getTaskStats(query?.startDate, query?.endDate);
      console.log('StatisticsService: Đã tải thống kê công việc:', data);
      return data;
    } catch (error) {
      console.error('StatisticsService: Lỗi khi tải thống kê công việc:', error);
      throw error;
    }
  },

  // Lấy thống kê khối thời gian
  getTimeBlockStatistics: async (query?: StatisticsQuery): Promise<TimeBlockStatistics> => {
    try {
      console.log('StatisticsService: Đang tải thống kê khối thời gian...', query);
      const data = await ApiService.statistics.getTimeBlockStats(query?.startDate, query?.endDate);
      console.log('StatisticsService: Đã tải thống kê khối thời gian:', data);
      return data;
    } catch (error) {
      console.error('StatisticsService: Lỗi khi tải thống kê khối thời gian:', error);
      throw error;
    }
  },

  // Lấy thống kê năng suất
  getProductivityStatistics: async (query?: StatisticsQuery): Promise<ProductivityStatistics> => {
    try {
      console.log('StatisticsService: Đang tải thống kê năng suất...', query);
      const data = await ApiService.statistics.getProductivityStats(query?.startDate, query?.endDate);
      console.log('StatisticsService: Đã tải thống kê năng suất:', data);
      return data;
    } catch (error) {
      console.error('StatisticsService: Lỗi khi tải thống kê năng suất:', error);
      throw error;
    }
  },

  // Lấy tất cả thống kê
  getAllStatistics: async (query?: StatisticsQuery) => {
    try {
      console.log('StatisticsService: Đang tải tất cả thống kê...', query);
      
      const [taskStats, timeBlockStats, productivityStats] = await Promise.all([
        StatisticsService.getTaskStatistics(query),
        StatisticsService.getTimeBlockStatistics(query),
        StatisticsService.getProductivityStatistics(query),
      ]);

      console.log('StatisticsService: Đã tải tất cả thống kê');
      
      return {
        tasks: taskStats,
        timeBlocks: timeBlockStats,
        productivity: productivityStats,
      };
    } catch (error) {
      console.error('StatisticsService: Lỗi khi tải tất cả thống kê:', error);
      throw error;
    }
  },

  // Tính toán thống kê cục bộ từ dữ liệu tasks (fallback)
  calculateLocalTaskStatistics: (tasks: any[]): TaskStatistics => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const overdue = tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      return new Date(task.dueDate) < new Date();
    }).length;

    const byPriority = {
      low: tasks.filter(task => task.priority === 'low').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      high: tasks.filter(task => task.priority === 'high').length,
    };

    const byStatus = {
      backlog: tasks.filter(task => task.status === 'backlog').length,
      todo: tasks.filter(task => task.status === 'todo').length,
      doing: tasks.filter(task => task.status === 'doing').length,
      done: tasks.filter(task => task.status === 'done').length,
    };

    const byCategory: Record<string, number> = {};
    tasks.forEach(task => {
      const category = task.category || 'Không có danh mục';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    return {
      total,
      completed,
      pending,
      overdue,
      byPriority,
      byStatus,
      byCategory,
    };
  },
};
