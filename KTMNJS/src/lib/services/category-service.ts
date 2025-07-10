import { Category } from '../types';
import { ApiService } from './api-service';

// Tạo một lớp cache đơn giản để lưu trữ tạm thời
let categoriesCache: Category[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 phút

// Danh sách các danh mục mặc định
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Công việc', color: '#ff4757' },
  { id: '2', name: 'Cá nhân', color: '#1e90ff' },
  { id: '3', name: 'Học tập', color: '#ffa502' },
  { id: '4', name: 'Sức khỏe', color: '#2ed573' },
];

export const CategoryService = {
  getCategories: async (): Promise<Category[]> => {
    try {
      console.log('CategoryService: Đang gọi API categories...');
      const categories = await ApiService.categories.getAll();
      console.log('CategoryService: Nhận được categories từ API:', categories);
      categoriesCache = categories;
      lastFetchTime = Date.now();
      return categories;
    } catch (error: any) {
      console.error('CategoryService: Lỗi khi lấy danh sách danh mục:', error);

      // Nếu lỗi 401 (Unauthorized), có nghĩa là chưa đăng nhập
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.log('CategoryService: Chưa đăng nhập, sử dụng danh mục mặc định');
        return DEFAULT_CATEGORIES;
      }

      // Nếu có lỗi khác, trả về cache hoặc danh mục mặc định
      if (categoriesCache.length > 0) {
        console.log('CategoryService: Sử dụng cache:', categoriesCache);
        return categoriesCache;
      }
      console.log('CategoryService: Sử dụng danh mục mặc định:', DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
  },
  
  getCategory: async (id: string): Promise<Category | undefined> => {
    try {
      console.log(`CategoryService: Đang tìm danh mục với ID: ${id}`);

      // Kiểm tra trong danh sách mặc định trước
      const defaultCategory = DEFAULT_CATEGORIES.find(category => category.id === id);
      if (defaultCategory) {
        console.log(`CategoryService: Tìm thấy danh mục mặc định:`, defaultCategory);
        return defaultCategory;
      }

      // Nếu cache rỗng, thử load categories trước
      if (categoriesCache.length === 0) {
        console.log('CategoryService: Cache rỗng, đang load categories...');
        try {
          await CategoryService.getCategories();
        } catch (error) {
          console.warn('CategoryService: Không thể load categories:', error);
        }
      }

      // Kiểm tra trong cache sau khi load
      const cachedCategory = categoriesCache.find(category => category.id === id);
      if (cachedCategory) {
        console.log(`CategoryService: Tìm thấy trong cache:`, cachedCategory);
        return cachedCategory;
      }

      // Chỉ gọi API nếu ID có vẻ như MongoDB ObjectId (24 ký tự hex)
      if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        console.log(`CategoryService: Gọi API cho ObjectId: ${id}`);
        const apiCategory = await ApiService.categories.getById(id);
        if (apiCategory) {
          // Thêm vào cache
          categoriesCache = [...categoriesCache, apiCategory];
        }
        return apiCategory;
      }

      // Nếu không phải ObjectId hợp lệ, trả về undefined
      console.warn(`CategoryService: ID danh mục không hợp lệ: ${id}`);
      return undefined;
    } catch (error) {
      console.error(`CategoryService: Lỗi khi lấy danh mục với id ${id}:`, error);
      // Kiểm tra trong danh sách mặc định
      return DEFAULT_CATEGORIES.find(category => category.id === id);
    }
  },
  
  createCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    try {
      const newCategory = await ApiService.categories.create(category);
      // Cập nhật cache
      categoriesCache = [...categoriesCache, newCategory];
      return newCategory;
    } catch (error) {
      console.error('Lỗi khi tạo danh mục mới:', error);
      throw error;
    }
  },
  
  updateCategory: async (id: string, updates: Partial<Omit<Category, 'id'>>): Promise<Category> => {
    try {
      // Kiểm tra xem có phải là danh mục mặc định không
      if (DEFAULT_CATEGORIES.some(c => c.id === id)) {
        throw new Error('Không thể cập nhật danh mục mặc định');
      }
      
      const updatedCategory = await ApiService.categories.update(id, updates);
      // Cập nhật cache
      const categoryIndex = categoriesCache.findIndex(category => category.id === id);
      if (categoryIndex !== -1) {
        categoriesCache[categoryIndex] = updatedCategory;
      }
      return updatedCategory;
    } catch (error) {
      console.error(`Lỗi khi cập nhật danh mục với id ${id}:`, error);
      throw error;
    }
  },
  
  deleteCategory: async (id: string): Promise<void> => {
    try {
      // Kiểm tra xem có phải là danh mục mặc định không
      if (DEFAULT_CATEGORIES.some(c => c.id === id)) {
        throw new Error('Không thể xóa danh mục mặc định');
      }
      
      await ApiService.categories.delete(id);
      // Cập nhật cache
      categoriesCache = categoriesCache.filter(category => category.id !== id);
    } catch (error) {
      console.error(`Lỗi khi xóa danh mục với id ${id}:`, error);
      throw error;
    }
  },
  
  // Phương thức để xóa cache khi cần thiết
  clearCache: () => {
    categoriesCache = [];
    lastFetchTime = 0;
  },
  
  // Phương thức để tải lại dữ liệu từ API
  refreshCategories: async (): Promise<Category[]> => {
    try {
      const categories = await ApiService.categories.getAll();
      categoriesCache = categories;
      lastFetchTime = Date.now();
      return categories;
    } catch (error) {
      console.error('Lỗi khi làm mới danh sách danh mục:', error);
      return categoriesCache.length > 0 ? categoriesCache : DEFAULT_CATEGORIES;
    }
  }
};