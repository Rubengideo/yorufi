'use client'

import { useState, useRef, useEffect } from 'react'
import { useHabits } from '@/hooks/useHabits'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function buildHabitSummary(habits: ReturnType<typeof useHabits>['data']): string {
  if (!habits || habits.length === 0) return 'No habits tracked yet.'

  const lines = habits.map((h) => {
    const streak = h.streak?.current_streak ?? 0
    const longest = h.streak?.longest_streak ?? 0
    return `- ${h.icon ?? ''} ${h.name}: ${streak} day streak (best: ${longest})`
  })
  return lines.join('\n')
}

export function CoachChat() {
  const { data: habits } = useHabits()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const userText = input.trim()
    if (!userText || isStreaming) return

    const newMessages: Message[] = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    // Add empty assistant message that we'll stream into
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          habitSummary: buildHabitSummary(habits),
        }),
      })

      if (!res.ok || !res.body) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Sorry, something went wrong. Please try again.',
          }
          return updated
        })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: (updated[updated.length - 1]?.content ?? '') + chunk,
          }
          return updated
        })
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-stone-500 dark:text-stone-400 text-sm">
              Ask your coach anything about your habits and goals.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                'How am I doing this week?',
                'Tips to improve my streak',
                'What habit should I focus on?',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-xs rounded-full border border-stone-200 dark:border-stone-800 px-3 py-1.5 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="h-7 w-7 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-semibold mr-2 mt-0.5 shrink-0">
                AI
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-tr-sm'
                  : 'bg-stone-100 dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-tl-sm'
              }`}
            >
              {msg.content || (
                <span className="inline-flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-400 animate-bounce" />
                </span>
              )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-stone-100 dark:border-stone-900 pt-4">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach… (Enter to send)"
            rows={2}
            disabled={isStreaming}
            className="flex-1 resize-none rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1A1A1A] px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-40 transition shrink-0"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
