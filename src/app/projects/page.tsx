"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Project, Task } from "@/lib/types";
import ProjectListView from "@/components/project/ProjectListView";
import ProjectDialog from "@/components/project/ProjectDialog";
import ScrumBoard from "@/components/project/ScrumBoard";
import ProjectStats from "@/components/project/ProjectStats";
import { Layout } from "@/components/layout/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ProjectViewMode } from "@/components/project/ProjectCard";

const PROJECTS_KEY = "projects_scrum";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ProjectViewMode>("tasks");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const loadProjects = useCallback(() => {
    const stored = localStorage.getItem(PROJECTS_KEY);
    setProjects(stored ? JSON.parse(stored) : []);
  }, []);

  const loadTasks = useCallback((projectId: string) => {
    const stored = localStorage.getItem(`tasks_project_${projectId}`);
    setTasks(stored ? JSON.parse(stored) : []);
  }, []);

  useEffect(() => loadProjects(), []);

  useEffect(() => {
    if (selectedProject) loadTasks(selectedProject.id);
    else setTasks([]);
  }, [selectedProject, loadTasks]);

  useEffect(() => {
    if (selectedProject)
      localStorage.setItem(`tasks_project_${selectedProject.id}`, JSON.stringify(tasks));
  }, [tasks, selectedProject]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PROJECTS_KEY) loadProjects();
      else if (selectedProject && e.key === `tasks_project_${selectedProject.id}`) {
        loadTasks(selectedProject.id);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [selectedProject, loadProjects, loadTasks]);

  const handleAddOrEdit = ({ name, description }: { name: string; description?: string }) => {
    if (editProject) {
      const updated = projects.map(p => (p.id === editProject.id ? { ...p, name, description } : p));
      setProjects(updated);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
    } else {
      const newProject = {
        id: Date.now().toString(),
        name,
        description,
        createdAt: new Date().toISOString(),
      };
      const updated = [...projects, newProject];
      setProjects(updated);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
    }
    setEditProject(null);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
    localStorage.removeItem(`tasks_project_${id}`);
    if (selectedProject?.id === id) setSelectedProject(null);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Quản lý dự án</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="w-full md:w-1/3 min-w-[260px]">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-2xl font-bold text-primary">Danh sách dự án</CardTitle>
              <Button variant="outline" onClick={() => setDialogOpen(true)}>+ Thêm</Button>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 pb-2 min-h-[320px]">
              <ProjectListView
                projects={projects}
                selectedProjectId={selectedProject?.id || null}
                onSelect={id => setSelectedProject(projects.find(p => p.id === id) || null)}
                onEdit={id => {
                  setEditProject(projects.find(p => p.id === id) || null);
                  setDialogOpen(true);
                }}
                onDelete={handleDelete}
                onAdd={() => setDialogOpen(true)}
                onViewModeSelect={(id, mode) => {
                  setSelectedProject(projects.find(p => p.id === id) || null);
                  setViewMode(mode);
                }}
              />
              <ProjectDialog
                open={dialogOpen}
                onClose={() => {
                  setEditProject(null);
                  setDialogOpen(false);
                }}
                initial={
                  editProject
                    ? { name: editProject.name, description: editProject.description || "" }
                    : undefined
                }
                onSubmit={handleAddOrEdit}
              />
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[320px]">
            <CardHeader>
              <CardTitle className="text-base">
                {selectedProject
                  ? viewMode === "tasks"
                    ? "Bảng công việc"
                    : "Thống kê dự án"
                  : "Bảng công việc"}
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 pb-2 min-h-[420px]">
              {selectedProject ? (
                viewMode === "tasks" ? (
                  <ScrumBoard project={selectedProject} tasks={tasks} setTasks={setTasks} />
                ) : (
                  <ProjectStats project={selectedProject} tasks={tasks} />
                )
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  Chọn một dự án để xem bảng công việc
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
