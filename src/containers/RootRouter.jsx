import React from 'react';
import { usePersona } from '../context/PersonaContext';
import EmployeeHome from './EmployeeHome/EmployeeHome';
import StoreManagerHome from './StoreManagerHome/StoreManagerHome';
import CentralHome from './CentralHome/CentralHome';
import BrandAssociateHome from './BrandAssociateHome/BrandAssociateHome';

/**
 * Branches the root view based on the active persona's role.
 * - SA / DM  → EmployeeHome (vertical-aware internally)
 * - BA       → BrandAssociateHome (read-only, ineligible notice)
 * - SM       → StoreManagerHome (store achievement + roster payouts)
 * - Central  → CentralHome (org drill-down, maker-checker log)
 */
export default function RootRouter() {
  const { active } = usePersona();
  const role = active.role;

  if (role === 'SM') return <StoreManagerHome />;
  if (role === 'BA') return <BrandAssociateHome />;
  if (role === 'CENTRAL_MAKER' || role === 'CENTRAL_CHECKER') return <CentralHome />;
  // SA / DM both see the employee home; internally it reacts to vertical
  return <EmployeeHome />;
}
