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

interface TaskSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TaskSelector({ value, onChange }: TaskSelectorProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    // Lấy danh sách các công việc chưa hoàn thành
    const activeTasks = TaskService.getTasks().filter(task => !task.completed);
    setTasks(activeTasks);
  }, []);
  
  return (
    <Select value={value || "none"} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Chọn công việc (nếu có)" />
      </SelectTrigger>
      <SelectContent className="backdrop-blur-sm border border-border/40 bg-background/90">
        <SelectItem value="none">Không liên kết với công việc</SelectItem>
        {tasks.map(task => (
          <SelectItem key={task.id} value={task.id}>
            {task.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 