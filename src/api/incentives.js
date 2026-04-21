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

/**
 * Store-level leaderboard. Backend returns stores ranked by achievement%.
 * Callers pass `{ vertical, city, month?, monthsBack? }` — when omitted the
 * backend falls back to the authenticated viewer's store vertical/city.
 */
export async function fetchStoreLeaderboard(params = {}) {
  return api.get('/leaderboard', { params });
}

/**
 * Attendance connection status for F&L. Returns:
 *   { isConnected, currentMonthCovered, lastUploadWithinDays, latestUpload }
 * The app shows a banner when !isConnected so F&L users know why the weekly
 * pool is blocked.
 */
export async function fetchAttendanceStatus() {
  return api.get('/attendance/status');
}
