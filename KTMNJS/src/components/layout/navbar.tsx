'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PreferenceService } from '@/lib/services/preference-service';
import { ApiService } from '@/lib/services/api-service';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Moon, Sun, Calendar, Home, List, Settings, Trash2, BarChart2, LogOut } from 'lucide-react';
import { Sidebar, SidebarProvider, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { UserMenu } from './user-menu';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const preferences = await PreferenceService.getPreferences();
        setTheme(preferences.theme);
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    loadPreferences();
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    PreferenceService.updatePreferences({ theme: newTheme });
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      aria-label="Toggle theme"
                    >
                      {theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Đổi giao diện {theme === 'dark' ? 'sáng' : 'tối'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="sr-only">Đăng xuất</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Đăng xuất</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                {navItems.map((item) => (
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
                  className="w-full"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? (
                    <span className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Giao diện sáng
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Giao diện tối
                    </span>
                  )}
                </Button>

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