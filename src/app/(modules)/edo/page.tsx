import type { Metadata } from 'next'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { EDOModuleTabs } from '@/components/edo/EDOModuleTabs'

export const metadata: Metadata = {
  title: 'Ecuaciones Diferenciales — Mathcariola',
  description: 'EDO separables, lineales de 1er orden y de 2do orden. Campo de pendientes y métodos numéricos (Euler, RK4).',
}

export default function EdoPage() {
  return (
    <PageWrapper
      title="Ecuaciones Diferenciales"
      description="Resolución simbólica de EDO, campo de pendientes y comparación de métodos numéricos Euler vs Runge-Kutta."
    >
      <EDOModuleTabs />
    </PageWrapper>
  )
}
