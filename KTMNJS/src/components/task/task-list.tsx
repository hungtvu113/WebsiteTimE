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
import { PlusCircle, Search, Filter, Loader2, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TaskListProps {
  tasks?: Task[];
  setTasks?: (tasks: Task[]) => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function TaskList({
  tasks: propTasks,
  setTasks: propSetTasks,
  isLoading: propIsLoading,
  error: propError,
  onRefresh
}: TaskListProps = {}) {
  const [internalTasks, setInternalTasks] = useState<Task[]>([]);
  const tasks = propTasks ?? internalTasks;
  const setTasks = propSetTasks ?? setInternalTasks;
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [preferences, setPreferences] = useState({ showCompletedTasks: true });
  const [internalIsLoading, setInternalIsLoading] = useState(true);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(true);

  // Sử dụng props hoặc internal state
  const isLoading = propIsLoading ?? internalIsLoading;
  const error = propError ?? internalError;

  // Tải preferences từ API
  useEffect(() => {
    const loadPreferences = async () => {
      setIsPreferencesLoading(true);
      try {
        // Sử dụng phiên bản đồng bộ cho lần render đầu tiên
        const cachedPrefs = PreferenceService.getPreferencesSync();
        setPreferences(cachedPrefs);
        
        // Sau đó tải bản mới nhất từ API
        const prefs = await PreferenceService.getPreferences();
        setPreferences(prefs);
      } catch (error) {
        console.error('Lỗi khi tải preferences:', error);
      } finally {
        setIsPreferencesLoading(false);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Tải danh sách công việc từ API
  useEffect(() => {
    if (!propTasks) {
      loadTasks();
    }
  }, [propTasks]);
  
  // Lọc và sắp xếp công việc
  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, preferences.showCompletedTasks]);
  
  const loadTasks = async () => {
    if (onRefresh) {
      // Nếu có onRefresh từ parent, sử dụng nó
      onRefresh();
    } else {
      // Nếu không, sử dụng internal logic
      setInternalIsLoading(true);
      setInternalError(null);
      try {
        const fetchedTasks = await TaskService.getTasks();
        setTasks(fetchedTasks);
      } catch (err) {
        console.error('Lỗi khi tải danh sách công việc:', err);
        setInternalError('Không thể tải danh sách công việc. Vui lòng thử lại sau.');
      } finally {
        setInternalIsLoading(false);
      }
    }
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
  
  const handleToggleShowCompleted = async () => {
    setIsPreferencesLoading(true);
    try {
      const updatedPreferences = await PreferenceService.updatePreferences({
        showCompletedTasks: !preferences.showCompletedTasks
      });
      setPreferences(updatedPreferences);
    } catch (error) {
      console.error('Lỗi khi cập nhật preferences:', error);
    } finally {
      setIsPreferencesLoading(false);
    }
  };
  
  const handleDeleteTask = async (id: string) => {
    // TaskItem đã xử lý việc gọi API để xóa task
    // Chỉ cần cập nhật state local
    setTasks(tasks.filter(t => t.id !== id));
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
              disabled={isPreferencesLoading}
              className="mr-3"
            />
            <Label htmlFor="show-completed" className="text-sm font-medium cursor-pointer flex items-center">
              {isPreferencesLoading && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
              Hiển thị công việc đã hoàn thành
            </Label>
          </div>
        </div>
      </div>
      
      {/* Hiển thị lỗi nếu có */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadTasks}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Trạng thái loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-4 w-4 rounded-sm mt-1" />
                <div className="grid flex-1 gap-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full max-w-[250px]" />
                  <div className="flex gap-2 mt-1">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
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
                {searchTerm 
                  ? 'Không tìm thấy công việc phù hợp với từ khóa tìm kiếm.' 
                  : 'Bạn chưa có công việc nào. Hãy thêm công việc mới để bắt đầu.'}
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
          {filteredTasks.map((task, index) => {
            const taskId = task.id || (task as any)._id || `task-${index}`;
            return (
              <TaskItem
                key={taskId}
                task={task}
                onDelete={handleDeleteTask}
              />
            );
          })}
        </div>
      )}
      
      <TaskForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdded={(newTask) => {
          // Thêm task mới vào danh sách
          if (newTask) {
            setTasks([newTask, ...tasks]);
            // Nếu có onRefresh từ parent, gọi để sync data
            if (onRefresh) {
              onRefresh();
            }
          }
        }}
      />
    </div>
  );
}