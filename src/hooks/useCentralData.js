import { useState, useEffect } from 'react';
import { fetchDashboard } from '../api/dashboard';
import { fetchIncentives } from '../api/incentives';
import { fetchRules } from '../api/rules';
import { transformCentralReporting } from '../api/transformers/central';

export default function useCentralData() {
  const [reporting, setReporting] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetchDashboard(),
      fetchIncentives({}),          // city-level (no filters)
      fetchIncentives({ vertical: undefined }), // store-level
      fetchRules(),
    ])
      .then(([dashboard, cityData, storeData, allPlans]) => {
        if (cancelled) return;
        const cityRows = cityData?.level === 'city' ? cityData.rows : [];
        const storeRows = storeData?.level === 'store' ? storeData.rows : [];
        setReporting(transformCentralReporting(dashboard, cityRows, storeRows, allPlans));
        setRules(allPlans);
      })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { reporting, rules, loading, error };
}
