import api from './client';

export async function fetchEmployees(storeCode) {
  const { employees } = await api.get('/employees', { params: { storeCode } });
  return employees;
}

export async function fetchEmployee(employeeId) {
  const { employee } = await api.get(`/employees/${employeeId}`);
  return employee;
}
