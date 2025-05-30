'use client';

import { useState } from 'react';
import { AIService } from '@/lib/services/ai-service';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskService } from '@/lib/services/task-service';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

export function AIAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const tasks = TaskService.getTasks();
      const summaryText = await AIService.summarizeTasks(tasks);
      setSummary(summaryText);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary("Đã xảy ra lỗi khi tạo báo cáo. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
      >
        <Lightbulb className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Dr.AITime</DialogTitle>
            <DialogDescription>Phân tích công việc thông minh</DialogDescription>
          </DialogHeader>
          
          <div className="px-6 py-4 text-sm">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : summary ? (
              <div className="space-y-2">
                <p>{summary}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                AI có thể phân tích công việc của bạn và đưa ra đề xuất thông minh.
              </p>
            )}
          </div>
          
          <DialogFooter className="flex justify-between border-t p-4">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Đóng
            </Button>
            <Button 
              size="sm" 
              onClick={generateSummary} 
              disabled={isLoading}
              className="gap-1"
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              Phân tích
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 