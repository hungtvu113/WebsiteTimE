import { Layout } from '@/components/layout/layout';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <section className="py-12 md:py-24 lg:py-32 xl:py-40">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl">
                Quản lý thời gian hiệu quả
              </h1>
              <p className="mx-auto max-w-[800px] text-gray-500 md:text-xl dark:text-gray-400">
                QLTime giúp bạn sắp xếp công việc, lên lịch hợp lý và đạt được hiệu suất cao nhất trong cuộc sống hàng ngày.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/tasks">
                <Button size="lg" className="h-12 px-6 rounded-lg">
                  Bắt đầu ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 lg:py-32 backdrop-blur-sm bg-background/40 rounded-xl border border-border/40">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 px-4 sm:px-6 md:gap-16 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm">
                Theo dõi công việc
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Quản lý danh sách công việc
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                Tạo và quản lý các công việc một cách dễ dàng. Thiết lập hạn hoàn thành, ưu tiên và danh mục để tổ chức công việc hiệu quả.
              </p>
            </div>
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm">
                Lập lịch thông minh
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Lên lịch và nhắc nhở
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                Tạo khung giờ cụ thể cho từng công việc để tối ưu hóa thời gian của bạn. Nhận thông báo nhắc nhở để không bỏ lỡ bất kỳ nhiệm vụ quan trọng nào.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
