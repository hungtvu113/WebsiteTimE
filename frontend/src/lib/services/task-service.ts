import { Task } from '../types';
import { ApiService } from './api-service';

// Tạo một lớp cache đơn giản để lưu trữ tạm thởi
let tasksCache: Task[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 phút

export const TaskService = {
  getTasks: async (): Promise<Task[]> => {
    const now = Date.now();
    // Kiểm tra xem cache có hết hạn chưa
    if (now - lastFetchTime > CACHE_DURATION || tasksCache.length === 0) {
      try {
        const tasks = await ApiService.tasks.getAll();
        tasksCache = tasks;
        lastFetchTime = now;
        return tasks;
      } catch (error) {
        console.error('Lỗi khi lấy danh sách công việc:', error);
        // Nếu có lỗi, trả về cache hiện tại hoặc mảng rỗng
        return tasksCache.length > 0 ? tasksCache : [];
      }
    }
    return tasksCache;
  },
  
  getTask: async (id: string): Promise<Task | undefined> => {
    try {
      // Kiểm tra trong cache trước
      const cachedTask = tasksCache.find(task => task.id === id);
      if (cachedTask) return cachedTask;

      // Nếu không có trong cache, gọi API
      const task = await ApiService.tasks.getById(id);

      // API trả về null cho 404, không throw error
      if (task === null) {
        console.debug(`Task với ID ${id} không tồn tại (đã bị xóa hoặc không hợp lệ)`);
        return undefined;
      }

      return task;
    } catch (error: any) {
      // Chỉ log lỗi cho các lỗi khác (không phải 404)
      console.error(`Lỗi khi lấy công việc với id ${id}:`, error);
      return undefined;
    }
  },
  
  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      const newTask = await ApiService.tasks.create(task);
      // Cập nhật cache
      tasksCache = [...tasksCache, newTask];
      return newTask;
    } catch (error) {
      console.error('Lỗi khi tạo công việc mới:', error);
      throw error;
    }
  },
  
  updateTask: async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> => {
    try {
      console.log(`TaskService: Đang cập nhật task ${id} với data:`, updates);
      const updatedTask = await ApiService.tasks.update(id, updates);
      console.log(`TaskService: Task ${id} đã được cập nhật:`, updatedTask);

      // Cập nhật cache
      const taskIndex = tasksCache.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        tasksCache[taskIndex] = updatedTask;
      }
      return updatedTask;
    } catch (error) {
      console.error(`TaskService: Lỗi khi cập nhật công việc với id ${id}:`, error);
      throw error;
    }
  },
  
  deleteTask: async (id: string): Promise<void> => {
    try {
      await ApiService.tasks.delete(id);
      // Cập nhật cache
      tasksCache = tasksCache.filter(task => task.id !== id);
    } catch (error) {
      console.error(`Lỗi khi xóa công việc với id ${id}:`, error);
      throw error;
    }
  },
  
  toggleTaskCompletion: async (id: string): Promise<Task> => {
    try {
      const updatedTask = await ApiService.tasks.toggleCompletion(id);
      // Cập nhật cache
      const taskIndex = tasksCache.findIndex(task => task.id === id);
      if (taskIndex !== -1) {
        tasksCache[taskIndex] = updatedTask;
      }
      return updatedTask;
    } catch (error) {
      console.error(`Lỗi khi chuyển trạng thái hoàn thành của công việc với id ${id}:`, error);
      throw error;
    }
  },
  
  // Phương thức để xóa cache khi cần thiết
  clearCache: () => {
    tasksCache = [];
    lastFetchTime = 0;
  },
  
  // Phương thức để tải lại dữ liệu từ API
  refreshTasks: async (): Promise<Task[]> => {
    try {
      const tasks = await ApiService.tasks.getAll();
      tasksCache = tasks;
      lastFetchTime = Date.now();
      return tasks;
    } catch (error) {
      console.error('Lỗi khi làm mới danh sách công việc:', error);
      return tasksCache;
    }
  }
};