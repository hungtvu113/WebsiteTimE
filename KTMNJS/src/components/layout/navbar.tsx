'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { ApiService } from '@/lib/services/api-service';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar, Home, List, Settings, Trash2, BarChart2, LogOut, UserCircle } from 'lucide-react';
import { Sidebar, SidebarProvider, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { UserMenu } from './user-menu';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  

  
  useEffect(() => {
    // Áp dụng theme khi component được mount
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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

  const handleLogout = () => {
    ApiService.auth.logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/', label: 'Trang chủ', icon: <Home className="h-5 w-5" /> },
    { href: '/tasks', label: 'Công việc', icon: <List className="h-5 w-5" /> },
    { href: '/calendar', label: 'Lịch', icon: <Calendar className="h-5 w-5" /> },
    { href: '/statistics', label: 'Thống kê', icon: <BarChart2 className="h-5 w-5" /> },
    { href: '/projects', label: 'Dự án', icon: <List className="h-5 w-5" /> },
  ];

  const mobileNavItems = [
    ...navItems,
    { href: '/profile', label: 'Hồ sơ cá nhân', icon: <UserCircle className="h-5 w-5" /> },
  ];
  
  return (
    <>
      {/* Desktop Navigation */}
      <header className="border-b shadow-sm sticky top-0 z-40 bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="text-xl font-bold text-primary transition-colors hover:text-primary/80">
            QLTime
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="flex items-center gap-2">
              <UserMenu />
            </div>
          </nav>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </header>
      
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="p-6">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
              <nav className="flex flex-col gap-4">
                {mobileNavItems.map((item) => (
                  <SidebarLink
                    key={item.href}
                    link={{
                      href: item.href,
                      label: item.label,
                      icon: item.icon,
                    }}
                    className={pathname === item.href ? "text-primary" : ""}
                  />
                ))}
              </nav>
              <div className="flex flex-col gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={handleLogout}
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </span>
                </Button>
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
      </div>
    </>
  );
} 