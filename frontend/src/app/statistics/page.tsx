'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/layout';
import { StatisticsService, TaskStatistics, TimeBlockStatistics, ProductivityStatistics } from '@/lib/services/statistics-service';
import { useStatistics } from '@/lib/contexts/statistics-context';
import { Task, Project } from '@/lib/types';
import ProjectSelector from '@/components/project/ProjectSelector';
import { StatisticsCard } from '@/components/statistics/statistics-card';
import { StatisticsChart } from '@/components/statistics/statistics-chart';
import { StatisticsPriorityChart } from '@/components/statistics/statistics-priority-chart';
import { StatisticsCategoryChart } from '@/components/statistics/statistics-category-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Calendar } from 'lucide-react';

export default function StatisticsPage() {
  const { refreshTrigger } = useStatistics();
  const [taskStats, setTaskStats] = useState<TaskStatistics | null>(null);
  const [timeBlockStats, setTimeBlockStats] = useState<TimeBlockStatistics | null>(null);
  const [productivityStats, setProductivityStats] = useState<ProductivityStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Load statistics từ API
  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('StatisticsPage: Đang tải thống kê...', dateRange);

      const query = {
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
      };

      const [tasks, timeBlocks, productivity] = await Promise.all([
        StatisticsService.getTaskStatistics(query),
        StatisticsService.getTimeBlockStatistics(query),
        StatisticsService.getProductivityStatistics(query),
      ]);

      setTaskStats(tasks);
      setTimeBlockStats(timeBlocks);
      setProductivityStats(productivity);

      console.log('StatisticsPage: Đã tải thống kê thành công');
    } catch (err: any) {
      console.error('StatisticsPage: Lỗi tải thống kê:', err);
      setError(err.message || 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  // Listen for refresh trigger từ context
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('StatisticsPage: Received refresh trigger, reloading statistics');
      loadStatistics();
    }
  }, [refreshTrigger]);
  
  // Tính toán thống kê từ API data
  const totalTasks = taskStats?.total || 0;
  const completedTasks = taskStats?.completed || 0;
  const pendingTasks = taskStats?.pending || 0;
  const overdueTasks = taskStats?.overdue || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Thống kê theo mức độ ưu tiên
  const highPriorityTasks = taskStats?.byPriority?.high || 0;
  const mediumPriorityTasks = taskStats?.byPriority?.medium || 0;
  const lowPriorityTasks = taskStats?.byPriority?.low || 0;

  // Thống kê theo danh mục
  const categoryCounts = taskStats?.byCategory || {};

  // Thống kê năng suất
  const productivityScore = productivityStats?.productivityScore || 0;
  const taskCompletionRate = productivityStats?.taskCompletionRate || 0;
  const timeBlockCompletionRate = productivityStats?.timeBlockCompletionRate || 0;
  
  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-4 space-y-8">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight">Thống kê công việc</h1>
            <p className="text-muted-foreground">Đang tải dữ liệu thống kê...</p>
          </div>

          {/* Loading skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thống kê công việc</h1>
            <p className="text-muted-foreground">
              Tổng quan về tình trạng công việc và hiệu suất của bạn
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStatistics}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Hiển thị lỗi nếu có */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadStatistics}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Thử lại
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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
            title="Quá hạn"
            value={overdueTasks}
            description="Công việc đã quá hạn"
            icon="priority"
            trend={overdueTasks > 0 ? 'warning' : 'neutral'}
          />
        </div>
        
        {/* Biểu đồ và phân tích chi tiết */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 md:w-auto md:grid-cols-5">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="priority">Mức độ ưu tiên</TabsTrigger>
            <TabsTrigger value="category">Danh mục</TabsTrigger>
            <TabsTrigger value="productivity">Năng suất</TabsTrigger>
            <TabsTrigger value="timeblocks">Khối thời gian</TabsTrigger>
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
          
          <TabsContent value="productivity" className="mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Điểm năng suất</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{productivityScore.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    điểm năng suất tổng thể
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành công việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{taskCompletionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    công việc đã hoàn thành
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tỷ lệ hoàn thành khối thời gian</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{timeBlockCompletionRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    khối thời gian đã hoàn thành
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeblocks" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Thống kê khối thời gian</CardTitle>
                <CardDescription>
                  Tổng quan về việc sử dụng thời gian và hiệu quả
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{timeBlockStats?.totalHours?.toFixed(1) || 0}h</div>
                    <p className="text-sm text-muted-foreground">Tổng thời gian</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{timeBlockStats?.completedHours?.toFixed(1) || 0}h</div>
                    <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{timeBlockStats?.completionRate?.toFixed(1) || 0}%</div>
                    <p className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
