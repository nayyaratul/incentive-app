import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';

import { fetchEmployees } from '../api/employees';
import { fetchStores } from '../api/stores';
import { useAuth } from './AuthContext';

// Static imports for mock-data fallback
import { personas as staticPersonas, DEFAULT_PERSONA_ID } from '../data/personas';
import { employees as staticEmployees, stores as staticStores } from '../data/masters';

const useMock = process.env.REACT_APP_USE_MOCK_DATA === 'true';
const enableSwitcher = process.env.REACT_APP_ENABLE_PERSONA_SWITCHER === 'true';

// ---------------------------------------------------------------------------
// Helper: derive a color token from the employee role
// ---------------------------------------------------------------------------
function roleColor(role) {
  switch (role) {
    case 'SA':
      return 'crimson';
    case 'SM':
    case 'DM':
    case 'CENTRAL':
    case 'CENTRAL_MAKER':
    case 'CENTRAL_CHECKER':
      return 'navy';
    case 'BA':
      return 'saffron';
    default:
      return 'navy';
  }
}

// ---------------------------------------------------------------------------
// Helper: build a personas array from raw employee + store records
// ---------------------------------------------------------------------------
function buildPersonas(employees, stores) {
  const storeMap = new Map(stores.map((s) => [s.storeCode, s]));

  return employees.map((emp) => {
    const store = emp.storeCode ? storeMap.get(emp.storeCode) : null;
    const vertical = emp.vertical || (store ? store.vertical : null);
    const displayRole = emp.role.startsWith('CENTRAL') ? 'CENTRAL' : emp.role;

    return {
      id: `p-${emp.employeeId}`,
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      role: emp.role,
      vertical,
      storeCode: emp.storeCode || null,
      badge: vertical ? `${displayRole} \u00b7 ${vertical}` : displayRole,
      tagline: store ? `${displayRole} \u00b7 ${store.storeName}` : displayRole,
      color: roleColor(emp.role),
    };
  });
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const PersonaContext = createContext(null);

export function PersonaProvider({ children }) {
  // --- data state ---
  const [personas, setPersonas] = useState(useMock ? staticPersonas : []);
  const [employeeList, setEmployeeList] = useState(useMock ? staticEmployees : []);
  const [storeList, setStoreList] = useState(useMock ? staticStores : []);

  // --- loading / error ---
  const [loading, setLoading] = useState(!useMock);
  const [error, setError] = useState(null);

  // --- active persona ---
  const [activeId, setActiveId] = useState(useMock ? DEFAULT_PERSONA_ID : null);
  const [isSwitcherOpen, setSwitcherOpen] = useState(false);

  // Always call useAuth (rules of hooks); in mock mode auth.user is null anyway
  const auth = useAuth();

  // Fetch employees + stores from the API on mount (skip when using mock data)
  useEffect(() => {
    if (useMock || !enableSwitcher) return;

    let cancelled = false;

    (async () => {
      try {
        const [emps, strs] = await Promise.all([fetchEmployees(), fetchStores()]);

        if (cancelled) return;

        const built = buildPersonas(emps, strs);

        setEmployeeList(emps);
        setStoreList(strs);
        setPersonas(built);
        setActiveId(built.length > 0 ? built[0].id : null);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Auth-only mode: single persona from authenticated user
  useEffect(() => {
    if (useMock || enableSwitcher || !auth.user) return;

    const u = auth.user;
    const persona = {
      id: `p-${u.employeeId}`,
      employeeId: u.employeeId,
      employeeName: u.employeeName,
      role: u.role,
      vertical: u.vertical || null,
      storeCode: u.storeCode || null,
      badge: u.vertical ? `${u.role} \u00b7 ${u.vertical}` : u.role,
      tagline: u.storeName ? `${u.role} \u00b7 ${u.storeName}` : u.role,
      color: u.role === 'SA' ? 'crimson' : u.role === 'BA' ? 'saffron' : 'navy',
    };

    setPersonas([persona]);
    setEmployeeList([{
      employeeId: u.employeeId,
      employeeName: u.employeeName,
      role: u.role,
      storeCode: u.storeCode,
      storeName: u.storeName,
      vertical: u.vertical,
      payrollStatus: u.payrollStatus || 'ACTIVE',
    }]);
    setStoreList(u.storeCode ? [{
      storeCode: u.storeCode,
      storeName: u.storeName || '',
      vertical: u.vertical || '',
    }] : []);
    setActiveId(persona.id);
    setLoading(false);
  }, [auth.user]);

  // --- derived lookups ---
  const active = useMemo(
    () => personas.find((p) => p.id === activeId) || null,
    [activeId, personas],
  );

  const employee = useMemo(
    () => (active ? employeeList.find((e) => e.employeeId === active.employeeId) || null : null),
    [active, employeeList],
  );

  const store = useMemo(
    () =>
      active && active.storeCode
        ? storeList.find((s) => s.storeCode === active.storeCode) || null
        : null,
    [active, storeList],
  );

  // --- actions ---
  const switchTo = useCallback((id) => {
    setActiveId(id);
    setSwitcherOpen(false);
  }, []);

  // --- context value ---
  const value = useMemo(
    () => ({
      personas,
      active,
      employee,
      store,
      loading,
      error,
      isSwitcherOpen,
      openSwitcher: () => setSwitcherOpen(true),
      closeSwitcher: () => setSwitcherOpen(false),
      switchTo,
    }),
    [personas, active, employee, store, loading, error, isSwitcherOpen, switchTo],
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersona must be used within <PersonaProvider>');
  return ctx;
}
