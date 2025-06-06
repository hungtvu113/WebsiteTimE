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
import { ProjectService } from "@/lib/services/project-service";
import { TaskService } from "@/lib/services/task-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, Plus, Loader2 } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ProjectViewMode>('tasks');
  const [loading, setLoading] = useState<boolean>(true);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Load projects từ API
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('ProjectsPage: Đang tải projects...');

      const fetchedProjects = await ProjectService.getProjects();
      setProjects(fetchedProjects);

      console.log('ProjectsPage: Đã tải projects thành công:', fetchedProjects.length);
    } catch (err: any) {
      console.error('ProjectsPage: Lỗi khi tải projects:', err);
      setError(err.message || 'Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  // Load tasks của project được chọn
  const loadProjectTasks = async (projectId: string) => {
    try {
      setTasksLoading(true);
      console.log('ProjectsPage: Đang tải tasks của project...', projectId);

      const fetchedTasks = await ProjectService.getProjectTasks(projectId);
      console.log('ProjectsPage: Fetched tasks for project:', projectId, fetchedTasks);
      setTasks(fetchedTasks);

      console.log('ProjectsPage: Đã tải tasks thành công:', fetchedTasks.length);
    } catch (err: any) {
      console.error('ProjectsPage: Lỗi khi tải tasks:', err);
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Khi chọn project, load tasks của project đó
  useEffect(() => {
    if (selectedProject && selectedProject.id) {
      loadProjectTasks(selectedProject.id);
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  const handleViewModeSelect = (projectId: string, mode: ProjectViewMode) => {
    setSelectedProject(projects.find(p => p.id === projectId) || null);
    setViewMode(mode);
  };

  // Handler functions cho CRUD operations
  const handleAddProject = async (data: { name: string; description: string }) => {
    try {
      console.log('ProjectsPage: Đang tạo project...', data);
      const newProject = await ProjectService.createProject(data);
      console.log('ProjectsPage: New project created:', newProject);
      setProjects([...projects, newProject]);
      setShowAdd(false);
      console.log('ProjectsPage: Đã tạo project thành công');
    } catch (err: any) {
      console.error('ProjectsPage: Lỗi khi tạo project:', err);
      setError(err.message || 'Không thể tạo dự án');
    }
  };

  const handleEditProject = async (data: { name: string; description: string }) => {
    if (!editProject) return;

    try {
      console.log('ProjectsPage: Đang cập nhật project...', editProject.id, data);
      const updatedProject = await ProjectService.updateProject(editProject.id, data);

      setProjects(projects.map(p => p.id === editProject.id ? updatedProject : p));
      setShowEdit(false);
      setEditProject(null);

      // Nếu đang chỉnh sửa dự án hiện tại, cập nhật selectedProject
      if (selectedProject && selectedProject.id === editProject.id) {
        setSelectedProject(updatedProject);
      }

      console.log('ProjectsPage: Đã cập nhật project thành công');
    } catch (err: any) {
      console.error('ProjectsPage: Lỗi khi cập nhật project:', err);
      setError(err.message || 'Không thể cập nhật dự án');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      console.log('ProjectsPage: Đang xóa project...', projectId);
      await ProjectService.deleteProject(projectId);

      setProjects(projects.filter(p => p.id !== projectId));

      // Nếu đang xem dự án bị xóa, reset selectedProject
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(null);
      }

      console.log('ProjectsPage: Đã xóa project thành công');
    } catch (err: any) {
      console.error('ProjectsPage: Lỗi khi xóa project:', err);
      setError(err.message || 'Không thể xóa dự án');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* Header với refresh button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Quản lý dự án</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadProjects}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Thêm dự án
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <Card className="w-full md:w-1/3 min-w-[260px]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Danh sách dự án</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 pb-2 min-h-[320px]">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <ProjectListView
                  projects={projects}
                  selectedProjectId={selectedProject?.id || null}
                  onSelect={id => setSelectedProject(projects.find(p => p.id === id) || null)}
                  onEdit={id => {
                    setEditProject(projects.find(p => p.id === id) || null);
                    setShowEdit(true);
                  }}
                  onDelete={handleDeleteProject}
                  onAdd={() => setShowAdd(true)}
                  onViewModeSelect={handleViewModeSelect}
                />
              )}
              <ProjectDialog
                open={showAdd}
                onClose={() => setShowAdd(false)}
                onSubmit={handleAddProject}
              />
              <ProjectDialog
                open={showEdit}
                onClose={() => {
                  setShowEdit(false);
                  setEditProject(null);
                }}
                initial={editProject ? {
                  name: editProject.name,
                  description: editProject.description || ""
                } : undefined}
                onSubmit={handleEditProject}
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
                tasksLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-muted-foreground">Đang tải công việc...</span>
                      </div>
                    </div>
                  </div>
                ) : viewMode === 'tasks' ? (
                  <ScrumBoard
                    project={selectedProject}
                    tasks={tasks}
                    setTasks={setTasks}
                    onTaskUpdate={() => loadProjectTasks(selectedProject.id)}
                  />
                ) : (
                  <ProjectStats
                    project={selectedProject}
                    tasks={tasks}
                  />
                )
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  <div className="space-y-2">
                    <p>Chọn một dự án để xem bảng công việc</p>
                    <p className="text-sm">Hoặc tạo dự án mới để bắt đầu</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
