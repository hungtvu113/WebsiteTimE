import React from "react";
import { Project } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <Select
      value={selectedProjectId || ""}
      onValueChange={(value) => setSelectedProjectId(value || null)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Chọn dự án" />
      </SelectTrigger>
      <SelectContent className="backdrop-blur-sm border border-border/40 bg-background/90">
        {allowAll && <SelectItem value="">Tất cả dự án</SelectItem>}
        {projects.map(p => (
          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
