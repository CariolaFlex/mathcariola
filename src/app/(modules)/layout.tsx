import { Sidebar } from '@/components/ui/Sidebar'
import { Header } from '@/components/ui/Header'

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
    </div>
  )
}
