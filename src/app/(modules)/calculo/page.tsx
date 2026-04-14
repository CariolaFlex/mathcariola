import type { Metadata } from 'next'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { CalculusModuleTabs } from '@/components/calculus/CalculusModuleTabs'

export const metadata: Metadata = {
  title: 'Cálculo — Mathcariola',
  description: 'Derivadas, integrales y límites con solución paso a paso. Visualizador de tangente, sumas de Riemann y series de Taylor.',
}

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
