import { useState, useEffect } from 'react';
import { fetchEmployeeIncentive } from '../api/incentives';
import { fetchRules } from '../api/rules';
import { transformFnlPayout } from '../api/transformers/fnl';
import { fnlPayoutTRN0241 } from '../data/payouts';
import { fnlWeeklyRules as staticWeeklyRules } from '../data/configs';

const useMock = process.env.REACT_APP_USE_MOCK_DATA === 'true';

export default function useFnlData(employeeId) {
  const [payout, setPayout] = useState(null);
  const [weeklyRules, setWeeklyRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    if (useMock) {
      setPayout(fnlPayoutTRN0241);
      setWeeklyRules({
        splitMatrix: staticWeeklyRules.splitMatrix,
        minWorkingDays: staticWeeklyRules.minWorkingDays,
      });
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetchEmployeeIncentive(employeeId, 'FNL'),
      fetchRules('FNL'),
    ])
      .then(([empDetail, plans]) => {
        if (cancelled) return;
        const activePlan = plans.find((p) => p.status === 'ACTIVE');
        const splits = activePlan?.fnlRoleSplits || [];
        setWeeklyRules({
          splitMatrix: splits.map((s) => ({
            sms: s.numSms,
            dms: s.numDms,
            saPoolPct: Number(s.saPoolPct),
            smSharePct: Number(s.smSharePct),
            dmSharePctEach: Number(s.dmSharePerDmPct),
          })),
          minWorkingDays: activePlan?.config?.minWorkingDays ?? 5,
        });
        setPayout(transformFnlPayout(empDetail, splits, []));
      })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [employeeId]);

  return { payout, weeklyRules, loading, error };
}
