'use client';

import { Layout } from '@/components/layout/layout';
import { TaskList } from '@/components/task/task-list';
import ProjectSelector from '@/components/project/ProjectSelector';
import { useEffect, useState } from 'react';
import { Task } from '@/lib/types';
import { Project } from '@/lib/types';

export default function TasksPage() {
  // Luôn load tasks từ localStorage
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem('tasks');
    setTasks(stored ? JSON.parse(stored) : []);
  }, []);
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <TaskList tasks={tasks} setTasks={setTasks} />
      </div>
    </Layout>
  );
} 