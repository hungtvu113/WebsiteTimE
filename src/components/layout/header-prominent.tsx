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
      <div className="container flex h-16 items-center justify-end">
        <Button 
          variant="outline" 
          className="gap-2" 
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4" />
              <span>Giao diện sáng</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4" />
              <span>Giao diện tối</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
} 