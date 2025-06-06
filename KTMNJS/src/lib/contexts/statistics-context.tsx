'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface StatisticsContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

export function StatisticsProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    console.log('StatisticsContext: Triggering statistics refresh');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <StatisticsContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </StatisticsContext.Provider>
  );
}

export function useStatistics() {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    console.error('useStatistics must be used within a StatisticsProvider');
    // Return default values instead of throwing error
    return {
      refreshTrigger: 0,
      triggerRefresh: () => console.warn('StatisticsProvider not found')
    };
  }
  return context;
}

// Hook để trigger refresh từ bất kỳ đâu
export function useStatisticsRefresh() {
  const { triggerRefresh } = useStatistics();
  return triggerRefresh;
}
