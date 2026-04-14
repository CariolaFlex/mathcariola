'use client'

/**
 * AlgebraLinealTabs — Tab shell for the Linear Algebra module.
 *
 * Tabs: Matrices | Sistemas | Valores Propios | Visualizador
 * All Mafs panels loaded via next/dynamic (ssr:false).
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'

function PanelSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      <div className="h-6 w-48 bg-[--surface-secondary] rounded" />
      <div className="h-4 w-72 bg-[--surface-secondary] rounded" />
      <div className="h-[300px] bg-[--surface-secondary] rounded-xl" />
    </div>
  )
}

const MatrixPanel = dynamic(
  () => import('./MatrixPanel').then(m => ({ default: m.MatrixPanel })),
  { ssr: false, loading: () => <PanelSkeleton /> }
)
const SystemPanel = dynamic(
  () => import('./SystemPanel').then(m => ({ default: m.SystemPanel })),
  { ssr: false, loading: () => <PanelSkeleton /> }
)
const EigenPanel = dynamic(
  () => import('./EigenPanel').then(m => ({ default: m.EigenPanel })),
  { ssr: false, loading: () => <PanelSkeleton /> }
)
const TransformVisualizer = dynamic(
  () => import('./TransformVisualizer').then(m => ({ default: m.TransformVisualizer })),
  { ssr: false, loading: () => <PanelSkeleton /> }
)

type Tab = 'matrices' | 'sistemas' | 'eigen' | 'visualizador'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'matrices',     label: 'Matrices',       icon: '⊡' },
  { id: 'sistemas',     label: 'Sistemas',        icon: 'Ax' },
  { id: 'eigen',        label: 'Valores Propios', icon: 'λ' },
  { id: 'visualizador', label: 'Visualizador',    icon: '📐' },
]

export function AlgebraLinealTabs() {
  const [tab, setTab] = useState<Tab>('matrices')

  return (
    <div className="flex flex-col gap-6">
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

      {tab === 'matrices'     && <MatrixPanel />}
      {tab === 'sistemas'     && <SystemPanel />}
      {tab === 'eigen'        && <EigenPanel />}
      {tab === 'visualizador' && <TransformVisualizer />}
    </div>
  )
}
