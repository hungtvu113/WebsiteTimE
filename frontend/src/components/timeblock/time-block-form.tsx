'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { TimeBlock } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TimeBlockService } from '@/lib/services/time-block-service';
import { TaskSelector } from '../task/task-selector';
import { Loader2 } from 'lucide-react';
import { useStatisticsRefresh } from '@/lib/contexts/statistics-context';

interface TimeBlockFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  date: Date;
  timeBlock?: TimeBlock;
}

const formSchema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  startTime: z.string().min(1, 'Vui lòng chọn thời gian bắt đầu'),
  endTime: z.string().min(1, 'Vui lòng chọn thời gian kết thúc'),
  taskId: z.string().nullable().optional(),
}).refine(data => {
  return data.endTime > data.startTime;
}, {
  message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
  path: ['endTime'],
});

type FormValues = z.infer<typeof formSchema>;

export function TimeBlockForm({ isOpen, onClose, onUpdate, date, timeBlock }: TimeBlockFormProps) {
  const refreshStatistics = useStatisticsRefresh();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!timeBlock;
  const todayStr = format(date, 'yyyy-MM-dd');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      startTime: `${todayStr}T09:00`,
      endTime: `${todayStr}T10:00`,
      taskId: '',
    },
  });
  
  useEffect(() => {
    if (timeBlock) {
      form.reset({
        title: timeBlock.title,
        startTime: format(new Date(timeBlock.startTime), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(timeBlock.endTime), "yyyy-MM-dd'T'HH:mm"),
        taskId: timeBlock.taskId || '',
      });
    } else {
      // Tạo timeblock mới, đặt giá trị mặc định cho ngày hiện tại
      form.reset({
        title: '',
        startTime: `${todayStr}T09:00`,
        endTime: `${todayStr}T10:00`,
        taskId: '',
      });
    }
  }, [timeBlock, form, todayStr]);
  
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isEditing && timeBlock) {
        // Cập nhật time block hiện có
        await TimeBlockService.updateTimeBlock({
          ...timeBlock,
          title: values.title,
          startTime: new Date(values.startTime).toISOString(),
          endTime: new Date(values.endTime).toISOString(),
          taskId: values.taskId === 'none' ? null : values.taskId,
        });
      } else {
        // Tạo time block mới (không gửi id)
        const taskId = values.taskId === 'none' || values.taskId === '' ? null : values.taskId;
        console.log('TimeBlockForm: Tạo time block với taskId:', taskId);

        await TimeBlockService.createTimeBlock({
          title: values.title,
          startTime: new Date(values.startTime).toISOString(),
          endTime: new Date(values.endTime).toISOString(),
          isCompleted: false,
          taskId: taskId,
        });
      }

      // Trigger statistics refresh
      refreshStatistics();

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu khối thời gian:', error);
      setError('Có lỗi xảy ra khi lưu khối thời gian. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa khối thời gian' : 'Tạo khối thời gian mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Chỉnh sửa thông tin khối thời gian'
              : 'Thêm khối thời gian mới cho lịch của bạn'}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
            {error}
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tiêu đề hoạt động" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời gian kết thúc</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="taskId"
              render={({ field: { onChange, value } }) => (
                <FormItem>
                  <FormLabel>Liên kết với công việc (tùy chọn)</FormLabel>
                  <FormControl>
                    <TaskSelector
                      value={value || ''}
                      onChange={onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
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
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}