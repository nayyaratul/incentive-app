import React, { useEffect, useState } from 'react';
import { UserCircle2, X, Check } from 'lucide-react';
import styles from './PersonaSwitcher.module.scss';
import { usePersona } from '../../../context/PersonaContext';

const roleOrder = ['SA', 'DM', 'SM', 'BA', 'CENTRAL'];

function groupPersonas(personas) {
  const groups = { Employees: [], Management: [], Central: [] };
  for (const p of personas) {
    if (p.role === 'SA' || p.role === 'BA') groups.Employees.push(p);
    else if (p.role === 'DM' || p.role === 'SM') groups.Management.push(p);
    else if (p.role === 'CENTRAL') groups.Central.push(p);
  }
  return groups;
}

export function PersonaPill() {
  const { active, openSwitcher } = usePersona();
  const [hidden, setHidden] = useState(false);

  // Auto-hide on scroll down, reveal on scroll up or when near top.
  // Keeps the centered pill out of the way while reading long pages.
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - lastY;
        if (y < 8) setHidden(false);           // near top — always show
        else if (dy > 4) setHidden(true);      // scrolling down — hide
        else if (dy < -4) setHidden(false);    // scrolling up ("pull down") — show
        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`${styles.pill} ${hidden ? styles.pillHidden : ''}`}
      onClick={openSwitcher}
      aria-label={`Switch persona (current: ${active?.badge || ''})`}
    >
      <UserCircle2 size={14} strokeWidth={2.4} />
      <span className={styles.pillLabel}>Switch</span>
    </button>
  );
}

export function PersonaModal() {
  const { personas, active, isSwitcherOpen, closeSwitcher, switchTo } = usePersona();

  useEffect(() => {
    if (!isSwitcherOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeSwitcher(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isSwitcherOpen, closeSwitcher]);

  if (!isSwitcherOpen) return null;

  const groups = groupPersonas(personas);

  return (
    <div className={styles.overlay} onClick={closeSwitcher}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Switch persona">
        <header className={styles.modalHead}>
          <div>
            <div className={styles.eyebrow}>POC Demo · Switch persona</div>
            <h2 className={styles.title}>Who are we showing next?</h2>
            <p className={styles.sub}>Re-renders the app end-to-end with the selected persona's data, role, and vertical rules applied.</p>
          </div>
          <button type="button" className={styles.close} onClick={closeSwitcher} aria-label="Close">
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        <div className={styles.body}>
          {Object.entries(groups).map(([groupName, arr]) => (
            <section key={groupName} className={styles.group}>
              <h3 className={styles.groupTitle}>{groupName}</h3>
              <div className={styles.grid}>
                {arr
                  .sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role))
                  .map((p) => {
                    const isActive = p.id === active.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`${styles.card} ${styles[`color-${p.color}`]} ${isActive ? styles.cardActive : ''}`}
                        onClick={() => switchTo(p.id)}
                      >
                        <div className={styles.cardHead}>
                          <span className={styles.badge}>{p.badge}</span>
                          {isActive && <Check size={14} strokeWidth={2.6} className={styles.checkMark} />}
                        </div>
                        <div className={styles.name}>{p.employeeName}</div>
                        <div className={styles.tagline}>{p.tagline}</div>
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>

        <footer className={styles.footer}>
          <span className={styles.footnote}>Persona is visible only during POC · ESC to close</span>
        </footer>
      </div>
    </div>
  );
}
