import { prisma } from '@/lib/prisma'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const profiles = await prisma.profile.findMany()
  
  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200">Einstellungen & Profile</h1>
      <SettingsClient initialProfiles={profiles} />
    </div>
  )
}
