import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  FinanceAccount,
  FinanceSnapshot,
  FinanceGoal,
  FinanceGoalWithProgress,
  NetWorthSummary,
  NetWorthDataPoint,
} from '@habit-tracker/types'
import { todayLocal } from './dates'

// ─── Accounts ────────────────────────────────────────────────

export type CreateAccountInput = Pick<FinanceAccount, 'name' | 'type' | 'currency'> &
  Partial<Pick<FinanceAccount, 'balance' | 'institution' | 'icon' | 'color' | 'is_liability' | 'original_amount' | 'interest_rate' | 'monthly_payment'>>

export type UpdateAccountInput = Partial<CreateAccountInput>

export async function getAccounts(
  client: SupabaseClient,
  userId: string,
): Promise<FinanceAccount[]> {
  const { data, error } = await client
    .from('finance_accounts')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAccount(
  client: SupabaseClient,
  id: string,
): Promise<FinanceAccount> {
  const { data, error } = await client
    .from('finance_accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createAccount(
  client: SupabaseClient,
  userId: string,
  input: CreateAccountInput,
): Promise<FinanceAccount> {
  const { data, error } = await client
    .from('finance_accounts')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateAccount(
  client: SupabaseClient,
  id: string,
  input: UpdateAccountInput,
): Promise<FinanceAccount> {
  const { data, error } = await client
    .from('finance_accounts')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function archiveAccount(
  client: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client
    .from('finance_accounts')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ─── Snapshots ───────────────────────────────────────────────

export type CreateSnapshotInput = Pick<FinanceSnapshot, 'account_id' | 'balance'> &
  Partial<Pick<FinanceSnapshot, 'date' | 'note'>>

/**
 * Upsert een saldo-snapshot voor een account op een bepaalde datum (standaard vandaag).
 * Gebruikt dezelfde unique (account_id, date) constraint als completions.
 * Het invoegen van een snapshot triggert automatisch sync_account_balance_from_snapshot() in de DB.
 */
export async function recordSnapshot(
  client: SupabaseClient,
  userId: string,
  input: CreateSnapshotInput,
): Promise<FinanceSnapshot> {
  const date = input.date ?? todayLocal()

  const { data, error } = await client
    .from('finance_snapshots')
    .upsert(
      { ...input, user_id: userId, date },
      { onConflict: 'account_id,date' },
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getSnapshots(
  client: SupabaseClient,
  accountId: string,
  from: string,
  to: string,
): Promise<FinanceSnapshot[]> {
  const { data, error } = await client
    .from('finance_snapshots')
    .select('*')
    .eq('account_id', accountId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Goals ───────────────────────────────────────────────────

export type CreateGoalInput = Pick<FinanceGoal, 'name' | 'target_amount' | 'currency'> &
  Partial<Pick<FinanceGoal, 'description' | 'current_amount' | 'deadline' | 'icon' | 'color'>>

export type UpdateGoalInput = Partial<CreateGoalInput>

export async function getGoals(
  client: SupabaseClient,
  userId: string,
): Promise<FinanceGoalWithProgress[]> {
  const { data, error } = await client
    .from('finance_goals')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  const today = todayLocal()
  return (data ?? []).map((g) => enrichGoal(g, today))
}

export async function createGoal(
  client: SupabaseClient,
  userId: string,
  input: CreateGoalInput,
): Promise<FinanceGoal> {
  const { data, error } = await client
    .from('finance_goals')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateGoal(
  client: SupabaseClient,
  id: string,
  input: UpdateGoalInput,
): Promise<FinanceGoal> {
  const { data, error } = await client
    .from('finance_goals')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function archiveGoal(
  client: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await client
    .from('finance_goals')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

// ─── Net Worth ───────────────────────────────────────────────

export async function getNetWorthSummary(
  client: SupabaseClient,
  userId: string,
): Promise<NetWorthSummary> {
  const accounts = await getAccounts(client, userId)

  const by_currency: Record<string, number> = {}
  let gross_assets = 0
  let total_liabilities = 0

  for (const acc of accounts) {
    if (acc.is_liability) {
      total_liabilities += acc.balance
      by_currency[acc.currency] = (by_currency[acc.currency] ?? 0) - acc.balance
    } else {
      gross_assets += acc.balance
      by_currency[acc.currency] = (by_currency[acc.currency] ?? 0) + acc.balance
    }
  }

  return {
    total: gross_assets - total_liabilities,
    gross_assets,
    total_liabilities,
    by_currency,
    account_count: accounts.length,
    as_of: todayLocal(),
  }
}

/**
 * Bouw een netto vermogen tijdreeks.
 * Leest alle rekeningen + snapshots in de datumrange.
 * Rekeningen zonder snapshot krijgen hun huidig saldo als baseline zodat
 * de grafiek altijd alle rekeningen meeneemt (geen verborgen accounts).
 * Het eindpunt komt altijd overeen met getNetWorthSummary.
 * Schuld-rekeningen (is_liability = true) worden negatief meegeteld.
 */
export async function getNetWorthHistory(
  client: SupabaseClient,
  userId: string,
  from: string,
  to: string,
): Promise<NetWorthDataPoint[]> {
  // Haal alle actieve rekeningen op voor baseline + is_liability flag
  const accounts = await getAccounts(client, userId)

  const liabilityFlag = new Map<string, boolean>()
  for (const acc of accounts) {
    liabilityFlag.set(acc.id, acc.is_liability)
  }

  // Snapshots in de gevraagde datumrange (geen join nodig, is_liability al bekend)
  const { data, error } = await client
    .from('finance_snapshots')
    .select('account_id, balance, date')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })

  if (error) throw new Error(error.message)

  // Groepeer snapshots per datum
  const byDate = new Map<string, Map<string, number>>()
  for (const snap of data ?? []) {
    if (!byDate.has(snap.date)) byDate.set(snap.date, new Map())
    byDate.get(snap.date)!.set(snap.account_id, snap.balance)
  }

  // Haal de laatste snapshot vóór de range op per rekening.
  // Dit geeft een accurate startbalans voor rekeningen die in deze periode
  // niet zijn bijgewerkt (anders gebruikten we hun huidig saldo voor alle historische punten).
  const { data: priorSnaps } = await client
    .from('finance_snapshots')
    .select('account_id, balance')
    .eq('user_id', userId)
    .lt('date', from)
    .order('date', { ascending: false })

  // Neem de recentste snapshot per rekening vóór de range
  const priorByAccount = new Map<string, number>()
  for (const snap of priorSnaps ?? []) {
    if (!priorByAccount.has(snap.account_id)) {
      priorByAccount.set(snap.account_id, snap.balance)
    }
  }

  // Baseline: gebruik snapshot van vóór de range als die bestaat,
  // anders het huidig saldo (beste benadering voor rekeningen zonder geschiedenis).
  const latestByAccount = new Map<string, number>()
  for (const acc of accounts) {
    latestByAccount.set(acc.id, priorByAccount.get(acc.id) ?? acc.balance)
  }

  const points: NetWorthDataPoint[] = []

  // Loop over gesorteerde snapshot-datums en draag het laatste bekende saldo voort
  for (const [date, accountMap] of [...byDate.entries()].sort()) {
    for (const [accId, bal] of accountMap) {
      latestByAccount.set(accId, bal)
    }
    let total = 0
    for (const [accId, bal] of latestByAccount) {
      total += liabilityFlag.get(accId) ? -bal : bal
    }
    points.push({ date, total })
  }

  // Voeg altijd het eindpunt van vandaag toe op basis van huidige saldo's,
  // zodat de grafiek exact overeenkomt met getNetWorthSummary.
  const today = todayLocal()
  const lastPoint = points[points.length - 1]
  if (!lastPoint || lastPoint.date !== today) {
    let todayTotal = 0
    for (const acc of accounts) {
      todayTotal += acc.is_liability ? -acc.balance : acc.balance
    }
    points.push({ date: today, total: todayTotal })
  }

  return points
}

// ─── Helpers ─────────────────────────────────────────────────

function enrichGoal(goal: FinanceGoal, today: string): FinanceGoalWithProgress {
  const progress = Math.min(goal.current_amount / goal.target_amount, 1)
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0)
  const is_overdue = !!goal.deadline && goal.deadline < today && !goal.completed_at
  return { ...goal, progress, remaining, is_overdue }
}
