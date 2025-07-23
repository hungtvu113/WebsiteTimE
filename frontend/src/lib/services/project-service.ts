import { Project } from '@/lib/types';
import { ApiService } from './api-service';

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
}

export const ProjectService = {
  // Lấy tất cả projects
  getProjects: async (): Promise<Project[]> => {
    try {
      console.log('ProjectService: Đang tải projects...');
      const projects = await ApiService.projects.getAll();
      console.log('ProjectService: Đã tải projects:', projects);
      return projects;
    } catch (error) {
      console.error('ProjectService: Lỗi khi tải projects:', error);
      throw error;
    }
  },

  // Lấy project theo ID
  getProjectById: async (id: string): Promise<Project> => {
    try {
      console.log('ProjectService: Đang tải project...', id);
      const project = await ApiService.projects.getById(id);
      console.log('ProjectService: Đã tải project:', project);
      return project;
    } catch (error) {
      console.error('ProjectService: Lỗi khi tải project:', error);
      throw error;
    }
  },

  // Tạo project mới
  createProject: async (data: CreateProjectData): Promise<Project> => {
    try {
      console.log('ProjectService: Đang tạo project...', data);
      
      // Validate dữ liệu
      if (!data.name.trim()) {
        throw new Error('Tên dự án không được để trống');
      }
      
      const project = await ApiService.projects.create({
        name: data.name.trim(),
        description: data.description?.trim() || '',
      });
      
      console.log('ProjectService: Đã tạo project:', project);
      return project;
    } catch (error) {
      console.error('ProjectService: Lỗi khi tạo project:', error);
      throw error;
    }
  },

  // Cập nhật project
  updateProject: async (id: string, data: UpdateProjectData): Promise<Project> => {
    try {
      console.log('ProjectService: Đang cập nhật project...', id, data);
      
      // Validate dữ liệu nếu có
      if (data.name !== undefined && !data.name.trim()) {
        throw new Error('Tên dự án không được để trống');
      }
      
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.description !== undefined) updateData.description = data.description.trim();
      
      const project = await ApiService.projects.update(id, updateData);
      console.log('ProjectService: Đã cập nhật project:', project);
      return project;
    } catch (error) {
      console.error('ProjectService: Lỗi khi cập nhật project:', error);
      throw error;
    }
  },

  // Xóa project
  deleteProject: async (id: string): Promise<void> => {
    try {
      console.log('ProjectService: Đang xóa project...', id);
      await ApiService.projects.delete(id);
      console.log('ProjectService: Đã xóa project:', id);
    } catch (error) {
      console.error('ProjectService: Lỗi khi xóa project:', error);
      throw error;
    }
  },

  // Lấy tasks của project
  getProjectTasks: async (projectId: string): Promise<any[]> => {
    try {
      console.log('ProjectService: Đang tải tasks của project...', projectId);

      // Sử dụng constants từ ApiService
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/tasks?projectId=${encodeURIComponent(projectId)}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const projectTasks = await response.json();
      console.log('ProjectService: Tasks from API for project:', projectTasks);

      // Map _id to id for frontend compatibility
      const mappedTasks = projectTasks.map((task: any) => ({
        ...task,
        id: task._id || task.id,
      }));

      console.log('ProjectService: Mapped tasks:', mappedTasks);
      return mappedTasks;
    } catch (error) {
      console.error('ProjectService: Lỗi khi tải tasks của project:', error);
      throw error;
    }
  },

  // Refresh projects (để sử dụng trong context)
  refreshProjects: async (): Promise<Project[]> => {
    return await ProjectService.getProjects();
  },
};
