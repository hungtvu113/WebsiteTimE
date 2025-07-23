'use client';

import { useState, useEffect } from 'react';
import { Task, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { TaskService } from '@/lib/services/task-service';
import { CategoryService } from '@/lib/services/category-service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { AlertCircle, CalendarIcon, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AIService } from '@/lib/services/ai-service';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatisticsRefresh } from '@/lib/contexts/statistics-context';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: (task?: Task) => void;
  task?: Task;
}

export function TaskForm({ isOpen, onClose, onAdded, task }: TaskFormProps) {
  const refreshStatistics = useStatisticsRefresh();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate ? new Date(task.dueDate) : undefined);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(task?.priority || 'medium');
  const [category, setCategory] = useState<string | undefined>(task?.category);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Tải danh sách danh mục khi component được mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const fetchedCategories = await CategoryService.getCategories();
        console.log('TaskForm: Đã tải categories:', fetchedCategories);

        // Kiểm tra duplicate IDs
        const ids = fetchedCategories.map(cat => cat.id);
        const uniqueIds = [...new Set(ids)];
        if (ids.length !== uniqueIds.length) {
          console.warn('TaskForm: Phát hiện duplicate category IDs:', ids);
          console.warn('TaskForm: Categories chi tiết:', fetchedCategories);
        } else {
          console.log('TaskForm: Không có duplicate IDs:', ids);
        }

        setCategories(fetchedCategories);

        // Nếu chỉ có danh mục mặc định, hiển thị thông báo
        if (fetchedCategories.length === 4 && fetchedCategories[0].id === '1') {
          setCategoriesError('Đang sử dụng danh mục mặc định. Vào trang "Danh mục" để tạo danh mục tùy chỉnh.');
        }
      } catch (error) {
        console.error('TaskForm: Lỗi khi tải danh mục:', error);
        setCategoriesError('Không thể tải danh sách danh mục. Vui lòng thử lại.');
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveError(null);
    
    try {
      const taskData = {
        title,
        description,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        priority,
        category: category === 'none' ? undefined : category,
        completed: task?.completed || false,
      };
      
      let updatedTask: Task;
      
      if (task) {
        updatedTask = await TaskService.updateTask(task.id, taskData);
      } else {
        updatedTask = await TaskService.createTask(taskData);
      }
      
      if (onAdded) onAdded(updatedTask);

      // Trigger statistics refresh
      refreshStatistics();

      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu task:', error);
      setSaveError('Không thể lưu công việc. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hàm xử lý gợi ý từ AI
  const handleAiSuggestions = async () => {
    if (!title) {
      alert("Vui lòng nhập tiêu đề công việc trước");
      return;
    }
    
    setIsAiLoading(true);
    try {
      // Gợi ý độ ưu tiên
      const suggestedPriority = await AIService.suggestPriority(title, description);
      setPriority(suggestedPriority);
      
      // Gợi ý ngày hoàn thành nếu chưa chọn
      if (!dueDate) {
        const suggestedDate = await AIService.suggestDueDate(title, description);
        if (suggestedDate) {
          setDueDate(new Date(suggestedDate));
        }
      }
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Hàm tải lại danh mục
  const handleRefreshCategories = async () => {
    setIsCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const refreshedCategories = await CategoryService.refreshCategories();
      setCategories(refreshedCategories);
    } catch (error) {
      console.error('Lỗi khi tải lại danh mục:', error);
      setCategoriesError('Không thể tải danh sách danh mục. Vui lòng thử lại.');
    } finally {
      setIsCategoriesLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-sm border border-border/40 bg-background/90">
        <DialogHeader>
          <DialogTitle>{task ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}</DialogTitle>
          <DialogDescription>
            {task ? 'Cập nhật thông tin công việc của bạn' : 'Tạo công việc mới để quản lý thời gian hiệu quả'}
          </DialogDescription>
        </DialogHeader>
        
        {saveError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề công việc"
              className="bg-background/80"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Mô tả
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả chi tiết (không bắt buộc)"
              className="resize-none h-20 bg-background/80"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                Hạn hoàn thành
              </label>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background/80",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'PPP', { locale: vi }) : <span>Chọn ngày</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 backdrop-blur-sm border border-border/40 bg-background/90">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium mb-1">
                Mức độ ưu tiên
              </label>
              <Select value={priority} onValueChange={(value) => setPriority(value as 'high' | 'medium' | 'low')}>
                <SelectTrigger className="bg-background/80">
                  <SelectValue placeholder="Chọn mức độ ưu tiên" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-sm border border-border/40 bg-background/90">
                  <SelectItem key="priority-high" value="high">
                    Cao
                  </SelectItem>
                  <SelectItem key="priority-medium" value="medium">
                    Trung bình
                  </SelectItem>
                  <SelectItem key="priority-low" value="low">
                    Thấp
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1 flex justify-between">
              <span>Danh mục</span>
              {isCategoriesLoading ? (
                <span className="text-xs text-muted-foreground">Đang tải...</span>
              ) : categoriesError ? (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefreshCategories} 
                  className="h-5 text-xs gap-1 text-muted-foreground hover:text-primary"
                >
                  <RefreshCw className="h-3 w-3" /> Tải lại
                </Button>
              ) : null}
            </label>
            
            {categoriesError ? (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{categoriesError}</AlertDescription>
              </Alert>
            ) : isCategoriesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={category || 'none'} onValueChange={setCategory}>
                <SelectTrigger className="bg-background/80">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-sm border border-border/40 bg-background/90">
                  <SelectItem key="category-none" value="none">
                    Không có danh mục
                  </SelectItem>
                  {categories.map((cat, index) => {
                    const uniqueKey = `category-${cat.id}-${index}-${Date.now()}`;
                    return (
                      <SelectItem
                        key={uniqueKey}
                        value={cat.id}
                      >
                        {cat.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="flex justify-end mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAiSuggestions}
              disabled={isAiLoading || !title.trim()}
              className="gap-1"
            >
              {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lightbulb className="h-3 w-3" />}
              Gợi ý từ AI
            </Button>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              disabled={isLoading || !title.trim()}
              className="gap-1"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Đang lưu...' : task ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}