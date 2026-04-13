import React from 'react';
import styles from './EmployeeHome.module.scss';
import { usePersona } from '../../context/PersonaContext';
import { VERTICALS } from '../../data/masters';
import { electronicsPayoutsRD3675, groceryPayoutT28V, fnlPayoutTRN0241 } from '../../data/payouts';
import HeaderBar from '../../components/Organism/HeaderBar/HeaderBar';
import BottomNav from '../../components/Organism/BottomNav/BottomNav';
import ElectronicsView from './views/ElectronicsView';
import GroceryView from './views/GroceryView';
import FnlView from './views/FnlView';

const TODAY = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  day: '2-digit',
  month: 'short',
});

export default function EmployeeHome() {
  const { active, employee, store } = usePersona();

  const firstName = employee.employeeName.split(' ')[0];

  // Pick the persona-specific payout pack
  let myPayout = null;
  if (active.vertical === VERTICALS.ELECTRONICS) {
    myPayout = electronicsPayoutsRD3675.find((p) => p.employeeId === employee.employeeId);
  } else if (active.vertical === VERTICALS.GROCERY) {
    myPayout = groceryPayoutT28V; // equal-distribution view
  } else if (active.vertical === VERTICALS.FNL) {
    myPayout = fnlPayoutTRN0241;
  }

  return (
    <div className={styles.shell}>
      <BottomNav active="home" employeeInitial={firstName[0]} />

      <div className={styles.layout}>
        <HeaderBar employeeName={firstName} streak={myPayout?.streak ?? 0} />

        <main className={styles.main}>
          <div className={`${styles.datemark} rise rise-1`}>
            <span>{active.vertical} · {store?.storeName || '—'}</span>
            <span className={styles.line} />
            <span>{TODAY}</span>
          </div>

          {active.vertical === VERTICALS.ELECTRONICS && (
            <ElectronicsView payout={myPayout} employee={employee} store={store} role={active.role} />
          )}
          {active.vertical === VERTICALS.GROCERY && (
            <GroceryView payout={myPayout} employee={employee} store={store} role={active.role} />
          )}
          {active.vertical === VERTICALS.FNL && (
            <FnlView payout={myPayout} employee={employee} store={store} role={active.role} />
          )}
        </main>
      </div>
    </div>
  );
}
