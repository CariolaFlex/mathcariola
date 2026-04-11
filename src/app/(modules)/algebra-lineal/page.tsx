import type { Metadata } from 'next'
import { PageWrapper, Section } from '@/components/ui/PageWrapper'

export const metadata: Metadata = { title: 'Álgebra Lineal' }

export default function AlgebraLinealPage() {
  return (
    <PageWrapper
      title="Álgebra Lineal"
      description="Matrices, determinantes, eigenvalores y espacios vectoriales."
      badge="Sprint 10 →"
    >
      <Section title="En construcción">
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[--border] bg-[--surface-raised] py-16 text-center">
          <span className="mb-3 text-5xl">[A]</span>
          <p className="text-lg font-semibold text-[--text-primary]">Módulo Álgebra Lineal</p>
          <p className="mt-1 max-w-sm text-sm text-[--text-muted]">
            Las operaciones matriciales y el solucionador de sistemas se integrarán en el Sprint 10.
          </p>
        </div>
      </Section>
    </PageWrapper>
  )
}
