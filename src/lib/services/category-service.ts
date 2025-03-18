import { v4 as uuidv4 } from 'uuid';
import { Category } from '../types';

// Mô phỏng localStorage cho môi trường máy chủ và client
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

// Danh sách các danh mục mặc định
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Công việc', color: '#ff4757' },
  { id: '2', name: 'Cá nhân', color: '#1e90ff' },
  { id: '3', name: 'Học tập', color: '#ffa502' },
  { id: '4', name: 'Sức khỏe', color: '#2ed573' },
];

export const CategoryService = {
  getCategories: (): Category[] => {
    const storage = getLocalStorage();
    if (!storage) return DEFAULT_CATEGORIES;
    
    const categories = storage.getItem('categories');
    if (!categories) {
      // Khởi tạo danh sách mặc định nếu chưa có
      storage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    
    return JSON.parse(categories);
  },
  
  getCategory: (id: string): Category | undefined => {
    const categories = CategoryService.getCategories();
    return categories.find(category => category.id === id);
  },
  
  createCategory: (category: Omit<Category, 'id'>): Category => {
    const storage = getLocalStorage();
    if (!storage) throw new Error('Storage not available');
    
    const categories = CategoryService.getCategories();
    
    const newCategory: Category = {
      ...category,
      id: uuidv4(),
    };
    
    storage.setItem('categories', JSON.stringify([...categories, newCategory]));
    return newCategory;
  },
  
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>): Category => {
    const storage = getLocalStorage();
    if (!storage) throw new Error('Storage not available');
    
    const categories = CategoryService.getCategories();
    const categoryIndex = categories.findIndex(category => category.id === id);
    
    if (categoryIndex === -1) {
      throw new Error('Category not found');
    }
    
    const updatedCategory: Category = {
      ...categories[categoryIndex],
      ...updates,
    };
    
    categories[categoryIndex] = updatedCategory;
    storage.setItem('categories', JSON.stringify(categories));
    
    return updatedCategory;
  },
  
  deleteCategory: (id: string): void => {
    const storage = getLocalStorage();
    if (!storage) throw new Error('Storage not available');
    
    const categories = CategoryService.getCategories();
    
    // Kiểm tra xem có phải là danh mục mặc định không
    if (DEFAULT_CATEGORIES.some(c => c.id === id)) {
      throw new Error('Cannot delete default category');
    }
    
    const updatedCategories = categories.filter(category => category.id !== id);
    
    storage.setItem('categories', JSON.stringify(updatedCategories));
  },
}; 