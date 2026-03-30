'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { useCreateExpense } from '@/hooks/useExpenses'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@habit-tracker/types'

// ─── Auto-categorisatie ──────────────────────────────────────

const CATEGORY_RULES: { pattern: RegExp; category: ExpenseCategory }[] = [
  { pattern: /albert heijn|jumbo|lidl|aldi|plus supermarkt|dirk|ah |spar /i, category: 'boodschappen' },
  { pattern: /ns |ov-chip|shell|esso|bp |q8|total energy|parkeer|parking|sixt|uber|bolt taxi/i, category: 'transport' },
  { pattern: /netflix|spotify|apple |disney|videoland|amazon prime|ziggo|kpn|t-mobile|tele2|hollandsnieuwe/i, category: 'abonnementen' },
  { pattern: /zorgverzeker|apotheek|tandarts|huisarts|fysiotherap|ziekenhuis|cz |vgz |dsw |menzis|achmea/i, category: 'gezondheid' },
  { pattern: /restaurant|café|cafe |pizza|sushi|mcdonalds|kfc|burger king|subway|starbucks|domino|thuisbezorgd|deliveroo|uber eat/i, category: 'horeca' },
  { pattern: /zara|h&m|zalando|primark|ikea|action |hema |bijenkorf|coolblue|bol\.com|wehkamp/i, category: 'shopping' },
  { pattern: /huur|hypotheek|energie|nuon|vattenfall|eneco|essent|water |woningcorpor|vve |internet|glasvezel/i, category: 'wonen' },
  { pattern: /school|universit|cursus|boek|udemy|coursera|linkedin learning|opleiding/i, category: 'opleiding' },
  { pattern: /cinema|bioscoop|pathé|vue |theater|concert|museum|netflix|spotify|youtube/i, category: 'entertainment' },
]

function guessCategory(merchant: string, description: string): ExpenseCategory {
  const text = `${merchant} ${description}`.toLowerCase()
  for (const { pattern, category } of CATEGORY_RULES) {
    if (pattern.test(text)) return category
  }
  return 'overig'
}

// ─── CSV parsing ─────────────────────────────────────────────

interface RaboRow {
  date: string            // YYYY-MM-DD
  amount: number          // altijd positief (alleen uitgaven)
  merchant: string
  description: string
}

function parseRabobankCsv(text: string): RaboRow[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    delimiter: ',',
  })

  const rows: RaboRow[] = []

  for (const row of result.data) {
    // Kolommen Rabobank CSV-export
    const dateRaw    = row['Datum'] ?? row['Date'] ?? ''
    const amountRaw  = row['Bedrag'] ?? row['Amount'] ?? ''
    const merchant   = row['Naam tegenpartij'] ?? row['Name'] ?? ''
    const desc1      = row['Omschrijving-1'] ?? row['Description'] ?? ''
    const desc2      = row['Omschrijving-2'] ?? ''
    const desc3      = row['Omschrijving-3'] ?? ''

    if (!dateRaw || !amountRaw) continue

    // Bedrag: komma als decimaalscheider (nl-NL), negatief = uitgave
    const amountNum = parseFloat(amountRaw.replace(',', '.'))
    if (isNaN(amountNum) || amountNum >= 0) continue // Sla inkomsten over

    rows.push({
      date: dateRaw,
      amount: Math.abs(amountNum),
      merchant: merchant.trim(),
      description: [desc1, desc2, desc3].filter(Boolean).join(' ').trim(),
    })
  }

  return rows
}

// ─── Import rij ──────────────────────────────────────────────

interface ImportRow extends RaboRow {
  id: number
  category: ExpenseCategory
  selected: boolean
}

// ─── Component ───────────────────────────────────────────────

