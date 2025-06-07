import { TimeBlockService } from '../services/time-block-service';
import { TaskService } from '../services/task-service';

/**
 * Dọn dẹp các TimeBlock có taskId không hợp lệ (task đã bị xóa)
 */
export const cleanupInvalidTimeBlocks = async () => {
  try {
    console.log('CleanupUtils: Bắt đầu dọn dẹp TimeBlocks không hợp lệ...');
    
    // Lấy tất cả time blocks
    const timeBlocks = await TimeBlockService.getTimeBlocks();
    
    // Lọc ra những time blocks có taskId
    const timeBlocksWithTasks = timeBlocks.filter(tb => tb.taskId);
    
    if (timeBlocksWithTasks.length === 0) {
      console.log('CleanupUtils: Không có TimeBlock nào có taskId để kiểm tra');
      return;
    }
    
    console.log(`CleanupUtils: Kiểm tra ${timeBlocksWithTasks.length} TimeBlocks có taskId...`);
    
    let cleanedCount = 0;
    
    // Kiểm tra từng time block
    for (const timeBlock of timeBlocksWithTasks) {
      try {
        const task = await TaskService.getTask(timeBlock.taskId!);
        
        // Nếu task không tồn tại, xóa taskId khỏi timeBlock
        if (!task) {
          console.log(`CleanupUtils: Dọn dẹp TimeBlock "${timeBlock.title}" - task ID không hợp lệ: ${timeBlock.taskId}`);
          
          await TimeBlockService.updateTimeBlock(timeBlock.id, {
            taskId: null
          });
          
          cleanedCount++;
        }
      } catch (error) {
        console.error(`CleanupUtils: Lỗi khi kiểm tra task ${timeBlock.taskId}:`, error);
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`CleanupUtils: Đã dọn dẹp ${cleanedCount} TimeBlocks có taskId không hợp lệ`);
    } else {
      console.log('CleanupUtils: Tất cả TimeBlocks đều có taskId hợp lệ');
    }
    
    return cleanedCount;
  } catch (error) {
    console.error('CleanupUtils: Lỗi khi dọn dẹp TimeBlocks:', error);
    return 0;
  }
};

/**
 * Kiểm tra và báo cáo các TimeBlock có vấn đề mà không sửa
 */
export const validateTimeBlocks = async () => {
  try {
    const timeBlocks = await TimeBlockService.getTimeBlocks();
    const timeBlocksWithTasks = timeBlocks.filter(tb => tb.taskId);
    
    const invalidTimeBlocks = [];
    
    for (const timeBlock of timeBlocksWithTasks) {
      try {
        const task = await TaskService.getTask(timeBlock.taskId!);
        if (!task) {
          invalidTimeBlocks.push({
            timeBlockId: timeBlock.id,
            timeBlockTitle: timeBlock.title,
            invalidTaskId: timeBlock.taskId
          });
        }
      } catch (error) {
        invalidTimeBlocks.push({
          timeBlockId: timeBlock.id,
          timeBlockTitle: timeBlock.title,
          invalidTaskId: timeBlock.taskId,
          error: error
        });
      }
    }
    
    return {
      total: timeBlocksWithTasks.length,
      invalid: invalidTimeBlocks.length,
      invalidTimeBlocks
    };
  } catch (error) {
    console.error('CleanupUtils: Lỗi khi validate TimeBlocks:', error);
    return {
      total: 0,
      invalid: 0,
      invalidTimeBlocks: [],
      error
    };
  }
};
