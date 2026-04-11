import { Sidebar } from '@/components/ui/Sidebar'

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Padding inferior en mobile para el bottom nav (56px) */}
      <div className="flex flex-1 flex-col overflow-hidden pb-14 md:pb-0">
        {children}
      </div>
    </div>
  )
}
