import React, { useState } from 'react';
import { Flag, CheckCircle2, XCircle } from 'lucide-react';
import styles from './CentralHome.module.scss';
import { usePersona } from '../../context/PersonaContext';
import { centralReporting } from '../../data/payouts';
import { electronicsRuleMeta, groceryCampaign, fnlWeeklyRules } from '../../data/configs';
import HeaderBar from '../../components/Organism/HeaderBar/HeaderBar';
import BottomNav from '../../components/Organism/BottomNav/BottomNav';
import RulesScreen from '../screens/RulesScreen';
import { formatINR } from '../../utils/format';

const SEVERITY_ICONS = {
  alert: XCircle,
  warn:  Flag,
  info:  CheckCircle2,
};

const WORKFLOW_COLORS = {
  APPROVED:  styles.wfApproved,
  ACTIVE:    styles.wfActive,
  SUBMITTED: styles.wfSubmitted,
  DRAFT:     styles.wfDraft,
  REJECTED:  styles.wfRejected,
};

export default function CentralHome() {
  const [tab, setTab] = useState('home');
  const { employee } = usePersona();
  const firstName = employee.employeeName.split(' ')[0];
  const cr = centralReporting;

  return (
    <div className={styles.shell}>
      <BottomNav active={tab} role="CENTRAL" onNavigate={setTab} />

      <div className={styles.layout}>
        <HeaderBar
          employeeName={tab === 'home' ? firstName : null}
          streak={0}
          showStreak={false}
        />

        <main className={styles.main}>
          {tab === 'rules' && <RulesScreen defaultVertical="ELECTRONICS" />}

          {tab === 'stores' && (
            <>
              <div className={`${styles.datemark} rise rise-1`}>
                <span>Stores · drill-down</span>
                <span className={styles.line} />
                <span>{cr.topStores.length} shown</span>
              </div>
              <section className={`${styles.pad} rise rise-2`}>
                <div className={styles.cardLight}>
                  <div className={styles.cardHead}>
                    <span className={styles.eyebrow}>Top stores</span>
                  </div>
                  {cr.topStores.map((s, i) => (
                    <div key={s.storeCode} className={styles.storeRow}>
                      <div className={styles.storeRank}>#{i + 1}</div>
                      <div className={styles.storeMid}>
                        <div className={styles.storeName}>{s.storeName}</div>
                        <div className={styles.storeMeta}>{s.vertical} · {s.storeCode} · {s.achievementPct}%</div>
                      </div>
                      <div className={styles.storePay}>{formatINR(s.payoutMTD)}</div>
                    </div>
                  ))}
                </div>
              </section>
              <section className={`${styles.pad} rise rise-3`}>
                <div className={styles.cardLight}>
                  <div className={styles.cardHead}>
                    <span className={styles.eyebrow}>By state</span>
                  </div>
                  <div className={styles.stateGrid}>
                    {cr.byState.map((s) => (
                      <div key={s.state} className={styles.stateCard}>
                        <div className={styles.stateName}>{s.state}</div>
                        <div className={styles.statePay}>{formatINR(s.payoutMTD)}</div>
                        <div className={styles.stateMeta}>{s.stores} stores</div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {tab === 'alerts' && (
            <>
              <div className={`${styles.datemark} rise rise-1`}>
                <span>Alerts · anomalies</span>
                <span className={styles.line} />
                <span>{cr.flags.length} active</span>
              </div>
              <section className={`${styles.pad} rise rise-2`}>
                <div className={styles.cardDark}>
                  <div className={styles.cardHead}>
                    <span className={styles.eyebrowLight}>Anomalies</span>
                  </div>
                  <div className={styles.flagList}>
                    {cr.flags.map((f) => {
                      const Icon = SEVERITY_ICONS[f.severity] || Flag;
                      return (
                        <div key={f.id} className={`${styles.flagRow} ${styles[`sev-${f.severity}`]}`}>
                          <Icon size={14} strokeWidth={2.4} />
                          <div>
                            <div className={styles.flagStore}>{f.storeCode} · {f.vertical}</div>
                            <div className={styles.flagMsg}>{f.message}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </>
          )}

          {tab === 'home' && (
            <>
          <div className={`${styles.datemark} rise rise-1`}>
            <span>Central Reporting · read-only</span>
            <span className={styles.line} />
            <span>As of {new Date(cr.asOf).toLocaleString('en-IN')}</span>
          </div>

          {/* Org hero */}
          <section className={`${styles.pad} rise rise-2`}>
            <div className={styles.orgHero}>
              <div className={styles.heroEyebrow}>Organisation · Month to date</div>
              <div className={styles.bigPay}>{formatINR(cr.totals.organisationPayoutMTD)}</div>
              <div className={styles.bigCap}>total incentive payout across all verticals</div>
              <div className={styles.heroStats}>
                <div><strong>{cr.totals.employeesEligible.toLocaleString('en-IN')}</strong><span>eligible employees</span></div>
                <div className={styles.statDiv} />
                <div><strong>{cr.totals.storesWithPayout}</strong><span>stores with payout</span></div>
                <div className={styles.statDiv} />
                <div><strong>{cr.totals.storesBelowGate}</strong><span>below payout gate</span></div>
              </div>
            </div>
          </section>

          {/* By vertical */}
          <section className={`${styles.pad} rise rise-3`}>
            <div className={styles.cardLight}>
              <div className={styles.cardHead}>
                <span className={styles.eyebrow}>By vertical</span>
              </div>
              {cr.byVertical.map((v) => (
                <div key={v.vertical} className={styles.vRow}>
                  <div className={styles.vLeft}>
                    <span className={styles.vBadge}>{v.vertical}</span>
                    <span className={styles.vSub}>{v.stores} stores · {v.employees.toLocaleString('en-IN')} staff</span>
                  </div>
                  <div className={styles.vMid}>
                    <div className={styles.vAch}>{v.achievementAvgPct}%</div>
                    <div className={styles.vAchCap}>avg</div>
                  </div>
                  <div className={styles.vRight}>
                    <div className={styles.vPay}>{formatINR(v.payoutMTD)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Top stores drill-down */}
          <section className={`${styles.pad} rise rise-4`}>
            <div className={styles.cardLight}>
              <div className={styles.cardHead}>
                <span className={styles.eyebrow}>Top stores · drill down</span>
              </div>
              {cr.topStores.map((s, i) => (
                <div key={s.storeCode} className={styles.storeRow}>
                  <div className={styles.storeRank}>#{i + 1}</div>
                  <div className={styles.storeMid}>
                    <div className={styles.storeName}>{s.storeName}</div>
                    <div className={styles.storeMeta}>{s.vertical} · {s.storeCode} · {s.achievementPct}%</div>
                  </div>
                  <div className={styles.storePay}>{formatINR(s.payoutMTD)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* State breakdown */}
          <section className={`${styles.pad} rise rise-4`}>
            <div className={styles.cardLight}>
              <div className={styles.cardHead}>
                <span className={styles.eyebrow}>By state</span>
              </div>
              <div className={styles.stateGrid}>
                {cr.byState.map((s) => (
                  <div key={s.state} className={styles.stateCard}>
                    <div className={styles.stateName}>{s.state}</div>
                    <div className={styles.statePay}>{formatINR(s.payoutMTD)}</div>
                    <div className={styles.stateMeta}>{s.stores} stores</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Flags / anomalies */}
          <section className={`${styles.pad} rise rise-5`}>
            <div className={styles.cardDark}>
              <div className={styles.cardHead}>
                <span className={styles.eyebrowLight}>Anomalies · {cr.flags.length}</span>
              </div>
              <div className={styles.flagList}>
                {cr.flags.map((f) => {
                  const Icon = SEVERITY_ICONS[f.severity] || Flag;
                  return (
                    <div key={f.id} className={`${styles.flagRow} ${styles[`sev-${f.severity}`]}`}>
                      <Icon size={14} strokeWidth={2.4} />
                      <div>
                        <div className={styles.flagStore}>{f.storeCode} · {f.vertical}</div>
                        <div className={styles.flagMsg}>{f.message}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Rule catalog (read-only summary — Maker/Checker flow lives in admin portal) */}
          <section className={`${styles.pad} rise rise-5`}>
            <div className={styles.cardLight}>
              <div className={styles.cardHead}>
                <span className={styles.eyebrow}>Active rule catalog</span>
                <span className={styles.readOnlyBadge}>Read-only</span>
              </div>
              <div className={styles.ruleList}>
                <RuleRow
                  ruleId={electronicsRuleMeta.ruleId}
                  name={electronicsRuleMeta.name}
                  version={electronicsRuleMeta.version}
                  state={electronicsRuleMeta.workflowState}
                />
                <RuleRow
                  ruleId={groceryCampaign.ruleMeta.ruleId}
                  name={groceryCampaign.campaignName}
                  version={groceryCampaign.ruleMeta.version}
                  state={groceryCampaign.workflowState}
                />
                <RuleRow
                  ruleId={fnlWeeklyRules.ruleMeta.ruleId}
                  name="F&L Trends Weekly Incentive"
                  version={fnlWeeklyRules.ruleMeta.version}
                  state={fnlWeeklyRules.workflowState}
                />
              </div>
            </div>
          </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function RuleRow({ ruleId, name, version, state }) {
  return (
    <div className={styles.ruleRow}>
      <div className={styles.ruleLeft}>
        <div className={styles.ruleName}>{name}</div>
        <div className={styles.ruleMeta}>{ruleId} · v{version}</div>
      </div>
      <div className={styles.ruleRight}>
        <span className={`${styles.wfChip} ${WORKFLOW_COLORS[state] || ''}`}>{state}</span>
      </div>
    </div>
  );
}
