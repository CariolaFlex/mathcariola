'use client'

/**
 * EDOModuleTabs — Tab shell for the ODE module.
 * Tabs: Resolver | Campo de Pendientes | Métodos Numéricos
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { PanelSkeleton } from '@/components/ui/ModuleSkeleton'

const ODEPanel = dynamic(
  () => import('./ODEPanel').then(m => ({ default: m.ODEPanel })),
  { ssr: false, loading: () => <PanelSkeleton /> }
)
const SlopeFieldVisualizer = dynamic(
  () => import('./SlopeFieldVisualizer').then(m => ({ default: m.SlopeFieldVisualizer })),
  { ssr: false, loading: () => <PanelSkeleton /> }
)
const NumericalODEPanel = dynamic(
  () => import('./NumericalODEPanel').then(m => ({ default: m.NumericalODEPanel })),
  { ssr: false, loading: () => <PanelSkeleton /> }
)

type Tab = 'resolver' | 'campo' | 'numerico'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'resolver', label: 'Resolver',          icon: 'dy/dx' },
  { id: 'campo',    label: 'Campo de Pendientes', icon: '↗' },
  { id: 'numerico', label: 'Métodos Numéricos', icon: 'RK4' },
]

export function EDOModuleTabs() {
  const [tab, setTab] = useState<Tab>('resolver')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === id
                ? 'bg-emerald-600 text-white'
                : 'bg-[--surface-secondary] text-[--text-secondary] hover:bg-[--surface-primary] hover:text-[--text-primary]'
            }`}
          >
            <span className="font-mono text-xs">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {tab === 'resolver'  && <ODEPanel />}
      {tab === 'campo'     && <SlopeFieldVisualizer />}
      {tab === 'numerico'  && <NumericalODEPanel />}
    </div>
  )
}
