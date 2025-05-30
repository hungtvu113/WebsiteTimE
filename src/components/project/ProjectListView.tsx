import ProjectCard, { ProjectViewMode } from "./ProjectCard";
import ProjectEmptyState from "./ProjectEmptyState";
import { Input } from "@/components/ui/input";
import { Project } from "@/lib/types";
import { useState } from "react";

interface Props {
  projects: Project[];
  selectedProjectId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onViewModeSelect: (projectId: string, mode: ProjectViewMode) => void;
}

export default function ProjectListView({ 
  projects, 
  selectedProjectId, 
  onSelect, 
  onEdit, 
  onDelete, 
  onAdd,
  onViewModeSelect
}: Props) {
  const [search, setSearch] = useState("");
  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-3">
        <Input placeholder="Tìm kiếm dự án..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <ProjectEmptyState onAdd={onAdd} />
      ) : (
        filtered.map(p => (
          <ProjectCard
            key={p.id}
            project={p}
            onSelect={() => onSelect(p.id)}
            onEdit={() => onEdit(p.id)}
            onDelete={() => onDelete(p.id)}
            selected={selectedProjectId === p.id}
            onViewModeSelect={onViewModeSelect}
          />
        ))
      )}
    </div>
  );
}
