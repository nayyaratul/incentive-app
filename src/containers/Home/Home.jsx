import React from 'react';
import styles from './Home.module.scss';
import { dummyData } from '../../data/dummy';
import HeaderBar from '../../components/Organism/HeaderBar/HeaderBar';
import EarningsHero from '../../components/Molecule/EarningsHero/EarningsHero';
import StoreBoostCard from '../../components/Molecule/StoreBoostCard/StoreBoostCard';
import OpportunityStrip from '../../components/Organism/OpportunityStrip/OpportunityStrip';
import LeaderboardTile from '../../components/Molecule/LeaderboardTile/LeaderboardTile';
import BottomNav from '../../components/Organism/BottomNav/BottomNav';

const TODAY = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  day: '2-digit',
  month: 'short',
});

export default function Home() {
  const { employee, streak, earnings, goal, storeBoost, opportunities, myRank } = dummyData;

  return (
    <div className={styles.page}>
      <HeaderBar employeeName={employee.name} streak={streak.current} />

      <main className={styles.main}>
        <div className={`${styles.datemark} rise rise-1`}>
          <span>Shift · {TODAY}</span>
          <span className={styles.line} />
          <span>Live</span>
        </div>

        <section className={`${styles.heroSection} rise rise-2`}>
          <EarningsHero
            thisMonth={earnings.thisMonth}
            today={earnings.today}
            goal={goal}
          />
        </section>

        <section className={`${styles.boostSection} rise rise-3`}>
          <StoreBoostCard storeBoost={storeBoost} />
        </section>

        <section className={`${styles.stripSection} rise rise-4`}>
          <OpportunityStrip opportunities={opportunities} />
        </section>

        <section className={`${styles.rankSection} rise rise-5`}>
          <LeaderboardTile
            rank={myRank.rank}
            deltaAbove={myRank.deltaAbove}
            scope={myRank.scope}
          />
        </section>
      </main>

      <BottomNav active="home" employeeInitial={employee.name[0]} />
    </div>
  );
}
