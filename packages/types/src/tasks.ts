export type TaskPriority = 'high' | 'normal' | 'low'

export type TaskFilter = 'inbox' | 'today' | 'upcoming' | 'completed'

export interface Task {
  id: string
  user_id: string
  title: string
  notes: string | null
  description: string | null  // Tiptap JSON string voor rijke tekst
  due_date: string | null     // 'YYYY-MM-DD'
  priority: TaskPriority
  completed_at: string | null
  archived_at: string | null
  created_at: string
  gcal_event_id: string | null  // Google Calendar event ID (null = niet gesynchroniseerd)
}

export type CreateTaskInput = {
  title: string
  notes?: string
  description?: string
  due_date?: string
  priority?: TaskPriority
  gcal_event_id?: string | null
}

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, 'due_date'>> & {
  due_date?: string | null
  completed_at?: string | null
  gcal_event_id?: string | null
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: 'Hoog',
  normal: 'Normaal',
  low: 'Laag',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: '#EF4444',
  normal: '#F59E0B',
  low: '#A8A29E',
}

export const FILTER_LABELS: Record<TaskFilter, string> = {
  inbox: 'Inbox',
  today: 'Vandaag',
  upcoming: 'Aankomend',
  completed: 'Voltooid',
}
