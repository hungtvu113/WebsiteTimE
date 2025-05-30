import React from "react";
import { Project } from "@/lib/types";

interface ProjectSelectorProps {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  allowAll?: boolean;
}

export default function ProjectSelector({ selectedProjectId, setSelectedProjectId, allowAll }: ProjectSelectorProps) {
  const [projects, setProjects] = React.useState<Project[]>([]);
  React.useEffect(() => {
    const p = localStorage.getItem('projects_scrum');
    setProjects(p ? JSON.parse(p) : []);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'projects_scrum') {
        const p = localStorage.getItem('projects_scrum');
        setProjects(p ? JSON.parse(p) : []);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  return (
    <select
      className="border px-2 py-1 rounded"
      value={selectedProjectId || ""}
      onChange={e => setSelectedProjectId(e.target.value || null)}
    >
      {allowAll && <option value="">Tất cả dự án</option>}
      {projects.map(p => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );
}
