import type { Metadata } from 'next'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { MathInputPanel } from '@/components/math/MathInputPanel'
import { MathDisplay } from '@/components/math/MathDisplay'
import { CASTestPanel } from '@/components/math/CASTestPanel'
import { GraphPanel2D } from '@/components/graph/GraphPanel2D'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = { title: 'Funciones' }

export default function FuncionesPage() {
  return (
    <PageWrapper
      title="Funciones"
      description="Análisis y graficación de funciones reales."
      badge="Sprint 4 — Graficadora 2D"
    >
      {/* 2D Graph — main Sprint 4 feature */}
      <Card padding="lg">
        <GraphPanel2D height={420} />
      </Card>

      {/* CAS Test Panel — dev only */}
      {process.env.NODE_ENV === 'development' && <CASTestPanel />}

      {/* Panel interactivo MathField → KaTeX */}
      <Card padding="lg">
        <MathInputPanel />
      </Card>

      {/* Demo de MathDisplay con ejemplos estáticos SSR */}
      <Card padding="md">
        <Card.Title>Ejemplos de render KaTeX (Server-side)</Card.Title>
        <Card.Body>
          <div className="mt-3 flex flex-col gap-3">
            <MathDisplay
              expression="f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}"
              step={1}
              justification="Distribución normal"
            />
            <MathDisplay
              expression="\nabla^2 \phi = \frac{\partial^2\phi}{\partial x^2} + \frac{\partial^2\phi}{\partial y^2} + \frac{\partial^2\phi}{\partial z^2}"
              step={2}
              justification="Operador Laplaciano"
            />
            <MathDisplay
              expression="\oint_C \mathbf{F} \cdot d\mathbf{r} = \iint_S (\nabla \times \mathbf{F}) \cdot d\mathbf{S}"
              step={3}
              justification="Teorema de Stokes"
            />
          </div>
        </Card.Body>
      </Card>
    </PageWrapper>
  )
}
