'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { createLowlight } from 'lowlight'
import { useSupabase } from '@/hooks/useAuth'

const lowlight = createLowlight()

interface RichTextEditorProps {
  content: string | null
  initialText?: string | null
  onChange: (json: string) => void
  placeholder?: string
  editable?: boolean
  userId: string
}

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`rounded-md px-1.5 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-white'
          : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-3.5 bg-stone-200 dark:bg-stone-700 mx-0.5 self-center shrink-0" />
}

// ─── Custom Bubble Menu ───────────────────────────────────────────────────────

function BubbleButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-1.5 py-1 text-xs font-medium rounded transition-colors ${
        active
          ? 'bg-white/20 text-white'
          : 'text-white/75 hover:bg-white/15 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function CustomBubbleMenu({ editor, onOpenLink }: { editor: Editor; onOpenLink: () => void }) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    function update() {
      const { state, view } = editor
      const { from, to, empty } = state.selection
      if (empty || !view.hasFocus()) { setCoords(null); return }
      const s = view.coordsAtPos(from)
      const e = view.coordsAtPos(Math.min(to, state.doc.content.size - 1))
      setCoords({ left: (s.left + e.left) / 2, top: Math.min(s.top, e.top) })
    }
    function hide() { setCoords(null) }

    editor.on('selectionUpdate', update)
    editor.on('transaction', update)
    editor.on('blur', hide)
    return () => {
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
      editor.off('blur', hide)
    }
  }, [editor])

  if (!coords) return null

  const menu = (
    <div
      style={{
        position: 'fixed',
        top: coords.top - 8,
        left: coords.left,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
      }}
      onMouseDown={(e) => e.preventDefault()}
      className="flex items-center gap-0.5 rounded-lg bg-stone-900 border border-stone-700/80 px-1.5 py-1 shadow-2xl"
    >
      <BubbleButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Vet (Ctrl+B)">
        <strong>B</strong>
      </BubbleButton>
      <BubbleButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Cursief (Ctrl+I)">
        <em>I</em>
      </BubbleButton>
      <BubbleButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Onderstrepen">
        <span className="underline">U</span>
      </BubbleButton>
      <BubbleButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Doorhalen">
        <span className="line-through">S</span>
      </BubbleButton>
      <div className="w-px h-3 bg-white/20 mx-0.5 self-center" />
      <BubbleButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3,2 1,6 3,10" /><polyline points="9,2 11,6 9,10" />
        </svg>
      </BubbleButton>
      <BubbleButton onClick={onOpenLink} active={editor.isActive('link')} title="Link">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 7.5a3 3 0 004.24 0l1.5-1.5a3 3 0 00-4.24-4.24L5 2.76" />
          <path d="M7.5 4.5a3 3 0 00-4.24 0L1.76 6a3 3 0 004.24 4.24L7 9.24" />
        </svg>
      </BubbleButton>
    </div>
  )

  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(menu, document.body)
    : null
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RichTextEditor({
  content,
  initialText,
  onChange,
  placeholder = 'Voeg een beschrijving toe...',
  editable = true,
  userId,
}: RichTextEditorProps) {
  const supabase = useSupabase()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkValue, setLinkValue] = useState('')
  const linkInputRef = useRef<HTMLInputElement>(null)

  function getInitialContent() {
    if (content) {
      try { return JSON.parse(content) } catch { /* val door */ }
    }
    if (initialText) {
      return {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: initialText }] }],
      }
    }
    return undefined
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: getInitialContent(),
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(JSON.stringify(editor.getJSON()))
    },
  })

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage
      .from('task-attachments')
      .upload(path, file, { contentType: file.type })
    if (error) { console.error('Upload mislukt:', error); return }
    const { data } = supabase.storage.from('task-attachments').getPublicUrl(path)
    editor.chain().focus().setImage({ src: data.publicUrl }).run()
  }, [editor, supabase, userId])

  function openLinkEditor() {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    setLinkValue(prev ?? '')
    setShowLinkInput(true)
    setTimeout(() => linkInputRef.current?.focus(), 0)
  }

  function commitLink() {
    if (!editor) return
    if (linkValue.trim() === '') {
      editor.chain().focus().unsetLink().run()
    } else {
      editor.chain().focus().setLink({ href: linkValue.trim(), target: '_blank' }).run()
    }
    setShowLinkInput(false)
    setLinkValue('')
  }

  function handleInsertTable() {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  if (!editor) return null

  return (
    <div className="flex flex-col gap-0">
      {editable && (
        <>
          {/* Zwevend bubble menu bij tekstselectie */}
          <CustomBubbleMenu editor={editor} onOpenLink={openLinkEditor} />

          {/* Toolbar — blokelementen */}
          <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 rounded-t-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/40">
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Kop 1">H1</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Kop 2">H2</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Kop 3">H3</ToolbarButton>

            <Divider />

            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Opsommingslijst">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="2" cy="3.5" r="0.7" fill="currentColor" stroke="none" />
                <line x1="5" y1="3.5" x2="12" y2="3.5" />
                <circle cx="2" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
                <line x1="5" y1="6.5" x2="12" y2="6.5" />
                <circle cx="2" cy="9.5" r="0.7" fill="currentColor" stroke="none" />
                <line x1="5" y1="9.5" x2="12" y2="9.5" />
              </svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Genummerde lijst">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" strokeLinecap="round">
                <text x="0.5" y="4.5" fontSize="4" fill="currentColor" fontFamily="monospace">1.</text>
                <line x1="5" y1="3.5" x2="12" y2="3.5" stroke="currentColor" strokeWidth="1.5" />
                <text x="0.5" y="8" fontSize="4" fill="currentColor" fontFamily="monospace">2.</text>
                <line x1="5" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" />
                <text x="0.5" y="11.5" fontSize="4" fill="currentColor" fontFamily="monospace">3.</text>
                <line x1="5" y1="10.5" x2="12" y2="10.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Taaklist">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="1.5" width="4" height="4" rx="0.8" />
                <path d="M2 3.5l1 1 2-2" />
                <line x1="7" y1="3.5" x2="12" y2="3.5" />
                <rect x="1" y="7.5" width="4" height="4" rx="0.8" />
                <line x1="7" y1="9.5" x2="12" y2="9.5" />
              </svg>
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citaat">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor">
                <path d="M1.5 3C1.5 2.45 1.95 2 2.5 2h1.25C4.43 2 5 2.57 5 3.25v1.5C5 6.02 4.02 7.23 2.72 7.6L2.5 7.67V6.75H2.75A1.25 1.25 0 004 5.5V5H2.5C1.95 5 1.5 4.55 1.5 4V3zM7 3c0-.55.45-1 1-1h1.25C9.93 2 10.5 2.57 10.5 3.25v1.5c0 1.27-.98 2.48-2.28 2.85L8 7.67V6.75h.25A1.25 1.25 0 009.5 5.5V5H8c-.55 0-1-.45-1-1V3z" />
              </svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code blok">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4,3 1,6.5 4,10" /><polyline points="9,3 12,6.5 9,10" />
              </svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontale lijn">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="1" y1="6.5" x2="12" y2="6.5" />
              </svg>
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={openLinkEditor} active={editor.isActive('link')} title="Link invoegen">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 8a3 3 0 004.24 0l1.5-1.5a3 3 0 00-4.24-4.24L5.5 3.26" />
                <path d="M8 5a3 3 0 00-4.24 0L2.26 6.5a3 3 0 004.24 4.24L7.5 9.74" />
              </svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => fileInputRef.current?.click()} active={false} title="Afbeelding uploaden">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="2" width="11" height="9" rx="1.5" />
                <circle cx="4.5" cy="5" r="1" />
                <path d="M1 9.5l3-3 2 2 2.5-2.5 3.5 3.5" />
              </svg>
            </ToolbarButton>
            <ToolbarButton onClick={handleInsertTable} active={editor.isActive('table')} title="Tabel invoegen">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="1" y="1" width="11" height="11" rx="1" />
                <line x1="1" y1="4.5" x2="12" y2="4.5" />
                <line x1="1" y1="8.5" x2="12" y2="8.5" />
                <line x1="4.5" y1="1" x2="4.5" y2="12" />
                <line x1="8.5" y1="1" x2="8.5" y2="12" />
              </svg>
            </ToolbarButton>

            <Divider />

            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} title="Ongedaan maken (Ctrl+Z)">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4.5H7.5a3.5 3.5 0 010 7H4" /><polyline points="2,2 2,4.5 4.5,4.5" />
              </svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} title="Opnieuw (Ctrl+Y)">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4.5H5.5a3.5 3.5 0 000 7H9" /><polyline points="11,2 11,4.5 8.5,4.5" />
              </svg>
            </ToolbarButton>
          </div>

          {/* Inline link-editor */}
          {showLinkInput && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-x border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 shrink-0">
                <path d="M4.5 7.5a3 3 0 004.24 0l1.5-1.5a3 3 0 00-4.24-4.24L5 2.76" />
                <path d="M7.5 4.5a3 3 0 00-4.24 0L1.76 6a3 3 0 004.24 4.24L7 9.24" />
              </svg>
              <input
                ref={linkInputRef}
                type="url"
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); commitLink() }
                  if (e.key === 'Escape') { setShowLinkInput(false); setLinkValue('') }
                }}
                placeholder="https://..."
                className="flex-1 bg-transparent text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 outline-none"
              />
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); commitLink() }}
                className="text-[10px] font-medium text-accent hover:text-accent/80 transition"
              >
                {linkValue.trim() ? 'Opslaan' : 'Verwijderen'}
              </button>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setShowLinkInput(false); setLinkValue('') }}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M1 1l8 8M9 1L1 9" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {/* Editor inhoud */}
      <EditorContent
        editor={editor}
        className={`rich-editor min-h-[100px] px-3 py-2.5 text-sm text-stone-800 dark:text-stone-200 focus-within:outline-none ${
          editable
            ? 'border border-t-0 border-stone-200 dark:border-stone-800 rounded-b-xl bg-white dark:bg-[#0F0F0F]'
            : ''
        }`}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageUpload(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
