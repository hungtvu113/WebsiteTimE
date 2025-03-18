'use client';

import { useState, useEffect } from 'react';
import { TimeBlock } from '@/lib/types';
import { TimeBlockItem } from './time-block-item';
import { TimeBlockForm } from './time-block-form';
import { Button } from '@/components/ui/button';
import { TimeBlockService } from '@/lib/services/time-block-service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PlusCircle } from 'lucide-react';

interface TimeBlockListProps {
  date: Date;
  compact?: boolean; // Chế độ hiển thị nhỏ gọn cho chế độ xem tuần
}

export function TimeBlockList({ date, compact = false }: TimeBlockListProps) {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    loadTimeBlocks();
  }, [date]);
  
  const loadTimeBlocks = () => {
    const blocks = TimeBlockService.getTimeBlocksForDay(date);
    blocks.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    setTimeBlocks(blocks);
  };
  
  const formatDate = format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
  
  if (compact) {
    return (
      <div className="space-y-3">
        {timeBlocks.length === 0 ? (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground">Không có khối thời gian</p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 h-8 text-xs"
              onClick={() => setIsDialogOpen(true)}
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Thêm
            </Button>
          </div>
        ) : (
          <>
            {timeBlocks.map(timeBlock => (
              <div
                key={timeBlock.id}
                className={`p-2 text-xs rounded border ${
                  timeBlock.isCompleted ? 'bg-muted/50 text-muted-foreground' : 'bg-card'
                }`}
              >
                <div className="font-medium truncate">{timeBlock.title}</div>
                <div className="text-muted-foreground">
                  {format(new Date(timeBlock.startTime), 'HH:mm', { locale: vi })} - 
                  {format(new Date(timeBlock.endTime), 'HH:mm', { locale: vi })}
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs"
              onClick={() => setIsDialogOpen(true)}
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Thêm khối thời gian
            </Button>
          </>
        )}
        
        <TimeBlockForm
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onUpdate={loadTimeBlocks}
          date={date}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {!compact && <h2 className="text-xl font-semibold capitalize">{formatDate}</h2>}
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="ml-auto flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Thêm khối thời gian
        </Button>
      </div>
      
      {timeBlocks.length === 0 ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm" data-v0-t="card">
          <div className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Không có khối thời gian nào</h3>
              <p className="text-sm text-muted-foreground">
                Không có khối thời gian nào cho ngày này. Hãy tạo khối thời gian mới.
              </p>
            </div>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Thêm khối thời gian mới
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {timeBlocks.map(timeBlock => (
            <TimeBlockItem key={timeBlock.id} timeBlock={timeBlock} onUpdate={loadTimeBlocks} />
          ))}
        </div>
      )}
      
      <TimeBlockForm
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onUpdate={loadTimeBlocks}
        date={date}
      />
    </div>
  );
} 