"use client";
import React, { useState, useEffect } from "react";
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  // Luôn dùng key riêng cho dự án scrum
  const PROJECTS_KEY = "projects_scrum";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ProjectViewMode>('tasks');

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Load từ localStorage - chỉ load danh sách dự án
  useEffect(() => {
    const p = localStorage.getItem(PROJECTS_KEY);
    setProjects(p ? JSON.parse(p) : []);
  }, []);

  // Khi chọn dự án, load tasks của dự án đó từ localStorage
  useEffect(() => {
    if (selectedProject) {
      const storedTasks = localStorage.getItem(`tasks_project_${selectedProject.id}`);
      setTasks(storedTasks ? JSON.parse(storedTasks) : []);
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  // Lưu tasks vào localStorage khi thay đổi
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem(`tasks_project_${selectedProject.id}`, JSON.stringify(tasks));
    }
  }, [tasks, selectedProject]);

  // Lắng nghe sự kiện storage để đồng bộ danh sách dự án khi có thay đổi từ tab khác
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PROJECTS_KEY) {
        const p = localStorage.getItem(PROJECTS_KEY);
        setProjects(p ? JSON.parse(p) : []);
      } else if (selectedProject && e.key === `tasks_project_${selectedProject.id}`) {
        const storedTasks = localStorage.getItem(`tasks_project_${selectedProject.id}`);
        setTasks(storedTasks ? JSON.parse(storedTasks) : []);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [selectedProject]);

  const handleViewModeSelect = (projectId: string, mode: ProjectViewMode) => {
    setSelectedProject(projects.find(p => p.id === projectId) || null);
    setViewMode(mode);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Quản lý dự án</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="w-full md:w-1/3 min-w-[260px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-bold tracking-tight text-primary">Danh sách dự án</CardTitle>
              <Button variant="outline" className="gap-2" onClick={() => setShowAdd(true)}>
                <span>+ Thêm dự án</span>
              </Button>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 pb-2 min-h-[320px]">
              <ProjectListView
                projects={projects}
                selectedProjectId={selectedProject?.id || null}
                onSelect={id => setSelectedProject(projects.find(p => p.id === id) || null)}
                onEdit={id => {
                  setEditProject(projects.find(p => p.id === id) || null);
                  setShowEdit(true);
                }}
                onDelete={id => {
                  const newProjects = projects.filter(p => p.id !== id);
                  setProjects(newProjects);
                  // Vẫn lưu danh sách dự án sau khi xóa
                  localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
                  // Xóa tasks của dự án đã xóa
                  localStorage.removeItem(`tasks_project_${id}`);
                  if(selectedProject?.id === id) setSelectedProject(null);
                }}
                onAdd={() => {
                  setShowAdd(true);
                }}
                onViewModeSelect={handleViewModeSelect}
              />
              <ProjectDialog
                open={showAdd}
                onClose={() => setShowAdd(false)}
                onSubmit={({ name, description }) => {
                  const newProject = { 
                    id: Date.now().toString(), 
                    name, 
                    description, 
                    createdAt: new Date().toISOString() 
                  };
                  const newProjects = [...projects, newProject];
                  setProjects(newProjects);
                  // Lưu danh sách dự án khi tạo mới
                  localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
                  setShowAdd(false);
                }}
              />
              <ProjectDialog
                open={showEdit}
                onClose={() => setShowEdit(false)}
                initial={editProject ? { name: editProject.name, description: editProject.description || "" } : undefined}
                onSubmit={({ name, description }) => {
                  if(editProject) {
                    const newProjects = projects.map(p => 
                      p.id === editProject.id ? { ...p, name, description } : p
                    );
                    setProjects(newProjects);
                    // Lưu danh sách dự án khi cập nhật
                    localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
                    setShowEdit(false);
                  }
                }}
              />
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-[320px]">
            <CardHeader>
              <CardTitle className="text-base">
                {selectedProject 
                  ? viewMode === 'tasks' 
                    ? 'Bảng công việc' 
                    : 'Thống kê dự án'
                  : 'Bảng công việc'
                }
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 pb-2 min-h-[420px]">
              {selectedProject ? (
                viewMode === 'tasks' ? (
                  <ScrumBoard
                    project={selectedProject}
                    tasks={tasks}
                    setTasks={setTasks}
                  />
                ) : (
                  <ProjectStats
                    project={selectedProject}
                    tasks={tasks}
                  />
                )
              ) : (
                <div className="text-muted-foreground text-center py-8">Chọn một dự án để xem bảng công việc</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
