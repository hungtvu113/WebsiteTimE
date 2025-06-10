'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { PreferenceService } from '@/lib/services/preference-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layout } from '@/components/layout/layout';
import { UserPreferences } from '@/lib/types';
import { AISettings } from '@/components/ai/ai-settings';
import {
  Palette,
  Bell,
  Database,
  Download,
  Upload,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await PreferenceService.getPreferences();
        setPreferences(prefs);

        // Sync theme with next-themes
        if (prefs.theme && prefs.theme !== theme) {
          setTheme(prefs.theme);
        }
      } catch (error) {
        console.error('Lỗi khi tải tùy chọn:', error);
        setError('Không thể tải cài đặt. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [theme, setTheme]);

  const updatePreference = async (key: keyof UserPreferences, value: any) => {
    if (!preferences) return;

    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      // Special handling for theme
      if (key === 'theme') {
        setTheme(value); // Update next-themes immediately
      }

      const updatedPrefs = await PreferenceService.updatePreferences({
        [key]: value
      });
      setPreferences(updatedPrefs);
      setLastUpdated(new Date());
      setSuccess(`Đã cập nhật ${getPreferenceLabel(key)} thành công!`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Lỗi khi cập nhật tùy chọn:', error);
      setError(error.message || 'Không thể cập nhật cài đặt. Vui lòng thử lại.');

      // Revert theme on error
      if (key === 'theme' && preferences) {
        setTheme(preferences.theme);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getPreferenceLabel = (key: keyof UserPreferences): string => {
    const labels: Record<keyof UserPreferences, string> = {
      theme: 'chủ đề',
      language: 'ngôn ngữ',
      startOfWeek: 'ngày bắt đầu tuần',
      showCompletedTasks: 'hiển thị công việc đã hoàn thành',
      notifications: 'thông báo',
      soundEnabled: 'âm thanh thông báo',
      autoLogout: 'tự động đăng xuất',
      saveLocalData: 'lưu dữ liệu cục bộ'
    };
    return labels[key] || key;
  };

  const handleExportSettings = () => {
    if (!preferences) return;

    const settingsData = {
      preferences,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qltime-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccess('Đã xuất cài đặt thành công!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const settingsData = JSON.parse(content);

        if (settingsData.preferences) {
          const updatedPrefs = await PreferenceService.updatePreferences(settingsData.preferences);
          setPreferences(updatedPrefs);
          setSuccess('Đã nhập cài đặt thành công!');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError('File cài đặt không hợp lệ.');
        }
      } catch (error) {
        setError('Không thể đọc file cài đặt. Vui lòng kiểm tra định dạng file.');
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  const handleResetSettings = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đặt lại tất cả cài đặt về mặc định?')) {
      return;
    }

    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const defaultPrefs = await PreferenceService.resetPreferences();
      setPreferences(defaultPrefs);
      setSuccess('Đã đặt lại cài đặt về mặc định thành công!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Không thể đặt lại cài đặt.');
    } finally {
      setIsUpdating(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Cài đặt</h1>
            <p className="text-muted-foreground">
              Quản lý tùy chọn và cài đặt ứng dụng của bạn
            </p>
          </div>
          {lastUpdated && (
            <div className="text-sm text-muted-foreground">
              Cập nhật lần cuối: {lastUpdated.toLocaleTimeString('vi-VN')}
            </div>
          )}
        </div>

        {/* Global Error */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Global Success */}
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Loading overlay */}
        {isUpdating && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Đang cập nhật cài đặt...</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* Giao diện */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Giao diện
              </CardTitle>
              <CardDescription>
                Tùy chỉnh giao diện và hiển thị của ứng dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="theme">Chủ đề</Label>
                  <p className="text-sm text-muted-foreground">
                    Chọn giao diện sáng, tối hoặc theo hệ thống
                  </p>
                </div>
                <Select
                  value={theme || preferences.theme}
                  onValueChange={(value: 'light' | 'dark' | 'system') =>
                    updatePreference('theme', value)
                  }
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-sm border border-border/40 bg-background/90">
                    <SelectItem value="light">🌞 Sáng</SelectItem>
                    <SelectItem value="dark">🌙 Tối</SelectItem>
                    <SelectItem value="system">💻 Theo hệ thống</SelectItem>
                  </SelectContent>
                </Select>
              </div>


            </CardContent>
          </Card>

          {/* Thông báo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Thông báo
              </CardTitle>
              <CardDescription>
                Quản lý cách ứng dụng gửi thông báo cho bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="notifications">Bật thông báo</Label>
                  <p className="text-sm text-muted-foreground">
                    Nhận thông báo về công việc và deadline
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={preferences.notifications}
                  onCheckedChange={(checked) =>
                    updatePreference('notifications', checked)
                  }
                  disabled={isUpdating}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="sound">Âm thanh thông báo</Label>
                  <p className="text-sm text-muted-foreground">
                    Phát âm thanh khi có thông báo mới
                  </p>
                </div>
                <Switch
                  id="sound"
                  checked={preferences.soundEnabled}
                  onCheckedChange={(checked) =>
                    updatePreference('soundEnabled', checked)
                  }
                  disabled={isUpdating || !preferences.notifications}
                />
              </div>

              {!preferences.notifications && (
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  💡 Bật thông báo để sử dụng âm thanh thông báo
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Configuration */}
          <AISettings />

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Bảo mật
              </CardTitle>
              <CardDescription>
                Cài đặt bảo mật và quyền riêng tư
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Tự động đăng xuất</Label>
                  <p className="text-sm text-muted-foreground">
                    Đăng xuất tự động sau 30 phút không hoạt động
                  </p>
                </div>
                <Switch
                  checked={preferences.autoLogout || false}
                  onCheckedChange={(checked) =>
                    updatePreference('autoLogout', checked)
                  }
                  disabled={isUpdating}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Lưu dữ liệu cục bộ</Label>
                  <p className="text-sm text-muted-foreground">
                    Lưu trữ dữ liệu trên thiết bị để truy cập offline
                  </p>
                </div>
                <Switch
                  checked={preferences.saveLocalData !== false}
                  onCheckedChange={(checked) =>
                    updatePreference('saveLocalData', checked)
                  }
                  disabled={isUpdating}
                />
              </div>

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Tài khoản được bảo vệ</p>
                    <p className="text-sm text-muted-foreground">
                      Dữ liệu của bạn được mã hóa và bảo mật. Chúng tôi không chia sẻ thông tin cá nhân với bên thứ ba.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dữ liệu và Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dữ liệu và Backup
              </CardTitle>
              <CardDescription>
                Quản lý, sao lưu và khôi phục dữ liệu ứng dụng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Export Settings */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Xuất cài đặt</Label>
                    <p className="text-sm text-muted-foreground">
                      Tải xuống file chứa tất cả cài đặt của bạn
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleExportSettings}
                    disabled={isUpdating}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Xuất cài đặt
                  </Button>
                </div>

                <Separator />

                {/* Import Settings */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Nhập cài đặt</Label>
                    <p className="text-sm text-muted-foreground">
                      Khôi phục cài đặt từ file đã xuất trước đó
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportSettings}
                      style={{ display: 'none' }}
                      id="import-settings"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('import-settings')?.click()}
                      disabled={isUpdating}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Nhập cài đặt
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Reset Settings */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Đặt lại cài đặt</Label>
                    <p className="text-sm text-muted-foreground">
                      Khôi phục tất cả cài đặt về giá trị mặc định
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleResetSettings}
                    disabled={isUpdating}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Đặt lại
                  </Button>
                </div>

                <Separator />

                {/* Clear All Data */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-destructive">Xóa tất cả dữ liệu</Label>
                    <p className="text-sm text-muted-foreground">
                      ⚠️ Xóa tất cả công việc, dự án và cài đặt. Hành động này không thể hoàn tác.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleClearData}
                    disabled={isUpdating}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
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
