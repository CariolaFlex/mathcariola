'use client'

/**
 * EstadisticaModuleTabs — Tab shell for the Statistics module.
 * Tabs: Datos | Gráficos
 * Data state is shared between tabs via useState at shell level.
 */

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { STATISTICS_EXAMPLES } from '@/types/statistics'

function PanelSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      <div className="h-6 w-48 bg-[--surface-secondary] rounded" />
      <div className="h-[300px] bg-[--surface-secondary] rounded-xl" />
    </div>
  )
}

const DataInputPanel = dynamic(
  () => import('./DataInputPanel').then(m => ({ default: m.DataInputPanel })),
  { ssr: false, loading: () => <PanelSkeleton /> }
)
const ChartsPanel = dynamic(
  () => import('./ChartsPanel').then(m => ({ default: m.ChartsPanel })),
  { ssr: false, loading: () => <PanelSkeleton /> }
)

type Tab = 'datos' | 'graficos'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'datos',    label: 'Datos & Descriptiva', icon: 'Σ' },
  { id: 'graficos', label: 'Gráficos',             icon: '📊' },
]

export function EstadisticaModuleTabs() {
  const [tab, setTab] = useState<Tab>('datos')
  const [data, setData] = useState<number[]>(STATISTICS_EXAMPLES[0].data)

  const handleDataChange = useCallback((d: number[]) => setData(d), [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === id
                ? 'bg-violet-600 text-white'
                : 'bg-[--surface-secondary] text-[--text-secondary] hover:bg-[--surface-primary] hover:text-[--text-primary]'
            }`}
          >
            <span className="font-mono text-xs">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {tab === 'datos'    && <DataInputPanel onDataChange={handleDataChange} />}
      {tab === 'graficos' && <ChartsPanel data={data} />}
    </div>
  )
}
