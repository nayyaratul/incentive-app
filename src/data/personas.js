// ============================================================================
// PERSONAS — the switchable profiles used by the POC.
// Each persona points to an employee (or ops user) and the context they bring
// to the app (vertical, store, role). Active persona drives every render.
// ============================================================================

import { VERTICALS, ROLES } from './masters';

export const personas = [
  {
    id: 'p-rohit-sa-electronics',
    employeeId: 'EMP-0041',
    employeeName: 'Rohit Sharma',
    role: ROLES.SA,
    vertical: VERTICALS.ELECTRONICS,
    storeCode: 'RD3675',
    badge: 'SA · Electronics',
    tagline: 'Store Associate · Reliance Digital, Andheri',
    color: 'crimson',
  },
  {
    id: 'p-manoj-ba-electronics',
    employeeId: 'EMP-0047',
    employeeName: 'Manoj Iyer',
    role: ROLES.BA,
    vertical: VERTICALS.ELECTRONICS,
    storeCode: 'RD3675',
    badge: 'BA · Samsung',
    tagline: 'Brand Associate · Reliance Digital, Andheri',
    color: 'navy',
    brandRep: 'Samsung',
  },
  {
    id: 'p-sunil-sm-electronics',
    employeeId: 'EMP-0046',
    employeeName: 'Sunil Kumar',
    role: ROLES.SM,
    vertical: VERTICALS.ELECTRONICS,
    storeCode: 'RD3675',
    badge: 'SM · Electronics',
    tagline: 'Store Manager · Reliance Digital, Andheri',
    color: 'navy',
  },
  {
    id: 'p-meena-sa-grocery',
    employeeId: 'GRC-2203',
    employeeName: 'Meena Nair',
    role: ROLES.SA,
    vertical: VERTICALS.GROCERY,
    storeCode: 'T28V',
    badge: 'SA · Grocery',
    tagline: 'Store Associate · SMT-Kalpetta (Cake Rush campaign)',
    color: 'saffron',
  },
  {
    id: 'p-nisha-sm-grocery',
    employeeId: 'GRC-2201',
    employeeName: 'Nisha Thomas',
    role: ROLES.SM,
    vertical: VERTICALS.GROCERY,
    storeCode: 'T28V',
    badge: 'SM · Grocery',
    tagline: 'Store Manager · SMT-Kalpetta',
    color: 'navy',
  },
  {
    id: 'p-sara-sa-fnl',
    employeeId: 'FNL-3103',
    employeeName: 'Sara Khan',
    role: ROLES.SA,
    vertical: VERTICALS.FNL,
    storeCode: 'TRN0241',
    badge: 'SA · Trends',
    tagline: 'Store Associate · Trends Koregaon Park',
    color: 'crimson',
  },
  {
    id: 'p-neha-dm-fnl',
    employeeId: 'FNL-3102',
    employeeName: 'Neha Agarwal',
    role: ROLES.DM,
    vertical: VERTICALS.FNL,
    storeCode: 'TRN0241',
    badge: 'DM · Trends',
    tagline: 'Deputy Store Manager · Trends Koregaon Park',
    color: 'saffron',
  },
  {
    id: 'p-arjun-sm-fnl',
    employeeId: 'FNL-3101',
    employeeName: 'Arjun Menon',
    role: ROLES.SM,
    vertical: VERTICALS.FNL,
    storeCode: 'TRN0241',
    badge: 'SM · Trends',
    tagline: 'Store Manager · Trends Koregaon Park',
    color: 'navy',
  },
  {
    id: 'p-rashmi-central-reporting',
    employeeId: 'OPS-0001',
    employeeName: 'Rashmi Iyer',
    role: 'CENTRAL',
    vertical: null,
    storeCode: null,
    badge: 'Central Reporting',
    tagline: 'Read-only org-level dashboards, vertical & store drill-down',
    color: 'navy',
  },
];

// Note: Maker & Checker personas live in the Reliance admin portal, not in this
// employee-facing app. They were removed per user request.

export const DEFAULT_PERSONA_ID = 'p-rohit-sa-electronics';
