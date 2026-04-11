import { Sidebar } from '@/components/ui/Sidebar'
import { Header } from '@/components/ui/Header'
import { MathKeyboardConfig } from '@/components/math/MathKeyboardConfig'

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        {/* Padding inferior en mobile para el bottom nav (56px) */}
        <main className="flex-1 overflow-y-auto pb-14 md:pb-0">
          {children}
        </main>
      </div>
      {/*
        MathKeyboardConfig se monta aquí (una sola vez para todos los módulos).
        Configura el teclado virtual global de MathLive.
        Renders null — efecto de configuración puro.
      */}
      <MathKeyboardConfig />
    </div>
  )
}
