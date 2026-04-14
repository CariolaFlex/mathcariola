import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { PageWrapper } from '@/components/ui/PageWrapper'

export const metadata: Metadata = {
  title: 'Cálculo — Mathcariola',
  description: 'Derivadas, integrales y límites con solución paso a paso. Visualizador de tangente, sumas de Riemann y series de Taylor.',
}

// CalculusModuleTabs uses Mafs (client-only) via lazy() internally;
// wrapping the shell itself in dynamic(ssr:false) ensures no SSR mismatch
// from mafs/core.css or the Suspense-lazy chain.
const CalculusModuleTabs = dynamic(
  () => import('@/components/calculus/CalculusModuleTabs').then(m => ({ default: m.CalculusModuleTabs })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse flex flex-col gap-4 mt-6">
        <div className="h-10 w-80 bg-[--surface-secondary] rounded-xl" />
        <div className="h-[480px] bg-[--surface-secondary] rounded-2xl" />
      </div>
    ),
  }
)

export default function CalculoPage() {
  return (
    <PageWrapper
      title="Cálculo"
      description="Derivadas, integrales y límites con pasos pedagógicos detallados. Visualizador interactivo de tangentes, sumas de Riemann y series de Taylor."
    >
      <CalculusModuleTabs />
    </PageWrapper>
  )
}
