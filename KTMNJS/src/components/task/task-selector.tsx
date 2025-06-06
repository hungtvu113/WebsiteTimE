'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { TaskService } from '@/lib/services/task-service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface TaskSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TaskSelector({ value, onChange }: TaskSelectorProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        // Lấy danh sách các công việc chưa hoàn thành
        const allTasks = await TaskService.getTasks();
        const activeTasks = allTasks.filter(task => !task.completed);
        setTasks(activeTasks);
        setError(null);
      } catch (err) {
        console.error('Lỗi khi tải danh sách công việc:', err);
        setError('Không thể tải danh sách công việc');
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, []);
  
  return (
    <div className="relative">
      <Select 
        value={value || "none"} 
        onValueChange={onChange}
        disabled={loading}
      >
        <SelectTrigger className="w-full">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tải...</span>
            </div>
          ) : (
            <SelectValue placeholder="Chọn công việc (nếu có)" />
          )}
        </SelectTrigger>
        <SelectContent className="backdrop-blur-sm border border-border/40 bg-background/90">
          <SelectItem value="none">Không liên kết với công việc</SelectItem>
          {tasks.map(task => (
            <SelectItem key={task.id} value={task.id}>
              {task.title}
            </SelectItem>
          ))}
          {error && (
            <div className="py-2 px-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {!loading && tasks.length === 0 && !error && (
            <div className="py-2 px-2 text-sm text-muted-foreground">
              Không có công việc nào chưa hoàn thành
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}