'use client'

/**
 * MathKeyboardConfig — Configura el teclado virtual global de MathLive.
 *
 * DEBE montarse UNA SOLA VEZ en el layout de módulos.
 * Configura: layouts, CSS del teclado, y política de visibilidad.
 *
 * Referencia: https://cortexjs.io/mathlive/guides/virtual-keyboards/
 */

import { useEffect } from 'react'

export function MathKeyboardConfig() {
  useEffect(() => {
    import('mathlive').then(() => {
      const vk = window.mathVirtualKeyboard

      if (!vk) return

      // ── Layers de teclado para ingeniería ─────────────────────────────────
      vk.layouts = [
        // Layout base (incluye operadores, números, fracciones)
        'default',

        // Teclado de funciones trigonométricas e hiperbólicas
        {
          label: 'Trig',
          tooltip: 'Funciones trigonométricas',
          rows: [
            [
              { latex: '\\sin', shift: { latex: '\\arcsin', label: 'arcsin' } },
              { latex: '\\cos', shift: { latex: '\\arccos', label: 'arccos' } },
              { latex: '\\tan', shift: { latex: '\\arctan', label: 'arctan' } },
              { latex: '\\csc', shift: { latex: '\\sec', label: 'sec' } },
              { latex: '\\cot' },
            ],
            [
              { latex: '\\sinh' },
              { latex: '\\cosh' },
              { latex: '\\tanh' },
              { latex: '\\ln',  shift: { latex: '\\log', label: 'log' } },
              { latex: '\\log_{10}' },
            ],
            [
              { latex: '\\pi' },
              { latex: 'e' },
              { latex: '\\infty' },
              { latex: '\\sqrt{#0}' },
              { latex: '\\sqrt[#0]{#1}' },
            ],
            [
              { latex: '\\int_{#0}^{#1}' },
              { latex: '\\int' },
              { latex: "\\frac{d}{d#0}" },
              { latex: '\\sum_{#0}^{#1}' },
              { latex: '\\prod_{#0}^{#1}' },
            ],
          ],
        },

        // Teclado de letras griegas
        {
          label: 'Greek',
          tooltip: 'Letras griegas',
          rows: [
            [
              { latex: '\\alpha',   shift: { latex: '\\Alpha',   label: 'Α' } },
              { latex: '\\beta',    shift: { latex: '\\Beta',    label: 'Β' } },
              { latex: '\\gamma',   shift: { latex: '\\Gamma',   label: 'Γ' } },
              { latex: '\\delta',   shift: { latex: '\\Delta',   label: 'Δ' } },
              { latex: '\\epsilon', shift: { latex: '\\varepsilon', label: 'ε' } },
            ],
            [
              { latex: '\\zeta' },
              { latex: '\\eta' },
              { latex: '\\theta',   shift: { latex: '\\Theta',   label: 'Θ' } },
              { latex: '\\lambda',  shift: { latex: '\\Lambda',  label: 'Λ' } },
              { latex: '\\mu' },
            ],
            [
              { latex: '\\nu' },
              { latex: '\\xi',      shift: { latex: '\\Xi',      label: 'Ξ' } },
              { latex: '\\pi',      shift: { latex: '\\Pi',      label: 'Π' } },
              { latex: '\\rho' },
              { latex: '\\sigma',   shift: { latex: '\\Sigma',   label: 'Σ' } },
            ],
            [
              { latex: '\\tau' },
              { latex: '\\phi',     shift: { latex: '\\Phi',     label: 'Φ' } },
              { latex: '\\chi' },
              { latex: '\\psi',     shift: { latex: '\\Psi',     label: 'Ψ' } },
              { latex: '\\omega',   shift: { latex: '\\Omega',   label: 'Ω' } },
            ],
          ],
        },
      ]
    }).catch(console.error)
  }, [])

  // Componente de configuración pura — no renderiza nada visible
  return null
}
