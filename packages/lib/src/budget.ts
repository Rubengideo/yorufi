import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  BudgetSettings,
  BudgetItem,
  BudgetBucket,
  BudgetBucketSummary,
  BudgetSummary,
  ExpenseCategory,
} from '@habit-tracker/types'
import { BUDGET_BUCKETS, CATEGORY_BUCKET_MAP } from '@habit-tracker/types'
import { getExpenses } from './expenses'

// ─── Input types ─────────────────────────────────────────────

export type UpdateBudgetSettingsInput = Partial<
  Pick<BudgetSettings, 'monthly_income' | 'needs_pct' | 'savings_pct' | 'wants_pct' | 'currency'>
>

export type CreateBudgetItemInput = Pick<BudgetItem, 'name' | 'amount' | 'bucket'> &
  Partial<Pick<BudgetItem, 'currency' | 'is_recurring'>>

export type UpdateBudgetItemInput = Partial<CreateBudgetItemInput>

// ─── Settings ────────────────────────────────────────────────

/**
 * Haal de budgetinstellingen op voor een gebruiker.
 * Als er nog geen rij bestaat, insert een standaardrij (50/20/30, inkomen 0)
 * en retourneer die. Dit upsert-on-read patroon zorgt dat de UI altijd
 * iets heeft om weer te geven zonder een aparte "eerste keer setup" flow.
 */
export async function getBudgetSettings(
  client: SupabaseClient,
  userId: string,
): Promise<BudgetSettings> {
  // Probeer eerst een gewone select — vermijdt onnodige upserts
  const { data: existing } = await client
    .from('budget_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) return existing

  // Geen rij gevonden: maak standaardinstellingen aan
  const { data, error } = await client
    .from('budget_settings')
    .insert({ user_id: userId, monthly_income: 0, needs_pct: 50, savings_pct: 20, wants_pct: 30 })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateBudgetSettings(
  client: SupabaseClient,
  userId: string,
  input: UpdateBudgetSettingsInput,
): Promise<BudgetSettings> {
  const { data, error } = await client
    .from('budget_settings')
    .update(input)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Items ───────────────────────────────────────────────────

export async function getBudgetItems(
  client: SupabaseClient,
  userId: string,
): Promise<BudgetItem[]> {
  const { data, error } = await client
    .from('budget_items')
    .select('*')
    .eq('user_id', userId)
    .order('bucket', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createBudgetItem(
  client: SupabaseClient,
  userId: string,
  input: CreateBudgetItemInput,
): Promise<BudgetItem> {
  const { data, error } = await client
    .from('budget_items')
    .insert({
      ...input,
      user_id:      userId,
      currency:     input.currency     ?? 'EUR',
      is_recurring: input.is_recurring ?? true,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateBudgetItem(
  client: SupabaseClient,
  id: string,
  input: UpdateBudgetItemInput,
): Promise<BudgetItem> {
  const { data, error } = await client
    .from('budget_items')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteBudgetItem(
  client: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client
    .from('budget_items')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ─── Summary ─────────────────────────────────────────────────

/**
 * Berekent de volledige BudgetSummary vanuit instellingen + items + werkelijke expenses.
 * Haalt alle drie parallel op, aggregeert dan in-memory.
 * Werkt correct als inkomen 0 is (geen deling door nul: actual_pct = 0).
 */
export async function getBudgetSummary(
  client: SupabaseClient,
  userId: string,
  year?: number,
  month?: number,
): Promise<BudgetSummary> {
  const now = new Date()
  const targetYear  = year  ?? now.getFullYear()
  const targetMonth = month ?? (now.getMonth() + 1)
  const [settings, items, expenses] = await Promise.all([
    getBudgetSettings(client, userId),
    getBudgetItems(client, userId),
    getExpenses(client, userId, targetYear, targetMonth),
  ])

  const income = settings.monthly_income

  // Groepeer budget-items per bucket
  const bucketItems: Record<BudgetBucket, BudgetItem[]> = {
    needs:   [],
    savings: [],
    wants:   [],
  }
  for (const item of items) {
    bucketItems[item.bucket].push(item)
  }

  // Bereken werkelijke uitgaven per bucket via CATEGORY_BUCKET_MAP
  const spentPerBucket: Record<BudgetBucket, number> = { needs: 0, savings: 0, wants: 0 }
  const spentByCategoryPerBucket: Record<BudgetBucket, Partial<Record<ExpenseCategory, number>>> = {
    needs: {}, savings: {}, wants: {},
  }
  for (const exp of expenses) {
    const bucket = CATEGORY_BUCKET_MAP[exp.category]
    spentPerBucket[bucket] += exp.amount
    spentByCategoryPerBucket[bucket][exp.category] =
      (spentByCategoryPerBucket[bucket][exp.category] ?? 0) + exp.amount
  }

  const pctMap: Record<BudgetBucket, number> = {
    needs:   settings.needs_pct,
    savings: settings.savings_pct,
    wants:   settings.wants_pct,
  }

  function buildBucketSummary(bucket: BudgetBucket): BudgetBucketSummary {
    const meta        = BUDGET_BUCKETS.find((b) => b.value === bucket)!
    const goalPct     = pctMap[bucket]
    const goalAmt     = (income * goalPct) / 100
    const itemList    = bucketItems[bucket]
    const actual      = itemList.reduce((sum, i) => sum + i.amount, 0)
    const actualPct   = income > 0 ? Math.round((actual / income) * 1000) / 10 : 0
    const spent       = spentPerBucket[bucket]
    const spentPct    = income > 0 ? Math.round((spent / income) * 1000) / 10 : 0

    return {
      bucket,
      label:         meta.label,
      color:         meta.color,
      goal_pct:      goalPct,
      actual_pct:    actualPct,
      goal_amount:   goalAmt,
      actual_amount: actual,
      remaining:     goalAmt - Math.max(actual, spent),
      items:         itemList,
      spent_amount:       spent,
      spent_pct:          spentPct,
      spent_by_category:  spentByCategoryPerBucket[bucket],
    }
  }

  const needs   = buildBucketSummary('needs')
  const savings = buildBucketSummary('savings')
  const wants   = buildBucketSummary('wants')

  const totalBudgeted  = needs.actual_amount + savings.actual_amount + wants.actual_amount
  const totalRemaining = needs.remaining + savings.remaining + wants.remaining

  return {
    monthly_income:  income,
    currency:        settings.currency,
    total_budgeted:  totalBudgeted,
    total_remaining: totalRemaining,
    needs,
    savings,
    wants,
  }
}
