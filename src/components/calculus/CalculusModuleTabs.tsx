'use client'

/**
 * CalculusModuleTabs — Top-level tab shell for the Calculus module.
 *
 * Tabs:
 *   derivadas    → DerivativesPanel
 *   integrales   → IntegralsPanel
 *   limites      → LimitsPanel
 *   visualizador → TangentVisualizer + RiemannVisualizer + TaylorVisualizer
 *
 * All heavy panels are lazy-loaded via React.lazy + Suspense so that
 * the initial shell renders instantly.
 */

import { useState, Suspense, lazy } from 'react'

// ---------------------------------------------------------------------------
// Lazy panels
// ---------------------------------------------------------------------------

const DerivativesPanel  = lazy(() => import('./DerivativesPanel').then(m => ({ default: m.DerivativesPanel })))
const IntegralsPanel    = lazy(() => import('./IntegralsPanel').then(m => ({ default: m.IntegralsPanel })))
const LimitsPanel       = lazy(() => import('./LimitsPanel').then(m => ({ default: m.LimitsPanel })))
const TangentVisualizer = lazy(() => import('./TangentVisualizer').then(m => ({ default: m.TangentVisualizer })))
const RiemannVisualizer = lazy(() => import('./RiemannVisualizer').then(m => ({ default: m.RiemannVisualizer })))
const TaylorVisualizer  = lazy(() => import('./TaylorVisualizer').then(m => ({ default: m.TaylorVisualizer })))

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

type Tab = 'derivadas' | 'integrales' | 'limites' | 'visualizador'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'derivadas',    label: 'Derivadas',    icon: "f'" },
  { id: 'integrales',   label: 'Integrales',   icon: '∫' },
  { id: 'limites',      label: 'Límites',      icon: 'lim' },
  { id: 'visualizador', label: 'Visualizador', icon: '📈' },
]

// ---------------------------------------------------------------------------
// VisualizadorPanel — sub-tabs for the three visualizers
// ---------------------------------------------------------------------------

type VizTab = 'tangente' | 'riemann' | 'taylor'

const VIZ_TABS: { id: VizTab; label: string }[] = [
  { id: 'tangente', label: 'Tangente' },
  { id: 'riemann',  label: 'Sumas de Riemann' },
  { id: 'taylor',   label: 'Taylor / Maclaurin' },
]

function VisualizadorPanel() {
  const [vizTab, setVizTab] = useState<VizTab>('tangente')

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 rounded-xl bg-[--surface-secondary] p-1 w-fit">
        {VIZ_TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setVizTab(id)}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
              vizTab === id
                ? 'bg-[--surface-primary] text-[--text-primary] shadow'
                : 'text-[--text-secondary] hover:text-[--text-primary]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <Suspense fallback={<PanelSkeleton />}>
        {vizTab === 'tangente' && <TangentVisualizer />}
        {vizTab === 'riemann'  && <RiemannVisualizer />}
        {vizTab === 'taylor'   && <TaylorVisualizer />}
      </Suspense>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function PanelSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      <div className="h-6 w-48 bg-[--surface-secondary] rounded" />
      <div className="h-4 w-72 bg-[--surface-secondary] rounded" />
      <div className="h-[300px] bg-[--surface-secondary] rounded-xl" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// CalculusModuleTabs
// ---------------------------------------------------------------------------

export function CalculusModuleTabs() {
  const [tab, setTab] = useState<Tab>('derivadas')

  return (
    <div className="flex flex-col gap-6">
      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === id
                ? 'bg-indigo-600 text-white'
                : 'bg-[--surface-secondary] text-[--text-secondary] hover:bg-[--surface-primary] hover:text-[--text-primary]'
            }`}
          >
            <span className="font-mono text-xs">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* ── Active panel ──────────────────────────────────────── */}
      <Suspense fallback={<PanelSkeleton />}>
        {tab === 'derivadas'    && <DerivativesPanel />}
        {tab === 'integrales'   && <IntegralsPanel />}
        {tab === 'limites'      && <LimitsPanel />}
        {tab === 'visualizador' && <VisualizadorPanel />}
      </Suspense>
    </div>
  )
}
