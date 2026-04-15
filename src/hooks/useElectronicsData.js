import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { fetchEmployeeIncentive, fetchStoreIncentive } from '../api/incentives';
import { fetchSales } from '../api/sales';
import { fetchRules } from '../api/rules';
import { transformElectronicsPayout, transformMultiplierTiers } from '../api/transformers/electronics';

export default function useElectronicsData(employeeId, storeCode) {
  const [payout, setPayout] = useState(null);
  const [multiplierTiers, setMultiplierTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId || !storeCode) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    const periodStart = dayjs().startOf('month').format('YYYY-MM-DD');
    const periodEnd = dayjs().endOf('month').format('YYYY-MM-DD');

    Promise.all([
      fetchEmployeeIncentive(employeeId, 'ELECTRONICS', periodStart, periodEnd),
      fetchStoreIncentive(storeCode, 'ELECTRONICS', periodStart, periodEnd),
      fetchSales({ employeeId, vertical: 'ELECTRONICS' }),
      fetchRules('ELECTRONICS'),
    ])
      .then(([empDetail, storeDetail, salesRows, plans]) => {
        if (cancelled) return;
        const storeEmployees = storeDetail?.employees || [];
        const transformed = transformElectronicsPayout(empDetail, storeEmployees, salesRows, null);
        setPayout(transformed);

        const activePlan = plans.find((p) => p.status === 'ACTIVE');
        if (activePlan) {
          setMultiplierTiers(transformMultiplierTiers(activePlan.achievementMultipliers));
        }
      })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [employeeId, storeCode]);

  return { payout, multiplierTiers, loading, error };
}
