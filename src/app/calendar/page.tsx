'use client';

import { Layout } from '@/components/layout/layout';
import { CalendarView } from '@/components/calendar/calendar-view';
import ProjectSelector from '@/components/project/ProjectSelector';
import { useEffect, useState } from 'react';
import { Project, Task } from '@/lib/types';

export default function CalendarPage() {
  // Luôn load tasks từ localStorage
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem('tasks');
    setTasks(stored ? JSON.parse(stored) : []);
  }, []);
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <CalendarView tasks={tasks} setTasks={setTasks} />
      </div>
    </Layout>
  );
} 