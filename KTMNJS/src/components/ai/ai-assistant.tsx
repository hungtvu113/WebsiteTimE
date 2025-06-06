'use client';

import { useState } from 'react';
import { AIService } from '@/lib/services/ai-service';
import { Button } from '@/components/ui/button';
import { Lightbulb, Loader2, MessageCircle, Brain } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Markdown } from '@/components/ui/markdown';

export function AIAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const tasks = await TaskService.getTasks();
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
        className="h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        <Brain className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Dr.AITime
            </DialogTitle>
            <DialogDescription>Trợ lý AI thông minh cho quản lý thời gian</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Phân tích
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="py-4 text-sm">
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : summary ? (
                <div className="space-y-2">
                  <Markdown content={summary} className="text-foreground" />
                </div>
              ) : (
                <p className="text-muted-foreground">
                  AI có thể phân tích công việc của bạn và đưa ra đề xuất thông minh.
                </p>
              )}
            </TabsContent>

            <TabsContent value="chat" className="py-4">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Tính năng chat AI sẽ có sẵn trong chatbox riêng biệt.</p>
                <p className="text-xs mt-1">Nhấn vào biểu tượng chat ở góc trái màn hình.</p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex justify-between border-t p-4">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Đóng
            </Button>
            {activeTab === 'summary' && (
              <Button
                size="sm"
                onClick={generateSummary}
                disabled={isLoading}
                className="gap-1"
              >
                {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                Phân tích ngay
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}