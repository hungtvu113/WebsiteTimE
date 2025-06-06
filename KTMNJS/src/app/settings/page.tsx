'use client';

import { useState, useEffect } from 'react';
import { PreferenceService } from '@/lib/services/preference-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Layout } from '@/components/layout/layout';
import { UserPreferences } from '@/lib/types';
import { AISettings } from '@/components/ai/ai-settings';

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await PreferenceService.getPreferences();
        setPreferences(prefs);
      } catch (error) {
        console.error('Lỗi khi tải tùy chọn:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const updatePreference = async (key: keyof UserPreferences, value: any) => {
    if (!preferences) return;

    try {
      const updatedPrefs = await PreferenceService.updatePreferences({
        [key]: value
      });
      setPreferences(updatedPrefs);
    } catch (error) {
      console.error('Lỗi khi cập nhật tùy chọn:', error);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.')) {
      // Clear localStorage
      localStorage.clear();
      // Clear preferences cache
      PreferenceService.clearCache();
      // Reload page
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Đang tải cài đặt...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!preferences) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Không thể tải cài đặt</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cài đặt</h1>
          <p className="text-muted-foreground">
            Quản lý tùy chọn và cài đặt ứng dụng của bạn
          </p>
        </div>

        <div className="grid gap-6">
          {/* Giao diện */}
          <Card>
            <CardHeader>
              <CardTitle>Giao diện</CardTitle>
              <CardDescription>
                Tùy chỉnh giao diện và hiển thị của ứng dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Chủ đề</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value: 'light' | 'dark' | 'system') => 
                    updatePreference('theme', value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm border border-border/40 bg-background/90">
                    <SelectItem value="light">Sáng</SelectItem>
                    <SelectItem value="dark">Tối</SelectItem>
                    <SelectItem value="system">Theo hệ thống</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="language">Ngôn ngữ</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value: 'vi' | 'en') => 
                    updatePreference('language', value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm border border-border/40 bg-background/90">
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Thông báo */}
          <Card>
            <CardHeader>
              <CardTitle>Thông báo</CardTitle>
              <CardDescription>
                Quản lý cách ứng dụng gửi thông báo cho bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Bật thông báo</Label>
                <Switch
                  id="notifications"
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => 
                    updatePreference('notifications', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sound">Âm thanh thông báo</Label>
                <Switch
                  id="sound"
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) => 
                    updatePreference('soundEnabled', checked)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Configuration */}
          <AISettings />

          {/* Dữ liệu */}
          <Card>
            <CardHeader>
              <CardTitle>Dữ liệu</CardTitle>
              <CardDescription>
                Quản lý dữ liệu ứng dụng của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Xóa tất cả dữ liệu</Label>
                    <p className="text-sm text-muted-foreground">
                      Xóa tất cả công việc, dự án và cài đặt. Hành động này không thể hoàn tác.
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleClearData}
                  >
                    Xóa dữ liệu
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
