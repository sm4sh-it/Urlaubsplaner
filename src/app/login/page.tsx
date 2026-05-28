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
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 w-full max-w-md">
        
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-500 rounded-full mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="text-brand-500 w-6 h-6" /> sm4shReisen
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-center">
            Bitte gib das Familien-Passwort ein, um den Urlaubsplaner zu öffnen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Wird geprüft..." : "Entsperren"}
          </button>
        </form>

      </div>
    </div>
  )
}
