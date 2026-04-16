/**
 * Transforms the flat { level, rows[] } response from
 *   GET /api/incentives?storeCode=…&vertical=…
 * into the nested { departments[], employees[], summary{} } shape that
 * StoreManagerHome's summary builder expects.
 *
 * Fields the API doesn't provide (target, actual, piecesSold, daysPresent)
 * are omitted — the summary builder already has fallback logic for those via
 * rulesResult / storeTeam data.
 */
export function transformStoreIncentive(response, vertical) {
  // Already in the expected shape (mock mode) or null — pass through
  if (!response || response.departments || response.employees) return response;

  const rows = response.rows || [];
  if (rows.length === 0) return { departments: [], employees: [], summary: {} };

  // ---- employees ----
  const employees = rows.map((r) => ({
    employeeId: r.employeeId,
    employeeName: r.employeeName,
    role: r.role,
    baseIncentive: Number(r.baseIncentive) || 0,
    finalIncentive: Number(r.finalIncentive) || 0,
    achievementPct: Number(r.achievementPct) || 0,
    // Pass through optional fields when the backend includes them
    ...(r.daysPresent != null && { daysPresent: Number(r.daysPresent) }),
    ...(r.department && { department: r.department }),
    ...(r.piecesSold != null && { piecesSold: Number(r.piecesSold) }),
  }));

  const totalIncentive = employees.reduce((s, e) => s + e.finalIncentive, 0);

  // ---- departments ----
  // Group by department when the backend supplies per-row department fields,
  // otherwise create a single aggregate entry.
  const hasDepts = employees.some((e) => e.department);
  let departments;

  if (hasDepts) {
    const byDept = {};
    for (const e of employees) {
      const dept = e.department || 'Other';
      if (!byDept[dept]) {
        byDept[dept] = { department: dept, target: 0, actual: 0, achSum: 0, count: 0 };
      }
      byDept[dept].achSum += e.achievementPct;
      byDept[dept].count += 1;
    }
    departments = Object.values(byDept).map((d) => ({
      department: d.department,
      target: 0,
      actual: 0,
      achievementPct: d.count > 0 ? Math.round(d.achSum / d.count) : 0,
    }));
  } else {
    const avgAch = employees.length > 0
      ? Math.round(employees.reduce((s, e) => s + e.achievementPct, 0) / employees.length)
      : 0;
    const label = vertical === 'GROCERY' ? 'Campaign' : vertical === 'FNL' ? 'Weekly' : 'Store';
    departments = [{ department: label, target: 0, actual: 0, achievementPct: avgAch }];
  }

  // ---- summary ----
  const totalPiecesSold = employees.reduce((s, e) => s + (e.piecesSold || 0), 0) || undefined;
  const summary = { totalIncentive, ...(totalPiecesSold && { totalPiecesSold }) };

  // ---- FNL week payouts (pass-through from backend) ----
  const weekPayouts = response.weekPayouts || [];
  let monthAggregate = null;

  if (weekPayouts.length > 0) {
    monthAggregate = {
      isMonthView: true,
      weekStart: weekPayouts[0].weekStart,
      weekEnd: weekPayouts[weekPayouts.length - 1].weekEnd,
      weeklySalesTarget: weekPayouts.reduce((s, w) => s + (Number(w.weeklySalesTarget) || 0), 0),
      actualWeeklyGrossSales: weekPayouts.reduce((s, w) => s + (Number(w.actualWeeklyGrossSales) || 0), 0),
      storeQualifies: weekPayouts.some((w) => w.storeQualifies),
      weeksQualified: weekPayouts.filter((w) => w.storeQualifies).length,
      weeksTotal: weekPayouts.length,
      totalStoreIncentive: weekPayouts.reduce((s, w) => s + (Number(w.totalStoreIncentive) || 0), 0),
      myPayout: weekPayouts.reduce((s, w) => s + (Number(w.myPayout) || 0), 0),
    };
  }

  return { departments, employees, summary, weekPayouts, monthAggregate };
}
