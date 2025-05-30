import React from "react";
import { Task, Project, ScrumTaskStatus } from "@/lib/types";
import TaskCard from "@/components/project/TaskCard";
import TaskForm from "@/components/project/TaskForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const SCRUM_COLUMNS: { key: ScrumTaskStatus; label: string }[] = [
  { key: "backlog", label: "Lên kế hoạch" },
  { key: "todo", label: "Cần làm" },
  { key: "doing", label: "Đang làm" },
  { key: "done", label: "Hoàn thành" },
];

interface ScrumBoardProps {
  project: Project;
  tasks: Task[];
  setTasks: (ts: Task[]) => void;
}

export default function ScrumBoard({ project, tasks, setTasks }: ScrumBoardProps) {
  const [showForm, setShowForm] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  function addTask(task: Task) {
    const newTasks = [...tasks, task];
    setTasks(newTasks);
  }
  
  function updateTask(task: Task) {
    const newTasks = tasks.map(t => t.id === task.id ? task : t);
    setTasks(newTasks);
  }
  
  function deleteTask(id: string) {
    const newTasks = tasks.filter(t => t.id !== id);
    setTasks(newTasks);
  }
  
  function moveTask(id: string, status: ScrumTaskStatus) {
    const newTasks = tasks.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          status, 
          completed: status === 'done',
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });
    setTasks(newTasks);
  }

  return (
    <div className="border rounded-lg bg-background p-6 mb-4 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-xl">Dự án: {project.name}</h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1" 
          onClick={() => { setEditingTask(null); setShowForm(true); }}
        >
          <Plus className="h-4 w-4" /> Thêm công việc
        </Button>
      </div>
      
      {showForm && (
        <TaskForm
          projectId={project.id}
          onSubmit={t => { editingTask ? updateTask(t) : addTask(t); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
          initialTask={editingTask}
        />
      )}
      
      <div className="flex gap-4 min-w-[700px]">
        {SCRUM_COLUMNS.map(col => (
          <div key={col.key} className="flex-1 bg-muted/30 rounded p-3 min-h-[320px]">
            <h3 className="text-center font-bold mb-3 pb-2 border-b">{col.label}</h3>
            <div className="space-y-2">
              {tasks.filter(t => t.status === col.key).map(t => (
                <TaskCard key={t.id} task={t} onEdit={() => { setEditingTask(t); setShowForm(true); }} onDelete={() => deleteTask(t.id)} onMove={moveTask} />
              ))}
              {tasks.filter(t => t.status === col.key).length === 0 && (
                <div className="text-center text-muted-foreground py-4 text-sm italic">
                  Chưa có công việc
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
