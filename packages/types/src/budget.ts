import type { ExpenseCategory } from './expenses'

// ─── Bucket ──────────────────────────────────────────────────

export type BudgetBucket = 'needs' | 'savings' | 'wants'

export interface BudgetBucketMeta {
  value: BudgetBucket
  label: string   // Nederlandse label in de UI
  color: string   // hex kleur voor dit bucket
}

export const BUDGET_BUCKETS: BudgetBucketMeta[] = [
  { value: 'needs',   label: 'Nodig',               color: '#3B82F6' },
  { value: 'savings', label: 'Sparen & investeren',  color: '#22C55E' },
  { value: 'wants',   label: 'Leuke dingen',         color: '#F59E0B' },
]

/** Mapping van expense-categorieën naar budget-buckets voor werkelijke uitgavenberekening */
export const CATEGORY_BUCKET_MAP: Record<ExpenseCategory, BudgetBucket> = {
  wonen:         'needs',
  boodschappen:  'needs',
  transport:     'needs',
  horeca:        'wants',
  entertainment: 'wants',
  abonnementen:  'needs',
  gezondheid:    'needs',
  shopping:      'wants',
  opleiding:     'savings',
  overig:        'needs',
  sparen:        'savings',
}

// ─── Settings ────────────────────────────────────────────────

export interface BudgetSettings {
  user_id:        string
  monthly_income: number
  needs_pct:      number   // integer 0–100
  savings_pct:    number
  wants_pct:      number
  currency:       string
  updated_at:     string
}

// ─── Item ────────────────────────────────────────────────────

export interface BudgetItem {
  id:           string
  user_id:      string
  name:         string
  amount:       number
  bucket:       BudgetBucket
  currency:     string
  is_recurring: boolean
  created_at:   string
}

// ─── Afgeleide/summary types (gebruikt in de UI) ─────────────

/** Per-bucket berekende samenvatting voor BudgetBucketCard en BudgetAllocationTable */
export interface BudgetBucketSummary {
  bucket:        BudgetBucket
  label:         string
  color:         string
  goal_pct:      number   // door de gebruiker ingesteld percentage (bijv. 50)
  actual_pct:    number   // actual_amount / monthly_income * 100, afgerond op 1 decimaal
  goal_amount:   number   // monthly_income * goal_pct / 100
  actual_amount: number   // som van alle handmatige budget-items in dit bucket (gepland)
  remaining:     number   // goal_amount - max(actual_amount, spent_amount) (kan negatief zijn)
  items:         BudgetItem[]
  spent_amount:        number   // werkelijke uitgaven dit lopende maand (via expenses + CATEGORY_BUCKET_MAP)
  spent_pct:           number   // spent_amount / monthly_income * 100
  spent_by_category:   Partial<Record<ExpenseCategory, number>>  // uitsplitsing per expense-categorie
}

/** Volledige budgetsamenvatting berekend in de lib laag */
export interface BudgetSummary {
  monthly_income:  number
  currency:        string
  total_budgeted:  number   // som van alle items
  total_remaining: number   // som van per-bucket remaining (income - effectief gebruik per bucket)
  needs:           BudgetBucketSummary
  savings:         BudgetBucketSummary
  wants:           BudgetBucketSummary
}
