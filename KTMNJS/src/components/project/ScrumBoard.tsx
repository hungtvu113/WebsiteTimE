import React from "react";
import { Task, Project, ScrumTaskStatus } from "@/lib/types";
import TaskCard from "@/components/project/TaskCard";
import TaskForm from "@/components/project/TaskForm";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { TaskService } from "@/lib/services/task-service";

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
  onTaskUpdate?: () => void;
}

export default function ScrumBoard({ project, tasks, setTasks, onTaskUpdate }: ScrumBoardProps) {
  const [showForm, setShowForm] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Debug: Log tasks khi component render
  React.useEffect(() => {
    console.log('ScrumBoard: Component rendered with tasks:', tasks);
    console.log('ScrumBoard: Tasks with status:', tasks.map(t => ({ id: t.id, title: t.title, status: t.status })));

    // Kiểm tra tasks không có status
    const tasksWithoutStatus = tasks.filter(t => !t.status);
    if (tasksWithoutStatus.length > 0) {
      console.warn('ScrumBoard: Tasks without status:', tasksWithoutStatus);
    }
  }, [tasks]);

  async function addTask(taskData: Omit<Task, 'id'>) {
    try {
      setLoading(true);
      console.log('ScrumBoard: Đang tạo task...', taskData);

      const newTask = await TaskService.createTask({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        project: project.id,
        dueDate: taskData.dueDate,
        status: taskData.status || 'backlog',
        completed: taskData.completed || false,
      });

      console.log('ScrumBoard: Đã tạo task:', newTask);
      console.log('ScrumBoard: Current tasks before update:', tasks);

      // Đảm bảo task có status để hiển thị đúng column
      const taskWithStatus = {
        ...newTask,
        status: newTask.status || 'backlog',
        projectId: project.id, // Backward compatibility
      };

      const updatedTasks = [...tasks, taskWithStatus];
      console.log('ScrumBoard: Updated tasks:', updatedTasks);
      setTasks(updatedTasks);
      setShowForm(false);

      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('ScrumBoard: Lỗi khi tạo task:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateTask(task: Task) {
    try {
      setLoading(true);
      console.log('ScrumBoard: Đang cập nhật task...', task);

      const updatedTask = await TaskService.updateTask(task.id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        completed: task.completed,
        dueDate: task.dueDate,
      });

      console.log('ScrumBoard: Đã cập nhật task:', updatedTask);
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
      setShowForm(false);

      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('ScrumBoard: Lỗi khi cập nhật task:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTask(id: string) {
    try {
      setLoading(true);
      console.log('ScrumBoard: Đang xóa task...', id);

      await TaskService.deleteTask(id);

      console.log('ScrumBoard: Đã xóa task:', id);
      setTasks(tasks.filter(t => t.id !== id));

      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('ScrumBoard: Lỗi khi xóa task:', error);
    } finally {
      setLoading(false);
    }
  }

  async function moveTask(id: string, status: ScrumTaskStatus) {
    try {
      setLoading(true);
      console.log('ScrumBoard: Đang di chuyển task...', id, status);

      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const updatedTask = await TaskService.updateTask(id, {
        completed: status === 'done',
      });

      // Update local state với status mới
      const newTask = {
        ...updatedTask,
        status,
        updatedAt: new Date().toISOString()
      };

      console.log('ScrumBoard: Đã di chuyển task:', newTask);
      setTasks(tasks.map(t => t.id === id ? newTask : t));

      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('ScrumBoard: Lỗi khi di chuyển task:', error);
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Thêm công việc
        </Button>
      </div>
      
      {showForm && (
        <TaskForm
          projectId={project.id}
          onSubmit={t => {
            if (editingTask) {
              updateTask(t as Task);
            } else {
              addTask(t as Omit<Task, 'id'>);
            }
          }}
          onCancel={() => setShowForm(false)}
          initialTask={editingTask}
        />
      )}
      
      <div className="flex gap-4 min-w-[700px]">
        {SCRUM_COLUMNS.map(col => {
          const tasksForColumn = tasks.filter(t => {
            console.log(`ScrumBoard: Checking task ${t.id} (${t.title}) with status "${t.status}" against column "${col.key}"`);
            return t.status === col.key;
          });
          console.log(`ScrumBoard: Column ${col.key} has ${tasksForColumn.length} tasks:`, tasksForColumn);

          return (
            <div key={col.key} className="flex-1 bg-muted/30 rounded p-3 min-h-[320px]">
              <h3 className="text-center font-bold mb-3 pb-2 border-b">
                {col.label} ({tasksForColumn.length})
              </h3>
              <div className="space-y-2">
                {tasksForColumn.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onEdit={() => { setEditingTask(t); setShowForm(true); }}
                    onDelete={() => deleteTask(t.id)}
                    onMove={moveTask}
                  />
                ))}
                {tasksForColumn.length === 0 && (
                  <div className="text-center text-muted-foreground py-4 text-sm italic">
                    Chưa có công việc
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
