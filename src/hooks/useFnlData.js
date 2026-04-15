import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { fetchEmployeeIncentive } from '../api/incentives';
import { fetchRules } from '../api/rules';
import { transformFnlPayout } from '../api/transformers/fnl';

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
    let cancelled = false;
    setLoading(true);

    const periodStart = dayjs().startOf('month').format('YYYY-MM-DD');
    const periodEnd = dayjs().endOf('month').format('YYYY-MM-DD');

    Promise.all([
      fetchEmployeeIncentive(employeeId, 'FNL', periodStart, periodEnd),
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
