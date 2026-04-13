'use client'

/**
 * ExamplesPanel — Function library browser + PNG export + URL sharing.
 *
 * Features:
 *   - Browse 20 examples in 5 categories
 *   - One-click to load into the 2D grapher (via onSelect callback)
 *   - Export the current graph as PNG
 *   - Copy shareable URL encoding the current expression
 *
 * Designed to be embedded inside a tab — receives the current expression
 * and an onSelect handler from the parent (FuncionesModuleTabs / FuncionesAdvancedTabs).
 */

import { useState, useCallback } from 'react'
import {
  FUNCTION_EXAMPLES,
  EXAMPLES_BY_CATEGORY,
  CATEGORY_LABELS,
  type FunctionCategory,
  type FunctionExample,
} from '@/constants/functionExamples'
import { exportCanvasToPNG, copyShareURL } from '@/lib/utils/exportShare'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ExamplesPanelProps {
  /** Currently active expression (for share URL) */
  currentExpression?: string
  /** Called when user clicks an example — parent loads it into the grapher */
  onSelect?: (example: FunctionExample) => void
}

// ---------------------------------------------------------------------------
// Category tab bar
// ---------------------------------------------------------------------------

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as FunctionCategory[]

// ---------------------------------------------------------------------------
// ExamplesPanel
// ---------------------------------------------------------------------------

export function ExamplesPanel({ currentExpression = '', onSelect }: ExamplesPanelProps) {
  const [activeCategory, setActiveCategory] = useState<FunctionCategory | 'all'>('all')
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'error'>('idle')
  const [search, setSearch] = useState('')

  // Filter examples
  const examples = (() => {
    let base =
      activeCategory === 'all'
        ? FUNCTION_EXAMPLES
        : EXAMPLES_BY_CATEGORY[activeCategory]

    if (search.trim()) {
      const q = search.toLowerCase()
      base = base.filter(
        (e) =>
          e.label.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.display.toLowerCase().includes(q)
      )
    }
    return base
  })()

  // Share URL
  const handleShare = useCallback(async () => {
    const expr = currentExpression.trim() || 'x^2'
    try {
      await copyShareURL([expr])
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2500)
    } catch {
      setShareStatus('error')
      setTimeout(() => setShareStatus('idle'), 2500)
    }
  }, [currentExpression])

  // PNG export
  const handleExport = useCallback(async () => {
    setExportStatus('exporting')
    try {
      await exportCanvasToPNG(
        '.mafs-canvas svg, svg[class*="mafs"]',
        'grafica-mathcariola'
      )
      setExportStatus('idle')
    } catch {
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 3000)
    }
  }, [])

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header + action buttons ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-[--text-primary]">
            Biblioteca de funciones
          </h3>
          <p className="text-xs text-[--text-secondary] mt-0.5">
            {FUNCTION_EXAMPLES.length} ejemplos — haz clic en uno para cargarlo en la graficadora
          </p>
        </div>

        {/* Export + Share */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleExport}
            disabled={exportStatus === 'exporting'}
            className="flex items-center gap-1.5 rounded-lg border border-[--border] px-3 py-2 text-xs font-medium text-[--text-secondary] hover:border-indigo-400 hover:text-indigo-400 transition-colors disabled:opacity-50"
          >
            <span>{exportStatus === 'exporting' ? '⏳' : '⬇'}</span>
            {exportStatus === 'error' ? 'Error al exportar' : 'Exportar PNG'}
          </button>

          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              shareStatus === 'copied'
                ? 'bg-emerald-600 text-white'
                : shareStatus === 'error'
                ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            <span>{shareStatus === 'copied' ? '✓' : '🔗'}</span>
            {shareStatus === 'copied'
              ? '¡URL copiada!'
              : shareStatus === 'error'
              ? 'Error al copiar'
              : 'Compartir URL'}
          </button>
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────── */}
      <input
        type="search"
        placeholder="Buscar por nombre o descripción…"
        className="w-full rounded-lg border border-[--border] bg-[--surface-secondary] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ── Category filter tabs ──────────────────────────────────────── */}
      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-[--surface-secondary] text-[--text-secondary] hover:text-[--text-primary]'
          }`}
        >
          Todas ({FUNCTION_EXAMPLES.length})
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-[--surface-secondary] text-[--text-secondary] hover:text-[--text-primary]'
            }`}
          >
            {CATEGORY_LABELS[cat]} ({EXAMPLES_BY_CATEGORY[cat].length})
          </button>
        ))}
      </div>

      {/* ── Example cards grid ───────────────────────────────────────── */}
      {examples.length === 0 ? (
        <div className="py-8 text-center text-sm text-[--text-secondary]">
          No se encontraron funciones con ese criterio de búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {examples.map((ex) => (
            <ExampleCard key={ex.id} example={ex} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ExampleCard
// ---------------------------------------------------------------------------

interface ExampleCardProps {
  example: FunctionExample
  onSelect?: (example: FunctionExample) => void
}

const CATEGORY_COLORS: Record<FunctionCategory, string> = {
  polynomial: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  trigonometric: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  exponential: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  logarithmic: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  rational: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
}

function ExampleCard({ example, onSelect }: ExampleCardProps) {
  return (
    <button
      onClick={() => onSelect?.(example)}
      className="text-left rounded-xl border border-[--border] bg-[--surface-secondary] p-4 hover:border-indigo-400 hover:bg-[--surface-primary] transition-all group"
    >
      {/* Category badge */}
      <span
        className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium mb-2 ${CATEGORY_COLORS[example.category]}`}
      >
        {CATEGORY_LABELS[example.category]}
      </span>

      {/* Label + display */}
      <p className="font-semibold text-sm text-[--text-primary] group-hover:text-indigo-400 transition-colors">
        {example.label}
      </p>
      <p className="font-mono text-xs text-indigo-300 mt-0.5 mb-2">{example.display}</p>

      {/* Description */}
      <p className="text-xs text-[--text-secondary] leading-relaxed line-clamp-2">
        {example.description}
      </p>

      {/* Domain */}
      <p className="mt-2 text-[10px] text-[--text-secondary]">
        <span className="font-medium">Dom:</span> {example.domain}
      </p>

      {/* Source */}
      {example.source && (
        <p className="mt-0.5 text-[10px] text-[--text-secondary] opacity-60">{example.source}</p>
      )}

      {/* CTA */}
      <p className="mt-3 text-[10px] font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
        Cargar en la graficadora →
      </p>
    </button>
  )
}
