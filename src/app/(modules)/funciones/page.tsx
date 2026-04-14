import type { Metadata } from 'next'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { FuncionesModuleTabs } from '@/components/graph/FuncionesModuleTabs'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: 'Funciones',
  description:
    'Módulo completo de funciones: graficadora 2D/3D, transformaciones, inversa, composición, biblioteca de 20 ejemplos y solucionador paso a paso.',
  openGraph: {
    title: 'Funciones — MathCariola',
    description: 'Graficadora interactiva de funciones reales con motor CAS simbólico. Transformaciones, composición e inversas paso a paso.',
  },
  twitter: { card: 'summary_large_image' },
}

export default function FuncionesPage() {
  return (
    <PageWrapper
      title="Funciones"
      description="Análisis, graficación, transformaciones, inversas, composición y solucionador."
      badge="Sprint 8 — Módulo Completo"
    >
      {/* Main module — all tabs */}
      <Card padding="lg">
        <FuncionesModuleTabs />
      </Card>
    </PageWrapper>
  )
}
