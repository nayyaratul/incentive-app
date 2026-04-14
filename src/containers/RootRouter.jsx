import React from 'react';
import { usePersona } from '../context/PersonaContext';
import EmployeeHome from './EmployeeHome/EmployeeHome';
import StoreManagerHome from './StoreManagerHome/StoreManagerHome';
import CentralHome from './CentralHome/CentralHome';
import BrandAssociateHome from './BrandAssociateHome/BrandAssociateHome';

/**
 * Branches the root view based on the active persona's role.
 * - SA       → EmployeeHome (vertical-aware internally)
 * - SM / DM  → StoreManagerHome (store achievement + roster payouts)
 * - BA       → BrandAssociateHome (read-only, ineligible notice)
 * - Central  → CentralHome (org drill-down, maker-checker log)
 */
export default function RootRouter() {
  const { active } = usePersona();
  if (!active) return null;
  const role = active.role;

  if (role === 'SM' || role === 'DM') return <StoreManagerHome />;
  if (role === 'BA') return <BrandAssociateHome />;
  if (role === 'CENTRAL') return <CentralHome />;
  // SA sees the employee home; internally it reacts to vertical
  return <EmployeeHome />;
}
