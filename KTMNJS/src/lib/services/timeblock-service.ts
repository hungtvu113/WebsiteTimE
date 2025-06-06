import { ApiService } from './api-service';
import { TimeBlock } from '@/lib/types';

export interface CreateTimeBlockData {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  taskId?: string;
  isCompleted?: boolean;
}

export interface UpdateTimeBlockData {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  taskId?: string;
  isCompleted?: boolean;
}

export const TimeBlockService = {
  // Lấy tất cả time blocks
  getTimeBlocks: async (): Promise<TimeBlock[]> => {
    try {
      console.log('TimeBlockService: Đang tải time blocks...');
      const timeBlocks = await ApiService.timeBlocks.getAll();
      console.log('TimeBlockService: Đã tải time blocks:', timeBlocks);
      return timeBlocks;
    } catch (error) {
      console.error('TimeBlockService: Lỗi khi tải time blocks:', error);
      throw error;
    }
  },

  // Lấy time blocks theo ngày
  getTimeBlocksByDate: async (date: string): Promise<TimeBlock[]> => {
    try {
      console.log('TimeBlockService: Đang tải time blocks cho ngày...', date);
      const timeBlocks = await ApiService.timeBlocks.getByDate(date);
      console.log('TimeBlockService: Đã tải time blocks cho ngày:', timeBlocks);
      return timeBlocks;
    } catch (error) {
      console.error('TimeBlockService: Lỗi khi tải time blocks cho ngày:', error);
      throw error;
    }
  },

  // Lấy time block theo ID
  getTimeBlockById: async (id: string): Promise<TimeBlock> => {
    try {
      console.log('TimeBlockService: Đang tải time block...', id);
      const timeBlock = await ApiService.timeBlocks.getById(id);
      console.log('TimeBlockService: Đã tải time block:', timeBlock);
      return timeBlock;
    } catch (error) {
      console.error('TimeBlockService: Lỗi khi tải time block:', error);
      throw error;
    }
  },

  // Tạo time block mới
  createTimeBlock: async (data: CreateTimeBlockData): Promise<TimeBlock> => {
    try {
      console.log('TimeBlockService: Đang tạo time block...', data);
      
      // Validate dữ liệu
      if (!data.title.trim()) {
        throw new Error('Tiêu đề không được để trống');
      }
      
      if (!data.startTime || !data.endTime) {
        throw new Error('Thời gian bắt đầu và kết thúc không được để trống');
      }
      
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      
      if (startTime >= endTime) {
        throw new Error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
      }
      
      const timeBlock = await ApiService.timeBlocks.create({
        title: data.title.trim(),
        startTime: data.startTime,
        endTime: data.endTime,
        taskId: data.taskId,
        isCompleted: data.isCompleted || false,
      });
      
      console.log('TimeBlockService: Đã tạo time block:', timeBlock);
      return timeBlock;
    } catch (error) {
      console.error('TimeBlockService: Lỗi khi tạo time block:', error);
      throw error;
    }
  },

  // Cập nhật time block
  updateTimeBlock: async (id: string, data: UpdateTimeBlockData): Promise<TimeBlock> => {
    try {
      console.log('TimeBlockService: Đang cập nhật time block...', 'id:', id, 'data:', data);
      console.log('TimeBlockService: id type:', typeof id, 'data type:', typeof data);
      
      // Validate dữ liệu nếu có
      if (data.title !== undefined && !data.title.trim()) {
        throw new Error('Tiêu đề không được để trống');
      }
      
      if (data.startTime && data.endTime) {
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        
        if (startTime >= endTime) {
          throw new Error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
        }
      }
      
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.startTime !== undefined) updateData.startTime = data.startTime;
      if (data.endTime !== undefined) updateData.endTime = data.endTime;
      if (data.taskId !== undefined) updateData.taskId = data.taskId;
      if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted;

      console.log('TimeBlockService: Final updateData:', updateData);
      const timeBlock = await ApiService.timeBlocks.update(id, updateData);
      console.log('TimeBlockService: Đã cập nhật time block:', timeBlock);
      return timeBlock;
    } catch (error) {
      console.error('TimeBlockService: Lỗi khi cập nhật time block:', error);
      throw error;
    }
  },

  // Xóa time block
  deleteTimeBlock: async (id: string): Promise<void> => {
    try {
      console.log('TimeBlockService: Đang xóa time block...', id);
      await ApiService.timeBlocks.delete(id);
      console.log('TimeBlockService: Đã xóa time block:', id);
    } catch (error) {
      console.error('TimeBlockService: Lỗi khi xóa time block:', error);
      throw error;
    }
  },

  // Toggle completion status
  toggleCompletion: async (id: string): Promise<TimeBlock> => {
    try {
      console.log('TimeBlockService: Đang toggle completion...', id);

      // Lấy time block hiện tại để biết trạng thái
      const currentTimeBlock = await TimeBlockService.getTimeBlockById(id);

      // Gọi API toggle completion trực tiếp
      const updatedTimeBlock = await ApiService.timeBlocks.toggleCompletion(id, !currentTimeBlock.isCompleted);

      console.log('TimeBlockService: Đã toggle completion:', updatedTimeBlock);
      return updatedTimeBlock;
    } catch (error) {
      console.error('TimeBlockService: Lỗi khi toggle completion:', error);
      throw error;
    }
  },

  // Lấy time blocks trong khoảng thời gian
  getTimeBlocksInRange: async (startDate: string, endDate: string): Promise<TimeBlock[]> => {
    try {
      console.log('TimeBlockService: Đang tải time blocks trong khoảng...', { startDate, endDate });
      
      // Lấy tất cả time blocks và filter theo client
      const allTimeBlocks = await TimeBlockService.getTimeBlocks();
      
      const filteredTimeBlocks = allTimeBlocks.filter(timeBlock => {
        const blockDate = new Date(timeBlock.startTime).toISOString().split('T')[0];
        return blockDate >= startDate && blockDate <= endDate;
      });
      
      console.log('TimeBlockService: Đã filter time blocks:', filteredTimeBlocks);
      return filteredTimeBlocks;
    } catch (error) {
      console.error('TimeBlockService: Lỗi khi tải time blocks trong khoảng:', error);
      throw error;
    }
  },

  // Kiểm tra xung đột thời gian
  checkTimeConflict: async (startTime: string, endTime: string, excludeId?: string): Promise<boolean> => {
    try {
      const date = new Date(startTime).toISOString().split('T')[0];
      const timeBlocks = await TimeBlockService.getTimeBlocksByDate(date);
      
      const newStart = new Date(startTime);
      const newEnd = new Date(endTime);
      
      for (const timeBlock of timeBlocks) {
        // Bỏ qua time block đang được cập nhật
        if (excludeId && timeBlock.id === excludeId) continue;
        
        const existingStart = new Date(timeBlock.startTime);
        const existingEnd = new Date(timeBlock.endTime);
        
        // Kiểm tra xung đột
        if (
          (newStart >= existingStart && newStart < existingEnd) ||
          (newEnd > existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        ) {
          return true; // Có xung đột
        }
      }
      
      return false; // Không có xung đột
    } catch (error) {
      console.error('TimeBlockService: Lỗi khi kiểm tra xung đột:', error);
      return false; // Mặc định không có xung đột nếu lỗi
    }
  },
};
