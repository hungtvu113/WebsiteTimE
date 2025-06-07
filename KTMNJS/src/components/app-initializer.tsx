'use client';

import { useEffect } from 'react';
import { cleanupLocalStorage } from '@/lib/utils/json-utils';

/**
 * Component để khởi tạo app và dọn dẹp dữ liệu không hợp lệ
 */
export function AppInitializer() {
  useEffect(() => {
    // Cleanup localStorage khi app khởi động
    const cleanedCount = cleanupLocalStorage();

    if (cleanedCount > 0) {
      console.log(`AppInitializer: Đã dọn dẹp ${cleanedCount} mục localStorage không hợp lệ`);
    }

    // Global error handler cho unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message) {
        const message = event.reason.message;
        if (message.includes('not valid JSON') || message.includes('"undefined" is not valid JSON')) {
          console.warn('Caught JSON parsing error in promise:', event.reason);
          event.preventDefault(); // Prevent the error from being logged to console
          return;
        }
      }
    };

    // Global error handler cho window errors
    const handleError = (event: ErrorEvent) => {
      if (event.message) {
        if (event.message.includes('not valid JSON') || event.message.includes('"undefined" is not valid JSON')) {
          console.warn('Caught JSON parsing error:', event.message);
          event.preventDefault();
          return;
        }
      }
    };

    // Intercept console.error để filter các lỗi JSON parsing và empty src
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');

      // Suppress JSON parsing errors
      if (message.includes('"undefined" is not valid JSON') || message.includes('not valid JSON')) {
        console.warn('Suppressed JSON parsing error:', ...args);
        return;
      }

      // Suppress empty src attribute warnings
      if (message.includes('An empty string ("") was passed to the src attribute')) {
        console.debug('Suppressed empty src warning:', ...args);
        return;
      }

      // Call original console.error for other errors
      originalConsoleError.apply(console, args);
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup function
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      // Restore original console.error
      console.error = originalConsoleError;
    };
  }, []);

  // Component này không render gì
  return null;
}
