import { Task, Category, TimeBlock, Preference, Note, Project } from '../types';

// URL cơ sở cho API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Hàm trợ giúp để xử lý lỗi từ phản hồi fetch
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    console.log(`handleResponse: Response not OK - Status: ${response.status}, StatusText: ${response.statusText}`);

    // Xử lý lỗi 401 (Unauthorized) - token hết hạn hoặc không hợp lệ
    if (response.status === 401) {
      console.log('handleResponse: 401 Unauthorized - Xóa token');
      // Xóa token không hợp lệ
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }

    const errorData = await response.json().catch(() => ({}));
    console.log('handleResponse: Error data:', errorData);
    throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
  }

  // Kiểm tra nếu response có content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    if (text && text !== 'undefined' && text !== 'null' && text.trim() !== '') {
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Text:', text);
        throw new Error('Phản hồi từ server không hợp lệ');
      }
    }
    return null;
  }

  // Nếu không có content-type JSON, trả về null cho DELETE requests
  return null;
};

// Hàm wrapper để xử lý lỗi kết nối
const handleFetchError = async (fetchPromise: Promise<Response>) => {
  try {
    return await fetchPromise;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo server đang chạy.');
    }
    throw error;
  }
};

// Hàm xử lý response đặc biệt cho getById - không throw error cho 404
const handleResponseForGetById = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 404) {
      // Trả về null thay vì throw error cho 404
      return null;
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Lỗi ${response.status}: ${response.statusText}`);
  }

  // Kiểm tra nếu response có content
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    if (text && text !== 'undefined' && text !== 'null' && text.trim() !== '') {
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Text:', text);
        throw new Error('Phản hồi từ server không hợp lệ');
      }
    }
    return null;
  }

  // Nếu không có content-type JSON, trả về null cho DELETE requests
  return null;
};

// Lấy token xác thực từ localStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Tạo headers cơ bản cho các yêu cầu API
const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Tạo headers cho DELETE requests (không có Content-Type)
const getDeleteHeaders = () => {
  const headers: HeadersInit = {};

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const ApiService = {
  // AUTH ENDPOINTS
  auth: {
    login: async (email: string, password: string) => {
      const response = await handleFetchError(fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      }));
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      return data;
    },

    register: async (name: string, email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, password }),
      });
      return handleResponse(response);
    },

    logout: () => {
      localStorage.removeItem('authToken');
    },

    getCurrentUser: async () => {
      console.log('ApiService.getCurrentUser: Đang gọi API /auth/me...');
      const headers = getHeaders();
      console.log('ApiService.getCurrentUser: Headers:', headers);

      const response = await handleFetchError(fetch(`${API_BASE_URL}/auth/me`, {
        headers: headers,
      }));

      console.log('ApiService.getCurrentUser: Response status:', response.status);
      const result = await handleResponse(response);
      console.log('ApiService.getCurrentUser: Result:', result);
      return result;
    },
  },

  // TASK ENDPOINTS
  tasks: {
    getAll: async (): Promise<Task[]> => {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: getHeaders(),
      });
      const data = await handleResponse(response);
      // Map _id to id for frontend compatibility
      return data.map((task: any) => ({
        ...task,
        id: task._id || task.id,
      }));
    },

    getById: async (id: string): Promise<Task | null> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        headers: getHeaders(),
      });
      return handleResponseForGetById(response);
    },

    create: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(task),
      });
      return handleResponse(response);
    },

    update: async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: getDeleteHeaders(),
      });
      return handleResponse(response);
    },

    toggleCompletion: async (id: string): Promise<Task> => {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
        method: 'PATCH',
        headers: getDeleteHeaders(), // Không cần Content-Type vì không có body
      });
      return handleResponse(response);
    },
  },

  // CATEGORY ENDPOINTS
  categories: {
    getAll: async (): Promise<Category[]> => {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: string): Promise<Category> => {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    create: async (category: Omit<Category, 'id'>): Promise<Category> => {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(category),
      });
      return handleResponse(response);
    },

    update: async (id: string, updates: Partial<Omit<Category, 'id'>>): Promise<Category> => {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: getDeleteHeaders(),
      });
      return handleResponse(response);
    },
  },

  // TIME BLOCK ENDPOINTS
  timeBlocks: {
    getAll: async (): Promise<TimeBlock[]> => {
      const response = await fetch(`${API_BASE_URL}/time-blocks`, {
        headers: getHeaders(),
      });
      const data = await handleResponse(response);
      // Map _id to id for frontend compatibility
      return data.map((timeBlock: any) => ({
        ...timeBlock,
        id: timeBlock._id || timeBlock.id,
      }));
    },

    getByDate: async (date: string): Promise<TimeBlock[]> => {
      const response = await fetch(`${API_BASE_URL}/time-blocks/date/${date}`, {
        headers: getHeaders(),
      });
      const data = await handleResponse(response);
      // Map _id to id for frontend compatibility
      return data.map((timeBlock: any) => ({
        ...timeBlock,
        id: timeBlock._id || timeBlock.id,
      }));
    },

    getById: async (id: string): Promise<TimeBlock> => {
      const response = await fetch(`${API_BASE_URL}/time-blocks/${id}`, {
        headers: getHeaders(),
      });
      const data = await handleResponse(response);
      // Map _id to id for frontend compatibility
      return {
        ...data,
        id: data._id || data.id,
      };
    },

    create: async (timeBlock: {
      title: string;
      startTime: string;
      endTime: string;
      isCompleted?: boolean;
      taskId?: string | null;
    }): Promise<TimeBlock> => {
      const response = await fetch(`${API_BASE_URL}/time-blocks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(timeBlock),
      });
      const data = await handleResponse(response);
      // Map _id to id for frontend compatibility
      return {
        ...data,
        id: data._id || data.id,
      };
    },

    update: async (id: string, updates: Partial<Omit<TimeBlock, 'id'>>): Promise<TimeBlock> => {
      console.log('ApiService: Updating timeBlock with id:', id, 'updates:', updates);
      const response = await fetch(`${API_BASE_URL}/time-blocks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(response);
      // Map _id to id for frontend compatibility
      return {
        ...data,
        id: data._id || data.id,
      };
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/time-blocks/${id}`, {
        method: 'DELETE',
        headers: getDeleteHeaders(),
      });
      return handleResponse(response);
    },

    toggleCompletion: async (id: string, isCompleted: boolean): Promise<TimeBlock> => {
      console.log('ApiService: Toggling timeBlock completion:', id, isCompleted);
      const response = await fetch(`${API_BASE_URL}/time-blocks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ isCompleted }),
      });
      const data = await handleResponse(response);
      // Map _id to id for frontend compatibility
      return {
        ...data,
        id: data._id || data.id,
      };
    },
  },

  // PREFERENCE ENDPOINTS
  preferences: {
    get: async (): Promise<Preference> => {
      const response = await fetch(`${API_BASE_URL}/preferences`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    update: async (updates: Partial<Omit<Preference, 'id' | 'userId'>>): Promise<Preference> => {
      const response = await fetch(`${API_BASE_URL}/preferences`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      return handleResponse(response);
    },
  },

  // PROJECT ENDPOINTS
  projects: {
    getAll: async (): Promise<Project[]> => {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: getHeaders(),
      });
      const data = await handleResponse(response);
      // Map _id to id for frontend compatibility
      return data.map((project: any) => ({
        ...project,
        id: project._id || project.id,
      }));
    },

    getById: async (id: string): Promise<Project> => {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        headers: getHeaders(),
      });
      const data = await handleResponse(response);
      // Map _id to id for frontend compatibility
      return {
        ...data,
        id: data._id || data.id,
      };
    },

    create: async (project: {
      name: string;
      description?: string;
    }): Promise<Project> => {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(project),
      });
      const data = await handleResponse(response);
      // Map _id to id for frontend compatibility
      return {
        ...data,
        id: data._id || data.id,
      };
    },

    update: async (id: string, updates: any): Promise<Project> => {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(response);
      // Map _id to id for frontend compatibility
      return {
        ...data,
        id: data._id || data.id,
      };
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: getDeleteHeaders(),
      });
      return handleResponse(response);
    },
  },

  // NOTE ENDPOINTS
  notes: {
    getAll: async (): Promise<Note[]> => {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    getById: async (id: string): Promise<Note> => {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    create: async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(note),
      });
      return handleResponse(response);
    },

    update: async (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Note> => {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      return handleResponse(response);
    },

    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'DELETE',
        headers: getDeleteHeaders(),
      });
      return handleResponse(response);
    },
  },

  // STATISTICS ENDPOINTS
  statistics: {
    getTaskStats: async (startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `${API_BASE_URL}/statistics/tasks${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    getTimeBlockStats: async (startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `${API_BASE_URL}/statistics/time-blocks${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    getProductivityStats: async (startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `${API_BASE_URL}/statistics/productivity${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
  },

  // USER ENDPOINTS
  users: {
    getProfile: async () => {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: getHeaders(),
      });
      return handleResponse(response);
    },

    updateProfile: async (updates: { name?: string; email?: string; avatar?: string }) => {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      return handleResponse(response);
    },
  },

  // NOTIFICATIONS ENDPOINTS
  notifications: {
    subscribeEmail: async (subscriptionData: {
      email: string;
      taskReminders?: boolean;
      dailySummary?: boolean;
      weeklyReport?: boolean;
      reminderHours?: number;
    }) => {
      const response = await handleFetchError(fetch(`${API_BASE_URL}/notifications/email/subscribe`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(subscriptionData),
      }));
      return handleResponse(response);
    },

    subscribeEmailPublic: async (subscriptionData: {
      email: string;
      name?: string;
      taskReminders?: boolean;
      dailySummary?: boolean;
      weeklyReport?: boolean;
      reminderHours?: number;
    }) => {
      const response = await handleFetchError(fetch(`${API_BASE_URL}/notifications/email/subscribe-public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      }));
      return handleResponse(response);
    },

    getSubscriptions: async () => {
      const response = await handleFetchError(fetch(`${API_BASE_URL}/notifications/email/subscriptions`, {
        headers: getHeaders(),
      }));
      return handleResponse(response);
    },

    updateSubscription: async (id: string, updateData: any) => {
      const response = await handleFetchError(fetch(`${API_BASE_URL}/notifications/email/subscriptions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updateData),
      }));
      return handleResponse(response);
    },

    deleteSubscription: async (id: string) => {
      const response = await handleFetchError(fetch(`${API_BASE_URL}/notifications/email/subscriptions/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }));
      return handleResponse(response);
    },

    unsubscribe: async (token: string) => {
      const response = await handleFetchError(fetch(`${API_BASE_URL}/notifications/email/unsubscribe?token=${token}`, {
        method: 'POST',
      }));
      return handleResponse(response);
    },
  },


};
