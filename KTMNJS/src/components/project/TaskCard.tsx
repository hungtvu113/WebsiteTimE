import React from "react";
import { Task, ScrumTaskStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (id: string, status: ScrumTaskStatus) => void;
}

const statusColors: Record<ScrumTaskStatus, string> = {
  backlog: "bg-muted text-primary",
  todo: "bg-primary/10 text-primary",
  doing: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500",
};

export default function TaskCard({ task, onEdit, onDelete, onMove }: TaskCardProps) {
  const [showConfirm, setShowConfirm] = React.useState(false);
  
  return (
    <div className="bg-card rounded-md shadow-sm border p-3">
      <div className="flex justify-between items-start">
        <div className="font-medium">{task.title}</div>
        <div className="flex gap-1 ml-2">
          <Badge variant={
            task.priority === 'high' ? 'destructive' :
            task.priority === 'medium' ? 'default' :
            'secondary'
          } className="text-xs">
            {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
          </Badge>
        </div>
      </div>
      
      {task.description && (
        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</div>
      )}
      
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-muted">
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setShowConfirm(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-1">
          {(['backlog','todo','doing','done'] as ScrumTaskStatus[])
            .filter(s => s !== task.status)
            .map(s => {
              let label = '';
              if (s === 'backlog') label = 'Lên KH';
              else if (s === 'todo') label = 'Cần làm';
              else if (s === 'doing') label = 'Đang làm';
              else if (s === 'done') label = 'Hoàn thành';
              
              return (
                <Button 
                  key={s} 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs px-2"
                  onClick={() => onMove(task.id, s)}
                >
                  <ArrowRight className="h-3 w-3 mr-1" /> {label}
                </Button>
              );
            })
          }
        </div>
      </div>
      
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn xóa công việc này?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Hủy</Button>
            <Button variant="destructive" onClick={() => { setShowConfirm(false); onDelete(); }}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
