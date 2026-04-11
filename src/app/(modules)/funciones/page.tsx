import type { Metadata } from 'next'
import { PageWrapper, Section } from '@/components/ui/PageWrapper'

export const metadata: Metadata = { title: 'Funciones' }

export default function FuncionesPage() {
  return (
    <PageWrapper
      title="Funciones"
      description="Análisis y graficación de funciones reales."
      badge="Sprint 2 →"
    >
      <Section title="En construcción">
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[--border] bg-[--surface-raised] py-16 text-center">
          <span className="mb-3 text-5xl">f(x)</span>
          <p className="text-lg font-semibold text-[--text-primary]">Módulo Funciones</p>
          <p className="mt-1 max-w-sm text-sm text-[--text-muted]">
            La entrada matemática MathLive y el render KaTeX se integrarán en el Sprint 2.
          </p>
        </div>
      </Section>
    </PageWrapper>
  )
}
