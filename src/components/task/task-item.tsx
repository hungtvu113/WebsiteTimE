'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TaskService } from '@/lib/services/task-service';
import { CategoryService } from '@/lib/services/category-service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Edit, Trash2, CalendarClock, Clock, Tag, MoreHorizontal } from 'lucide-react';
import { TaskForm } from './task-form';

interface TaskItemProps {
  task: Task;
  onUpdate: () => void;
}

export function TaskItem({ task, onUpdate }: TaskItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // @ts-ignore: Type Task không có trường category trong interface mới
  const category = task.category 
    ? CategoryService.getCategory(task.category) 
    : undefined;
  
  const priorityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-900/30',
    medium: 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
    low: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30',
  };

  const priorityLabels = {
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp',
  };
  
  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      TaskService.toggleTaskCompletion(task.id);
      onUpdate();
    } catch (error) {
      console.error('Lỗi khi cập nhật task:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      TaskService.deleteTask(task.id);
      onUpdate();
    } catch (error) {
      console.error('Lỗi khi xóa task:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div className={`rounded-lg border p-4 ${
        task.completed 
          ? 'bg-muted/40' 
          : 'bg-card'
      }`}>
        <div className="flex items-start gap-4">
          <Checkbox 
            id={`task-${task.id}`} 
            checked={task.completed}
            onCheckedChange={handleToggleComplete}
            disabled={isLoading}
            className="mt-1"
          />
          <div className="grid flex-1 gap-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
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
                      <p>Chỉnh sửa công việc</p>
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
                      <p>Xóa công việc</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground">
                {task.description}
              </p>
            )}
            
            <div className="mt-2 flex flex-wrap gap-2">
              <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityColors[task.priority]}`}>
                {priorityLabels[task.priority]}
              </div>
              
              {category && (
                <div 
                  className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                  style={{ 
                    backgroundColor: `${category.color}10`, 
                    color: category.color,
                    borderColor: `${category.color}30`
                  }}
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {category.name}
                </div>
              )}
              
              {task.dueDate && (
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400">
                  <CalendarClock className="mr-1 h-3 w-3" />
                  {format(new Date(task.dueDate), 'PPP', { locale: vi })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <TaskForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={onUpdate}
        task={task}
      />
    </>
  );
} 