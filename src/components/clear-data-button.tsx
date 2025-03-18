"use client";

import { Button } from "@/components/ui/button";
import { PreferenceService } from "@/lib/services/preference-service";
import { Trash2 } from "lucide-react";

export function ClearDataButton() {
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
      <span>Xóa dữ liệu</span>
    </Button>
  );
} 