import api from './client';

export async function fetchRules(vertical) {
  const { plans } = await api.get('/rules', { params: { vertical } });
  return plans;
}
