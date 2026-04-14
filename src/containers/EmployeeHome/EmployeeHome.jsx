import React, { useState } from 'react';
import styles from './EmployeeHome.module.scss';
import { usePersona } from '../../context/PersonaContext';
import { VERTICALS } from '../../data/masters';
import { electronicsPayoutsRD3675, groceryPayoutT28V, fnlPayoutTRN0241 } from '../../data/payouts';
import HeaderBar from '../../components/Organism/HeaderBar/HeaderBar';
import BottomNav from '../../components/Organism/BottomNav/BottomNav';
import LeaderboardDrawer from '../../components/Organism/LeaderboardDrawer/LeaderboardDrawer';
import ElectronicsView from './views/ElectronicsView';
import GroceryView from './views/GroceryView';
import FnlView from './views/FnlView';
import HistoryScreen from '../screens/HistoryScreen';

export default function EmployeeHome() {
  const [tab, setTab] = useState('home');
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const { active, employee, store } = usePersona();

  const firstName = employee.employeeName.split(' ')[0];

  let myPayout = null;
  if (active.vertical === VERTICALS.ELECTRONICS) {
    myPayout = electronicsPayoutsRD3675.find((p) => p.employeeId === employee.employeeId);
  } else if (active.vertical === VERTICALS.GROCERY) {
    myPayout = groceryPayoutT28V;
  } else if (active.vertical === VERTICALS.FNL) {
    myPayout = fnlPayoutTRN0241;
  }

  const myRank = myPayout?.myRank;

  return (
    <div className={styles.shell}>
      <BottomNav active={tab} role={active.role} onNavigate={setTab} />

      <LeaderboardDrawer
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        myRank={myRank}
      />

      <div className={styles.layout}>
        <HeaderBar
          employeeName={tab === 'home' ? firstName : null}
          rank={tab === 'home' ? myRank?.rank : undefined}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
        />

        <main className={styles.main}>
          {tab === 'home' && (
            <>
              {active.vertical === VERTICALS.ELECTRONICS && (
                <ElectronicsView payout={myPayout} employee={employee} store={store} role={active.role} />
              )}
              {active.vertical === VERTICALS.GROCERY && (
                <GroceryView payout={myPayout} employee={employee} store={store} role={active.role} />
              )}
              {active.vertical === VERTICALS.FNL && (
                <FnlView payout={myPayout} employee={employee} store={store} role={active.role} />
              )}
            </>
          )}

          {tab === 'history' && <HistoryScreen employeeId={employee.employeeId} vertical={active.vertical} />}
        </main>
      </div>
    </div>
  );
}
