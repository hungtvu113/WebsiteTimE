'use client';

import { useState, useEffect } from 'react';
import { TimeBlock, Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TimeBlockService } from '@/lib/services/time-block-service';
import { TaskService } from '@/lib/services/task-service';
import { ApiService } from '@/lib/services/api-service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Edit, Trash2, Clock, LinkIcon, Loader2 } from 'lucide-react';
import { TimeBlockForm } from './time-block-form';

interface TimeBlockItemProps {
  timeBlock: TimeBlock;
  onUpdate: () => void;
}

export function TimeBlockItem({ timeBlock, onUpdate }: TimeBlockItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [linkedTask, setLinkedTask] = useState<Task | undefined>(undefined);
  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  
  // Tải thông tin công việc liên kết nếu có
  useEffect(() => {
    const loadLinkedTask = async () => {
      if (!timeBlock.taskId || typeof timeBlock.taskId !== 'string') return;

      setTaskLoading(true);
      try {
        console.log('TimeBlockItem: Đang tải task với ID:', timeBlock.taskId);
        const task = await TaskService.getTask(timeBlock.taskId);
        setLinkedTask(task);
        console.log('TimeBlockItem: Đã tải task:', task);
      } catch (error) {
        console.error('Lỗi khi tải thông tin công việc liên kết:', error);
        setLinkedTask(undefined);
      } finally {
        setTaskLoading(false);
      }
    };

    loadLinkedTask();
  }, [timeBlock.taskId]);
  
  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      console.log('TimeBlockItem: Toggling completion for:', timeBlock.id, 'current:', timeBlock.isCompleted);
      console.log('TimeBlockItem: Calling toggleCompletion with id:', timeBlock.id, 'newValue:', !timeBlock.isCompleted);
      await ApiService.timeBlocks.toggleCompletion(timeBlock.id, !timeBlock.isCompleted);
      onUpdate();
    } catch (error) {
      console.error('Lỗi khi cập nhật khối thời gian:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await TimeBlockService.deleteTimeBlock(timeBlock.id);
      onUpdate();
    } catch (error) {
      console.error('Lỗi khi xóa khối thời gian:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Tính thời gian
  const startTime = format(new Date(timeBlock.startTime), 'HH:mm', { locale: vi });
  const endTime = format(new Date(timeBlock.endTime), 'HH:mm', { locale: vi });
  
  // Tính thời lượng (phút)
  const durationInMinutes = Math.round(
    (new Date(timeBlock.endTime).getTime() - new Date(timeBlock.startTime).getTime()) / (1000 * 60)
  );
  
  // Chuyển đổi sang giờ và phút
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  const durationText = hours > 0 
    ? `${hours} giờ ${minutes > 0 ? `${minutes} phút` : ''}`
    : `${minutes} phút`;
  
  return (
    <>
      <div 
        className={`rounded-lg border p-4 ${
          timeBlock.isCompleted 
            ? 'bg-muted/40' 
            : 'bg-card'
        }`}
      >
        <div className="flex items-start gap-4">
          <Checkbox 
            id={`timeblock-${timeBlock.id}`} 
            checked={timeBlock.isCompleted}
            onCheckedChange={handleToggleComplete}
            disabled={isLoading}
            className="mt-1"
          />
          <div className="grid flex-1 gap-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className={`font-medium ${timeBlock.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {timeBlock.title}
              </h3>
              
              <div className="flex flex-shrink-0 gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={() => setIsEditDialogOpen(true)}
                        disabled={isLoading}
                        className="h-8 w-8 text-muted-foreground"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Chỉnh sửa</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Chỉnh sửa khối thời gian</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Xóa</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Xóa khối thời gian</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{startTime} - {endTime}</span>
              <span className="text-xs px-1 rounded-full bg-muted">
                {durationText}
              </span>
            </div>
            
            {timeBlock.taskId && (
              <div className="mt-1 flex items-center gap-1 text-sm">
                <LinkIcon className="h-3.5 w-3.5 text-blue-500" />
                {taskLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    <span className="text-muted-foreground">Đang tải...</span>
                  </div>
                ) : linkedTask ? (
                  <span className="text-blue-600 dark:text-blue-400">
                    {linkedTask.title}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Không tìm thấy công việc</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <TimeBlockForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={onUpdate}
        date={new Date(timeBlock.startTime)}
        timeBlock={timeBlock}
      />
    </>
  );
}