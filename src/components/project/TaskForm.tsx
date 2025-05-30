'use client';

import React, { useEffect, useState } from "react";
import { Task, ScrumTaskStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Lightbulb, Loader2 } from 'lucide-react';

interface TaskFormProps {
  projectId: string;
  onSubmit: (t: Task) => void;
  onCancel: () => void;
  initialTask?: Task | null;
}

const statusOptions: { value: ScrumTaskStatus; label: string }[] = [
  { value: "backlog", label: "Lên kế hoạch" },
  { value: "todo", label: "Cần làm" },
  { value: "doing", label: "Đang làm" },
  { value: "done", label: "Hoàn thành" },
];
const priorityOptions = [
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
];

// Lưu ý: Trong môi trường thực tế, API key nên được lưu trữ trong biến môi trường
// API key này là demo, bạn cần thay thế bằng API key của bạn từ Google AI Studio
// const API_KEY = "YOUR_API_KEY_HERE"; 

// Tạo một mô phỏng service mà không cần API key ngay lập tức
// Điều này cho phép code chạy mà không bị lỗi khi chưa có API key
export const AIService = {
  // Phân tích nội dung công việc và đề xuất độ ưu tiên
  suggestPriority: async (title: string, description?: string): Promise<'high' | 'medium' | 'low'> => {
    try {
      // Mô phỏng logic gợi ý đơn giản dựa trên từ khóa
      if (!title) return 'medium';
      
      const lowerTitle = title.toLowerCase();
      const lowerDesc = description?.toLowerCase() || '';
      
      // Từ khóa cho độ ưu tiên cao
      const highPriorityKeywords = ['gấp', 'khẩn', 'ngay', 'quan trọng', 'deadline', 'hạn chót'];
      // Từ khóa cho độ ưu tiên thấp
      const lowPriorityKeywords = ['nhẹ nhàng', 'khi rảnh', 'không gấp', 'sau này', 'phụ'];
      
      // Kiểm tra xem tiêu đề hoặc mô tả có chứa từ khóa ưu tiên cao không
      for (const keyword of highPriorityKeywords) {
        if (lowerTitle.includes(keyword) || lowerDesc.includes(keyword)) {
          return 'high';
        }
      }
      
      // Kiểm tra xem tiêu đề hoặc mô tả có chứa từ khóa ưu tiên thấp không
      for (const keyword of lowPriorityKeywords) {
        if (lowerTitle.includes(keyword) || lowerDesc.includes(keyword)) {
          return 'low';
        }
      }
      
      return 'medium';
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      return 'medium';
    }
  },

  // Phân tích nội dung công việc và đề xuất ngày hoàn thành nếu chưa chọn
  suggestDueDate: async (title: string, description?: string): Promise<string | null> => {
    try {
      // Mô phỏng logic gợi ý đơn giản dựa trên từ khóa
      if (!title) return null;
      
      const lowerTitle = title.toLowerCase();
      const lowerDesc = description?.toLowerCase() || '';
      
      // Từ khóa cho ngày hoàn thành gấp
      const urgentKeywords = ['gấp', 'khẩn', 'ngay', 'quan trọng', 'deadline', 'hạn chót'];
      // Từ khóa cho ngày hoàn thành sau này
      const lateKeywords = ['sau này', 'phụ'];
      
      // Kiểm tra xem tiêu đề hoặc mô tả có chứa từ khóa ngày hoàn thành gấp không
      for (const keyword of urgentKeywords) {
        if (lowerTitle.includes(keyword) || lowerDesc.includes(keyword)) {
          const suggestedDate = new Date();
          suggestedDate.setDate(suggestedDate.getDate() + 1);
          return suggestedDate.toISOString();
        }
      }
      
      // Kiểm tra xem tiêu đề hoặc mô tả có chứa từ khóa ngày hoàn thành sau này không
      for (const keyword of lateKeywords) {
        if (lowerTitle.includes(keyword) || lowerDesc.includes(keyword)) {
          const suggestedDate = new Date();
          suggestedDate.setDate(suggestedDate.getDate() + 7);
          return suggestedDate.toISOString();
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      return null;
    }
  },
};

export default function TaskForm({ projectId, onSubmit, onCancel, initialTask }: TaskFormProps) {
  const [title, setTitle] = React.useState(initialTask?.title || "");
  const [description, setDescription] = React.useState(initialTask?.description || "");
  const [status, setStatus] = React.useState<ScrumTaskStatus>(initialTask?.status || "backlog");
  const [priority, setPriority] = React.useState(initialTask?.priority || "medium");
  const [completed, setCompleted] = React.useState(initialTask?.completed || false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    setCompleted(status === "done");
  }, [status]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const now = new Date().toISOString();
    onSubmit({
      id: initialTask?.id || Date.now().toString(),
      projectId,
      title,
      description,
      status,
      priority,
      completed: status === "done",
      createdAt: initialTask?.createdAt || now,
      updatedAt: now,
    });
  }

  const handleAiSuggestions = async () => {
    if (!title) {
      alert("Vui lòng nhập tiêu đề công việc trước");
      return;
    }
    
    setIsAiLoading(true);
    try {
      // Gợi ý độ ưu tiên
      const suggestedPriority = await AIService.suggestPriority(title, description);
      setPriority(suggestedPriority);
      
      // Gợi ý ngày hoàn thành nếu chưa chọn
      if (!dueDate) {
        const suggestedDate = await AIService.suggestDueDate(title, description);
        if (suggestedDate) {
          setDueDate(new Date(suggestedDate));
        }
      }
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <form 
      className="bg-card border rounded-lg shadow-sm p-4 mb-4 flex flex-col gap-4" 
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="task-title">Tên công việc</Label>
        <Input 
          id="task-title"
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Nhập tên công việc"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="task-description">Mô tả</Label>
        <Textarea 
          id="task-description"
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Nhập mô tả chi tiết (không bắt buộc)"
          className="min-h-[80px]"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="task-status">Trạng thái</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as ScrumTaskStatus)}>
            <SelectTrigger id="task-status">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="task-priority">Mức độ ưu tiên</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as "low" | "medium" | "high")}>
            <SelectTrigger id="task-priority">
              <SelectValue placeholder="Chọn mức độ ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAiSuggestions}
          disabled={isAiLoading || !title.trim()}
          className="gap-1"
        >
          {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lightbulb className="h-3 w-3" />}
          Gợi ý từ AI
        </Button>
      </div>
      
      <div className="flex justify-end gap-2 mt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">
          {initialTask ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
}
