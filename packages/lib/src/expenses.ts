import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  Expense,
  ExpenseBudget,
  ExpenseCategory,
  MonthlySummary,
} from '@habit-tracker/types'
import { EXPENSE_CATEGORIES } from '@habit-tracker/types'

// ─── Input types ─────────────────────────────────────────────

export type CreateExpenseInput = Pick<Expense, 'amount' | 'category' | 'date'> &
  Partial<Pick<Expense, 'description' | 'currency' | 'external_id'>>

export type UpdateExpenseInput = Partial<CreateExpenseInput>

// ─── Expenses ────────────────────────────────────────────────

/** Geeft alle uitgaven voor de gegeven maand, gesorteerd op datum DESC */
export async function getExpenses(
  client: SupabaseClient,
  userId: string,
  year: number,
  month: number,
): Promise<Expense[]> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await client
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createExpense(
  client: SupabaseClient,
  userId: string,
  input: CreateExpenseInput,
): Promise<Expense> {
  const { data, error } = await client
    .from('expenses')
    .insert({ ...input, user_id: userId, currency: input.currency ?? 'EUR' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Batch import ────────────────────────────────────────────

export interface BatchImportResult {
  inserted: number
  skipped: number
}

/**
 * Importeert meerdere uitgaven in één keer.
 * Rijen met een bestaand (user_id, external_id) worden overgeslagen (DO NOTHING).
 */
export async function batchImportExpenses(
  client: SupabaseClient,
  userId: string,
  rows: CreateExpenseInput[],
): Promise<BatchImportResult> {
  const payload = rows.map((r) => ({
    ...r,
    user_id: userId,
    currency: r.currency ?? 'EUR',
  }))

  const { data, error } = await client
    .from('expenses')
    .upsert(payload, {
      onConflict: 'user_id,external_id',
      ignoreDuplicates: true,
    })
    .select('id')

  if (error) throw new Error(error.message)

  const inserted = data?.length ?? 0
  const skipped  = rows.length - inserted
  return { inserted, skipped }
}

export async function updateExpense(
  client: SupabaseClient,
  id: string,
  input: UpdateExpenseInput,
): Promise<Expense> {
  const { data, error } = await client
    .from('expenses')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteExpense(
  client: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ─── Monthly Summary ─────────────────────────────────────────

/**
 * Berekent een maandoverzicht inclusief vergelijking met vorige maand.
 * Haalt huidige maand, vorige maand en budgetten parallel op via Promise.all.
 * Alle 10 categorieën worden altijd geïnitialiseerd zodat de UI nooit undefined-checks nodig heeft.
 */
export async function getMonthlySummary(
  client: SupabaseClient,
  userId: string,
  year: number,
  month: number,
): Promise<MonthlySummary> {
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year

  const [currentExpenses, prevExpenses, budgets] = await Promise.all([
    getExpenses(client, userId, year, month),
    getExpenses(client, userId, prevYear, prevMonth),
    getBudgets(client, userId),
  ])

  const budgetMap = new Map<ExpenseCategory, number>()
  for (const b of budgets) {
    budgetMap.set(b.category, b.monthly_limit)
  }

  // Initialiseer alle categorieën met nul-waarden
  const by_category = {} as MonthlySummary['by_category']
  for (const cat of EXPENSE_CATEGORIES) {
    by_category[cat.value] = {
      spent: 0,
      budget: budgetMap.get(cat.value) ?? null,
      count: 0,
    }
  }

  let total = 0
  for (const exp of currentExpenses) {
    by_category[exp.category]!.spent += exp.amount
    by_category[exp.category]!.count += 1
    total += exp.amount
  }

  const prev_total = prevExpenses.length > 0
    ? prevExpenses.reduce((sum, e) => sum + e.amount, 0)
    : null

  return { month, year, total, by_category, prev_total }
}

// ─── Budgets ─────────────────────────────────────────────────

export async function getBudgets(
  client: SupabaseClient,
  userId: string,
): Promise<ExpenseBudget[]> {
  const { data, error } = await client
    .from('expense_budgets')
    .select('*')
    .eq('user_id', userId)
    .order('category', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function upsertBudget(
  client: SupabaseClient,
  userId: string,
  category: ExpenseCategory,
  monthly_limit: number,
  currency: string = 'EUR',
): Promise<ExpenseBudget> {
  const { data, error } = await client
    .from('expense_budgets')
    .upsert(
      { user_id: userId, category, monthly_limit, currency },
      { onConflict: 'user_id,category' },
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
