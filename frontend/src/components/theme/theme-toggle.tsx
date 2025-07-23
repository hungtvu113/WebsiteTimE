"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { open, animate } = useSidebar();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className={`${animate && !open ? 'flex justify-center' : 'flex justify-start'} w-full px-2 mb-6`}
      onClick={toggleTheme}
    >
      <div className="relative flex-shrink-0">
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Chuyển đổi giao diện</span>
    </Button>
  );
} 