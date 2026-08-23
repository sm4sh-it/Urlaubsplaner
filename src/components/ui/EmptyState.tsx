"use client"

import React from "react"
import Link from "next/link"
import { LucideIcon, Compass, SearchX, Plus } from "lucide-react"

export interface EmptyStateProps {
  variant?: "card" | "subwell"
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  className?: string
}

export default function EmptyState({
  variant = "card",
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className = "",
}: EmptyStateProps) {
  const isCard = variant === "card"
  const DefaultIcon = isCard ? Compass : SearchX
  const EffectiveIcon = Icon || DefaultIcon

  const renderAction = () => {
    if (!actionLabel) return null

    if (actionHref) {
      return (
        <Link
          href={actionHref}
          className={
            isCard
              ? "btn-glass inline-flex items-center gap-2 font-semibold text-xs text-slate-700 dark:text-slate-200 mt-2"
              : "text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer mt-1"
          }
        >
          {isCard && <Plus className="w-3.5 h-3.5 text-brand-500" />}
          <span>{actionLabel}</span>
        </Link>
      )
    }

    if (onAction) {
      return (
        <button
          type="button"
          onClick={onAction}
          className={
            isCard
              ? "btn-glass inline-flex items-center gap-2 font-semibold text-xs text-slate-700 dark:text-slate-200 mt-2 cursor-pointer"
              : "text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer mt-1"
          }
        >
          {isCard && <Plus className="w-3.5 h-3.5 text-brand-500" />}
          <span>{actionLabel}</span>
        </button>
      )
    }

    return null
  }

  if (isCard) {
    return (
      <div
        className={`bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center gap-3 ${className}`}
      >
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-1 shadow-sm shrink-0">
          <EffectiveIcon className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h4>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed -mt-1">
            {description}
          </p>
        )}
        {renderAction()}
      </div>
    )
  }

  // Sub-Well (Filter Empty-State mit 2px gestricheltem Rand)
  return (
    <div
      className={`bg-slate-50/60 dark:bg-[#070c12]/50 border-2 border-dashed border-slate-300/80 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-2 ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-slate-200/70 dark:bg-[#161f28] border border-slate-300/40 dark:border-white/5 text-slate-400 dark:text-slate-400 flex items-center justify-center mb-1 shadow-sm shrink-0">
        <EffectiveIcon className="w-5 h-5" />
      </div>
      <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</div>
      {description && (
        <div className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
          {description}
        </div>
      )}
      {renderAction()}
    </div>
  )
}
