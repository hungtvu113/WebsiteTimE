'use client';

import { usePathname } from 'next/navigation';
import { AuthGuard } from './auth-guard';

interface AuthWrapperProps {
  children: React.ReactNode;
}

// Các trang không cần authentication
const publicRoutes = ['/login', '/register'];

export function AuthWrapper({ children }: AuthWrapperProps) {
  const pathname = usePathname();
  
  // Nếu là trang public, không cần AuthGuard
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }
  
  // Các trang khác cần authentication
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}
