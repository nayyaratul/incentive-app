export const demoLoginUsers = [
  {
    employerId: 'FNL-3110',
    password: 'Trends@123',
    token: 'demo-fnl-3110-token',
    user: {
      employeeId: 'FNL-3110',
      employeeName: 'Aarav Kapoor',
      role: 'SA',
      vertical: 'FNL',
      storeCode: 'TRN0241',
      storeName: 'Trends, Koregaon Park',
      payrollStatus: 'ACTIVE',
    },
  },
];

export function findDemoLoginUser(employerId, password) {
  return demoLoginUsers.find((entry) => entry.employerId === employerId && entry.password === password) || null;
}
