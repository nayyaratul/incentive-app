# Typography & Visual Consistency — Design System Checklist

> Built in response to: *"By changing the fonts, there needs to be adjustment done in font size, weight and color as it is looking inconsistent for each persona. Create a checklist so there are no inconsistencies. Fonts should be taken from a design system. There should be system to these components."*

This document defines the **token system** every persona screen must consume, and the **per-persona audit checklist** to verify nothing drifted after the recent font swap. No code changes happen until this is approved.

---

## Part A — Token System (the source of truth)

All values live in `src/styles/_tokens-semantic.scss`. **Components reference the token, never the raw value.**

### A1. Type Family Tokens
*(Right now these all point to Inter; can be flipped to any family without component edits.)*

| Token | Used for | Current value |
|---|---|---|
| `--font-sans` | All body text, labels, captions | Inter |
| `--font-display` | Hero figures, big numbers, headlines | Inter (heavier weight) |
| `--font-mono` | Tabular numerics, codes, timestamps | Inter + numeric features |

### A2. Type Scale (8 steps — no other sizes allowed)

| Token | px | Role | Example use |
|---|---|---|---|
| `--text-display-1` | 80 | Money hero | EarningsHero `.amount` |
| `--text-display-2` | 52 | Big % | StoreManagerHome `.bigPct`, CentralHome `.bigPay` |
| `--text-display-3` | 32 | Card hero | TierCelebration `.bigPct` (small variant) |
| `--text-headline` | 22 | Section figures | `.miniFig`, `.payoutValue`, drawer headlines |
| `--text-title` | 16 | Card titles, primary content |  |
| `--text-body` | 14 | Standard body, table rows |  |
| `--text-caption` | 12.5 | Helper text, secondary meta |  |
| `--text-eyebrow` | 11 | Uppercase eyebrows (always letter-spaced 0.18em) | `.eyebrow`, `.label` |

**Rule:** No `font-size: 13px` / `15px` / `9.5px` etc. anywhere. If a new size is needed, add a token first.

### A3. Weight Ladder

| Token | Value | Role |
|---|---|---|
| `--weight-regular` | 400 | Body prose |
| `--weight-medium` | 500 | Captions, secondary labels |
| `--weight-semibold` | 600 | Primary labels, eyebrows, titles |
| `--weight-bold` | 700 | Hero figures, money, %, emphasis |

**Rule:** Use exactly these four. No 360 / 480 / 720 / etc. (those are Fraunces-axis vestiges from before the swap).

### A4. Color-for-Text Tokens

| Token | Hex | Contrast on white | Allowed for |
|---|---|---|---|
| `--text-primary` | #000000 | 21:1 | All hero figures, primary content, money |
| `--text-secondary` | #4D4D4D | 8.6:1 | Captions, secondary meta, sub-labels |
| `--text-muted` | #595959 | 7.0:1 | Tertiary meta only — **never with `opacity:`** |
| `--brand-deep` | #8E1E1C | 7.5:1 | Streak chip text, eyebrows on tinted backgrounds |
| `--brand` | #BD2925 | 5.5:1 | Logo, focus rings, ₹ glyph at large size, single-icon accents |
| `--success` | #0F7A3A | 5.4:1 | Positive deltas, "tier up" |
| `--warn` | #C14B00 | 4.8:1 | Warnings only |

