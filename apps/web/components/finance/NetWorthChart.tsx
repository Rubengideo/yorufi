'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { NetWorthDataPoint } from '@habit-tracker/types'

interface NetWorthChartProps {
  data: NetWorthDataPoint[]
  currency?: string
}

interface HoverState {
  x: number
  y: number
  point: NetWorthDataPoint
}

/** Cubic bezier curve path — vloeiendere lijn dan polyline */
function buildCurvePath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  const cmds: string[] = [`M ${points[0]!.x},${points[0]!.y}`]
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!
    const curr = points[i]!
    const cpX = (prev.x + curr.x) / 2
    cmds.push(`C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`)
  }
  return cmds.join(' ')
}

export function NetWorthChart({ data, currency = 'EUR' }: NetWorthChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [width, setWidth] = useState(600)
  const [hover, setHover] = useState<HoverState | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const height = 120
  const padX = 8
  const padY = 12

  const values = data.map((d) => d.total)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range  = maxVal - minVal || 1

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * (width - padX * 2),
    y: padY + (1 - (d.total - minVal) / range) * (height - padY * 2),
    ...d,
  }))

  const curvePath = buildCurvePath(points)

  // Area fill path (onder de curve)
  const areaPath = [
    curvePath,
    `L ${points[points.length - 1]!.x},${height - padY}`,
    `L ${points[0]!.x},${height - padY}`,
    'Z',
  ].join(' ')

  const fmt = new Intl.NumberFormat('nl-NL', { style: 'currency', currency, maximumFractionDigits: 0 })
  const dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short' })

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left

    // Zoek het dichtstbijzijnde punt op basis van x-positie
    let closest = points[0]!
    let minDist = Math.abs(points[0]!.x - mouseX)
    for (const p of points) {
      const dist = Math.abs(p.x - mouseX)
      if (dist < minDist) {
        minDist = dist
        closest = p
      }
    }
    setHover({ x: closest.x, y: closest.y, point: closest })
  }, [points])

  const handleMouseLeave = useCallback(() => setHover(null), [])

  if (data.length < 2) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-stone-400 dark:text-stone-600">
        Voeg meer saldo-updates toe om de grafiek te zien
      </div>
    )
  }

  // Tooltip positie: zorg dat ie niet buiten het scherm valt
  const tooltipLeft = hover
    ? hover.x < width / 2
      ? hover.x + 10
      : hover.x - 110
    : 0

  return (
    <div ref={containerRef} className="w-full relative">
      {/* Hover tooltip */}
      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 shadow-lg text-xs"
          style={{ left: tooltipLeft, top: Math.max(0, hover.y - 52) }}
        >
          <p className="text-stone-400 dark:text-stone-500">
            {dateFmt.format(new Date(hover.point.date))}
          </p>
          <p className="font-semibold text-stone-950 dark:text-white mt-0.5">
            {fmt.format(hover.point.total)}
          </p>
        </div>
      )}

      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Bezier curve */}
        <path
          d={curvePath}
          fill="none"
          stroke="#6C63FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover: verticale stippellijn */}
        {hover && (
          <line
            x1={hover.x}
            y1={padY}
            x2={hover.x}
            y2={height - padY}
            stroke="#6C63FF"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.5"
          />
        )}

        {/* Hover: punt op de lijn */}
        {hover && (
          <circle
            cx={hover.x}
            cy={hover.y}
            r="4"
            fill="#6C63FF"
            stroke="white"
            strokeWidth="2"
          />
        )}

        {/* Labels: begin + einde datum */}
        <text x={points[0]!.x} y={height} fontSize="10" fill="currentColor" className="text-stone-400" textAnchor="start">
          {data[0]!.date.slice(5)}
        </text>
        <text x={points[points.length - 1]!.x} y={height} fontSize="10" fill="currentColor" className="text-stone-400" textAnchor="end">
          {data[data.length - 1]!.date.slice(5)}
        </text>

        {/* Min + max waarde labels */}
        <text x={padX} y={height - padY - 2} fontSize="10" fill="currentColor" className="text-stone-400" textAnchor="start" opacity="0.6">
          {fmt.format(minVal)}
        </text>
        <text x={width / 2} y={padY - 2} fontSize="10" fill="currentColor" className="text-stone-400" textAnchor="middle">
          {fmt.format(maxVal)}
        </text>
      </svg>
    </div>
  )
}
