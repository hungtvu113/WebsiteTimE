"use client";

import { Button } from "@/components/ui/button";
import { PreferenceService } from "@/lib/services/preference-service";
import { Trash2 } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { motion } from "framer-motion";

export function ClearDataButton() {
  const { open, animate } = useSidebar();
  
  const handleClearData = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.')) {
      PreferenceService.clearAllData();
      window.location.reload();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClearData}
      className="w-full flex items-center gap-2 justify-start px-2 text-destructive"
    >
      <Trash2 className="h-5 w-5" />
      <motion.span
        initial={{ opacity: 0, width: 0 }}
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          width: animate ? (open ? "auto" : 0) : "auto",
          marginLeft: animate ? (open ? "0.5rem" : 0) : "0.5rem",
          display: "inline-block"
        }}
        transition={{ duration: 0.2 }}
        className="whitespace-pre overflow-hidden"
      >
        Xóa dữ liệu
      </motion.span>
    </Button>
  );
} 