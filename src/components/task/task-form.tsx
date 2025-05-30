'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
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
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { CalendarIcon, Lightbulb, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AIService } from '@/lib/services/ai-service';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: (task?: Task) => void;
  task?: Task;
}

export function TaskForm({ isOpen, onClose, onAdded, task }: TaskFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate ? new Date(task.dueDate) : undefined);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(task?.priority || 'medium');
  const [category, setCategory] = useState<string | undefined>(task?.category);
  
  const categories = CategoryService.getCategories();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const taskData = {
        title,
        description,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        priority,
        category: category === 'none' ? undefined : category,
        completed: task?.completed || false,
        createdAt: task?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      let updatedTask: Task;
      
      if (task) {
        updatedTask = TaskService.updateTask(task.id, taskData);
      } else {
        updatedTask = TaskService.createTask(taskData);
      }
      
      if (onAdded) onAdded(updatedTask);
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu task:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Thêm hàm xử lý gợi ý từ AI
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
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-sm border border-border/40 bg-background/90">
        <DialogHeader>
          <DialogTitle>{task ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}</DialogTitle>
        </DialogHeader>
        
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
              placeholder="Nhập mô tả công việc (nếu cần)"
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
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              Danh mục
            </label>
            <Select value={category || 'none'} onValueChange={setCategory}>
              <SelectTrigger className="bg-background/80">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-sm border border-border/40 bg-background/90">
                <SelectItem value="none">Không có danh mục</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            >
              {isLoading ? 'Đang lưu...' : task ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 