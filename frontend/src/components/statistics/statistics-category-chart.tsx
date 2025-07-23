'use client';

import { useEffect, useRef } from 'react';

type StatisticsCategoryChartProps = {
  categories: Record<string, number>;
};

export function StatisticsCategoryChart({ categories }: StatisticsCategoryChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Xóa canvas
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
    
    const width = chartRef.current.width;
    const height = chartRef.current.height;
    
    const categoryEntries = Object.entries(categories);
    
    if (categoryEntries.length === 0) {
      // Hiển thị thông báo khi không có dữ liệu
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Không có dữ liệu danh mục để hiển thị', width / 2, height / 2);
      return;
    }
    
    // Màu sắc cho các danh mục
    const colors = [
      '#3b82f6', // Xanh dương
      '#10b981', // Xanh lá
      '#f59e0b', // Cam
      '#8b5cf6', // Tím
      '#ec4899', // Hồng
      '#06b6d4', // Xanh ngọc
      '#f43f5e', // Đỏ
      '#84cc16', // Xanh lá nhạt
      '#6366f1', // Indigo
      '#d946ef', // Tím hồng
    ];
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 60;
    
    let startAngle = 0;
    const total = categoryEntries.reduce((sum, [_, count]) => sum + count, 0);
    
    // Vẽ biểu đồ tròn
    categoryEntries.forEach(([category, count], index) => {
      const sliceAngle = (count / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      // Tính toán vị trí cho nhãn
      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(midAngle) * labelRadius;
      const labelY = centerY + Math.sin(midAngle) * labelRadius;
      
      // Hiển thị phần trăm trong biểu đồ nếu góc đủ lớn
      if (sliceAngle > 0.2) {
        const percentage = Math.round((count / total) * 100);
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${percentage}%`, labelX, labelY);
      }
      
      startAngle = endAngle;
    });
    
    // Vẽ lỗ trung tâm để tạo biểu đồ dạng donut
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    // Vẽ chú thích
    const legendStartY = height - 20 - categoryEntries.length * 25;
    const legendStartX = width - 150;
    
    categoryEntries.forEach(([category, count], index) => {
      const legendY = legendStartY + index * 25;
      
      // Vẽ ô màu
      ctx.beginPath();
      ctx.rect(legendStartX, legendY, 15, 15);
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      // Vẽ tên danh mục
      ctx.font = '12px Arial';
      ctx.fillStyle = '#000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      // Cắt ngắn tên danh mục nếu quá dài
      let displayCategory = category;
      if (displayCategory.length > 15) {
        displayCategory = displayCategory.substring(0, 12) + '...';
      }
      
      ctx.fillText(`${displayCategory} (${count})`, legendStartX + 20, legendY + 7);
    });
    
  }, [categories]);

  return (
    <div className="w-full h-80 flex items-center justify-center">
      <canvas ref={chartRef} width={500} height={300}></canvas>
    </div>
  );
}
