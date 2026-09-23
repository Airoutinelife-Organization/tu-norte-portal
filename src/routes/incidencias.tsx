import { createFileRoute } from '@tanstack/react-router'
import { Activity } from 'lucide-react'

export const Route = createFileRoute('/incidencias')({
  component: IncidenciasPage,
})

function IncidenciasPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="flex h-16 items-center border-b border-slate-200 bg-white px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Activity className="h-5 w-5" />
        </div>
        <h1 className="ml-3 text-[15px] font-bold text-slate-900">Centro de Incidencias</h1>
      </header>
    </div>
  )
}
