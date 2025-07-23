"use client";

import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import SidebarMenu from "@/components/ui/SidebarMenu";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ClearDataButton } from "@/components/clear-data-button";
import { Footerdemo } from "@/components/ui/footer-section";
import { useSidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";
import { AIAssistant } from '@/components/ai/ai-assistant';
import { AIChatbox } from '@/components/ai/ai-chatbox';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      <Sidebar>
        <div className="flex h-full flex-col justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-2 py-2">
              <Logo />
            </div>
            <SidebarMenu />
          </div>
          <div className="flex flex-col gap-2 px-2">
            <ClearDataButton />
          </div>
        </div>
      </Sidebar>
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-grow px-4 py-6 md:px-8 lg:px-12">
            {children}
          </div>
          <Footerdemo />
        </div>
      </div>

      <AIAssistant />
      <AIChatbox />
    </div>
  );
}

const Logo = () => {
  const { open, animate } = useSidebar();

  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          marginLeft: animate ? (open ? "8px" : "40px") : "8px",
          display: animate ? "inline-block" : "inline-block"
        }}
        transition={{ duration: 0.3 }}
        className="font-medium whitespace-pre text-xl"
      >
        QLTime
      </motion.span>
    </Link>
  );
}; 