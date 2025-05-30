'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, AlertCircle, ArrowUpCircle, ArrowDownCircle, Clock, ListTodo } from 'lucide-react';

type StatisticsCardProps = {
  title: string;
  value: number;
  description: string;
  icon: 'task' | 'check' | 'pending' | 'priority';
  trend?: 'up' | 'down' | 'warning' | 'neutral';
};

export function StatisticsCard({ title, value, description, icon, trend }: StatisticsCardProps) {
  const renderIcon = () => {
    switch (icon) {
      case 'task':
        return <ListTodo className="h-5 w-5 text-muted-foreground" />;
      case 'check':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'priority':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const renderTrend = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <ArrowUpCircle className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'neutral':
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {renderIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <CardDescription className="flex items-center gap-1 mt-1">
          {renderTrend()}
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
