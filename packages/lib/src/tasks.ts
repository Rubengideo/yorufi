import type { SupabaseClient } from '@supabase/supabase-js'
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilter } from '@habit-tracker/types'
import { todayLocal } from './dates'

// ─── Read ────────────────────────────────────────────────────────────────────

export async function getTasks(
  client: SupabaseClient,
  userId: string,
  filter?: TaskFilter,
): Promise<Task[]> {
  const today = todayLocal()
  let query = client
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)

  switch (filter) {
    case 'inbox':
      query = query.is('due_date', null).is('completed_at', null)
      break
    case 'today':
      query = query.lte('due_date', today).is('completed_at', null)
      break
    case 'upcoming':
      query = query.gt('due_date', today).is('completed_at', null)
      break
    case 'completed':
      query = query.not('completed_at', 'is', null)
      break
    default:
      break
  }

  // Sorteervolgorde: op datum voor today/upcoming, anders op aanmaakdatum
  if (filter === 'today' || filter === 'upcoming') {
    query = query.order('due_date', { ascending: true })
  } else {
    query = query.order('created_at', { ascending: true })
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createTask(
  client: SupabaseClient,
  userId: string,
  input: CreateTaskInput,
): Promise<Task> {
  const { data, error } = await client
    .from('tasks')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateTask(
  client: SupabaseClient,
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const { data, error } = await client
    .from('tasks')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── Complete / Uncomplete ───────────────────────────────────────────────────

export async function completeTask(client: SupabaseClient, id: string): Promise<Task> {
  return updateTask(client, id, { completed_at: new Date().toISOString() })
}

export async function uncompleteTask(client: SupabaseClient, id: string): Promise<Task> {
  return updateTask(client, id, { completed_at: null })
}

// ─── Archive ─────────────────────────────────────────────────────────────────

export async function archiveTask(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client
    .from('tasks')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
