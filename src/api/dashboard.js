import api from './client';

export async function fetchDashboard(vertical) {
  return api.get('/dashboard', { params: { vertical } });
}
