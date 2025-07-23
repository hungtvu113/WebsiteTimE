import { UserPreferences, Preference } from '../types';
import { ApiService } from './api-service';

// Giá trị mặc định cho tùy chọn người dùng
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'vi',
  startOfWeek: 'monday',
  showCompletedTasks: true,
  notifications: true,
  soundEnabled: true,
};

// Cache cho preferences
let preferencesCache: UserPreferences | null = null;

// Helper function to convert Preference to UserPreferences
const mapPreferenceToUserPreferences = (preference: Preference): UserPreferences => {
  return {
    theme: preference.theme,
    language: (preference.language === 'en' ? 'en' : 'vi') as 'vi' | 'en',
    startOfWeek: preference.startOfWeek === 1 ? 'monday' : 'sunday',
    showCompletedTasks: true, // Default value
    notifications: preference.notifications,
    soundEnabled: true, // Default value
  };
};

// Helper function to convert UserPreferences to Preference updates
const mapUserPreferencesToPreference = (userPrefs: Partial<UserPreferences>): Partial<Omit<Preference, 'id' | 'userId'>> => {
  const updates: any = {};

  if (userPrefs.theme) updates.theme = userPrefs.theme;
  if (userPrefs.language) updates.language = userPrefs.language;
  if (userPrefs.startOfWeek) updates.startOfWeek = userPrefs.startOfWeek === 'monday' ? 1 : 0;
  if (userPrefs.notifications !== undefined) updates.notifications = userPrefs.notifications;

  return updates;
};
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 phút

export const PreferenceService = {
  getPreferences: async (): Promise<UserPreferences> => {
    const now = Date.now();
    
    // Nếu có cache và chưa hết hạn, trả về cache
    if (preferencesCache && now - lastFetchTime < CACHE_DURATION) {
      return preferencesCache;
    }
    
    try {
      // Gọi API để lấy preferences
      const preference = await ApiService.preferences.get();
      const userPreferences = mapPreferenceToUserPreferences(preference);
      preferencesCache = userPreferences;
      lastFetchTime = now;
      return userPreferences;
    } catch (error) {
      console.error('Lỗi khi lấy tùy chọn người dùng:', error);
      
      // Nếu có lỗi và đã có cache, trả về cache
      if (preferencesCache) {
        return preferencesCache;
      }
      
      // Nếu không có cache, trả về giá trị mặc định
      return DEFAULT_PREFERENCES;
    }
  },
  
  // Phương thức đồng bộ để lấy preferences từ cache (cho các component không thể đợi async)
  getPreferencesSync: (): UserPreferences => {
    if (preferencesCache) {
      return preferencesCache;
    }
    
    // Nếu chưa có cache, trả về giá trị mặc định
    return DEFAULT_PREFERENCES;
  },
  
  updatePreferences: async (updates: Partial<UserPreferences>): Promise<UserPreferences> => {
    try {
      // Convert UserPreferences updates to Preference format
      const preferenceUpdates = mapUserPreferencesToPreference(updates);

      // Gọi API để cập nhật preferences
      const updatedPreference = await ApiService.preferences.update(preferenceUpdates);
      const updatedUserPreferences = mapPreferenceToUserPreferences(updatedPreference);

      // Cập nhật cache
      preferencesCache = updatedUserPreferences;
      lastFetchTime = Date.now();

      return updatedUserPreferences;
    } catch (error) {
      console.error('Lỗi khi cập nhật tùy chọn người dùng:', error);
      throw error;
    }
  },
  
  resetPreferences: async (): Promise<UserPreferences> => {
    try {
      // Convert default preferences to Preference format
      const defaultPreferenceUpdates = mapUserPreferencesToPreference(DEFAULT_PREFERENCES);

      // Gọi API để đặt lại preferences về mặc định
      const resetPreference = await ApiService.preferences.update(defaultPreferenceUpdates);
      const resetUserPreferences = mapPreferenceToUserPreferences(resetPreference);

      // Cập nhật cache
      preferencesCache = resetUserPreferences;
      lastFetchTime = Date.now();

      return resetUserPreferences;
    } catch (error) {
      console.error('Lỗi khi đặt lại tùy chọn người dùng:', error);

      // Nếu có lỗi, đặt cache về mặc định
      preferencesCache = DEFAULT_PREFERENCES;
      lastFetchTime = Date.now();

      return DEFAULT_PREFERENCES;
    }
  },
  
  // Xóa cache khi cần thiết
  clearCache: () => {
    preferencesCache = null;
    lastFetchTime = 0;
  },
  
  // Phương thức để tải lại dữ liệu từ API
  refreshPreferences: async (): Promise<UserPreferences> => {
    try {
      const preference = await ApiService.preferences.get();
      const userPreferences = mapPreferenceToUserPreferences(preference);
      preferencesCache = userPreferences;
      lastFetchTime = Date.now();
      return userPreferences;
    } catch (error) {
      console.error('Lỗi khi làm mới tùy chọn người dùng:', error);
      return preferencesCache || DEFAULT_PREFERENCES;
    }
  },
};