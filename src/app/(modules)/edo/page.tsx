import type { Metadata } from 'next'
import { PageWrapper, Section } from '@/components/ui/PageWrapper'

export const metadata: Metadata = { title: 'EDO' }

export default function EdoPage() {
  return (
    <PageWrapper
      title="Ecuaciones Diferenciales"
      description="EDO de 1er y 2do orden, transformada de Laplace y campos de pendientes."
      badge="Sprint 11 →"
    >
      <Section title="En construcción">
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[--border] bg-[--surface-raised] py-16 text-center">
          <span className="mb-3 text-5xl">{"y'"}</span>
          <p className="text-lg font-semibold text-[--text-primary]">Módulo EDO</p>
          <p className="mt-1 max-w-sm text-sm text-[--text-muted]">
            Los métodos analíticos y la visualización de campos de pendientes se integrarán en el Sprint 11.
          </p>
        </div>
      </Section>
    </PageWrapper>
  )
}
