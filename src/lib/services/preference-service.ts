import { UserPreferences } from '../types';

// Mô phỏng localStorage cho môi trường máy chủ và client
const getLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }
  return null;
};

// Giá trị mặc định cho tùy chọn người dùng
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  startOfWeek: 'monday',
  showCompletedTasks: true,
};

export const PreferenceService = {
  getPreferences: (): UserPreferences => {
    const storage = getLocalStorage();
    if (!storage) return DEFAULT_PREFERENCES;
    
    const preferences = storage.getItem('preferences');
    if (!preferences) {
      // Khởi tạo tùy chọn mặc định nếu chưa có
      storage.setItem('preferences', JSON.stringify(DEFAULT_PREFERENCES));
      return DEFAULT_PREFERENCES;
    }
    
    return JSON.parse(preferences);
  },
  
  updatePreferences: (updates: Partial<UserPreferences>): UserPreferences => {
    const storage = getLocalStorage();
    if (!storage) throw new Error('Storage not available');
    
    const currentPreferences = PreferenceService.getPreferences();
    
    const updatedPreferences: UserPreferences = {
      ...currentPreferences,
      ...updates,
    };
    
    storage.setItem('preferences', JSON.stringify(updatedPreferences));
    
    return updatedPreferences;
  },
  
  resetPreferences: (): UserPreferences => {
    const storage = getLocalStorage();
    if (!storage) throw new Error('Storage not available');
    
    storage.setItem('preferences', JSON.stringify(DEFAULT_PREFERENCES));
    
    return DEFAULT_PREFERENCES;
  },

  clearAllData: (): void => {
    const storage = getLocalStorage();
    if (!storage) throw new Error('Storage not available');
    
    // Xóa tất cả dữ liệu
    storage.clear();
    
    // Khởi tạo lại preferences mặc định
    storage.setItem('preferences', JSON.stringify(DEFAULT_PREFERENCES));
  },
}; 