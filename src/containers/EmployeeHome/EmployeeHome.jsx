import React, { useState } from 'react';
import styles from './EmployeeHome.module.scss';
import { usePersona } from '../../context/PersonaContext';
import { VERTICALS } from '../../data/masters';
import useElectronicsData from '../../hooks/useElectronicsData';
import useGroceryData from '../../hooks/useGroceryData';
import useFnlData from '../../hooks/useFnlData';
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

  const firstName = employee?.employeeName?.split(' ')[0] ?? '';

  const isElec = active?.vertical === VERTICALS.ELECTRONICS;
  const isGroc = active?.vertical === VERTICALS.GROCERY;
  const isFnl = active?.vertical === VERTICALS.FNL;

  const elec = useElectronicsData(isElec ? employee?.employeeId : null, isElec ? store?.storeCode : null);
  const groc = useGroceryData(isGroc ? employee?.employeeId : null);
  const fnl = useFnlData(isFnl ? employee?.employeeId : null);

  const activeDataLoading = isElec ? elec.loading : isGroc ? groc.loading : isFnl ? fnl.loading : true;
  const activeDataReady = isElec ? !!elec.payout : isGroc ? !!groc.payout : isFnl ? !!fnl.payout : false;
  const myPayout = isElec ? elec.payout : isGroc ? groc.payout : isFnl ? fnl.payout : null;

  const myRank = myPayout?.myRank;

  if (!active || !employee || activeDataLoading || !activeDataReady) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.shell}>
      <BottomNav active={tab} role={active.role} onNavigate={setTab} />

      <LeaderboardDrawer
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        myRank={myRank}
      />

      <div className={styles.layout}>
        {tab === 'home' && (
          <HeaderBar
            employeeName={firstName}
            rank={myRank?.rank}
            onOpenLeaderboard={() => setLeaderboardOpen(true)}
          />
        )}

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
