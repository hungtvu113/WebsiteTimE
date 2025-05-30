'use client';

import { useEffect, useRef } from 'react';

type StatisticsPriorityChartProps = {
  high: number;
  medium: number;
  low: number;
};

export function StatisticsPriorityChart({ high, medium, low }: StatisticsPriorityChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Xóa canvas
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
    
    const width = chartRef.current.width;
    const height = chartRef.current.height;
    
    const total = high + medium + low;
    if (total === 0) {
      // Hiển thị thông báo khi không có dữ liệu
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Không có dữ liệu để hiển thị', width / 2, height / 2);
      return;
    }
    
    // Màu sắc cho từng mức độ ưu tiên
    const colors = {
      high: '#ef4444', // Đỏ
      medium: '#f59e0b', // Cam
      low: '#10b981', // Xanh lá
    };
    
    // Kích thước của thanh
    const barWidth = 60;
    const spacing = 40;
    const startX = (width - (3 * barWidth + 2 * spacing)) / 2;
    const maxBarHeight = height - 100;
    
    // Tìm giá trị lớn nhất để tỷ lệ chiều cao
    const maxValue = Math.max(high, medium, low);
    
    // Vẽ thanh cho mức độ ưu tiên cao
    const highBarHeight = maxValue > 0 ? (high / maxValue) * maxBarHeight : 0;
    ctx.fillStyle = colors.high;
    ctx.fillRect(startX, height - 60 - highBarHeight, barWidth, highBarHeight);
    
    // Vẽ thanh cho mức độ ưu tiên trung bình
    const mediumBarHeight = maxValue > 0 ? (medium / maxValue) * maxBarHeight : 0;
    ctx.fillStyle = colors.medium;
    ctx.fillRect(startX + barWidth + spacing, height - 60 - mediumBarHeight, barWidth, mediumBarHeight);
    
    // Vẽ thanh cho mức độ ưu tiên thấp
    const lowBarHeight = maxValue > 0 ? (low / maxValue) * maxBarHeight : 0;
    ctx.fillStyle = colors.low;
    ctx.fillRect(startX + 2 * (barWidth + spacing), height - 60 - lowBarHeight, barWidth, lowBarHeight);
    
    // Vẽ nhãn và giá trị
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    
    // Nhãn và giá trị cho mức độ ưu tiên cao
    ctx.fillText(high.toString(), startX + barWidth / 2, height - 70 - highBarHeight);
    ctx.fillText('Cao', startX + barWidth / 2, height - 30);
    
    // Nhãn và giá trị cho mức độ ưu tiên trung bình
    ctx.fillText(medium.toString(), startX + barWidth + spacing + barWidth / 2, height - 70 - mediumBarHeight);
    ctx.fillText('Trung bình', startX + barWidth + spacing + barWidth / 2, height - 30);
    
    // Nhãn và giá trị cho mức độ ưu tiên thấp
    ctx.fillText(low.toString(), startX + 2 * (barWidth + spacing) + barWidth / 2, height - 70 - lowBarHeight);
    ctx.fillText('Thấp', startX + 2 * (barWidth + spacing) + barWidth / 2, height - 30);
    
  }, [high, medium, low]);

  return (
    <div className="w-full h-80 flex items-center justify-center">
      <canvas ref={chartRef} width={400} height={300}></canvas>
    </div>
  );
}
