import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { personas, DEFAULT_PERSONA_ID } from '../data/personas';
import { employees, stores } from '../data/masters';

const PersonaContext = createContext(null);

export function PersonaProvider({ children }) {
  const [activeId, setActiveId] = useState(DEFAULT_PERSONA_ID);
  const [isSwitcherOpen, setSwitcherOpen] = useState(false);

  const active = useMemo(() => personas.find((p) => p.id === activeId), [activeId]);

  const employee = useMemo(
    () => employees.find((e) => e.employeeId === active.employeeId) || null,
    [active]
  );

  const store = useMemo(
    () => (active.storeCode ? stores.find((s) => s.storeCode === active.storeCode) : null),
    [active]
  );

  const switchTo = useCallback((id) => {
    setActiveId(id);
    setSwitcherOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      personas,
      active,
      employee,
      store,
      isSwitcherOpen,
      openSwitcher: () => setSwitcherOpen(true),
      closeSwitcher: () => setSwitcherOpen(false),
      switchTo,
    }),
    [active, employee, store, isSwitcherOpen, switchTo]
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersona must be used within <PersonaProvider>');
  return ctx;
}
