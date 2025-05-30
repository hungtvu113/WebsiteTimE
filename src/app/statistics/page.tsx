'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/layout';
import { TaskService } from '@/lib/services/task-service';
import { Task, Project } from '@/lib/types';
import ProjectSelector from '@/components/project/ProjectSelector';
import { StatisticsCard } from '@/components/statistics/statistics-card';
import { StatisticsChart } from '@/components/statistics/statistics-chart';
import { StatisticsPriorityChart } from '@/components/statistics/statistics-priority-chart';
import { StatisticsCategoryChart } from '@/components/statistics/statistics-category-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StatisticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const stored = localStorage.getItem('tasks');
    setTasks(stored ? JSON.parse(stored) : []);
    setLoading(false);
  }, []);
  
  // Tính toán thống kê
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Thống kê theo mức độ ưu tiên
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;
  
  // Thống kê theo danh mục
  const categoryCounts = tasks.reduce((acc: Record<string, number>, task) => {
    const category = task.category || 'Không có danh mục';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  // Thống kê theo thời gian
  const getTasksByTimeRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Lấy ngày đầu tiên của tuần (Thứ Hai)
// Đầu tiên lấy ngày hiện tại
const firstDayOfWeek = new Date(today);
// Lấy thứ trong tuần (0: Chủ Nhật, 1: Thứ Hai, ..., 6: Thứ Bảy)
const day = today.getDay();
// Tính toán chênh lệch ngày để đưa về Thứ Hai
// Nếu hôm nay là Chủ Nhật (day = 0), lùi lại 6 ngày để về Thứ Hai tuần trước
// Nếu không phải Chủ Nhật, lùi về đầu tuần (Thứ Hai)
const diff = today.getDate() - day + (day === 0 ? -6 : 1);
// Đặt ngày mới cho firstDayOfWeek để trở thành Thứ Hai
firstDayOfWeek.setDate(diff);
    
    // Lấy ngày đầu tiên của tháng
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      today: tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= today;
      }).length,
      
      thisWeek: tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= firstDayOfWeek;
      }).length,
      
      thisMonth: tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= firstDayOfMonth;
      }).length,
    };
  };
  
  const timeRangeStats = getTasksByTimeRange();
  
  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-12">Đang tải dữ liệu...</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 space-y-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Thống kê công việc</h1>
          <p className="text-muted-foreground">
            Tổng quan về tình trạng công việc và hiệu suất của bạn
          </p>
        </div>
        
        {/* Thống kê tổng quan */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatisticsCard
            title="Tổng số công việc"
            value={totalTasks}
            description="Tổng số công việc đã tạo"
            icon="task"
          />
          <StatisticsCard
            title="Đã hoàn thành"
            value={completedTasks}
            description={`${completionRate}% công việc đã hoàn thành`}
            icon="check"
            trend={completionRate > 50 ? 'up' : 'down'}
          />
          <StatisticsCard
            title="Đang thực hiện"
            value={pendingTasks}
            description="Công việc chưa hoàn thành"
            icon="pending"
          />
          <StatisticsCard
            title="Ưu tiên cao"
            value={highPriorityTasks}
            description="Công việc cần ưu tiên"
            icon="priority"
            trend={highPriorityTasks > 0 ? 'warning' : 'neutral'}
          />
        </div>
        
        {/* Biểu đồ và phân tích chi tiết */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-4">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="priority">Mức độ ưu tiên</TabsTrigger>
            <TabsTrigger value="category">Danh mục</TabsTrigger>
            <TabsTrigger value="time">Thời gian</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan công việc</CardTitle>
                <CardDescription>
                  Biểu đồ thể hiện tỷ lệ công việc đã hoàn thành và đang thực hiện
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StatisticsChart 
                  completed={completedTasks} 
                  pending={pendingTasks} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="priority" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Phân loại theo mức độ ưu tiên</CardTitle>
                <CardDescription>
                  Biểu đồ thể hiện số lượng công việc theo mức độ ưu tiên
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StatisticsPriorityChart 
                  high={highPriorityTasks} 
                  medium={mediumPriorityTasks} 
                  low={lowPriorityTasks} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="category" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Phân loại theo danh mục</CardTitle>
                <CardDescription>
                  Biểu đồ thể hiện số lượng công việc theo từng danh mục
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StatisticsCategoryChart categories={categoryCounts} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="time" className="mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Hôm nay</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{timeRangeStats.today}</div>
                  <p className="text-xs text-muted-foreground">
                    công việc được tạo hôm nay
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tuần này</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{timeRangeStats.thisWeek}</div>
                  <p className="text-xs text-muted-foreground">
                    công việc được tạo trong tuần này
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tháng này</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{timeRangeStats.thisMonth}</div>
                  <p className="text-xs text-muted-foreground">
                    công việc được tạo trong tháng này
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
