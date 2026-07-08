"use client"

import { useStore } from "@/store/useStore"
import { ChevronUp, ChevronDown } from "lucide-react"

export default function Legend() {
  const activeSidebarPanel = useStore(state => state.activeSidebarPanel)
  const setActiveSidebarPanel = useStore(state => state.setActiveSidebarPanel)
  const isOpen = activeSidebarPanel === 'legend'

  return (
    <div className="bg-white dark:bg-[var(--surface)] rounded-xl shadow-sm border border-slate-200 dark:border-[var(--border-subtle)] p-6 flex flex-col gap-4 shrink-0">
      <div 
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setActiveSidebarPanel(isOpen ? 'statistics' : 'legend')}
      >
        <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Legende</h2>
        <button className="p-1 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 rounded-md transition-colors">
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-6 mt-2">
          {/* Abwesenheit */}
      <div className="flex flex-col gap-3">
        <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--color-brand)] font-bold border-b border-slate-200 dark:border-[var(--border-subtle)] pb-1.5">Abwesenheit</div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-u shrink-0">U</div>
            <span>Urlaub (Voll)</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">U</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-u-2 shrink-0">U/2</div>
            <span>Urlaub (Halb)</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">⇧ U</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-k shrink-0">K</div>
            <span>Krank (Voll)</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">K</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-k-2 shrink-0">K/2</div>
            <span>Krank (Halb)</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">⇧ K</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-s shrink-0">S</div>
            <span>Sonderurlaub</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">S</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-a shrink-0">A</div>
            <span>Auszeit/Sabbatical</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">A</span>
          </div>
        </div>
      </div>

      {/* Arbeit & Flexibilität */}
      <div className="flex flex-col gap-3">
        <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--color-brand)] font-bold border-b border-slate-200 dark:border-[var(--border-subtle)] pb-1.5">Arbeit & Flexibilität</div>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-m shrink-0">M</div>
            <span>Mobiles Arbeiten</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">M</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-m-2 shrink-0">M/2</div>
            <span>Mob. Arb. (Halb)</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">⇧ M</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-ue shrink-0">Ü</div>
            <span>Überstunden (Voll)</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">Ü</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-ue-2 shrink-0">Ü/2</div>
            <span>Überstunden (Halb)</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">⇧ Ü</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-g shrink-0">G</div>
            <span>Gleitzeit</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">G</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-d shrink-0">D</div>
            <span>Dienstreise</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">D</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-slate-700 dark:text-slate-200">
            <div className="w-7 h-6 rounded flex items-center justify-center text-[10px] font-bold status-x shrink-0">X</div>
            <span>Blockiert</span>
            <span className="ml-auto font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-slate-500 dark:text-[var(--fg)] shrink-0">X</span>
          </div>
        </div>
      </div>

      <div className="text-[12px] leading-relaxed text-slate-500 dark:text-[var(--muted)] pt-2 border-t border-slate-200 dark:border-[var(--border-subtle)]">
        <strong>Eintragen:</strong> Taste gedrückt halten (z.B. 'U') und auf den Tag klicken. Für halbe Tage zusätzlich <code>Shift</code> halten.<br /><br />
        <strong>Löschen:</strong> Tag einfach ohne gedrückte Taste anklicken.
      </div>
        </div>
      )}
    </div>
  )
}
