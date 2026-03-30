// ─── Category ────────────────────────────────────────────────

export type ExpenseCategory =
  | 'wonen'
  | 'boodschappen'
  | 'transport'
  | 'horeca'
  | 'entertainment'
  | 'abonnementen'
  | 'gezondheid'
  | 'shopping'
  | 'opleiding'
  | 'overig'
  | 'sparen'

export interface ExpenseCategoryMeta {
  value: ExpenseCategory
  label: string
  icon: string
}

export const EXPENSE_CATEGORIES: ExpenseCategoryMeta[] = [
  { value: 'wonen',          label: 'Wonen',          icon: '🏠' },
  { value: 'boodschappen',   label: 'Boodschappen',   icon: '🛒' },
  { value: 'transport',      label: 'Transport',      icon: '🚗' },
  { value: 'horeca',         label: 'Horeca',         icon: '🍽️' },
  { value: 'entertainment',  label: 'Entertainment',  icon: '🎬' },
  { value: 'abonnementen',   label: 'Abonnementen',   icon: '📱' },
  { value: 'gezondheid',     label: 'Gezondheid',     icon: '💊' },
  { value: 'shopping',       label: 'Shopping',       icon: '🛍️' },
  { value: 'opleiding',      label: 'Opleiding',      icon: '📚' },
  { value: 'overig',         label: 'Overig',         icon: '📦' },
  { value: 'sparen',         label: 'Sparen',         icon: '🏦' },
]

// ─── Expense ─────────────────────────────────────────────────

export interface Expense {
  id: string
  user_id: string
  amount: number
  currency: string        // ISO 4217, bijv. 'EUR'
  category: ExpenseCategory
  description: string | null
  date: string            // 'YYYY-MM-DD' — mirrors Completion.date
  external_id: string | null  // Rabobank Volgnr voor duplicate-detectie
  created_at: string
}

// ─── Budget ──────────────────────────────────────────────────

export interface ExpenseBudget {
  id: string
  user_id: string
  category: ExpenseCategory
  monthly_limit: number
  currency: string
  created_at: string
  updated_at: string
}

// ─── Summary ─────────────────────────────────────────────────

export interface CategorySummary {
  spent: number
  budget: number | null   // null als er geen budget is ingesteld
  count: number           // aantal transacties in deze categorie
}

/** Maandoverzicht — berekend in de lib, gebruikt door ExpensesView en het dashboard */
export interface MonthlySummary {
  month: number           // 1–12
  year: number
  total: number
  by_category: Record<ExpenseCategory, CategorySummary>
  /** null als er geen data is voor de vorige maand */
  prev_total: number | null
}
