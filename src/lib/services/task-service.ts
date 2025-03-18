import { v4 as uuidv4 } from 'uuid';
import { Task } from '../types';

// Mô phỏng localStorage cho môi trường máy chủ và client
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

export const TaskService = {
  getTasks: (): Task[] => {
    const storage = getLocalStorage();
    if (!storage) return [];
    
    const tasks = storage.getItem('tasks');
    if (!tasks) return [];
    
    return JSON.parse(tasks);
  },
  
  getTask: (id: string): Task | undefined => {
    const tasks = TaskService.getTasks();
    return tasks.find(task => task.id === id);
  },
  
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const storage = getLocalStorage();
    if (!storage) throw new Error('Storage not available');
    
    const tasks = TaskService.getTasks();
    const now = new Date();
    
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    
    storage.setItem('tasks', JSON.stringify([...tasks, newTask]));
    return newTask;
  },
  
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Task => {
    const storage = getLocalStorage();
    if (!storage) throw new Error('Storage not available');
    
    const tasks = TaskService.getTasks();
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    tasks[taskIndex] = updatedTask;
    storage.setItem('tasks', JSON.stringify(tasks));
    
    return updatedTask;
  },
  
  deleteTask: (id: string): void => {
    const storage = getLocalStorage();
    if (!storage) throw new Error('Storage not available');
    
    const tasks = TaskService.getTasks();
    const updatedTasks = tasks.filter(task => task.id !== id);
    
    storage.setItem('tasks', JSON.stringify(updatedTasks));
  },
  
  toggleTaskCompletion: (id: string): Task => {
    const task = TaskService.getTask(id);
    if (!task) {
      throw new Error('Task not found');
    }
    
    return TaskService.updateTask(id, { completed: !task.completed });
  },
}; 