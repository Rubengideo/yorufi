import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@/lib/supabase-server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  // Verify auth
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages, habitSummary } = await req.json() as {
    messages: { role: 'user' | 'assistant'; content: string }[]
    habitSummary: string
  }

  const system = `You are a friendly, motivating habit coach. You help users build better habits and stay consistent.

The user's current habit data:
${habitSummary}

Guidelines:
- Be encouraging and specific, reference their actual habits and streaks
- Give actionable advice, not generic tips
- Keep responses concise (2-4 short paragraphs max)
- If they're doing well, celebrate it! If they're struggling, be empathetic
- You can suggest small adjustments to improve consistency
- Respond in the same language the user writes in`

  const stream = anthropic.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    system,
    messages,
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
