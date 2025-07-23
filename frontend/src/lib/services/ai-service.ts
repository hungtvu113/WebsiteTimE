import { GoogleGenerativeAI } from "@google/generative-ai";
import { Task } from '../types';

// Khởi tạo Gemini AI
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

// Lấy API key từ API route
const getApiKeyFromServer = async (): Promise<string | null> => {
  try {
    const response = await fetch('/api/ai/api-key');
    if (!response.ok) {
      console.error('Failed to get API key from server');
      return null;
    }
    const data = await response.json();
    return data.apiKey || null;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return null;
  }
};

// Khởi tạo AI service với API key từ server
const initializeAI = async () => {
  if (model) return true; // Đã khởi tạo rồi

  const apiKey = await getApiKeyFromServer();
  if (apiKey && !genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
  }
  return !!model;
};

// Chat history interface
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIService = {
  // Phân tích nội dung công việc và đề xuất độ ưu tiên bằng AI
  suggestPriority: async (title: string, description?: string): Promise<'high' | 'medium' | 'low'> => {
    try {
      if (!(await initializeAI())) {
        // Fallback to keyword-based logic if AI not available
        return AIService.fallbackSuggestPriority(title, description);
      }

      const prompt = `
Phân tích công việc sau và đề xuất độ ưu tiên (high/medium/low):

Tiêu đề: ${title}
Mô tả: ${description || 'Không có mô tả'}

Hãy trả về chỉ một từ: "high", "medium", hoặc "low" dựa trên:
- Tính khẩn cấp của công việc
- Tầm quan trọng
- Deadline ngầm định
- Từ khóa chỉ độ ưu tiên

Chỉ trả về một từ, không giải thích.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().toLowerCase().trim();

      if (['high', 'medium', 'low'].includes(response)) {
        return response as 'high' | 'medium' | 'low';
      }

      return 'medium';
    } catch (error) {
      console.error("Error suggesting priority with AI:", error);
      return AIService.fallbackSuggestPriority(title, description);
    }
  },

  // Fallback method for priority suggestion
  fallbackSuggestPriority: (title: string, description?: string): 'high' | 'medium' | 'low' => {
    if (!title) return 'medium';

    const lowerTitle = title.toLowerCase();
    const lowerDesc = description?.toLowerCase() || '';

    const highPriorityKeywords = ['gấp', 'khẩn', 'ngay', 'quan trọng', 'deadline', 'hạn chót'];
    const lowPriorityKeywords = ['nhẹ nhàng', 'khi rảnh', 'không gấp', 'sau này', 'phụ'];

    for (const keyword of highPriorityKeywords) {
      if (lowerTitle.includes(keyword) || lowerDesc.includes(keyword)) {
        return 'high';
      }
    }

    for (const keyword of lowPriorityKeywords) {
      if (lowerTitle.includes(keyword) || lowerDesc.includes(keyword)) {
        return 'low';
      }
    }

    return 'medium';
  },
  
  // Đề xuất thời gian hoàn thành dựa trên nội dung bằng AI
  suggestDueDate: async (title: string, description?: string): Promise<string | null> => {
    try {
      if (!(await initializeAI())) {
        return AIService.fallbackSuggestDueDate(title, description);
      }

      const today = new Date();
      const prompt = `
Phân tích công việc sau và đề xuất số ngày cần để hoàn thành:

Tiêu đề: ${title}
Mô tả: ${description || 'Không có mô tả'}
Ngày hiện tại: ${today.toLocaleDateString('vi-VN')}

Hãy trả về chỉ một số nguyên (1-365) đại diện cho số ngày cần để hoàn thành công việc này.
Xem xét:
- Độ phức tạp của công việc
- Thời gian thông thường cần thiết
- Từ khóa về thời gian (gấp, khẩn, tuần này, tháng này, etc.)

Chỉ trả về số nguyên, không giải thích.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().trim();
      const daysToAdd = parseInt(response);

      if (isNaN(daysToAdd) || daysToAdd < 1 || daysToAdd > 365) {
        return AIService.fallbackSuggestDueDate(title, description);
      }

      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + daysToAdd);
      return dueDate.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error suggesting due date with AI:", error);
      return AIService.fallbackSuggestDueDate(title, description);
    }
  },

  // Fallback method for due date suggestion
  fallbackSuggestDueDate: (title: string, description?: string): string | null => {
    try {
      const lowerTitle = title.toLowerCase();
      const lowerDesc = description?.toLowerCase() || '';

      const today = new Date();
      let daysToAdd = 7;

      if (lowerTitle.includes('gấp') || lowerTitle.includes('khẩn') || lowerDesc.includes('gấp')) {
        daysToAdd = 1;
      } else if (lowerTitle.includes('tuần này') || lowerDesc.includes('tuần này')) {
        daysToAdd = 5;
      } else if (lowerTitle.includes('tháng') || lowerDesc.includes('tháng')) {
        daysToAdd = 30;
      }

      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + daysToAdd);
      return dueDate.toISOString().split('T')[0];
    } catch (error) {
      console.error("Error in fallback due date suggestion:", error);
      return null;
    }
  },
  
  // Tóm tắt danh sách công việc bằng AI
  summarizeTasks: async (tasks: Task[]): Promise<string> => {
    try {
      if (!(await initializeAI())) {
        return AIService.fallbackSummarizeTasks(tasks);
      }

      const completed = tasks.filter(task => task.completed).length;
      const pending = tasks.length - completed;
      const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
      const highPriorityPending = tasks.filter(task => task.priority === 'high' && !task.completed).length;

      // Tạo context cho AI
      const taskSummary = tasks.map(task =>
        `- ${task.title} (${task.priority} priority, ${task.completed ? 'completed' : 'pending'})`
      ).join('\n');

      const prompt = `
Phân tích danh sách công việc sau và tạo một bản tóm tắt thông minh bằng tiếng Việt với Markdown format:

## Thống kê hiện tại:
- **Tổng số công việc**: ${tasks.length}
- **Đã hoàn thành**: ${completed}
- **Chưa hoàn thành**: ${pending}
- **Tỷ lệ hoàn thành**: ${completionRate}%
- **Công việc ưu tiên cao chưa hoàn thành**: ${highPriorityPending}

## Danh sách công việc:
${taskSummary || 'Không có công việc nào'}

Hãy tạo một bản tóm tắt với Markdown format bao gồm:
1. **Đánh giá hiện trạng** - sử dụng emoji và bold
2. **Lời khuyên hoặc động viên** - sử dụng blockquote
3. **Gợi ý hành động tiếp theo** - sử dụng danh sách có dấu đầu dòng

Sử dụng:
- **Bold** cho các điểm quan trọng
- > Blockquote cho lời khuyên
- • Bullet points cho các bước hành động
- 📊 📈 ✅ ⚡ 🎯 emoji phù hợp

Giữ giọng điệu thân thiện và tích cực.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().trim();

      return response || AIService.fallbackSummarizeTasks(tasks);
    } catch (error) {
      console.error("Error summarizing tasks with AI:", error);
      return AIService.fallbackSummarizeTasks(tasks);
    }
  },

  // Fallback method for task summarization
  fallbackSummarizeTasks: (tasks: Task[]): string => {
    try {
      const completed = tasks.filter(task => task.completed).length;
      const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
      const highPriorityPending = tasks.filter(task => task.priority === 'high' && !task.completed).length;

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
      console.error("Error in fallback task summarization:", error);
      return "Không thể tạo bản tóm tắt tại thời điểm này.";
    }
  },
  
  // Chat với AI (chỉ sử dụng client-side)
  chat: async (message: string, chatHistory: ChatMessage[] = []): Promise<string> => {
    try {
      if (!(await initializeAI())) {
        return "Xin lỗi, AI hiện không khả dụng. Vui lòng kiểm tra cấu hình API key.";
      }

      // Tạo context từ lịch sử chat
      const historyContext = chatHistory.length > 0
        ? chatHistory.map(msg => `${msg.role === 'user' ? 'Người dùng' : 'AI'}: ${msg.content}`).join('\n')
        : '';

      const prompt = `
Bạn là Dr.AITime, một trợ lý AI thông minh chuyên về quản lý thời gian và công việc.

${historyContext ? `Lịch sử cuộc trò chuyện:\n${historyContext}\n` : ''}

Người dùng: ${message}

Hãy trả lời một cách thân thiện, hữu ích và chuyên nghiệp. Tập trung vào:
- Quản lý thời gian
- Tổ chức công việc
- Tăng năng suất
- Lời khuyên thực tế

Trả lời bằng tiếng Việt và sử dụng Markdown format để làm cho câu trả lời dễ đọc hơn:
- Sử dụng **bold** cho các điểm quan trọng
- Sử dụng danh sách có dấu đầu dòng cho các bước hoặc gợi ý
- Sử dụng > blockquote cho các lời khuyên đặc biệt
- Sử dụng \`code\` cho các thuật ngữ kỹ thuật
- Sử dụng ### cho tiêu đề phụ nếu cần`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error("Error in AI chat:", error);
      return "Xin lỗi, đã có lỗi xảy ra. Vui lòng kiểm tra API key và thử lại.";
    }
  },

  // Chat streaming với Gemini
  chatStream: async function* (message: string, chatHistory: ChatMessage[] = []): AsyncGenerator<string, void, unknown> {
    try {
      if (!(await initializeAI())) {
        yield "Xin lỗi, AI hiện không khả dụng. Vui lòng kiểm tra cấu hình API key.";
        return;
      }

      const historyContext = chatHistory.length > 0
        ? chatHistory.map(msg => `${msg.role === 'user' ? 'Người dùng' : 'AI'}: ${msg.content}`).join('\n')
        : '';

      const prompt = `
Bạn là Dr.AITime, một trợ lý AI thông minh chuyên về quản lý thời gian và công việc.

${historyContext ? `Lịch sử cuộc trò chuyện:\n${historyContext}\n` : ''}

Người dùng: ${message}

Hãy trả lời một cách thân thiện, hữu ích và chuyên nghiệp. Tập trung vào:
- Quản lý thời gian
- Tổ chức công việc
- Tăng năng suất
- Lời khuyên thực tế

Trả lời bằng tiếng Việt và sử dụng Markdown format để làm cho câu trả lời dễ đọc hơn:
- Sử dụng **bold** cho các điểm quan trọng
- Sử dụng danh sách có dấu đầu dòng cho các bước hoặc gợi ý
- Sử dụng > blockquote cho các lời khuyên đặc biệt
- Sử dụng \`code\` cho các thuật ngữ kỹ thuật
- Sử dụng ### cho tiêu đề phụ nếu cần`;

      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error) {
      console.error("Error in AI chat stream:", error);
      yield "Xin lỗi, đã có lỗi xảy ra. Vui lòng kiểm tra API key và thử lại.";
    }
  },

  // Kích hoạt API Gemini khi có API key
  initWithApiKey: (apiKey: string) => {
    try {
      genAI = new GoogleGenerativeAI(apiKey);
      model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
      console.log("AI service initialized with API key");
      return true;
    } catch (error) {
      console.error("Error initializing AI service:", error);
      return false;
    }
  },

  // Kiểm tra trạng thái AI
  isAvailable: (): boolean => {
    return !!model;
  }
};