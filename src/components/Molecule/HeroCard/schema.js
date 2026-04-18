/**
 * HeroCard prop schemas — documentation via JSDoc typedefs.
 *
 * These are not runtime-enforced (no PropTypes / Zod) — they exist so the
 * mapper functions and hero components share a single, typed vocabulary.
 * When adding fields in the future, extend the typedef here first, then the
 * mapper, then the hero component.
 *
 * Key principle: every block is optional. Hero components render only the
 * blocks that are present in the input. This means a mapper that cannot
 * populate a block (e.g. no API data yet) can omit it entirely, and the hero
 * collapses gracefully instead of showing `undefined` / `NaN`.
 *
 * Field-coverage status (as of 2026-04):
 *   ✅ API        — populated from backend
 *   ⚙️ CLIENT     — derived client-side from API data (mappers / transformers)
 *   ⚠️ FALLBACK   — synthesised (mock / heuristic) because API doesn't provide
 *   ❌ MISSING    — declared here but no source yet — mapper leaves undefined
 */

/**
 * @typedef {'ELECTRONICS'|'GROCERY'|'FNL'} Vertical
 * @typedef {'SA'|'SM'|'DM'|'BA'} Role
 * @typedef {'month'|'campaign'|'week'} PeriodKind
 */

/**
 * Common "context" block across all hero variants — identity + period strip
 * shown at the top of the card.
 *
 * @typedef {object} HeroContext
 * @property {Vertical} vertical
 * @property {Role} role
 * @property {PeriodKind} periodKind
 * @property {string} [periodLabel]   - e.g. "Apr 2026", "15–25 Apr 2026", "Week of 19 Apr"
 * @property {string} [periodStart]   - ISO YYYY-MM-DD
 * @property {string} [periodEnd]     - ISO YYYY-MM-DD
 * @property {string} [contextLine]   - e.g. "Your department: IT" / "Trends Extension · Kochi"
 */

/**
 * Primary amount block — the big ₹ number.
 *
 * @typedef {object} HeroPrimary
 * @property {number} amount          - Main displayed number
 * @property {string} [label]         - e.g. "Earned this month", "Your weekly payout"
 * @property {string} [prefix]        - Default "₹" for currency, "" for percent
 * @property {string} [suffix]        - Default "", "%" for percentage
 * @property {'default'|'success'|'muted'} [tone]
 * @property {number} [todayAmount]   - Optional "+₹Xk today" trend pill
 * @property {number} [potential]     - Max possible (❌ MISSING for Electronics SA — client-inferred today)
 */

/**
 * Progress block — achievement bar with multiplier tier markers.
 *
 * @typedef {object} HeroProgress
 * @property {number} achievementPct
 * @property {string} [achievementLabel]      - e.g. "Department achievement"
 * @property {number} [target]                - Sales value (₹)
 * @property {number} [actual]                - Sales value (₹)
 * @property {Array<{pct: number, label?: string}>} [markers]  - e.g. [{pct:85},{pct:100},{pct:120}]
 * @property {number} [max]                   - Progress bar max, default 120
 * @property {'locked'|'progress'|'qualified'|'exceeded'} [banner]
 * @property {number} [currentMultiplierPct]  - Electronics only
 * @property {{amount: number, atPct: number, nextMultiplierPct: number}} [gapToNext]
 * @property {number} [unlockPct]             - e.g. 85 for Electronics, 100 for Grocery/F&L
 */

/**
 * Pieces / per-unit rate block — Grocery today, but generic for any
 * per-unit-based mechanic.
 *
 * @typedef {object} HeroRateBlock
 * @property {number} [unitsSold]       - API: totalPiecesSold
 * @property {string} [unitLabel]       - "pcs"
 * @property {number} [appliedRate]     - API: currentRate
 * @property {string} [rateUnit]        - "/pc"
 * @property {number} [myUnitsSold]     - ❌ MISSING from API
 */

/**
 * Pool / staffing block — for SM/DM views and F&L SA (pool context).
 *
 * @typedef {object} HeroPoolBlock
 * @property {number} [storePool]
 * @property {number} [staffCount]
 * @property {number} [smsCount]        - ❌ MISSING from API (F&L)
 * @property {number} [dmsCount]        - ❌ MISSING from API (F&L)
 * @property {{saPct?: number, smPct?: number, dmPct?: number}} [roleSplit]
 * @property {string} [splitCaption]    - e.g. "₹20,000 ÷ 8 staff = ₹2,500 each"
 */

/**
 * Eligibility / attendance block.
 *
 * @typedef {object} HeroEligibilityBlock
 * @property {number} [daysPresent]
 * @property {number} [daysRequired]
 * @property {boolean} [eligible]
 * @property {string} [ineligibleReason]
 * @property {{current: number, total: number}} [workingDays]  - "day 16 of 30" — ❌ MISSING from API
 */

/**
 * Temporal block — countdown + run-rate.
 *
 * @typedef {object} HeroTemporalBlock
 * @property {string} [payoutDate]            - ⚠️ currently client-hardcoded (7th of next month)
 * @property {number} [daysToPayout]
 * @property {number} [daysLeftInPeriod]
 * @property {{perDay: number, projected: number, projectedPct: number}} [runRate]  - ❌ MISSING from API
 */

/**
 * Comparison vs previous period.
 *
 * @typedef {object} HeroComparisonBlock
 * @property {number} [amount]
 * @property {number} [pct]
 * @property {string} [label]                 - "vs last week", "vs last campaign"
 */

/**
 * Complete hero props — union of all optional blocks. Each vertical-hero
 * component reads only the blocks it cares about.
 *
 * @typedef {object} HeroProps
 * @property {HeroContext} context
 * @property {HeroPrimary} primary
 * @property {HeroProgress} [progress]
 * @property {HeroRateBlock} [rate]
 * @property {HeroPoolBlock} [pool]
 * @property {HeroEligibilityBlock} [eligibility]
 * @property {HeroTemporalBlock} [temporal]
 * @property {HeroComparisonBlock} [comparison]
 *
 * // Vertical-specific extensions:
 * @property {Array<{pct: number, label: string, color?: string}>} [milestones]     - Electronics SA
 * @property {Array<{threshold: number, crossed: boolean, label: string}>} [zaps]    - Electronics SA
 * @property {{title: string, start?: string, end?: string, geography?: string, channel?: string}} [campaign]  - Grocery
 * @property {boolean} [isMonthView]                                                  - F&L
 * @property {{weeksQualified: number, weeksTotal: number}} [weekSummary]             - F&L Month view
 */

export const HERO_SCHEMA_VERSION = 1;
