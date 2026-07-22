import { Settings } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const profiles = await prisma.profile.findMany()
  
  return (
    <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
          <Settings className="w-7 h-7 text-brand-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">Einstellungen &amp; Profile</h1>
        </div>
        <SettingsClient initialProfiles={profiles} />
      </div>
    </div>
  )
}
