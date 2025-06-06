'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ApiService } from '@/lib/services/api-service';
import { User, Mail, Calendar, UserCircle } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await ApiService.auth.getCurrentUser();
        setUser(userData);
        setName(userData.name || '');
        setEmail(userData.email || '');
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        setError('Không thể tải thông tin người dùng');
      }
    };

    fetchUser();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Gọi API cập nhật profile (cần implement trong backend)
      // const result = await ApiService.users.updateProfile({ name, email });
      
      // Tạm thời chỉ cập nhật local state
      setUser({ ...user, name, email });
      setSuccess('Cập nhật thông tin thành công!');
    } catch (err: any) {
      setError(err.message || 'Cập nhật thất bại');
    } finally {
      setIsLoading(false);
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

          <div className="grid gap-6 md:grid-cols-3">
            {/* Avatar và thông tin cơ bản */}
            <Card>
              <CardHeader>
                <CardTitle>Ảnh đại diện</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {user?.name ? getInitials(user.name) : <UserCircle className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-semibold">{user?.name || 'Người dùng'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Thay đổi ảnh
                </Button>
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
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
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
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Thông tin tài khoản */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ngày tạo tài khoản</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.createdAt ? formatDate(user.createdAt) : 'Không xác định'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">ID người dùng</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {user?.id || 'Không xác định'}
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
