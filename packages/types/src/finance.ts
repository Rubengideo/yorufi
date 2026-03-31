// ─── Account ─────────────────────────────────────────────────

export type AccountType = 'bank' | 'investment' | 'crypto' | 'other'

/** Type schuld — alleen gebruikt als is_liability = true */
export type LiabilityType = 'studielening' | 'hypotheek' | 'persoonlijke lening' | 'creditcard' | 'overig'

export interface FinanceAccount {
  id: string
  user_id: string
  name: string
  type: AccountType
  currency: string          // ISO 4217, bijv. 'EUR', 'USD', 'BTC'
  balance: number           // huidig saldo — gesynchroniseerd door DB trigger bij snapshot insert
  institution: string | null
  icon: string | null       // emoji
  color: string | null      // hex '#RRGGBB'
  archived_at: string | null
  created_at: string
  updated_at: string
  // ─── Schuld velden (014_liabilities) ─────────────────────
  is_liability:    boolean       // true = schuld (wordt van netto vermogen afgetrokken)
  original_amount: number | null // oorspronkelijk leenbedrag
  interest_rate:   number | null // jaarlijkse rente in %
  monthly_payment: number | null // maandelijkse aflossing
}

// ─── Snapshot ────────────────────────────────────────────────

export interface FinanceSnapshot {
  id: string
  account_id: string
  user_id: string
  balance: number
  date: string          // 'YYYY-MM-DD' — mirrors Completion.date
  note: string | null
  created_at: string
}

// ─── Goal ────────────────────────────────────────────────────

export interface FinanceGoal {
  id: string
  user_id: string
  name: string
  description: string | null
  target_amount: number
  current_amount: number
  currency: string
  deadline: string | null   // 'YYYY-MM-DD'
  icon: string | null
  color: string | null
  completed_at: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

// ─── Enriched / derived types (gebruikt in de UI) ────────────

/** FinanceGoal met berekend voortgangspercentage 0–1 */
export interface FinanceGoalWithProgress extends FinanceGoal {
  progress: number      // current_amount / target_amount, clamped 0–1
  remaining: number     // target_amount - current_amount (>= 0)
  is_overdue: boolean
  /** Gemiddelde maandelijkse bijdrage op basis van huidige bedrag en leeftijd van het doel */
  monthly_avg_contribution: number | null
  /** Geschatte resterende maanden op dit tempo */
  projected_months_remaining: number | null
  /** Geschatte voltooiingsdatum als 'YYYY-MM-DD' */
  projected_completion_date: string | null
}

/** Netto vermogen samenvatting — berekend in de lib, gebruikt door het dashboard */
export interface NetWorthSummary {
  total: number
  gross_assets: number        // som van alle bezitting-rekeningen
  total_liabilities: number   // som van alle schuld-rekeningen (positief getal)
  by_currency: Record<string, number>   // { EUR: 12000, USD: 5000 }
  account_count: number
  as_of: string   // 'YYYY-MM-DD' — datum van de meest recente snapshot of vandaag
}

/** Een punt in de netto vermogen geschiedenis grafiek */
export interface NetWorthDataPoint {
  date: string    // 'YYYY-MM-DD'
  total: number   // som van alle account-saldo's op die datum
}
