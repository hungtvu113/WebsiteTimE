import { v4 as uuidv4 } from 'uuid';
import { TimeBlock } from '../types';

// Mô phỏng localStorage cho môi trường máy chủ và client
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

export const TimeBlockService = {
  getTimeBlocks: (): TimeBlock[] => {
    const storage = getLocalStorage();
    if (!storage) return [];
    
    const timeBlocks = storage.getItem('timeBlocks');
    if (!timeBlocks) return [];
    
    return JSON.parse(timeBlocks, (key, value) => {
      if (key === 'startTime' || key === 'endTime') {
        return new Date(value);
      }
      return value;
    });
  },
  
  getTimeBlocksForDay: (date: Date): TimeBlock[] => {
    const timeBlocks = TimeBlockService.getTimeBlocks();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return timeBlocks.filter(block => {
      const blockDate = new Date(block.startTime);
      return blockDate >= targetDate && blockDate < nextDay;
    });
  },
  
  getTimeBlock: (id: string): TimeBlock | undefined => {
    const timeBlocks = TimeBlockService.getTimeBlocks();
    return timeBlocks.find(block => block.id === id);
  },
  
  createTimeBlock: (timeBlock: TimeBlock): TimeBlock => {
    const storage = getLocalStorage();
    if (!storage) throw new Error('Storage not available');
    
    const timeBlocks = TimeBlockService.getTimeBlocks();
    
    storage.setItem('timeBlocks', JSON.stringify([...timeBlocks, timeBlock]));
    return timeBlock;
  },
  
  updateTimeBlock: (timeBlock: TimeBlock): TimeBlock => {
    const storage = getLocalStorage();
    if (!storage) throw new Error('Storage not available');
    
    const timeBlocks = TimeBlockService.getTimeBlocks();
    const blockIndex = timeBlocks.findIndex(block => block.id === timeBlock.id);
    
    if (blockIndex === -1) {
      throw new Error('Time block not found');
    }
    
    timeBlocks[blockIndex] = timeBlock;
    storage.setItem('timeBlocks', JSON.stringify(timeBlocks));
    
    return timeBlock;
  },
  
  deleteTimeBlock: (id: string): void => {
    const storage = getLocalStorage();
    if (!storage) throw new Error('Storage not available');
    
    const timeBlocks = TimeBlockService.getTimeBlocks();
    const updatedTimeBlocks = timeBlocks.filter(block => block.id !== id);
    
    storage.setItem('timeBlocks', JSON.stringify(updatedTimeBlocks));
  },
  
  toggleTimeBlockCompletion: (id: string): TimeBlock => {
    const timeBlock = TimeBlockService.getTimeBlock(id);
    if (!timeBlock) {
      throw new Error('Time block not found');
    }
    
    return TimeBlockService.updateTimeBlock({
      ...timeBlock,
      isCompleted: !timeBlock.isCompleted
    });
  },
}; 