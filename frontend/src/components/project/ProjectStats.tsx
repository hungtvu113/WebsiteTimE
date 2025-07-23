import React, { useEffect, useState } from 'react';
import { Project, Task } from '@/lib/types';

interface ProjectStatsProps {
  project: Project;
  tasks: Task[];
}

export default function ProjectStats({ project, tasks }: ProjectStatsProps) {
  const [stats, setStats] = useState({
    completedTasks: 0,
    totalTasks: 0,
    completionRate: 0
  });

  // Tính lại tiến độ mỗi khi tasks thay đổi
  useEffect(() => {
    // Các công việc được coi là hoàn thành khi status = "done"
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    setStats({
      completedTasks,
      totalTasks,
      completionRate
    });
  }, [tasks]);

  // Nhóm theo trạng thái
  const statusCounts = {
    backlog: tasks.filter(t => t.status === 'backlog').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    doing: tasks.filter(t => t.status === 'doing').length,
    done: tasks.filter(t => t.status === 'done').length,
  };
  
  // Nhóm theo mức độ ưu tiên
  const priorityCounts = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  return (
    <div className="p-6 border rounded-lg bg-background">
      <h2 className="text-xl font-bold mb-6">Thống kê dự án: {project.name}</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2">Tiến độ tổng thể</h3>
        <div className="w-full bg-muted rounded-full h-4">
          <div 
            className="bg-primary h-4 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Hoàn thành: {stats.completedTasks}/{stats.totalTasks} công việc ({stats.completionRate}%)
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-medium mb-3">Theo trạng thái</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Lên kế hoạch</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded">{statusCounts.backlog}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Cần làm</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded">{statusCounts.todo}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Đang làm</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded">{statusCounts.doing}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Hoàn thành</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded">{statusCounts.done}</span>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-md font-medium mb-3">Theo mức độ ưu tiên</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Cao</span>
              <span className="bg-destructive/10 text-destructive px-2 py-1 rounded">{priorityCounts.high}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Trung bình</span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded">{priorityCounts.medium}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Thấp</span>
              <span className="bg-muted text-muted-foreground px-2 py-1 rounded">{priorityCounts.low}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-md font-medium mb-2">Thống kê thời gian</h3>
        <p className="text-sm text-muted-foreground">
          Dự án được tạo vào: {new Date(project.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        {tasks.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            Cập nhật công việc gần nhất: {new Date(
              Math.max(...tasks.map(t => new Date(t.updatedAt).getTime()))
            ).toLocaleDateString('vi-VN', {
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    </div>
  );
} 