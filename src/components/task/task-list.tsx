'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/types';
import { TaskItem } from './task-item';
import { TaskForm } from './task-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskService } from '@/lib/services/task-service';
import { PreferenceService } from '@/lib/services/preference-service';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TeamInvitation } from '@/components/ui/team-invitation';
import { PlusCircle, Search, Filter } from 'lucide-react';

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [preferences, setPreferences] = useState(PreferenceService.getPreferences());
  
  useEffect(() => {
    loadTasks();
  }, []);
  
  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, preferences.showCompletedTasks]);
  
  const loadTasks = () => {
    const tasks = TaskService.getTasks();
    setTasks(tasks);
  };
  
  const filterTasks = () => {
    let filtered = [...tasks];
    
    // Lọc theo trạng thái hoàn thành
    if (!preferences.showCompletedTasks) {
      filtered = filtered.filter(task => !task.completed);
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(lowercaseSearch) || 
        (task.description && task.description.toLowerCase().includes(lowercaseSearch))
      );
    }
    
    // Sắp xếp theo thời gian tạo (mới nhất lên đầu)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setFilteredTasks(filtered);
  };
  
  const handleToggleShowCompleted = () => {
    const updatedPreferences = PreferenceService.updatePreferences({
      showCompletedTasks: !preferences.showCompletedTasks
    });
    setPreferences(updatedPreferences);
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Danh sách công việc</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Thêm công việc
        </Button>
      </div>
      
      {/* Công cụ tìm kiếm và lọc */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm kiếm công việc..."
            className="w-full pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center p-2 px-3 border rounded-lg bg-background/80 backdrop-blur-sm">
            <Switch
              id="show-completed"
              checked={preferences.showCompletedTasks}
              onCheckedChange={handleToggleShowCompleted}
              className="mr-3"
            />
            <Label htmlFor="show-completed" className="text-sm font-medium cursor-pointer">
              Hiển thị công việc đã hoàn thành
            </Label>
          </div>
        </div>
      </div>
      
      {/* Danh sách công việc */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-lg border backdrop-blur-sm bg-background/70 shadow-sm" data-v0-t="card">
          <div className="flex flex-col items-center justify-center space-y-3 p-12 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M11 12H3" />
                <path d="M16 6H3" />
                <path d="M16 18H3" />
                <path d="M18 9v6" />
                <path d="M21 12h-6" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Không có công việc nào</h3>
              <p className="text-sm text-muted-foreground">
                Bạn chưa có công việc nào. Hãy thêm công việc mới để bắt đầu.
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Thêm công việc mới
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map(task => (
            <TaskItem key={task.id} task={task} onUpdate={loadTasks} />
          ))}
        </div>
      )}
      
      <TaskForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onUpdate={loadTasks}
      />
    </div>
  );
} 