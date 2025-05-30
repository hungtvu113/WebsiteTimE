// import { GoogleGenerativeAI } from "@google/generative-ai";
import { Task } from '../types';

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
      
      // Mặc định là trung bình
      return 'medium';
    } catch (error) {
      console.error("Error suggesting priority:", error);
      return "medium"; // Mặc định nếu có lỗi
    }
  },
  
  // Đề xuất thời gian hoàn thành dựa trên nội dung
  suggestDueDate: async (title: string, description?: string): Promise<string | null> => {
    try {
      // Mô phỏng logic gợi ý ngày đến hạn đơn giản
      const lowerTitle = title.toLowerCase();
      const lowerDesc = description?.toLowerCase() || '';
      
      const today = new Date();
      let daysToAdd = 7; // Mặc định là một tuần
      
      // Kiểm tra từ khóa về thời gian
      if (lowerTitle.includes('gấp') || lowerTitle.includes('khẩn') || lowerDesc.includes('gấp')) {
        daysToAdd = 1; // Công việc gấp: 1 ngày
      } else if (lowerTitle.includes('tuần này') || lowerDesc.includes('tuần này')) {
        daysToAdd = 5; // Công việc trong tuần: 5 ngày
      } else if (lowerTitle.includes('tháng') || lowerDesc.includes('tháng')) {
        daysToAdd = 30; // Công việc dài hạn: 30 ngày
      }
      
      // Tính ngày đến hạn
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + daysToAdd);
      
      // Định dạng ngày thành chuỗi YYYY-MM-DD
      return dueDate.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error suggesting due date:", error);
      return null;
    }
  },
  
  // Tóm tắt danh sách công việc
  summarizeTasks: async (tasks: Task[]): Promise<string> => {
    try {
      // Đếm số lượng công việc đã và chưa hoàn thành
      const completed = tasks.filter(task => task.completed).length;
      const pending = tasks.length - completed;
      
      // Tính tỷ lệ hoàn thành
      const completionRate = tasks.length > 0 
        ? Math.round((completed / tasks.length) * 100) 
        : 0;
      
      // Đếm số lượng công việc ưu tiên cao chưa hoàn thành
      const highPriorityPending = tasks.filter(
        task => task.priority === 'high' && !task.completed
      ).length;
      
      // Tạo bản tóm tắt
      let summary = `Bạn đã hoàn thành ${completed}/${tasks.length} công việc (${completionRate}%). `;
      
      if (highPriorityPending > 0) {
        summary += `Hiện có ${highPriorityPending} công việc ưu tiên cao cần hoàn thành. `;
      }
      
      if (completionRate >= 80) {
        summary += 'Bạn đang làm rất tốt! Hãy tiếp tục phát huy.';
      } else if (completionRate >= 50) {
        summary += 'Bạn đang tiến triển tốt. Cố gắng hoàn thành các công việc còn lại nhé.';
      } else if (tasks.length > 0) {
        summary += 'Bạn cần tập trung hơn để hoàn thành nhiều công việc hơn.';
      } else {
        summary = 'Bạn chưa có công việc nào. Hãy thêm một số công việc để bắt đầu.';
      }
      
      return summary;
    } catch (error) {
      console.error("Error summarizing tasks:", error);
      return "Không thể tạo bản tóm tắt tại thời điểm này.";
    }
  },
  
  // Kích hoạt API Gemini khi có API key
  initWithApiKey: (apiKey: string) => {
    console.log("AI service initialized with API key");
    // Không cần phần này nữa vì đã loại bỏ GoogleGenerativeAI
  }
}; 