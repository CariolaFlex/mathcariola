import type { Metadata } from 'next'
import { PageWrapper } from '@/components/ui/PageWrapper'
import { EstadisticaModuleTabs } from '@/components/estadistica/EstadisticaModuleTabs'

export const metadata: Metadata = {
  title: 'Estadística',
  description: 'Estadística descriptiva: media, mediana, varianza, cuartiles, histograma, box plot y regresión lineal.',
  openGraph: {
    title: 'Estadística — MathCariola',
    description: 'Estadística descriptiva completa con histograma, box plot y regresión lineal. Ingresa datos y obtén análisis instantáneo.',
  },
  twitter: { card: 'summary_large_image' },
}

export default function EstadisticaPage() {
  return (
    <PageWrapper
      title="Estadística"
      description="Estadística descriptiva completa: medidas de tendencia central, dispersión, gráficos y regresión lineal."
    >
      <EstadisticaModuleTabs />
    </PageWrapper>
  )
}
