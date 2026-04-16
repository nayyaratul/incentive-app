import React, { useState, useEffect, useRef, useCallback } from 'react';
import PullToRefresh from 'pulltorefreshjs';
import { RefreshCw } from 'lucide-react';
import styles from './EmployeeHome.module.scss';
import { usePersona } from '../../context/PersonaContext';
import { VERTICALS } from '../../data/masters';
import useElectronicsData from '../../hooks/useElectronicsData';
import useGroceryData from '../../hooks/useGroceryData';
import useFnlData from '../../hooks/useFnlData';
import HeaderBar, { HeaderGreeting } from '../../components/Organism/HeaderBar/HeaderBar';
import BottomNav from '../../components/Organism/BottomNav/BottomNav';
import LeaderboardDrawer from '../../components/Organism/LeaderboardDrawer/LeaderboardDrawer';
import LeaderboardPodium from '../../components/Molecule/LeaderboardPodium/LeaderboardPodium';
import LeaderboardFocusList from '../../components/Molecule/LeaderboardFocusList/LeaderboardFocusList';
import TabPageHeader from '../../components/Molecule/TabPageHeader/TabPageHeader';
import ElectronicsView from './views/ElectronicsView';
import GroceryView from './views/GroceryView';
import FnlView from './views/FnlView';
import { buildStoreLeaderboard } from '../../data/storeLeaderboard';
import HistoryScreen from '../screens/HistoryScreen';

const useMock = process.env.REACT_APP_USE_MOCK_DATA === 'true';

export default function EmployeeHome() {
  const [tab, setTab] = useState('home');
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const mainRef = useRef(null);
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

  // Employee rank within store — used by drawer and header pill
  const storeRank = myPayout?.myRank
    || (active?.vertical && store?.storeCode
        ? buildStoreLeaderboard(active.vertical, store.storeCode)
        : null);

  // Store-level leaderboard (stores vs stores) — used by the board tab
  const storeLeaderboard = active?.vertical
    ? buildStoreLeaderboard(active.vertical, store?.storeCode)
    : null;

  /* Pull-to-refresh — triggers a re-render that reloads data hooks */
  const handleRefresh = useCallback(() => {
    return new Promise((resolve) => {
      setRefreshKey((k) => k + 1);
      setTimeout(resolve, 800); // short delay for visual feedback
    });
  }, []);

  useEffect(() => {
    const ptr = PullToRefresh.init({
      mainElement: 'main',
      triggerElement: 'main',
      onRefresh: handleRefresh,
      instructionsPullToRefresh: 'Pull down to refresh',
      instructionsReleaseToRefresh: 'Release to refresh',
      instructionsRefreshing: 'Refreshing...',
      distThreshold: 60,
      distMax: 80,
      distReload: 50,
      resistanceFunction: (t) => Math.min(1, t / 2.5),
    });
    return () => PullToRefresh.destroyAll();
  }, [handleRefresh]);

  if (!active || !employee || activeDataLoading || !activeDataReady) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.shell}>
      <BottomNav active={tab} role={active.role} onNavigate={setTab} />

      <LeaderboardDrawer
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        myRank={storeRank}
      />

      <div className={styles.layout}>
        <HeaderBar />

        <main className={styles.main} ref={mainRef}>
          {tab === 'home' && (
            <>
              <HeaderGreeting
                employeeName={firstName}
                storeName={store ? `${store.storeFormat || store.storeName} — ${store.city}, ${store.state}` : undefined}
                department={isElec ? (myPayout?.employeeDepartment || employee?.department) : undefined}
                rank={storeRank?.rank}
                onOpenLeaderboard={() => setLeaderboardOpen(true)}
              />
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

          {tab === 'board' && storeLeaderboard && (
            <section className={styles.pad}>
              <div className="rise rise-1">
                <TabPageHeader
                  title="Leaderboard"
                  subtitle={`${store?.storeName || 'Store'} · ${storeLeaderboard.scopeNote || 'store rankings'}`}
                />
              </div>
              <div className="rise rise-2">
                <LeaderboardPodium
                  entries={storeLeaderboard.top}
                  unitLabel={storeLeaderboard.unitLabel || 'achievement'}
                  isStoreScope
                />
              </div>
              <div className="rise rise-3">
                <LeaderboardFocusList
                  entries={storeLeaderboard.top}
                  selfRank={storeLeaderboard.rank}
                  unitLabel={storeLeaderboard.unitLabel || 'achievement'}
                  isStoreScope
                />
              </div>
            </section>
          )}

          {tab === 'history' && <HistoryScreen employeeId={employee.employeeId} vertical={active.vertical} />}
        </main>
      </div>
    </div>
  );
}
