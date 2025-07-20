"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Github, Send, CheckCircle, AlertCircle } from "lucide-react"
import { ApiService } from "@/lib/services/api-service"

function Footerdemo() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleEmailSubscription = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setMessage({ type: 'error', text: 'Vui lòng nhập địa chỉ email' })
      return
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage({ type: 'error', text: 'Địa chỉ email không hợp lệ' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // Sử dụng API public - không cần đăng nhập
      await ApiService.notifications.subscribeEmailPublic({
        email: email,
        name: '', // Có thể để trống hoặc thêm field name nếu muốn
        taskReminders: true,
        dailySummary: false,
        weeklyReport: false,
        reminderHours: 24,
      })

      setMessage({
        type: 'success',
        text: 'Đăng ký thành công! Bạn sẽ nhận được thông báo qua email. Kiểm tra hộp thư để xác nhận.'
      })
      setEmail('')
    } catch (error: any) {
      console.error('Lỗi đăng ký email:', error)
      setMessage({
        type: 'error',
        text: error.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <footer className="relative border-t bg-background/80 backdrop-blur-sm text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">QLTime</h2>
            <p className="mb-6 text-muted-foreground">
              Giải pháp quản lý thời gian thông minh cho cuộc sống hiện đại.
            </p>
            <form onSubmit={handleEmailSubscription} className="relative">
              <Input
                type="email"
                placeholder="Đăng ký nhận thông báo"
                className="pr-12 backdrop-blur-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Đăng ký</span>
              </Button>
            </form>

            {message && (
              <Alert className={`mt-3 ${message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {message.text}
                  </AlertDescription>
                </div>
              </Alert>
            )}
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