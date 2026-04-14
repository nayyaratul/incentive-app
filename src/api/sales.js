import api from './client';

export async function fetchSales(params = {}) {
  const { rows } = await api.get('/sales', { params });
  return rows;
}

export async function fetchSalesFilters() {
  return api.get('/sales/filters');
}
