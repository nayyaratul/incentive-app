import { useState, useEffect } from 'react';
import { fetchEmployeeIncentive } from '../api/incentives';
import { fetchSales } from '../api/sales';
import { fetchRules } from '../api/rules';
import { transformGroceryPayout } from '../api/transformers/grocery';

export default function useGroceryData(employeeId) {
  const [payout, setPayout] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetchEmployeeIncentive(employeeId, 'GROCERY'),
      fetchSales({ employeeId, vertical: 'GROCERY' }),
      fetchRules('GROCERY'),
    ])
      .then(([empDetail, salesRows, plans]) => {
        if (cancelled) return;
        const activePlan = plans.find((p) => p.status === 'ACTIVE');
        const campaignConfig = activePlan?.campaignConfigs?.[0] || null;
        setCampaign(campaignConfig);
        setPayout(transformGroceryPayout(empDetail, campaignConfig, salesRows));
      })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [employeeId]);

  return { payout, campaign, loading, error };
}
