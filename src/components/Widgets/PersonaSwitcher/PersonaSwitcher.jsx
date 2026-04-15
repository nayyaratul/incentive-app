import React, { useEffect, useState } from 'react';
import { UserCircle2, Check } from 'lucide-react';
import { Modal } from '@/nexus/molecules';
import { Badge, Text } from '@/nexus/atoms';
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

  if (!isSwitcherOpen) return null;

  const groups = groupPersonas(personas);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) closeSwitcher();
  };

  return (
    <Modal
      open={isSwitcherOpen}
      onOpenChange={handleOpenChange}
      title="Who are we showing next?"
      description="Re-renders the app end-to-end with the selected persona's data, role, and vertical rules applied."
      size="lg"
      variant="default"
      placement="center"
      showCloseButton
      dismissible
      closeOnOverlayClick
      closeOnEsc
      icon={<Text variant="overline" size="xs" color="var(--color-action-primary)">POC Demo · Switch persona</Text>}
      footer={
        <Text variant="overline" size="xs" color="var(--color-text-tertiary)" className={styles.footnote}>
          Persona is visible only during POC · ESC to close
        </Text>
      }
    >
      <div className={styles.body}>
        {Object.entries(groups).map(([groupName, arr]) => (
          <section key={groupName} className={styles.group}>
            <div className={styles.groupTitle}>
              <Text variant="overline" size="xs" weight="semibold" color="var(--color-text-tertiary)">
                {groupName}
              </Text>
              <span className={styles.groupLine} />
            </div>
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
                        <Badge variant="default" size="sm" className={styles.badge}>
                          {p.badge}
                        </Badge>
                        {isActive && <Check size={14} strokeWidth={2.6} className={styles.checkMark} />}
                      </div>
                      <Text variant="body" size="md" weight="semibold" className={styles.name}>
                        {p.employeeName}
                      </Text>
                      <Text variant="caption" size="sm" color="var(--color-text-secondary)" className={styles.tagline}>
                        {p.tagline}
                      </Text>
                    </button>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </Modal>
  );
}
