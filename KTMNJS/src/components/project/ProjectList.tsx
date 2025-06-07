import React from "react";
import { Project } from "@/lib/types";
import { safeLocalStorageGet } from "@/lib/utils/json-utils";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";

interface ProjectListProps {
  selectedProject: Project | null;
  setSelectedProject: (p: Project | null) => void;
  onAdded?: () => void;
}

export default function ProjectList({ selectedProject, setSelectedProject, onAdded }: ProjectListProps) {
  const [projects, setProjects] = React.useState<Project[]>([]);
  React.useEffect(() => {
    const stored = safeLocalStorageGet<Project[]>('projects_scrum');
    setProjects(stored || []);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'projects_scrum') {
        const stored = safeLocalStorageGet<Project[]>('projects_scrum');
        setProjects(stored || []);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  React.useEffect(() => {
    const stored = localStorage.getItem('projects_scrum');
    if (stored) setProjects(JSON.parse(stored));
  }, [setProjects]);
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");

  function addProject() {
    if (!name.trim()) return;
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description: desc,
      createdAt: new Date().toISOString(),
    };
    const newProjects = [...projects, newProject];
    setProjects(newProjects);
    localStorage.setItem('projects_scrum', JSON.stringify(newProjects));
    setName("");
    setDesc("");
    if (typeof onAdded === 'function') onAdded();
  }
  const [confirmId, setConfirmId] = React.useState<string|null>(null);
function removeProject(id: string) {
  const newProjects = projects.filter(p => p.id !== id);
  setProjects(newProjects);
  localStorage.setItem('projects_scrum', JSON.stringify(newProjects));
  setSelectedProject(null);
  setConfirmId(null);
}

  return (
    <div>
      <h2 className="font-semibold mb-2">Danh sách dự án</h2>
      <ul className="mb-4">
        {projects.map(p => (
  <li key={p.id} className="flex items-center mb-1">
    <button className={`flex-1 text-left px-2 py-1 rounded ${selectedProject?.id === p.id ? 'bg-blue-100 font-bold' : ''}`} onClick={() => setSelectedProject(p)}>{p.name}</button>
    <button className="ml-2 text-red-500" onClick={() => setConfirmId(p.id)}>Xóa</button>
    {confirmId === p.id && (
      <Dialog open={true} onOpenChange={open => !open && setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bạn có chắc chắn muốn xóa dự án này?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <button className="px-3 py-1 rounded bg-gray-200" onClick={() => setConfirmId(null)}>Hủy</button>
            <button className="px-3 py-1 rounded bg-red-500 text-white" onClick={() => removeProject(p.id)}>Xóa</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  </li>
))}
      </ul>
      <div className="mb-2">
        <input className="border px-2 py-1 w-full mb-1" placeholder="Tên dự án" value={name} onChange={e => setName(e.target.value)} />
        <input className="border px-2 py-1 w-full mb-1" placeholder="Mô tả dự án" value={desc} onChange={e => setDesc(e.target.value)} />
        <button className="bg-blue-500 text-white px-3 py-1 rounded w-full" onClick={addProject}>Tạo dự án</button>
      </div>
    </div>
  );
}
