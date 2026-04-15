import api from './client';

export async function fetchStores(params = {}) {
  const { stores } = await api.get('/stores', { params });
  return stores;
}

export async function fetchStore(storeCode) {
  const { store } = await api.get(`/stores/${storeCode}`);
  return store;
}
