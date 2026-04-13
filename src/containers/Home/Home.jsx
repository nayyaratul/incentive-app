import React from 'react';
import styles from './Home.module.scss';
import { dummyData } from '../../data/dummy';
import HeaderBar from '../../components/Organism/HeaderBar/HeaderBar';
import EarningsHero from '../../components/Molecule/EarningsHero/EarningsHero';
import OpportunityStrip from '../../components/Organism/OpportunityStrip/OpportunityStrip';
import LeaderboardTile from '../../components/Molecule/LeaderboardTile/LeaderboardTile';
import BottomNav from '../../components/Organism/BottomNav/BottomNav';

export default function Home() {
  const { employee, streak, earnings, goal, opportunities, myRank } = dummyData;

  return (
    <div className={styles.page}>
      <HeaderBar
        employeeName={employee.name}
        streak={streak.current}
      />

      <main className={styles.main}>
        <section className={styles.heroSection}>
          <EarningsHero
            thisMonth={earnings.thisMonth}
            today={earnings.today}
            goal={goal}
          />
        </section>

        <section className={styles.stripSection}>
          <OpportunityStrip opportunities={opportunities} />
        </section>

        <section className={styles.rankSection}>
          <LeaderboardTile
            rank={myRank.rank}
            deltaAbove={myRank.deltaAbove}
            scope={myRank.scope}
          />
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  );
}
