import api from './client';

export async function login(employerId, password) {
  return api.post('/auth/login', { employerId, password });
}

export async function fetchMe() {
  return api.get('/auth/me');
}
