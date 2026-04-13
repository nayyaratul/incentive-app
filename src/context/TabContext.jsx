import React, { createContext, useContext, useState } from 'react';

const TabContext = createContext(null);

export function TabProvider({ children, initial = 'home' }) {
  const [tab, setTab] = useState(initial);
  return <TabContext.Provider value={{ tab, setTab }}>{children}</TabContext.Provider>;
}

export function useTab() {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error('useTab must be used within <TabProvider>');
  return ctx;
}
