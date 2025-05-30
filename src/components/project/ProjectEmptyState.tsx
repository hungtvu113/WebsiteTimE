import { Button } from "@/components/ui/button";

export default function ProjectEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <div className="mb-2 text-4xl">📁</div>
      <div className="mb-2 font-semibold">Chưa có dự án nào</div>
      <div className="mb-4 text-sm">Hãy thêm dự án mới để bắt đầu quản lý công việc.</div>
      <Button variant="default" onClick={onAdd}>
        + Thêm dự án mới
      </Button>
    </div>
  );
}
