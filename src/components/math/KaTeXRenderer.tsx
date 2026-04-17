/**
 * KaTeXRenderer — Renderiza expresiones LaTeX usando KaTeX.
 *
 * KaTeX opera con JavaScript puro (sin DOM) → es compatible con SSR.
 * Este componente NO necesita 'use client' — funciona como Server Component
 * y también puede usarse en Client Components.
 *
 * Para expresiones inválidas, renderiza un fallback visible en lugar de romper.
 */

import katex from 'katex'
import type { KatexOptions } from 'katex'
import { cn } from '@/lib/utils/cn'

// ─── Types ───────────────────────────────────────────────────────────────────
export interface KaTeXRendererProps {
  /** Expresión LaTeX a renderizar */
  expression: string
  /** true → bloque centrado | false → inline en prosa */
  displayMode?: boolean
  /** Clases CSS adicionales para el contenedor */
  className?: string
  /**
   * Qué hacer si KaTeX lanza error:
   * - 'fallback' (default) → muestra el LaTeX en texto plano
   * - 'throw' → relanza el error (para testing)
   */
  errorPolicy?: 'fallback' | 'throw'
}

// ─── Opciones base de KaTeX ───────────────────────────────────────────────────
const BASE_OPTIONS: KatexOptions = {
  output: 'html',
  strict: false,          // Tolerante con comandos no estándar
  trust: false,           // Sin \url ni comandos de riesgo
  throwOnError: false,    // No propagar errores — manejamos nosotros
  macros: {
    // Macros útiles para ingeniería
    '\\R':    '\\mathbb{R}',
    '\\N':    '\\mathbb{N}',
    '\\Z':    '\\mathbb{Z}',
    '\\C':    '\\mathbb{C}',
    '\\d':    '\\,\\mathrm{d}',    // diferencial tipográfico: ∫f(x)dx
    '\\abs':  '\\left|#1\\right|',
    '\\norm': '\\left\\|#1\\right\\|',
    '\\eval': '\\left.#1\\right|',
  },
}

// ─── Sanitización ────────────────────────────────────────────────────────────
/**
 * Elimina marcadores internos de Cortex-JS / MathLive que no son LaTeX estándar
 * y que producen salida confusa o errores en KaTeX.
 *
 * Patrones eliminados:
 *   \error{...}              — anotación de error de CE al parsear
 *   \colorbox{#fbbbb6}{...}  — resaltado de error de MathLive (se conserva el contenido)
 *   \placeholder[{...}]      — marcador de placeholder de MathLive
 *   \bigm                    — delimitador que CE incluye en expresiones inválidas
 */
function sanitizeLatex(expr: string): string {
  let s = expr
  // Múltiples pasadas para manejar anidamiento
  for (let pass = 0; pass < 5; pass++) {
    const prev = s
    // \error{contenido} → eliminar (el contenido suele ser inválido también)
    s = s.replace(/\\error\{[^{}]*\}/g, '')
    // \colorbox{color}{contenido} → conservar solo el contenido
    s = s.replace(/\\colorbox\{[^{}]*\}\{([^{}]*)\}/g, '$1')
    // \placeholder con argumento opcional
    s = s.replace(/\\placeholder(?:\{[^{}]*\})?/g, '')
    if (s === prev) break
  }
  // Limpiar \bigm suelto (sin argumento de delimitador)
  s = s.replace(/\\bigm\s*(?=[^{]|$)/g, '')
  // Limpiar espacios múltiples resultantes
  s = s.replace(/\s{2,}/g, ' ').trim()
  return s
}

// ─── Función de render segura ────────────────────────────────────────────────
function renderSafe(
  expression: string,
  displayMode: boolean,
  errorPolicy: 'fallback' | 'throw'
): { html: string; isError: boolean } {
  // Expresión vacía
  if (!expression.trim()) {
    return { html: '', isError: false }
  }

  // Sanitizar marcadores de error CE/MathLive antes de pasar a KaTeX
  const sanitized = sanitizeLatex(expression)
  if (!sanitized) {
    return { html: '', isError: false }
  }

  try {
    const html = katex.renderToString(sanitized, {
      ...BASE_OPTIONS,
      displayMode,
      throwOnError: errorPolicy === 'throw',
    })
    return { html, isError: false }
  } catch (err) {
    if (errorPolicy === 'throw') throw err

    // Fallback: muestra LaTeX en monospace con indicador de error
    const escaped = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    return {
      html: `<span class="katex-error" title="${(err as Error).message}">${escaped}</span>`,
      isError: true,
    }
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export function KaTeXRenderer({
  expression,
  displayMode = false,
  className,
  errorPolicy = 'fallback',
}: KaTeXRendererProps) {
  const { html, isError } = renderSafe(expression, displayMode, errorPolicy)

  if (!html) return null

  if (displayMode) {
    return (
      <div
        className={cn(
          'overflow-x-auto py-2',
          isError && 'text-red-500 dark:text-red-400',
          className
        )}
        dangerouslySetInnerHTML={{ __html: html }}
        aria-label={`Expresión matemática: ${expression}`}
      />
    )
  }

  return (
    <span
      className={cn(
        isError && 'text-red-500 dark:text-red-400',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
      aria-label={`Expresión matemática: ${expression}`}
    />
  )
}
