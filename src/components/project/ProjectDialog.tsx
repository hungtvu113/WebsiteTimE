import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
  initial?: { name: string; description: string };
}

export default function ProjectDialog({ open, onClose, onSubmit, initial }: Props) {
  const [name, setName] = React.useState(initial?.name || "");
  const [desc, setDesc] = React.useState(initial?.description || "");

  React.useEffect(() => {
    setName(initial?.name || "");
    setDesc(initial?.description || "");
  }, [initial, open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Chỉnh sửa dự án" : "Thêm dự án mới"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Input placeholder="Tên dự án" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Mô tả dự án" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="ghost">Hủy</Button>
          <Button onClick={() => { if(name.trim()) onSubmit({ name, description: desc }); }} variant="default">
            {initial ? "Lưu" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
