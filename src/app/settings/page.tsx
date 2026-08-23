import { prisma } from '@/lib/prisma'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const profiles = await prisma.profile.findMany()
  
  return (
    <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar">
      <main className="max-w-[1600px] w-full mx-auto p-3 sm:p-5 md:p-8 pt-2 sm:pt-4 md:pt-6 pb-24 md:pb-28 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Einstellungen &amp; Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Verwalte Urlaubsansprüche, Feiertagsregionen und Systemeinstellungen.
            </p>
          </div>
        </div>
        <SettingsClient initialProfiles={profiles} />
      </main>
    </div>
  )
}