export function ExpenseImport() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState<number | null>(null)

  const createExpense = useCreateExpense()

  const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })

  function handleFile(file: File) {
    setError(null)
    setImported(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      try {
        const parsed = parseRabobankCsv(text)
        if (parsed.length === 0) {
          setError('Geen uitgaven gevonden in dit bestand. Controleer of het een Rabobank CSV is.')
          return
        }
        setRows(
          parsed.map((r, i) => ({
            ...r,
            id: i,
            category: guessCategory(r.merchant, r.description),
            selected: true,
          }))
        )
      } catch {
        setError('Fout bij het lezen van het bestand. Probeer een geldig Rabobank CSV-bestand.')
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function setRowCategory(id: number, cat: ExpenseCategory) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, category: cat } : r)))
  }

  function toggleRow(id: number) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)))
  }

  function toggleAll() {
    const allSelected = rows.every((r) => r.selected)
    setRows((prev) => prev.map((r) => ({ ...r, selected: !allSelected })))
  }

  async function handleImport() {
    const toImport = rows.filter((r) => r.selected)
    if (toImport.length === 0) return
    setImporting(true)
    let count = 0
    for (const row of toImport) {
      try {
        await createExpense.mutateAsync({
          amount: row.amount,
          category: row.category,
          description: row.merchant || row.description || null,
          date: row.date,
        })
        count++
      } catch {
        // ga door met de rest
      }
    }
    setImporting(false)
    setImported(count)
    setRows([])
  }

  const selectedCount = rows.filter((r) => r.selected).length

  if (imported !== null) {
    return (
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-8 py-16 flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 rounded-2xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-2xl">✓</div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-stone-900 dark:text-white">
            {imported} uitgave{imported !== 1 ? 'n' : ''} geïmporteerd
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Ze zijn nu zichtbaar in je Uitgaven-overzicht.
          </p>
        </div>
        <button
          onClick={() => { setImported(null); setRows([]) }}
          className="rounded-xl border border-stone-200 dark:border-stone-800 px-5 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition"
        >
          Nog een bestand importeren
        </button>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        {/* Uitleg */}
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] p-5 space-y-3">
          <p className="text-sm font-semibold text-stone-900 dark:text-white">Hoe download je je Rabobank transacties?</p>
          <ol className="space-y-1.5 text-xs text-stone-500 dark:text-stone-400 list-decimal list-inside">
            <li>Open de <strong className="text-stone-700 dark:text-stone-300">Rabo app</strong> of ga naar <strong className="text-stone-700 dark:text-stone-300">internetbankieren</strong></li>
            <li>Ga naar je betaalrekening → <strong className="text-stone-700 dark:text-stone-300">Transacties</strong></li>
            <li>Kies <strong className="text-stone-700 dark:text-stone-300">Downloaden / Exporteren</strong></li>
            <li>Selecteer <strong className="text-stone-700 dark:text-stone-300">CSV-formaat</strong> en de gewenste periode</li>
            <li>Upload het bestand hieronder</li>
          </ol>
        </div>

        {/* Upload area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] px-8 py-16 flex flex-col items-center gap-4 text-center cursor-pointer hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900/30 transition"
        >
          <div className="h-12 w-12 rounded-2xl bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-2xl select-none">
            📂
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Sleep je CSV hier naartoe
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500">
              of klik om een bestand te kiezen
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          <strong className="text-stone-900 dark:text-white">{rows.length}</strong> uitgaven gevonden —{' '}
          pas de categorieën aan en importeer
        </p>
        <button
          onClick={() => setRows([])}
          className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition"
        >
          Ander bestand
        </button>
      </div>

      {/* Tabel */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0F0F0F] overflow-hidden">
        {/* Tabel-header */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-stone-100 dark:border-stone-900 bg-stone-50 dark:bg-stone-900/50">
          <input
            type="checkbox"
            checked={rows.every((r) => r.selected)}
            onChange={toggleAll}
            className="h-4 w-4 rounded accent-stone-900 dark:accent-white"
          />
          <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wide flex-1">Merchant / omschrijving</span>
          <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wide w-16 text-right">Bedrag</span>
          <span className="text-[10px] font-medium text-stone-400 uppercase tracking-wide w-36">Categorie</span>
        </div>

        {/* Rijen */}
        <div className="divide-y divide-stone-50 dark:divide-stone-900 max-h-[480px] overflow-y-auto">
          {rows.map((row) => (
            <label
              key={row.id}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900/50 transition"
            >
              <input
                type="checkbox"
                checked={row.selected}
                onChange={() => toggleRow(row.id)}
                className="h-4 w-4 rounded accent-stone-900 dark:accent-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-stone-950 dark:text-white truncate">
                  {row.merchant || '—'}
                </p>
                {row.description && (
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate">{row.description}</p>
                )}
                <p className="text-[10px] text-stone-300 dark:text-stone-700">{row.date}</p>
              </div>
              <span className="text-xs font-medium text-stone-900 dark:text-white w-16 text-right shrink-0">
                {fmt.format(row.amount)}
              </span>
              <select
                value={row.category}
                onChange={(e) => setRowCategory(row.id, e.target.value as ExpenseCategory)}
                onClick={(e) => e.stopPropagation()}
                disabled={!row.selected}
                className="text-[11px] rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 px-2 py-1.5 w-36 disabled:opacity-40 transition"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-400 dark:text-stone-500">
          {selectedCount} van {rows.length} geselecteerd
        </p>
        <button
          onClick={handleImport}
          disabled={selectedCount === 0 || importing}
          className="rounded-xl bg-stone-950 dark:bg-white text-white dark:text-stone-950 px-5 py-2.5 text-sm font-semibold disabled:opacity-40 transition"
        >
          {importing ? 'Importeren…' : `${selectedCount} uitgave${selectedCount !== 1 ? 'n' : ''} importeren`}
        </button>
      </div>
    </div>
  )
}
