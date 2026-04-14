import type { Metadata } from 'next'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { EDOModuleTabs } from '@/components/edo/EDOModuleTabs'

export const metadata: Metadata = {
  title: 'Ecuaciones Diferenciales',
  description: 'EDO separables, lineales de 1er orden y de 2do orden. Campo de pendientes y métodos numéricos Euler y Runge-Kutta 4to orden.',
  openGraph: {
    title: 'Ecuaciones Diferenciales — MathCariola',
    description: 'Resuelve EDO simbólicamente con pasos. Visualiza campo de pendientes y compara Euler vs Runge-Kutta 4to orden.',
  },
  twitter: { card: 'summary_large_image' },
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
