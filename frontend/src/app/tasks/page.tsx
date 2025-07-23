'use client';

import { Layout } from '@/components/layout/layout';
import { TaskList } from '@/components/task/task-list';
import ProjectSelector from '@/components/project/ProjectSelector';
import { useEffect, useState } from 'react';
import { Task } from '@/lib/types';
import { Project } from '@/lib/types';
import { TaskService } from '@/lib/services/task-service';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks từ API
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('TasksPage: Đang tải tasks từ API...');
      const tasksData = await TaskService.getTasks();
      console.log('TasksPage: Đã tải tasks:', tasksData);
      setTasks(tasksData);
    } catch (err: any) {
      console.error('TasksPage: Lỗi tải tasks:', err);
      setError(err.message || 'Không thể tải danh sách công việc');
      // Fallback to localStorage nếu API lỗi
      const stored = localStorage.getItem('tasks');
      if (stored) {
        setTasks(JSON.parse(stored));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <TaskList
          tasks={tasks}
          setTasks={setTasks}
          isLoading={isLoading}
          error={error}
          onRefresh={loadTasks}
        />
      </div>
    </Layout>
  );
}