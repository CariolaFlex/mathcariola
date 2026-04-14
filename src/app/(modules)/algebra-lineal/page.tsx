import type { Metadata } from 'next'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { AlgebraLinealTabs } from '@/components/linearAlgebra/AlgebraLinealTabs'

export const metadata: Metadata = {
  title: 'Álgebra Lineal',
  description: 'Matrices, determinantes, sistemas de ecuaciones lineales, valores propios y transformaciones lineales 2D.',
  openGraph: {
    title: 'Álgebra Lineal — MathCariola',
    description: 'Operaciones matriciales, Gauss-Jordan con pasos, eigenvalores y visualizador interactivo de transformaciones lineales 2D.',
  },
  twitter: { card: 'summary_large_image' },
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
