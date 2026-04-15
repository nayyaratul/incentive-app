import { useState, useEffect } from 'react';
import { fetchEmployeeIncentive, fetchStoreIncentive } from '../api/incentives';
import { fetchSales } from '../api/sales';
import { fetchRules } from '../api/rules';
import { transformElectronicsPayout, transformMultiplierTiers } from '../api/transformers/electronics';
import { electronicsPayoutsRD3675 } from '../data/payouts';
import { electronicsMultiplierTiers as staticMultiplierTiers } from '../data/configs';

const useMock = process.env.REACT_APP_USE_MOCK_DATA === 'true';

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

    if (useMock) {
      const mockPayout = electronicsPayoutsRD3675.find((row) => row.employeeId === employeeId) || null;
      setPayout(mockPayout);
      setMultiplierTiers(staticMultiplierTiers);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetchEmployeeIncentive(employeeId, 'ELECTRONICS'),
      fetchStoreIncentive(storeCode, 'ELECTRONICS'),
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
