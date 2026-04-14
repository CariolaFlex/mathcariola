import type { Metadata } from 'next'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { AlgebraLinealTabs } from '@/components/linearAlgebra/AlgebraLinealTabs'

export const metadata: Metadata = {
  title: 'Álgebra Lineal — Mathcariola',
  description: 'Matrices, determinantes, sistemas de ecuaciones lineales, valores propios y transformaciones lineales 2D.',
}

export default function AlgebraLinealPage() {
  return (
    <PageWrapper
      title="Álgebra Lineal"
      description="Operaciones matriciales, Gauss-Jordan, eigenvalores y visualizador de transformaciones lineales."
    >
      <AlgebraLinealTabs />
    </PageWrapper>
  )
}
