"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function Header() {
  const { setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/80 border-b">
      <div className="container flex h-14 items-center justify-between">
        <div className="mr-4 hidden md:flex">
          {/* Có thể thêm các phần tử khác ở đây nếu cần */}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Chuyển đổi giao diện">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Chuyển đổi giao diện</span>
          </Button>
        </div>
      </div>
    </header>
  );
} 