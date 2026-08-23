"use client"

import React from "react"
import { useStore } from "@/store/useStore"
import { Check, AlertCircle, Info, X } from "lucide-react"

export default function ToastContainer() {
  const toasts = useStore((state) => state.toasts)
  const removeToast = useStore((state) => state.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm sm:max-w-md w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        let iconHtml = (
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
        )

        if (toast.type === "success") {
          iconHtml = (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
          )
        } else if (toast.type === "error") {
          iconHtml = (
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          )
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start sm:items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-[#0d141d]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl animate-in fade-in-50 slide-in-from-bottom-5 duration-300"
          >
            {iconHtml}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {toast.title}
              </div>
              {toast.description && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  {toast.description}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
              aria-label="Benachrichtigung schließen"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
