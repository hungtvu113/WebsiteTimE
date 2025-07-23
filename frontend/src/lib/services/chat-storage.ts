import { ChatMessage } from './ai-service';

const CHAT_HISTORY_KEY = 'ai_chat_history';
const CHAT_SETTINGS_KEY = 'ai_chat_settings';
const MAX_MESSAGES = 100; // Giới hạn số tin nhắn để tránh localStorage quá lớn

export interface ChatSettings {
  isOpen: boolean;
  isMinimized: boolean;
  lastActiveDate: string;
}

export class ChatStorageService {
  // Lưu lịch sử chat
  static saveChatHistory(messages: ChatMessage[]): void {
    try {
      // Giới hạn số lượng tin nhắn để tránh localStorage quá lớn
      const limitedMessages = messages.slice(-MAX_MESSAGES);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(limitedMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
      // Nếu localStorage đầy, xóa một phần tin nhắn cũ
      try {
        const reducedMessages = messages.slice(-50);
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(reducedMessages));
      } catch (retryError) {
        console.error('Error saving reduced chat history:', retryError);
      }
    }
  }

  // Tải lịch sử chat
  static loadChatHistory(): ChatMessage[] {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved && saved !== 'undefined' && saved !== 'null') {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Clear invalid data
      localStorage.removeItem(CHAT_HISTORY_KEY);
    }
    return [];
  }

  // Lưu cài đặt chat
  static saveChatSettings(settings: Partial<ChatSettings>): void {
    try {
      const currentSettings = this.loadChatSettings();
      const updatedSettings = {
        ...currentSettings,
        ...settings,
        lastActiveDate: new Date().toISOString()
      };
      localStorage.setItem(CHAT_SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving chat settings:', error);
    }
  }

  // Tải cài đặt chat
  static loadChatSettings(): ChatSettings {
    try {
      const saved = localStorage.getItem(CHAT_SETTINGS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading chat settings:', error);
    }
    return {
      isOpen: false,
      isMinimized: false,
      lastActiveDate: new Date().toISOString()
    };
  }

  // Xóa toàn bộ lịch sử chat
  static clearChatHistory(): void {
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }

  // Xóa cài đặt chat
  static clearChatSettings(): void {
    try {
      localStorage.removeItem(CHAT_SETTINGS_KEY);
    } catch (error) {
      console.error('Error clearing chat settings:', error);
    }
  }

  // Xuất lịch sử chat ra file
  static exportChatHistory(): string {
    const messages = this.loadChatHistory();
    const exportData = {
      exportDate: new Date().toISOString(),
      totalMessages: messages.length,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))
    };
    return JSON.stringify(exportData, null, 2);
  }

  // Nhập lịch sử chat từ file
  static importChatHistory(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.messages && Array.isArray(data.messages)) {
        const messages: ChatMessage[] = data.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        this.saveChatHistory(messages);
        return true;
      }
    } catch (error) {
      console.error('Error importing chat history:', error);
    }
    return false;
  }

  // Lấy thống kê chat
  static getChatStats(): {
    totalMessages: number;
    userMessages: number;
    aiMessages: number;
    firstMessageDate: Date | null;
    lastMessageDate: Date | null;
    storageSize: number;
  } {
    const messages = this.loadChatHistory();
    const userMessages = messages.filter(m => m.role === 'user').length;
    const aiMessages = messages.filter(m => m.role === 'assistant').length;
    
    let storageSize = 0;
    try {
      const historyData = localStorage.getItem(CHAT_HISTORY_KEY);
      storageSize = historyData ? new Blob([historyData]).size : 0;
    } catch (error) {
      console.error('Error calculating storage size:', error);
    }

    return {
      totalMessages: messages.length,
      userMessages,
      aiMessages,
      firstMessageDate: messages.length > 0 ? messages[0].timestamp : null,
      lastMessageDate: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
      storageSize
    };
  }

  // Dọn dẹp tin nhắn cũ (giữ lại N tin nhắn gần nhất)
  static cleanupOldMessages(keepCount: number = 50): void {
    const messages = this.loadChatHistory();
    if (messages.length > keepCount) {
      const recentMessages = messages.slice(-keepCount);
      this.saveChatHistory(recentMessages);
    }
  }
}
