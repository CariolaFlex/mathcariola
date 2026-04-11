import type { Metadata } from 'next'
import { PageWrapper, Section } from '@/components/ui/PageWrapper'

export const metadata: Metadata = { title: 'Cálculo' }

export default function CalculoPage() {
  return (
    <PageWrapper
      title="Cálculo"
      description="Límites, derivadas e integrales con solución paso a paso."
      badge="Sprint 9 →"
    >
      <Section title="En construcción">
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[--border] bg-[--surface-raised] py-16 text-center">
          <span className="mb-3 text-5xl">∫</span>
          <p className="text-lg font-semibold text-[--text-primary]">Módulo Cálculo</p>
          <p className="mt-1 max-w-sm text-sm text-[--text-muted]">
            El motor CAS Cortex CE y el solucionador paso a paso se integrarán en el Sprint 3.
          </p>
        </div>
      </Section>
    </PageWrapper>
  )
}
