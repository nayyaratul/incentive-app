import api from './client';

export async function fetchIncentives(params = {}) {
  return api.get('/incentives', { params });
}

export async function fetchEmployeeIncentive(employeeId, vertical, periodStart, periodEnd) {
  return api.get('/incentives', {
    params: { employeeId, vertical, periodStart, periodEnd },
  });
}

export async function fetchStoreIncentive(storeCode, vertical, periodStart, periodEnd) {
  return api.get('/incentives', {
    params: { storeCode, vertical, periodStart, periodEnd },
  });
}

export async function fetchCityIncentives(vertical) {
  return api.get('/incentives', { params: { vertical } });
}

export async function fetchAllStoreIncentives(vertical) {
  return api.get('/incentives/stores', { params: { vertical } });
}
