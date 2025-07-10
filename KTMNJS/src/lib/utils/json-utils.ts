/**
 * Utility functions for safe JSON operations
 */

/**
 * Safely parse JSON string, returns null if parsing fails or input is invalid
 */
export const safeJsonParse = <T = any>(jsonString: string | null | undefined): T | null => {
  if (!jsonString || jsonString === 'undefined' || jsonString === 'null' || jsonString.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('Failed to parse JSON:', error, 'Input:', jsonString);
    return null;
  }
};

/**
 * Safely stringify object to JSON, returns empty string if fails
 */
export const safeJsonStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('Failed to stringify JSON:', error, 'Object:', obj);
    return '';
  }
};

/**
 * Safely get and parse item from localStorage
 */
export const safeLocalStorageGet = <T = any>(key: string): T | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const item = localStorage.getItem(key);
    return safeJsonParse<T>(item);
  } catch (error) {
    console.warn('Failed to get from localStorage:', error, 'Key:', key);
    return null;
  }
};

/**
 * Safely set item to localStorage
 */
export const safeLocalStorageSet = (key: string, value: any): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const jsonString = safeJsonStringify(value);
    if (jsonString) {
      localStorage.setItem(key, jsonString);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Failed to set to localStorage:', error, 'Key:', key, 'Value:', value);
    return false;
  }
};

/**
 * Safely remove item from localStorage
 */
export const safeLocalStorageRemove = (key: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error, 'Key:', key);
    return false;
  }
};

/**
 * Clear invalid localStorage items that contain 'undefined' or 'null' strings
 */
export const cleanupLocalStorage = (): number => {
  if (typeof window === 'undefined') {
    return 0;
  }

  let cleanedCount = 0;
  const keysToRemove: string[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value === 'undefined' || value === 'null' || value === '') {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      cleanedCount++;
    });

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} invalid localStorage items`);
    }
  } catch (error) {
    console.warn('Failed to cleanup localStorage:', error);
  }

  return cleanedCount;
};
