'use client'

/**
 * FuncionesModuleTabs — Main tab container for the Funciones module.
 *
 * Sprint 8 additions:
 *   - Transformaciones: real-time a·f(bx+h)+k sliders
 *   - Inversa: f and f⁻¹ with y=x mirror
 *   - Composición: f, g, f∘g, g∘f simultaneously
 *   - Biblioteca: 20-example library with one-click load + PNG export + share URL
 *
 * All Mafs-heavy panels are lazy-loaded (ssr:false) to avoid SSR issues.
 * Passing an example from the library into 2D grapher is done via shared
 * URL state: clicking an example updates ?fn= and switches to 'graficar' tab.
 */

import dynamic from 'next/dynamic'
import { useState, useCallback, useEffect } from 'react'
import { TabSwitcher } from '@/components/ui/TabSwitcher'
import { SolverPanel } from '@/components/solver/SolverPanel'
import type { FunctionExample } from '@/constants/functionExamples'

// ---------------------------------------------------------------------------
// Lazy imports — all browser-only components
// ---------------------------------------------------------------------------

const GraphPanel2D = dynamic(
  () => import('./GraphPanel2D').then((m) => ({ default: m.GraphPanel2D })),
  { ssr: false, loading: () => <div className="h-[420px] rounded-xl bg-[--surface-secondary] animate-pulse" /> }
)

const Graph3D = dynamic(
  () => import('./Graph3D').then((m) => ({ default: m.Graph3D })),
  { ssr: false, loading: () => <div className="h-[580px] rounded-xl bg-[#0d0d0d] animate-pulse" /> }
)

const TransformationPanel = dynamic(
  () => import('./TransformationPanel').then((m) => ({ default: m.TransformationPanel })),
  { ssr: false, loading: () => <div className="h-[460px] rounded-xl bg-[--surface-secondary] animate-pulse" /> }
)

const InversePanel = dynamic(
  () => import('./InversePanel').then((m) => ({ default: m.InversePanel })),
  { ssr: false, loading: () => <div className="h-[460px] rounded-xl bg-[--surface-secondary] animate-pulse" /> }
)

const CompositionPanel = dynamic(
  () => import('./CompositionPanel').then((m) => ({ default: m.CompositionPanel })),
  { ssr: false, loading: () => <div className="h-[460px] rounded-xl bg-[--surface-secondary] animate-pulse" /> }
)

const ExamplesPanel = dynamic(
  () => import('./ExamplesPanel').then((m) => ({ default: m.ExamplesPanel })),
  { ssr: false, loading: () => <div className="h-[300px] rounded-xl bg-[--surface-secondary] animate-pulse" /> }
)

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'graficar',        label: 'Graficar 2D' },
  { id: 'transformar',     label: 'Transformar' },
  { id: 'inversa',         label: 'Inversa' },
  { id: 'composicion',     label: 'Composición' },
  { id: 'graficar3d',      label: 'Graficar 3D' },
  { id: 'resolver',        label: 'Resolver' },
  { id: 'biblioteca',      label: 'Biblioteca' },
]

// ---------------------------------------------------------------------------
// FuncionesModuleTabs
// ---------------------------------------------------------------------------

export function FuncionesModuleTabs() {
  // Track the active tab so we can programmatically switch to 'graficar'
  // when the user picks an example from the library.
  const [activeTab, setActiveTab] = useState('graficar')

  // Expression loaded from URL params (?fn=) or from library selection
  const [loadedExpression, setLoadedExpression] = useState('')

  // Read ?fn= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fns = params.getAll('fn')
    if (fns.length > 0 && fns[0]) {
      setLoadedExpression(fns[0])
      // Restore tab from URL
      const tab = params.get('tab')
      if (tab && TABS.some((t) => t.id === tab)) setActiveTab(tab)
    }
  }, [])

  // When user picks an example from the library:
  //   1. Store the expression
  //   2. Switch to the 2D grapher
  const handleExampleSelect = useCallback((example: FunctionExample) => {
    setLoadedExpression(example.latex)
    setActiveTab('graficar')
  }, [])

  return (
    <TabSwitcher tabs={TABS} defaultTab={activeTab} key={activeTab}>
      {(active) => (
        <>
          {active === 'graficar' && (
            <GraphPanel2D
              height={420}
              // Pass loaded expression as initial value when coming from library
              initialExpression={loadedExpression || undefined}
            />
          )}
          {active === 'transformar' && <TransformationPanel />}
          {active === 'inversa' && <InversePanel />}
          {active === 'composicion' && <CompositionPanel />}
          {active === 'graficar3d' && (
            <div className="h-[580px] rounded-xl overflow-hidden">
              <Graph3D />
            </div>
          )}
          {active === 'resolver' && <SolverPanel />}
          {active === 'biblioteca' && (
            <ExamplesPanel
              currentExpression={loadedExpression}
              onSelect={handleExampleSelect}
            />
          )}
        </>
      )}
    </TabSwitcher>
  )
}
