'use client';

import { useEffect, useRef } from 'react';

type StatisticsChartProps = {
  completed: number;
  pending: number;
};

export function StatisticsChart({ completed, pending }: StatisticsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Vẽ biểu đồ tròn
    const total = completed + pending;
    const completedAngle = (completed / total) * 2 * Math.PI;
    
    // Xóa canvas
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
    
    const centerX = chartRef.current.width / 2;
    const centerY = chartRef.current.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Vẽ phần công việc đang thực hiện
    if (pending > 0) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#e11d48';
      ctx.fill();
    }
    
    // Vẽ phần công việc đã hoàn thành
    if (completed > 0) {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, 0, completedAngle);
      ctx.fillStyle = '#10b981';
      ctx.fill();
    }
    
    // Vẽ lỗ trung tâm để tạo biểu đồ dạng donut
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    // Hiển thị tỷ lệ phần trăm ở giữa
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${percentage}%`, centerX, centerY);
    
    // Vẽ chú thích
    const legendY = centerY + radius + 30;
    
    // Chú thích cho công việc đã hoàn thành
    ctx.beginPath();
    ctx.rect(centerX - 80, legendY, 15, 15);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';
    ctx.fillText('Đã hoàn thành', centerX - 60, legendY + 7);
    
    // Chú thích cho công việc đang thực hiện
    ctx.beginPath();
    ctx.rect(centerX + 20, legendY, 15, 15);
    ctx.fillStyle = '#e11d48';
    ctx.fill();
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';
    ctx.fillText('Đang thực hiện', centerX + 40, legendY + 7);
    
  }, [completed, pending]);

  return (
    <div className="w-full h-80 flex items-center justify-center">
      <canvas ref={chartRef} width={300} height={300}></canvas>
    </div>
  );
}
