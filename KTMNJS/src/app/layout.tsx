import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppInitializer } from "@/components/app-initializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QLTime - Quản lý thời gian hiệu quả",
  description: "QLTime giúp bạn sắp xếp công việc, quản lý thời gian và tăng năng suất làm việc",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <AppInitializer />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
