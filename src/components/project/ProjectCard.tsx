import { Button } from "@/components/ui/button";
import { Project } from "@/lib/types";
import { Folder, ChevronDown, ChevronUp, BarChart2, ListChecks, Edit, Trash } from "lucide-react";
import { useState } from "react";

export type ProjectViewMode = 'tasks' | 'stats';

export default function ProjectCard({ 
  project, 
  onSelect, 
  onEdit, 
  onDelete, 
  selected,
  onViewModeSelect
}: {
  project: Project;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  selected: boolean;
  onViewModeSelect: (projectId: string, mode: ProjectViewMode) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSelect = () => {
    onSelect();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-2">
      <div 
        className={`flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer transition hover:bg-accent ${selected ? 'bg-accent border-primary' : 'bg-card'}`} 
        onClick={handleSelect}
      >
        <Folder className="w-5 h-5 text-primary" />
        <div className="flex-1">
          <div className="font-semibold text-base truncate">{project.name}</div>
          <div className="text-xs text-muted-foreground truncate">{project.description}</div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); onEdit(); }}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={e => { e.stopPropagation(); onDelete(); }}>
          <Trash className="h-4 w-4" />
        </Button>
        {selected && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {selected && isExpanded && (
        <div className="ml-8 mt-1 border-l-2 pl-3 py-1 space-y-1 border-primary">
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-accent cursor-pointer text-sm"
            onClick={() => onViewModeSelect(project.id, 'tasks')}
          >
            <ListChecks className="h-4 w-4" />
            <span>Bảng công việc</span>
          </div>
          <div 
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-accent cursor-pointer text-sm"
            onClick={() => onViewModeSelect(project.id, 'stats')}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Thống kê</span>
          </div>
        </div>
      )}
    </div>
  );
}
