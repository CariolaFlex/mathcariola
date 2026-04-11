/**
 * MathDisplay — Render LaTeX en modo bloque (display mode).
 *
 * Uso: resultados de cálculos, pasos de solución, teoremas.
 * - Centrado horizontalmente
 * - overflow-x scroll en mobile para expresiones largas
 * - Tamaño visual más grande (displayMode: true en KaTeX)
 * - Server Component — sin estado, sin 'use client'
 */

import { KaTeXRenderer } from '@/components/math/KaTeXRenderer'
import { cn } from '@/lib/utils/cn'

// ─── Types ───────────────────────────────────────────────────────────────────
interface MathDisplayProps {
  /** Expresión LaTeX a mostrar */
  expression: string
  /** Etiqueta accesible adicional */
  label?: string
  /** Clases CSS adicionales */
  className?: string
  /** Número de paso (para listas step-by-step) */
  step?: number
  /** Justificación del paso (ej: "Aplicar regla de la cadena") */
  justification?: string
}

// ─── Component ───────────────────────────────────────────────────────────────
export function MathDisplay({
  expression,
  label,
  className,
  step,
  justification,
}: MathDisplayProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[--border] bg-[--surface-raised] px-4 py-3',
        className
      )}
      role="math"
      aria-label={label ?? `Expresión matemática: ${expression}`}
    >
      {/* Número de paso opcional */}
      {step !== undefined && (
        <div className="mb-1 flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
            {step}
          </span>
          {justification && (
            <span className="text-xs text-[--text-muted]">{justification}</span>
          )}
        </div>
      )}

      {/* Expresión matemática centrada con scroll en mobile */}
      <div className="overflow-x-auto">
        <KaTeXRenderer
          expression={expression}
          displayMode
          className="text-center"
        />
      </div>
    </div>
  )
}
