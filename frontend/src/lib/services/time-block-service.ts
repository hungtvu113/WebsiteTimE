import { TimeBlock } from '../types';
import { ApiService } from './api-service';

// Cache cho time blocks
let timeBlocksCache: TimeBlock[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 phút

export const TimeBlockService = {
  getTasks: async (): Promise<TimeBlock[]> => {
    const now = Date.now();
    
    // Nếu có cache và chưa hết hạn, trả về cache
    if (timeBlocksCache && now - lastFetchTime < CACHE_DURATION) {
      return timeBlocksCache;
    }
    
    try {
      // Gọi API để lấy time blocks
      const timeBlocks = await ApiService.timeBlocks.getAll();
      timeBlocksCache = timeBlocks;
      lastFetchTime = now;
      return timeBlocks;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khối thời gian:', error);
      
      // Nếu có lỗi và đã có cache, trả về cache
      if (timeBlocksCache) {
        return timeBlocksCache;
      }
      
      // Nếu không có cache, trả về mảng rỗng
      return [];
    }
  },
  
  getTimeBlocks: async (): Promise<TimeBlock[]> => {
    return TimeBlockService.getTasks();
  },
  
  getTimeBlocksForDay: async (date: Date): Promise<TimeBlock[]> => {
    const timeBlocks = await TimeBlockService.getTimeBlocks();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return timeBlocks.filter(block => {
      const blockDate = new Date(block.startTime);
      return blockDate >= targetDate && blockDate < nextDay;
    });
  },
  
  getTimeBlock: async (id: string): Promise<TimeBlock | undefined> => {
    try {
      return await ApiService.timeBlocks.getById(id);
    } catch (error) {
      console.error(`Lỗi khi lấy khối thời gian với id ${id}:`, error);
      
      // Nếu có cache, tìm trong cache
      if (timeBlocksCache) {
        return timeBlocksCache.find(block => block.id === id);
      }
      
      return undefined;
    }
  },
  
  createTimeBlock: async (timeBlock: Omit<TimeBlock, 'id'>): Promise<TimeBlock> => {
    try {
      // Loại bỏ id nếu có (để đảm bảo không gửi id trong request tạo mới)
      const { id, ...timeBlockData } = timeBlock as any;

      console.log('TimeBlockService: Tạo time block với data:', timeBlockData);
      const newTimeBlock = await ApiService.timeBlocks.create(timeBlockData);

      // Cập nhật cache nếu có
      if (timeBlocksCache) {
        timeBlocksCache.push(newTimeBlock);
      }

      return newTimeBlock;
    } catch (error) {
      console.error('Lỗi khi tạo khối thời gian mới:', error);
      throw error;
    }
  },
  
  updateTimeBlock: async (timeBlock: TimeBlock): Promise<TimeBlock> => {
    try {
      const updatedTimeBlock = await ApiService.timeBlocks.update(timeBlock.id, timeBlock);
      
      // Cập nhật cache nếu có
      if (timeBlocksCache) {
        const index = timeBlocksCache.findIndex(block => block.id === timeBlock.id);
        if (index !== -1) {
          timeBlocksCache[index] = updatedTimeBlock;
        }
      }
      
      return updatedTimeBlock;
    } catch (error) {
      console.error(`Lỗi khi cập nhật khối thời gian với id ${timeBlock.id}:`, error);
      throw error;
    }
  },
  
  deleteTimeBlock: async (id: string): Promise<void> => {
    try {
      await ApiService.timeBlocks.delete(id);
      
      // Cập nhật cache nếu có
      if (timeBlocksCache) {
        timeBlocksCache = timeBlocksCache.filter(block => block.id !== id);
      }
    } catch (error) {
      console.error(`Lỗi khi xóa khối thời gian với id ${id}:`, error);
      throw error;
    }
  },
  
  toggleTimeBlockCompletion: async (id: string): Promise<TimeBlock> => {
    try {
      const timeBlock = await TimeBlockService.getTimeBlock(id);
      if (!timeBlock) {
        throw new Error('Không tìm thấy khối thời gian');
      }
      
      return await TimeBlockService.updateTimeBlock({
        ...timeBlock,
        isCompleted: !timeBlock.isCompleted
      });
    } catch (error) {
      console.error(`Lỗi khi chuyển đổi trạng thái hoàn thành của khối thời gian với id ${id}:`, error);
      throw error;
    }
  },
  
  // Phương thức để tải lại dữ liệu từ API
  refreshTimeBlocks: async (): Promise<TimeBlock[]> => {
    try {
      const timeBlocks = await ApiService.timeBlocks.getAll();
      timeBlocksCache = timeBlocks;
      lastFetchTime = Date.now();
      return timeBlocks;
    } catch (error) {
      console.error('Lỗi khi làm mới danh sách khối thời gian:', error);
      throw error;
    }
  },
  
  // Xóa cache khi cần thiết
  clearCache: () => {
    timeBlocksCache = null;
    lastFetchTime = 0;
  },
};