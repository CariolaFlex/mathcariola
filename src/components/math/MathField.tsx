'use client'

/**
 * MathField — Wrapper de <math-field> (MathLive Web Component).
 *
 * CRÍTICO: mathlive usa Custom Elements + Shadow DOM.
 * - Este componente es 'use client' para que Next.js lo incluya solo en el bundle del cliente.
 * - mathlive se importa dinámicamente en useEffect para evitar que corra en SSR.
 * - Los eventos del Shadow DOM se escuchan con addEventListener (no con props onX de React).
 */

import { useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'
import type { MathfieldHTMLElement } from '@/types/mathlive'

// ─── Types ───────────────────────────────────────────────────────────────────
export interface MathFieldProps {
  /** Valor LaTeX controlado */
  value?: string
  /** Callback con el LaTeX actualizado en cada keystroke */
  onChange?: (latex: string) => void
  /** Placeholder informativo (mostrado como atributo) */
  placeholder?: string
  /** Desactiva la edición */
  readOnly?: boolean
  /** Clases CSS adicionales para el contenedor */
  className?: string
  /** Autoenfoca al montar */
  autoFocus?: boolean
  /** Callback cuando el campo recibe/pierde foco */
  onFocus?: () => void
  onBlur?: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────
export function MathField({
  value = '',
  onChange,
  placeholder,
  readOnly = false,
  className,
  autoFocus = false,
  onFocus,
  onBlur,
}: MathFieldProps) {
  const fieldRef = useRef<MathfieldHTMLElement | null>(null)

  // Refs estables para callbacks — evita re-suscripciones innecesarias
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const onFocusRef = useRef(onFocus)
  onFocusRef.current = onFocus
  const onBlurRef = useRef(onBlur)
  onBlurRef.current = onBlur

  // ── 1. Importar mathlive client-side (registra el Custom Element) ──────────
  useEffect(() => {
    import('mathlive').catch((err) => {
      console.error('[MathField] Error cargando mathlive:', err)
    })
  }, [])

  // ── 1b. Configurar placeholder vía JS (no como atributo HTML — MathLive
  //        lo interpretaría como fórmula LaTeX y mostraría símbolos raros) ──
  const placeholderRef = useRef(placeholder)
  placeholderRef.current = placeholder
  useEffect(() => {
    const el = fieldRef.current
    if (!el) return
    // Usar texto plano como placeholder (no LaTeX)
    // MathLive lo muestra en gris cuando el campo está vacío
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(el as any).setOptions?.({ placeholder: placeholderRef.current ?? '' })
    } catch {
      // setOptions no disponible en esta versión — ignorar silenciosamente
    }
  }, [placeholder])

  // ── 2. Suscribir eventos del Shadow DOM vía addEventListener ──────────────
  useEffect(() => {
    const el = fieldRef.current
    if (!el) return

    const handleInput = () => {
      onChangeRef.current?.(el.value)
    }
    const handleFocus = () => onFocusRef.current?.()
    const handleBlur = () => onBlurRef.current?.()

    el.addEventListener('input', handleInput)
    el.addEventListener('focus', handleFocus)
    el.addEventListener('blur', handleBlur)

    if (autoFocus) {
      // Pequeño delay para que el custom element esté completamente montado
      const t = setTimeout(() => el.focus?.(), 50)
      return () => {
        clearTimeout(t)
        el.removeEventListener('input', handleInput)
        el.removeEventListener('focus', handleFocus)
        el.removeEventListener('blur', handleBlur)
      }
    }

    return () => {
      el.removeEventListener('input', handleInput)
      el.removeEventListener('focus', handleFocus)
      el.removeEventListener('blur', handleBlur)
    }
  }, [autoFocus])

  // ── 3. Sincronizar prop value → elemento DOM (controlado) ─────────────────
  useEffect(() => {
    const el = fieldRef.current
    // Solo actualiza si el valor difiere (evita loops)
    if (el && el.value !== value) {
      el.value = value
    }
  }, [value])

  // ── 4. Exponer método focus al exterior ───────────────────────────────────
  const focus = useCallback(() => {
    fieldRef.current?.focus?.()
  }, [])
  // (disponible vía ref en el futuro con useImperativeHandle si se necesita)
  void focus

  return (
    <div className={cn('math-field-wrapper relative', className)}>
      {/*
        React 19 pasa las props directamente a custom elements como propiedades DOM.
        El atributo 'read-only' (kebab-case) es el que reconoce MathLive.
        suppressHydrationWarning evita el warning por la diferencia servidor/cliente.
      */}
      <math-field
        ref={fieldRef as React.RefObject<MathfieldHTMLElement>}
        read-only={readOnly || undefined}
        suppressHydrationWarning
      />
    </div>
  )
}
