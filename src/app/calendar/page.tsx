'use client';

import { Layout } from '@/components/layout/layout';
import { CalendarView } from '@/components/calendar/calendar-view';

export default function CalendarPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <CalendarView />
      </div>
    </Layout>
  );
} 