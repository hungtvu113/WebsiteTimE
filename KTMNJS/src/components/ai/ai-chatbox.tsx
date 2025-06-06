'use client';

import { useState, useRef, useEffect } from 'react';
import { AIService, ChatMessage } from '@/lib/services/ai-service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Loader2, X, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Markdown } from '@/components/ui/markdown';

interface AIChatboxProps {
  className?: string;
}

const CHAT_HISTORY_KEY = 'dr-aitime-chat-history';
const CHAT_SETTINGS_KEY = 'dr-aitime-chat-settings';

export function AIChatbox({ className }: AIChatboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from localStorage
  const loadChatHistory = (): ChatMessage[] => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return [];
  };

  // Save chat history to localStorage
  const saveChatHistory = (newMessages: ChatMessage[]) => {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  // Load settings from localStorage
  const loadChatSettings = () => {
    try {
      const saved = localStorage.getItem(CHAT_SETTINGS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading chat settings:', error);
    }
    return { isOpen: false, isMinimized: false };
  };

  // Initialize from localStorage
  useEffect(() => {
    const savedMessages = loadChatHistory();
    const savedSettings = loadChatSettings();

    setMessages(savedMessages);
    setIsOpen(savedSettings.isOpen || false);
    setIsMinimized(savedSettings.isMinimized || false);
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    const settings = { isOpen, isMinimized };
    try {
      localStorage.setItem(CHAT_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving chat settings:', error);
    }
  }, [isOpen, isMinimized]);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // Use streaming chat
      const stream = AIService.chatStream(userMessage.content, messages);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk;
        setStreamingMessage(fullResponse);
      }

      // Add complete response to messages
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingMessage('');
    // Clear from localStorage
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-4 left-4 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-4 left-4 z-50", className)}>
      <Card className={cn(
        "w-80 shadow-xl transition-all duration-200 relative overflow-hidden",
        isMinimized ? "h-12" : "h-96"
      )}>
        <CardHeader className="flex flex-row items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Dr.AITime Chat
            {messages.length > 0 && (
              <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">
                {messages.length}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-blue-700"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-blue-700"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80 relative">
            {/* Backdrop blur overlay chỉ trong khung chat */}
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-10 pointer-events-none" />
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-3 relative z-20">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="font-medium">Xin chào! Tôi là Dr.AITime 👋</p>
                    <p className="mt-1">Hãy hỏi tôi về quản lý thời gian nhé!</p>
                    <div className="mt-3 text-xs opacity-70">
                      <p>💡 Lịch sử chat sẽ được lưu tự động</p>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        message.role === 'user'
                          ? "bg-blue-600 text-white"
                          : "bg-muted"
                      )}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap text-white">{message.content}</p>
                      ) : (
                        <Markdown content={message.content} className="text-foreground" />
                      )}
                      <p className={cn(
                        "text-xs opacity-70 mt-1",
                        message.role === 'user' ? "text-white" : "text-muted-foreground"
                      )}>
                        {message.timestamp.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Streaming message */}
                {streamingMessage && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted">
                      <Markdown content={streamingMessage} className="text-foreground" />
                      <div className="flex items-center gap-1 mt-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs opacity-70 text-muted-foreground">Đang trả lời...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-3 relative z-20 bg-background">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat? Hành động này không thể hoàn tác.')) {
                      clearChat();
                    }
                  }}
                  className="w-full mt-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  🗑️ Xóa lịch sử chat ({messages.length} tin nhắn)
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
