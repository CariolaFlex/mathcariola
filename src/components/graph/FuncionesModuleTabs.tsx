'use client'

/**
 * FuncionesModuleTabs — Client wrapper for the Graficar | Resolver tabs
 * on the Funciones page. Keeps the page.tsx as a pure server component.
 */

import dynamic from 'next/dynamic'
import { TabSwitcher } from '@/components/ui/TabSwitcher'
import { SolverPanel } from '@/components/solver/SolverPanel'

// GraphPanel2D uses Mafs — must be client-only
const GraphPanel2D = dynamic(
  () => import('./GraphPanel2D').then((m) => ({ default: m.GraphPanel2D })),
  { ssr: false, loading: () => <div className="h-[420px] rounded-xl bg-[--surface-secondary] animate-pulse" /> }
)

const TABS = [
  { id: 'graficar', label: 'Graficar' },
  { id: 'resolver', label: 'Resolver' },
]

export function FuncionesModuleTabs() {
  return (
    <TabSwitcher tabs={TABS} defaultTab="graficar">
      {(active) => (
        <>
          {active === 'graficar' && <GraphPanel2D height={420} />}
          {active === 'resolver' && <SolverPanel />}
        </>
      )}
    </TabSwitcher>
  )
}
