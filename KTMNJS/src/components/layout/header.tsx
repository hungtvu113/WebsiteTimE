"use client";

import * as React from "react";
import { Moon, Sun, LogOut, User, Settings, BarChart3, UserCircle } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ApiService } from "@/lib/services/api-service";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await ApiService.auth.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
      }
    };

    fetchUser();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    ApiService.auth.logout();
    router.push('/login');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleStatistics = () => {
    router.push('/statistics');
  };

  // Tạo initials từ tên user
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/80 border-b">
      <div className="container flex h-14 items-center justify-between">
        <div className="mr-4 hidden md:flex">
          {/* Có thể thêm các phần tử khác ở đây nếu cần */}
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleTheme} title="Chuyển đổi giao diện">
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Chuyển đổi giao diện</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chuyển đổi giao diện</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full hover:bg-background/80 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name ? getInitials(user.name) : <UserCircle className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 backdrop-blur-sm border border-border/40 bg-background/90 shadow-lg animate-in fade-in-0 zoom-in-95"
              align="end"
              forceMount
              sideOffset={5}
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name || 'Người dùng'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'email@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleProfile}
                className="cursor-pointer hover:bg-background/60 transition-colors"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleStatistics}
                className="cursor-pointer hover:bg-background/60 transition-colors"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Thống kê</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSettings}
                className="cursor-pointer hover:bg-background/60 transition-colors"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 