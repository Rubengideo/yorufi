import { createServerClient } from '@/lib/supabase-server'
import { batchImportExpenses, type CreateExpenseInput } from '@habit-tracker/lib'

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json() as { rows: CreateExpenseInput[] }
  if (!Array.isArray(body?.rows) || body.rows.length === 0) {
    return Response.json({ error: 'rows vereist' }, { status: 400 })
  }

  try {
    const result = await batchImportExpenses(supabase, user.id, body.rows)
    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Onbekende fout'
    return Response.json({ error: message }, { status: 500 })
  }
}
