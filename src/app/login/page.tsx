"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authenticate } from "@/app/actions"
import { CalendarDays, Lock } from "lucide-react"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await authenticate(password)
      if (res.success) {
        router.push("/")
        router.refresh()
      } else {
        setError(res.error || "Login fehlgeschlagen")
      }
    } catch (err) {
      setError("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <div className="bg-white dark:bg-[#0d1117] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 w-full max-w-md">
        
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4">
            <img src="/logo.svg" alt="sm4sh's Urlaubsplaner Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 flex items-center justify-center gap-2 mb-1">
            sm4sh's Urlaubsplaner
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-center text-sm">
            Bitte gib das Passwort ein, um den Urlaubsplaner zu öffnen.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Passwort
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Wird geprüft..." : "Entsperren"}
          </button>
        </form>

      </div>
    </div>
  )
}
