import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Página no encontrada',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-[--surface]">
      <div className="text-8xl font-black text-indigo-600/30 mb-4 select-none">404</div>
      <h1 className="text-2xl font-bold text-[--text-primary] mb-2">Página no encontrada</h1>
      <p className="text-sm text-[--text-secondary] mb-8 max-w-sm">
        La página que buscas no existe o fue movida. Regresa al inicio para explorar los módulos disponibles.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
      >
        Ir a MathCariola
      </Link>
    </div>
  )
}
