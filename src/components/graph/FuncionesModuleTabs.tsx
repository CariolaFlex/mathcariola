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

// Graph3D uses THREE.js / R3F — must be client-only (ssr:false enforced inside Graph3D)
const Graph3D = dynamic(
  () => import('./Graph3D').then((m) => ({ default: m.Graph3D })),
  { ssr: false, loading: () => <div className="h-[580px] rounded-xl bg-[#0d0d0d] animate-pulse" /> }
)

const TABS = [
  { id: 'graficar', label: 'Graficar 2D' },
  { id: 'graficar3d', label: 'Graficar 3D' },
  { id: 'resolver', label: 'Resolver' },
]

export function FuncionesModuleTabs() {
  return (
    <TabSwitcher tabs={TABS} defaultTab="graficar">
      {(active) => (
        <>
          {active === 'graficar' && <GraphPanel2D height={420} />}
          {active === 'graficar3d' && (
            <div className="h-[580px] rounded-xl overflow-hidden">
              <Graph3D />
            </div>
          )}
          {active === 'resolver' && <SolverPanel />}
        </>
      )}
    </TabSwitcher>
  )
}
