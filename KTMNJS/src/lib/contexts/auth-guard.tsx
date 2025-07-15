'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/lib/services/api-service';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthGuard: Bắt đầu kiểm tra authentication...');
      const token = localStorage.getItem('authToken');
      console.log('AuthGuard: Token từ localStorage:', token ? `${token.substring(0, 20)}...` : 'null');

      if (!token) {
        console.log('AuthGuard: Không có token, chuyển hướng đến login');
        setIsAuthenticated(false);
        router.push('/login');
        return;
      }

      try {
        console.log('AuthGuard: Đang kiểm tra token với API...');
        // Kiểm tra token có hợp lệ không
        const user = await ApiService.auth.getCurrentUser();
        console.log('AuthGuard: Token hợp lệ, user:', user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('AuthGuard: Token không hợp lệ:', error);
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Đang kiểm tra authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return null; // Router sẽ chuyển hướng
  }

  // Đã đăng nhập
  return <>{children}</>;
}
