import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase-server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface SuggestedHabit {
  name: string
  description: string
  icon: string
  color: string
  frequency: 'daily' | 'weekly'
}

export async function POST(req: Request) {
  // Verify auth
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { goal } = await req.json() as { goal: string }

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: `You are a habit formation expert. When given a goal, suggest 4 specific, achievable habits.
Each habit should be:
- Small and concrete (not vague like "be healthier")
- Easy to start (2-5 minutes at first)
- Clearly linked to the goal
Pick a relevant emoji as the icon. Pick a color from this palette: #6C63FF #22C55E #F59E0B #EF4444 #3B82F6 #EC4899 #8B5CF6 #14B8A6`,
    messages: [
      { role: 'user', content: `My goal: ${goal}\n\nSuggest 4 habits for this goal.` },
    ],
    tools: [
      {
        name: 'suggest_habits',
        description: 'Return a structured list of habit suggestions',
        input_schema: {
          type: 'object' as const,
          properties: {
            habits: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', description: 'Short habit name (max 40 chars)' },
                  description: { type: 'string', description: 'Brief description (max 80 chars)' },
                  icon: { type: 'string', description: 'Single emoji' },
                  color: { type: 'string', description: 'Hex color from the given palette' },
                  frequency: { type: 'string', enum: ['daily', 'weekly'] },
                },
                required: ['name', 'description', 'icon', 'color', 'frequency'],
              },
            },
          },
          required: ['habits'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'suggest_habits' },
  })

  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    return Response.json({ habits: [] })
  }

  return Response.json(toolUse.input)
}
