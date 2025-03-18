'use client';

import { Layout } from '@/components/layout/layout';
import { TaskList } from '@/components/task/task-list';

export default function TasksPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <TaskList />
      </div>
    </Layout>
  );
} 