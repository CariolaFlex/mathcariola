/**
 * MathInline — Render LaTeX inline en texto de prosa.
 *
 * Uso: párrafos explicativos, labels de UI, tooltips.
 * - Sin interrupción del flujo de texto
 * - Tamaño adaptado a la fuente circundante
 * - Server Component — sin estado, sin 'use client'
 */

import { KaTeXRenderer } from '@/components/math/KaTeXRenderer'
import { cn } from '@/lib/utils/cn'

// ─── Types ───────────────────────────────────────────────────────────────────
interface MathInlineProps {
  /** Expresión LaTeX a mostrar inline */
  expression: string
  /** Clases CSS adicionales */
  className?: string
}

// ─── Component ───────────────────────────────────────────────────────────────
export function MathInline({ expression, className }: MathInlineProps) {
  return (
    <KaTeXRenderer
      expression={expression}
      displayMode={false}
      className={cn('inline align-middle', className)}
    />
  )
}
