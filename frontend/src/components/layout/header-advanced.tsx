"use client";

import * as React from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ApiService } from "@/lib/services/api-service";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const { setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    ApiService.auth.logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/80 border-b">
      <div className="container flex h-14 items-center justify-between">
        <div className="mr-4 hidden md:flex">
          {/* Breadcrumbs có thể được thêm vào đây */}
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title="Chuyển đổi giao diện">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Chuyển đổi giao diện</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="backdrop-blur-sm border border-border/40 bg-background/90" align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Sáng</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Tối</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <span className="mr-2">💻</span>
                <span>Hệ thống</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Đăng xuất</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đăng xuất</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
} 