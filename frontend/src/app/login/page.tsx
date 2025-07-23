'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiService } from '@/lib/services/api-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await ApiService.auth.login(email, password);
      console.log('Đăng nhập thành công:', result);
      
      // Chuyển hướng về trang chủ
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại');
      console.error('Lỗi đăng nhập:', err);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đăng nhập</CardTitle>
          <CardDescription>
            Đăng nhập vào QLTime để quản lý thời gian của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            <p><strong>Hướng dẫn:</strong></p>
            <p>• Nhập email và mật khẩu đã đăng ký</p>
            <p>• Nếu chưa có tài khoản, nhấn "Đăng ký ngay"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
