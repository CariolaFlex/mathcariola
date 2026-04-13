'use client'

/**
 * AnalysisPanel — Displays analysis results for a single function.
 *
 * Sections:
 *   - Zeros (raíces)
 *   - Extrema (máximos y mínimos)
 *   - Y-intercept
 *   - Vertical asymptotes
 *   - Approximate range
 *
 * All values rendered as LaTeX via KaTeXRenderer.
 */

import { KaTeXRenderer } from '@/components/math/KaTeXRenderer'
import { cn } from '@/lib/utils/cn'
import type { AnalysisResult, Extremum, FunctionDefinition } from '@/types/graph'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format a number for display: round to 4 sig figs, strip trailing zeros */
function fmt(n: number): string {
  if (!isFinite(n)) return '\\infty'
  const r = parseFloat(n.toPrecision(4))
  return String(r)
}

function fmtCoord(x: number, y: number): string {
  return `(${fmt(x)},\\;${fmt(y)})`
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({
  title,
  color,
  children,
}: {
  title: string
  color: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ background: color }}
        />
        <span className="text-xs font-semibold uppercase tracking-wide text-[--text-secondary]">
          {title}
        </span>
      </div>
      <div className="pl-4 flex flex-col gap-1">{children}</div>
    </div>
  )
}

function MathRow({ latex }: { latex: string }) {
  return (
    <div className="text-sm">
      <KaTeXRenderer expression={latex} displayMode={false} />
    </div>
  )
}

function EmptyRow() {
  return <p className="text-xs text-[--text-secondary] italic">—</p>
}

// ---------------------------------------------------------------------------
// Extremum row
// ---------------------------------------------------------------------------

const EXTREMUM_LABEL: Record<Extremum['type'], string> = {
  max: '\\uparrow\\text{Máx}',
  min: '\\downarrow\\text{Mín}',
  inflection: '\\diamond\\text{ Infl.}',
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface AnalysisPanelProps {
  def: FunctionDefinition
  result: AnalysisResult
  className?: string
}

export function AnalysisPanel({ def, result, className }: AnalysisPanelProps) {
  const { zeros, extrema, yIntercept, verticalAsymptotes, rangeMin, rangeMax } = result

  return (
    <div
      className={cn(
        'rounded-xl border border-[--border] bg-[--surface-secondary] p-4 flex flex-col gap-4',
        className
      )}
    >
      {/* Header: function color + latex */}
      <div className="flex items-center gap-2">
        <span
          className="h-3 w-3 rounded-full shrink-0 ring-1 ring-[--border]"
          style={{ background: def.color }}
        />
        <div className="text-sm font-medium text-[--text-primary] truncate max-w-[200px]">
          <KaTeXRenderer expression={`f(x) = ${def.latex}`} displayMode={false} />
        </div>
      </div>

      {/* Zeros */}
      <Section title="Ceros / Raíces" color={def.color}>
        {zeros.length === 0 ? (
          <EmptyRow />
        ) : (
          zeros.slice(0, 6).map((x) => (
            <MathRow key={x} latex={`x = ${fmt(x)}`} />
          ))
        )}
        {zeros.length > 6 && (
          <p className="text-xs text-[--text-secondary]">y {zeros.length - 6} más…</p>
        )}
      </Section>

      {/* Y-intercept */}
      <Section title="Intercepto en y" color={def.color}>
        {yIntercept === null ? (
          <EmptyRow />
        ) : (
          <MathRow latex={fmtCoord(0, yIntercept)} />
        )}
      </Section>

      {/* Extrema */}
      <Section title="Extremos" color={def.color}>
        {extrema.length === 0 ? (
          <EmptyRow />
        ) : (
          extrema.slice(0, 6).map((e) => (
            <MathRow
              key={`${e.type}-${e.x}`}
              latex={`${EXTREMUM_LABEL[e.type]}\\;${fmtCoord(e.x, e.y)}`}
            />
          ))
        )}
      </Section>

      {/* Vertical asymptotes */}
      {verticalAsymptotes.length > 0 && (
        <Section title="Asíntotas verticales" color={def.color}>
          {verticalAsymptotes.slice(0, 4).map((xa) => (
            <MathRow key={xa} latex={`x = ${fmt(xa)}`} />
          ))}
        </Section>
      )}

      {/* Approximate range */}
      <Section title="Recorrido (aprox.)" color={def.color}>
        <MathRow latex={`[${fmt(rangeMin)},\\;${fmt(rangeMax)}]`} />
      </Section>
    </div>
  )
}
