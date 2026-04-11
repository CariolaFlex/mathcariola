import type { Metadata } from 'next'
import { PageWrapper, Section } from '@/components/ui/PageWrapper'

export const metadata: Metadata = { title: 'Estadística' }

export default function EstadisticaPage() {
  return (
    <PageWrapper
      title="Estadística"
      description="Probabilidad, distribuciones y estadística inferencial para ingeniería."
      badge="Sprint 11 →"
    >
      <Section title="En construcción">
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[--border] bg-[--surface-raised] py-16 text-center">
          <span className="mb-3 text-5xl">σ</span>
          <p className="text-lg font-semibold text-[--text-primary]">Módulo Estadística</p>
          <p className="mt-1 max-w-sm text-sm text-[--text-muted]">
            Las distribuciones, pruebas de hipótesis y regresión se integrarán en el Sprint 11.
          </p>
        </div>
      </Section>
    </PageWrapper>
  )
}
