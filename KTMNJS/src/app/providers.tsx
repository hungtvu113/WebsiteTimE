"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { StatisticsProvider } from "@/lib/contexts/statistics-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <AuthWrapper>
        <StatisticsProvider>
          {children}
        </StatisticsProvider>
      </AuthWrapper>
    </ThemeProvider>
  );
}