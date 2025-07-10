'use client';

import { useState, useEffect } from 'react';
import { Task, Category } from '@/lib/types';
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
import { Edit, Trash2, CalendarClock, Tag, Loader2 } from 'lucide-react';
import { TaskForm } from './task-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { useStatisticsRefresh } from '@/lib/contexts/statistics-context';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
}

export function TaskItem({ task: initialTask, onDelete }: TaskItemProps) {
  const refreshStatistics = useStatisticsRefresh();
  // Thêm state để theo dõi trạng thái của task bên trong component
  const [task, setTask] = useState<Task>(initialTask);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Debug: Log task data khi component mount
  useEffect(() => {
    console.log(`TaskItem: Task data for "${task.title}":`, {
      id: task.id,
      title: task.title,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status
    });
  }, [task.id]);

  // Tải thông tin danh mục nếu task có category
  useEffect(() => {
    const loadCategory = async () => {
      console.log(`TaskItem: useEffect triggered for task "${task.title}" with category: ${task.category}`);

      if (!task.category) {
        console.log(`TaskItem: Task "${task.title}" không có category`);
        setCategory(undefined);
        return;
      }

      console.log(`TaskItem: Đang tải danh mục với ID: ${task.category} cho task "${task.title}"`);
      setCategoryLoading(true);
      try {
        const categoryData = await CategoryService.getCategory(task.category);
        console.log(`TaskItem: Đã tải danh mục cho task "${task.title}":`, categoryData);
        setCategory(categoryData);
      } catch (error) {
        console.error(`TaskItem: Lỗi khi tải thông tin danh mục với ID ${task.category} cho task "${task.title}":`, error);
        setCategory(undefined);
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategory();
  }, [task.category, task.title]);
  
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
      // Lấy ID từ task.id hoặc task._id
      const taskId = task.id || (task as any)._id;
      console.log('TaskItem: Toggle completion for task:', task);
      console.log('TaskItem: Task ID:', taskId);

      if (!taskId) {
        throw new Error('Không tìm thấy ID của công việc');
      }

      // Gọi API để cập nhật trạng thái hoàn thành
      const updatedTask = await TaskService.toggleTaskCompletion(taskId);

      // Cập nhật trạng thái local để UI cập nhật ngay lập tức
      setTask(updatedTask);

      // Trigger statistics refresh
      refreshStatistics();
    } catch (error) {
      console.error('TaskItem: Lỗi khi cập nhật task:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const [showConfirm, setShowConfirm] = useState(false);
  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // Xóa task qua API
      await TaskService.deleteTask(task.id);

      // Trigger statistics refresh
      refreshStatistics();

      // Gọi callback để cha cập nhật state
      onDelete(task.id);
    } catch (error) {
      console.error('Lỗi khi xóa task:', error);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  // Cập nhật task từ form edit
  const handleTaskUpdated = (updatedTask?: Task) => {
    if (updatedTask) {
      setTask(updatedTask);
    }
    setIsEditDialogOpen(false);
  };
  
  return (
    <>
      <div className={`rounded-lg border p-4 backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
        task.completed 
          ? 'bg-muted/40' 
          : 'bg-background/80'
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
                {isLoading && (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  </div>
                )}
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" 
                        size="icon"
                        onClick={() => setIsEditDialogOpen(true)}
                        disabled={isLoading}
                        className="h-8 w-8 text-muted-foreground hover:bg-accent/50"
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
                        onClick={() => setShowConfirm(true)}
                        disabled={isLoading}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
                <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bạn có chắc chắn muốn xóa công việc này?</DialogTitle>
                      <DialogDescription>
                        Hành động này không thể hoàn tác. Công việc sẽ bị xóa vĩnh viễn.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setShowConfirm(false)}>Hủy</Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDelete} 
                        disabled={isLoading}
                        className="gap-2"
                      >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Xóa
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
              
              {categoryLoading ? (
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Đang tải...
                </div>
              ) : category ? (
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
              ) : null}
              
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
        task={task}
        onAdded={handleTaskUpdated}
      />
    </>
  );
}