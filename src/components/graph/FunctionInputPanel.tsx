'use client'

/**
 * FunctionInputPanel — List of function inputs with add/remove/toggle/color.
 *
 * Each row: color swatch | MathLive input | visibility toggle | remove button
 * Footer: "+ Agregar función" button (max 8)
 *
 * MathLive is dynamically imported here (client-only, ssr:false) because
 * this component is already 'use client'.
 */

import { useCallback, useId } from 'react'
import dynamic from 'next/dynamic'
import { useGraph2DStore } from '@/store/graph2DStore'
import { cn } from '@/lib/utils/cn'

const MathField = dynamic(
  () => import('@/components/math/MathField').then((m) => ({ default: m.MathField })),
  { ssr: false, loading: () => <div className="h-10 flex-1 animate-pulse rounded-lg bg-[--surface-raised]" /> }
)

// ---------------------------------------------------------------------------
// Quick-start examples
// ---------------------------------------------------------------------------
const EXAMPLES = [
  { label: 'sin(x)',    latex: String.raw`\sin(x)` },
  { label: 'x²',       latex: 'x^2' },
  { label: 'cos(x)',   latex: String.raw`\cos(x)` },
  { label: '1/x',      latex: String.raw`\frac{1}{x}` },
  { label: 'eˣ',       latex: String.raw`e^x` },
  { label: 'ln(x)',    latex: String.raw`\ln(x)` },
]

// ---------------------------------------------------------------------------
// FunctionInputPanel
// ---------------------------------------------------------------------------

export function FunctionInputPanel() {
  const { functions, addFunction, removeFunction, updateFunction, toggleVisibility } =
    useGraph2DStore()

  const panelId = useId()

  const handleAdd = useCallback(() => {
    addFunction(String.raw`\sin(x)`) // default starter expression
  }, [addFunction])

  return (
    <div className="flex flex-col gap-3" aria-label="Lista de funciones">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[--text-secondary]">
          Funciones
          <span className="ml-2 text-xs text-[--text-muted]">({functions.length}/8)</span>
        </h3>
      </div>

      {/* Quick examples */}
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.latex}
            onClick={() => addFunction(ex.latex)}
            disabled={functions.length >= 8}
            className="rounded-md border border-[--border] px-2 py-0.5 text-xs text-[--text-secondary] hover:border-primary-500 hover:text-primary-500 disabled:opacity-40 transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Function rows */}
      <ul className="flex flex-col gap-2" role="list">
        {functions.length === 0 && (
          <li className="rounded-lg border border-dashed border-[--border] py-6 text-center text-sm text-[--text-muted]">
            Añade una función para empezar
          </li>
        )}

        {functions.map((def, i) => (
          <li
            key={def.id}
            className="flex items-center gap-2 rounded-xl border border-[--border] bg-[--surface] p-2"
          >
            {/* Color swatch + visibility toggle */}
            <button
              onClick={() => toggleVisibility(def.id)}
              title={def.visible ? 'Ocultar' : 'Mostrar'}
              className="shrink-0 h-7 w-7 rounded-full border-2 transition-opacity"
              style={{
                backgroundColor: def.color,
                borderColor: def.color,
                opacity: def.visible ? 1 : 0.3,
              }}
              aria-label={`${def.visible ? 'Ocultar' : 'Mostrar'} función ${i + 1}`}
            />

            {/* MathLive input */}
            <div className="flex-1 min-w-0">
              <MathField
                value={def.latex}
                onChange={(latex) => updateFunction(def.id, latex)}
                placeholder="f(x) = …"
              />
            </div>

            {/* Parse error indicator */}
            {def.fn === null && def.latex.trim() !== '' && (
              <span
                title="Expresión inválida"
                className="shrink-0 text-xs text-red-500"
                aria-label="Error al parsear expresión"
              >
                ⚠
              </span>
            )}

            {/* Remove button */}
            <button
              onClick={() => removeFunction(def.id)}
              className="shrink-0 rounded-lg p-1 text-[--text-muted] hover:bg-red-500/10 hover:text-red-500 transition-colors"
              aria-label={`Eliminar función ${i + 1}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {/* Add button */}
      <button
        onClick={handleAdd}
        disabled={functions.length >= 8}
        className={cn(
          'flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-2 text-sm font-medium transition-colors',
          functions.length < 8
            ? 'border-[--border] text-[--text-muted] hover:border-primary-500 hover:text-primary-500'
            : 'cursor-not-allowed border-[--border] text-[--text-muted] opacity-40'
        )}
        aria-label="Agregar función"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Agregar función
      </button>

      {/* Suppress unused variable warning */}
      <span className="sr-only" id={panelId} />
    </div>
  )
}