**Rules:**
- `text-muted` may only sit on white (#FFF) or `surface-raised` (#FAFAFA). Forbidden on tinted/colored backgrounds.
- No `opacity` on text colors. Use a darker token instead.
- `--brand` for text only when ≥ 18px (large-text AA threshold) OR for icon-only chrome.

### A5. Numeric Treatment
A token bundle for any numeric figure:

```scss
@mixin numeric {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums lining-nums slashed-zero;
  font-feature-settings: var(--font-numeric-features);
}
```

**Rule:** Every cell that displays a number (₹, %, count, date, code) uses `@include numeric;` — guarantees aligned columns, unambiguous zeros.

### A6. Hero Figure Pattern
Every persona's "big money" or "big %" hero must use **the same recipe**:

```scss
.heroFigure {
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--text-display-1); // or display-2
  line-height: 0.85;
  letter-spacing: -0.045em;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums lining-nums slashed-zero;
  font-feature-settings: var(--font-numeric-features);
}
```

No persona is allowed to substitute brand-red for the figure itself, lighter weight, or a different size. The supporting `₹` glyph uses `--brand` at lighter weight as a single accent.

### A7. Eyebrow Pattern (the small uppercase label above every card)

```scss
.eyebrow {
  font-family: var(--font-sans);
  font-size: var(--text-eyebrow);   // 11px
  font-weight: var(--weight-semibold);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-secondary);     // or --brand-deep on tinted hero
}
```

Every eyebrow across SA, BA, SM, Central uses this exact rule.

---

## Part B — Per-Persona Audit Checklist

Use after the token system is in place. Open each persona, walk top-to-bottom, mark ✅ / ❌.

### B1. Employee (SA / DM) — Electronics, Grocery, F&L

- [ ] HeaderBar greeting uses `--text-headline` weight `--weight-semibold`
- [ ] EarningsHero `.amount` uses A6 pattern exactly (₹ glyph in `--brand`, number in `--text-primary`)
- [ ] EarningsHero `.label` (eyebrow) follows A7
- [ ] StoreBoostCard headline figure matches A6
- [ ] OpportunityStrip cards: title `--text-title`/`--weight-semibold`, ₹ figure uses `@include numeric`
- [ ] LeaderboardTile rank chip: number `--text-headline`/`--weight-bold`, position label `--text-eyebrow`
- [ ] BottomNav active label: `--text-eyebrow` weight `--weight-bold`, white on `--text-primary` bg
- [ ] StreakNote bar: count `--text-body`/`--weight-bold`, label `--text-body`/`--weight-semibold`, all in `--brand-deep`
- [ ] Vertical-specific views (ElectronicsView / GroceryView / FnlView): every payout figure follows A6 (no per-vertical font drift)

### B2. Brand Associate (BA)

- [ ] Same HeaderBar pattern as SA — no role-specific font swap
- [ ] `.ineligCard` body text `--text-body`/`--text-secondary`, no opacity
- [ ] Contribution figures (`.contribVal`) use A6 hero pattern
- [ ] Top-SKU rows: SKU code uses `@include numeric`, name `--text-body`/`--weight-semibold`
- [ ] Store-pulse figures: `.pulseVal` uses `--text-headline`/`--weight-bold`/`--text-primary`

### B3. Store Manager (SM)

- [ ] Store hero `.bigPct` and `.miniFig` follow A6 (display-2, display-3)
- [ ] Department multipliers list: `.deptName` `--text-body`/`--weight-semibold`, `.deptSub` `--text-caption`/`--text-secondary`
- [ ] `.deptAch` (%) and `.deptMult` use `@include numeric`
- [ ] Team roster rows: name `--text-body`/`--weight-semibold`, role `--text-eyebrow`/`--text-secondary`
- [ ] Transactions screen filters use the same chip pattern as Central's vertical filters
- [ ] EmployeeDetailDrawer headlines use `--text-headline` (not display) — drawers are secondary surfaces

### B4. Central Reporting

- [ ] Org hero `.bigPay` uses `--text-display-2`/`--weight-bold`/`--text-primary`
- [ ] By-vertical rows: vertical badge `--text-eyebrow`/`--brand-deep`, payout `@include numeric`
- [ ] Stores directory rows: store name `--text-body`/`--weight-semibold`, code+city `--text-caption`/`--text-secondary`, achievement % `@include numeric`
- [ ] By-state cards: state name `--text-caption`/`--weight-semibold`, payout `--text-headline`/`--weight-bold`
- [ ] Anomalies list: severity icons keep brand color, body text `--text-body`/`--text-primary`
- [ ] StoreDetailDrawer matches EmployeeDetailDrawer's typography conventions

### B5. Cross-Persona (shared atoms / molecules)

- [ ] HeaderBar: same height, same greeting weight, same rank-chip across all 4 personas
- [ ] BottomNav: identical pill, identical active state, only the items differ
- [ ] Drawers (Employee / Store / Transaction / Leaderboard): same handle, same close button, same eyebrow + headline pattern
- [ ] Compliance / Eligibility disclosures (`ComplianceLink`): same pattern everywhere
- [ ] Tier celebration overlay: identical typography across personas (no SM-specific variant)

---

## Part C — Anti-pattern Sweep (find & fix)

Search-and-destroy these forbidden patterns before declaring "consistent":

| Pattern | Why forbidden | Fix |
|---|---|---|
| `color: var(--text-muted); opacity: 0.X;` | Drops below 4.5:1 AA | Use `--text-secondary` or solid token |
| `font-size: 9.5px` / `8.5px` / `10px` | Below legibility floor | Min `--text-eyebrow` (11px) |
| `font-weight: 360/420/480/680/720` | Inter snaps to 100s, breaks weight ladder | Use one of A3 |
| `font-family: 'Fraunces' / 'Geist Mono' / 'Instrument Sans'` (literal) | Bypasses token | Replace with `var(--font-*)` |
| `color: rgba(142, 30, 28, 0.7)` (faded brand) | Fragile contrast, not in palette | `--brand-deep` |
| `font-size: 13px` / `15px` / `17px` | Off the type scale | Round to nearest token step |
| `background: var(--brand-soft)` with `--text-muted` text inside | 2.9:1 contrast fail | Use `--brand-deep` text |
| Inline color/size in JSX (`style={{ ... }}`) | Bypasses everything | Move to module SCSS |

---

## Part D — Implementation Order (when approved)

1. **Add tokens** to `_tokens-semantic.scss` (Part A2, A3)
2. **Add `@mixin numeric`** to `_mixins.scss` (Part A5)
3. **Migrate one component** (EarningsHero) end-to-end as the reference implementation
4. **Run the anti-pattern sweep** (Part C) across all `.module.scss`
5. **Per-persona audit** (Part B) — walk each role with the checklist, fix drift, mark ✅
6. **Visual diff review** — open all 4 persona homes side-by-side, confirm shared atoms read identically

Each step gets reviewed before moving on. No mass perl substitutions across the whole tree without a pass-by-pass token migration in front of it.

---

## Part E — Open Question for User

Before I touch any files:

1. **Revert or proceed?** I already made the unilateral Inter swap. Do you want me to:
   - **(a)** Git-revert the font swap, restore Fraunces/Instrument/Geist, and we apply this checklist later when you're ready for the typography pass; OR
   - **(b)** Keep Inter loaded but rebuild the type system per Part A right now (this checklist becomes the active work)
2. **Which font family for the design system?** If (b), Inter stays — but if you have another in mind (since I jumped the gun), name it and I'll wire the tokens to that instead.
3. **Scale calibration:** the 8-step ramp in A2 reflects current usage. Want anything tighter (6 steps) or looser (10 steps)?
