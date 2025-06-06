'use client';

import { useState, useEffect } from 'react';
import { AIService } from '@/lib/services/ai-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export function AISettings() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if AI is already available
    if (AIService.isAvailable()) {
      setStatus('success');
      setMessage('AI đã được kích hoạt và sẵn sàng sử dụng.');
    }
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setStatus('error');
      setMessage('Vui lòng nhập API key.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const success = AIService.initWithApiKey(apiKey.trim());
      
      if (success) {
        setStatus('success');
        setMessage('API key đã được lưu thành công! AI đã sẵn sàng sử dụng.');
        
        // Store in localStorage for persistence
        localStorage.setItem('gemini_api_key', apiKey.trim());
      } else {
        setStatus('error');
        setMessage('API key không hợp lệ. Vui lòng kiểm tra lại.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Đã có lỗi xảy ra khi lưu API key. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearApiKey = () => {
    setApiKey('');
    setStatus('idle');
    setMessage('');
    localStorage.removeItem('gemini_api_key');
  };

  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      AIService.initWithApiKey(savedApiKey);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Cấu hình AI</span>
          {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
        </CardTitle>
        <CardDescription>
          Cấu hình API key để sử dụng tính năng AI thông minh
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">Gemini API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Nhập API key từ Google AI Studio"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              onClick={handleSaveApiKey}
              disabled={isLoading || !apiKey.trim()}
            >
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </div>

        {message && (
          <Alert className={status === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertDescription className={status === 'error' ? 'text-red-700' : 'text-green-700'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Hướng dẫn lấy API key:</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Truy cập Google AI Studio</li>
            <li>Đăng nhập bằng tài khoản Google</li>
            <li>Tạo API key mới</li>
            <li>Sao chép và dán vào ô trên</li>
          </ol>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.open('https://ai.google.dev/', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Mở Google AI Studio
          </Button>
        </div>

        {apiKey && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearApiKey}
              className="text-red-600 hover:text-red-700"
            >
              Xóa API Key
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Lưu ý:</strong> API key được lưu trữ cục bộ trên trình duyệt của bạn và không được gửi đến server của chúng tôi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
