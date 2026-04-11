'use client'

/**
 * MathInputPanel — Panel integrado MathField → KaTeX en tiempo real.
 *
 * Flujo: usuario escribe en MathField → onChange actualiza latexValue →
 * KaTeXRenderer re-renderiza el resultado en el cliente.
 *
 * NOTA: KaTeXRenderer es Server Component pero puede usarse dentro de
 * un Client Component — React los compone correctamente.
 */

import { useState } from 'react'
import { MathField } from '@/components/math/MathField'
import { KaTeXRenderer } from '@/components/math/KaTeXRenderer'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

// ─── Expresiones de ejemplo ───────────────────────────────────────────────────
const EXAMPLES = [
  { label: 'Integral',   latex: '\\int_0^{\\infty} e^{-x^2}\\,\\d x = \\frac{\\sqrt{\\pi}}{2}' },
  { label: 'Matriz',     latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: 'Sumatoria',  latex: '\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}' },
  { label: 'Derivada',   latex: "\\frac{d}{dx}\\left[x^n\\right] = nx^{n-1}" },
  { label: 'Límite',     latex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1' },
  { label: 'Raíz',       latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
]

// ─── Component ───────────────────────────────────────────────────────────────
export function MathInputPanel() {
  const [latex, setLatex] = useState('\\int_0^{\\pi} \\sin(x)\\,\\d x = 2')

  return (
    <div className="flex flex-col gap-6">
      {/* Input section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[--text-muted]">
            Entrada matemática
          </h2>
          <Badge variant="primary">MathLive</Badge>
        </div>

        {/* MathField wrapper con estilos sincronizados con el tema */}
        <div
          className={cn(
            'rounded-xl border border-[--math-field-border] bg-[--math-field-background]',
            'shadow-sm transition-shadow focus-within:shadow-md',
            'focus-within:border-[--math-field-focus-ring]',
            'focus-within:ring-2 focus-within:ring-[--math-field-focus-ring]/20'
          )}
        >
          <MathField
            value={latex}
            onChange={setLatex}
            placeholder="Escribe una expresión matemática..."
            className="min-h-[3.5rem] w-full px-4 py-3 [&_math-field]:w-full"
          />
        </div>

        {/* LaTeX string raw */}
        <div className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0 text-xs font-medium text-[--text-muted]">LaTeX:</span>
          <code className="break-all rounded bg-[--surface-overlay] px-2 py-0.5 font-mono text-xs text-[--text-secondary]">
            {latex || <span className="text-[--text-muted] italic">vacío</span>}
          </code>
        </div>
      </div>

      {/* Output section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[--text-muted]">
            Render KaTeX
          </h2>
          <Badge variant="success">en tiempo real</Badge>
        </div>

        <div className="min-h-[5rem] overflow-x-auto rounded-xl border border-[--border] bg-[--surface-raised] p-4">
          {latex.trim() ? (
            <KaTeXRenderer
              expression={latex}
              displayMode
              className="text-[--text-primary]"
            />
          ) : (
            <p className="text-center text-sm italic text-[--text-muted]">
              Escribe una expresión para verla renderizada aquí
            </p>
          )}
        </div>
      </div>

      {/* Ejemplos rápidos */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[--text-muted]">
          Ejemplos de ingeniería
        </h2>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => setLatex(ex.latex)}
              className={cn(
                'rounded-lg border border-[--border] px-3 py-1.5 text-xs font-medium',
                'text-[--text-secondary] transition-colors',
                'hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700',
                'dark:hover:bg-primary-900/30 dark:hover:text-primary-300',
                latex === ex.latex && 'border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
              )}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
