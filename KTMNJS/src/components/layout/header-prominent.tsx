"use client";

import * as React from "react";

export function Header() {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm bg-background/80 border-b">
      <div className="container flex h-16 items-center justify-end">
        <div className="text-sm text-muted-foreground">
          Sử dụng Cài đặt để thay đổi giao diện
        </div>
      </div>
    </header>
  );
}