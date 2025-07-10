'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AvatarUpload } from '@/components/profile/avatar-upload';
import { ApiService } from '@/lib/services/api-service';
import { User as UserType } from '@/lib/types';
import { User, Mail, Calendar, UserCircle, Loader2, Save, Shield, Clock, Activity } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Validation functions
  const validateName = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Họ và tên không được để trống';
    }
    if (trimmed.length < 2) {
      return 'Họ và tên phải có ít nhất 2 ký tự';
    }
    if (trimmed.length > 50) {
      return 'Họ và tên không được vượt quá 50 ký tự';
    }
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(trimmed)) {
      return 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
    }
    return '';
  };

  const validateEmail = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Email không được để trống';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return 'Email không hợp lệ';
    }
    return '';
  };

  // Check for changes
  useEffect(() => {
    if (user) {
      const nameChanged = name.trim() !== (user.name || '');
      const emailChanged = email.trim() !== (user.email || '');
      setHasChanges(nameChanged || emailChanged);
    }
  }, [name, email, user]);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingProfile(true);
      try {
        // Sử dụng API users.getProfile thay vì auth.getCurrentUser để có thông tin đầy đủ hơn
        const userData = await ApiService.users.getProfile();
        setUser(userData);
        setName(userData.name || '');
        setEmail(userData.email || '');
        setAvatar(userData.avatar || '');
      } catch (error: any) {
        console.error('Lỗi lấy thông tin user:', error);
        setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setNameError('');
    setEmailError('');
    setError('');
    setSuccess('');

    // Validate inputs
    const nameValidationError = validateName(name);
    const emailValidationError = validateEmail(email);

    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    // Check if email changed and ask for confirmation
    const emailChanged = email.trim() !== (user?.email || '');
    if (emailChanged) {
      const confirmed = window.confirm(
        'Bạn có chắc chắn muốn thay đổi địa chỉ email? ' +
        'Việc này có thể ảnh hưởng đến việc đăng nhập của bạn.'
      );
      if (!confirmed) {
        return;
      }
    }

    setIsLoading(true);

    try {
      // Gọi API cập nhật profile
      const updatedUser = await ApiService.users.updateProfile({
        name: name.trim(),
        email: email.trim(),
        avatar: avatar.trim() // Gửi nguyên giá trị để backend xử lý
      });

      setUser(updatedUser);

      if (emailChanged) {
        setSuccess('Cập nhật thông tin thành công! Email đã được thay đổi.');
      } else {
        setSuccess('Cập nhật thông tin thành công!');
      }

      // Clear success message after 5 seconds for email change, 3 for others
      setTimeout(() => setSuccess(''), emailChanged ? 5000 : 3000);
    } catch (err: any) {
      setError(err.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    setAvatar(newAvatarUrl);
    // Auto-save avatar
    handleUpdateAvatar(newAvatarUrl);
  };

  const handleUpdateAvatar = async (newAvatarUrl: string) => {
    try {
      const updatedUser = await ApiService.users.updateProfile({
        avatar: newAvatarUrl // Gửi nguyên giá trị, kể cả empty string để backend xử lý
      });
      setUser(updatedUser);

      if (newAvatarUrl === '') {
        setSuccess('Đã xóa ảnh đại diện thành công!');
      } else {
        setSuccess('Cập nhật ảnh đại diện thành công!');
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Cập nhật ảnh đại diện thất bại');
      // Revert avatar on error
      setAvatar(user?.avatar || '');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getAccountAge = () => {
    if (!user?.createdAt) return 'Không xác định';
    const created = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} ngày`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} tháng`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return remainingMonths > 0 ? `${years} năm ${remainingMonths} tháng` : `${years} năm`;
    }
  };

  if (isLoadingProfile) {
    return (
      <Layout>
        <div className="container max-w-4xl py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang tải thông tin...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
            <p className="text-muted-foreground">
              Quản lý thông tin tài khoản và cài đặt cá nhân của bạn
            </p>
          </div>

          {/* Global Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Global Success */}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {/* Avatar và thông tin cơ bản */}
            <Card>
              <CardHeader>
                <CardTitle>Ảnh đại diện</CardTitle>
                <CardDescription>
                  Tải lên ảnh đại diện hoặc nhập URL hình ảnh
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarUpload
                  currentAvatar={avatar}
                  userName={user?.name}
                  onAvatarChange={handleAvatarChange}
                  isLoading={isLoading}
                />
                <div className="text-center mt-4">
                  <h3 className="font-semibold">{user?.name || 'Người dùng'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Form cập nhật thông tin */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Cập nhật thông tin tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Nhập họ và tên"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setNameError('');
                        }}
                        onBlur={() => {
                          const error = validateName(name);
                          setNameError(error);
                        }}
                        className={`pl-10 ${nameError ? 'border-red-500 focus:border-red-500' : ''}`}
                        required
                      />
                    </div>
                    {nameError && (
                      <p className="text-sm text-red-600 dark:text-red-400">{nameError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@gmail.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError('');
                        }}
                        onBlur={() => {
                          const error = validateEmail(email);
                          setEmailError(error);
                        }}
                        className={`pl-10 ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
                        required
                      />
                    </div>
                    {emailError && (
                      <p className="text-sm text-red-600 dark:text-red-400">{emailError}</p>
                    )}
                    {email.trim() !== (user?.email || '') && email.trim() && !emailError && (
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        ⚠️ Thay đổi email có thể ảnh hưởng đến việc đăng nhập
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !hasChanges || !!nameError || !!emailError}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : hasChanges ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Lưu thay đổi
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Không có thay đổi
                      </>
                    )}
                  </Button>

                  {hasChanges && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Có thay đổi chưa lưu</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setName(user?.name || '');
                          setEmail(user?.email || '');
                          setNameError('');
                          setEmailError('');
                        }}
                        disabled={isLoading}
                      >
                        Hoàn tác
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Thông tin tài khoản */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
              <CardDescription>
                Chi tiết về tài khoản và hoạt động của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ngày tạo tài khoản</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.createdAt ? formatDate(user.createdAt) : 'Không xác định'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Thời gian sử dụng</p>
                    <p className="text-sm text-muted-foreground">
                      {getAccountAge()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Trạng thái tài khoản</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      Đã xác thực
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">ID người dùng</p>
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      {user?.id || 'Không xác định'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Mail className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email xác thực</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email || 'Không xác định'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cập nhật cuối</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.updatedAt ? formatDateTime(user.updatedAt) : 'Không xác định'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
