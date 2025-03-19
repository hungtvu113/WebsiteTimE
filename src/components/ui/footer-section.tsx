"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Github, Send } from "lucide-react"

function Footerdemo() {
  return (
    <footer className="relative border-t bg-background/80 backdrop-blur-sm text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">QLTime</h2>
            <p className="mb-6 text-muted-foreground">
              Giải pháp quản lý thời gian thông minh cho cuộc sống hiện đại.
            </p>
            <form className="relative">
              <Input
                type="email"
                placeholder="Đăng ký nhận thông báo"
                className="pr-12 backdrop-blur-sm"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Đăng ký</span>
              </Button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Tính năng</h3>
            <nav className="space-y-2 text-sm">
              <a href="/tasks" className="block transition-colors hover:text-primary">
                Quản lý công việc
              </a>
              <a href="/calendar" className="block transition-colors hover:text-primary">
                Lịch & Timeblocks
              </a>
              <a href="#" className="block transition-colors hover:text-primary">
                Thống kê
              </a>
              <a href="#" className="block transition-colors hover:text-primary">
                Tùy chỉnh
              </a>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Liên hệ</h3>
            <address className="space-y-2 text-sm not-italic">
              <p>Email: tranhunggit@gmail.com</p>
              <p>SĐT: 0375663427</p>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Theo dõi</h3>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-full"
                      asChild
                    >
                      <a href="https://github.com/hungtvu113/WebsiteTimE" target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                        <span className="sr-only">Github</span>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xem mã nguồn trên Github</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 QLTime. Bản quyền thuộc về nhóm phát triển.
          </p>
          <nav className="flex gap-4 text-sm">
            <a href="#" className="transition-colors hover:text-primary">
              Chính sách bảo mật
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Điều khoản sử dụng
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export { Footerdemo }