"use client"

import { useStore } from "@/store/useStore"
import { ChevronUp, ChevronDown } from "lucide-react"
import Kbd from "@/components/ui/Kbd"

export default function Legend() {
  const activeSidebarPanel = useStore(state => state.activeSidebarPanel)
  const setActiveSidebarPanel = useStore(state => state.setActiveSidebarPanel)
  const isOpen = activeSidebarPanel === 'legend'

  return (
    <div className="bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 p-4 sm:p-5 shadow-sm flex flex-col gap-4 shrink-0 min-h-[56px]">
      <div 
        className="flex items-center justify-between cursor-pointer group min-h-[40px] py-1 shrink-0 select-none"
        onClick={() => setActiveSidebarPanel(isOpen ? 'statistics' : 'legend')}
      >
        <h2 className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
          Legende
        </h2>
        <button className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-5 mt-1">
          {/* Abwesenheit */}
          <div className="flex flex-col gap-2.5">
            <div className="text-[11px] uppercase tracking-wider text-brand-600 dark:text-brand-400 font-bold border-b border-slate-100 dark:border-white/10 pb-1.5">
              Abwesenheit
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-u shrink-0 shadow-xs">U</div>
                <span className="font-medium">Urlaub (Voll)</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd>U</Kbd></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-u-2 shrink-0 shadow-xs">U/2</div>
                <span className="font-medium">Urlaub (Halb)</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd keys={["⇧", "U"]} /></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-k shrink-0 shadow-xs">K</div>
                <span className="font-medium">Krank (Voll)</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd>K</Kbd></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-k-2 shrink-0 shadow-xs">K/2</div>
                <span className="font-medium">Krank (Halb)</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd keys={["⇧", "K"]} /></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-s shrink-0 shadow-xs">S</div>
                <span className="font-medium">Sonderurlaub (Voll)</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd>S</Kbd></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-s-2 shrink-0 shadow-xs">S/2</div>
                <span className="font-medium">Sonderurlaub (Halb)</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd keys={["⇧", "S"]} /></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-a shrink-0 shadow-xs">A</div>
                <span className="font-medium">Auszeit/Sabbatical</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd>A</Kbd></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-ue shrink-0 shadow-xs">Ü</div>
                <span className="font-medium">Überstunden (Voll)</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd>Ü</Kbd></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-ue-2 shrink-0 shadow-xs">Ü/2</div>
                <span className="font-medium">Überstunden (Halb)</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd keys={["⇧", "Ü"]} /></span>
              </div>
            </div>
          </div>

          {/* Arbeit & Flexibilität */}
          <div className="flex flex-col gap-2.5">
            <div className="text-[11px] uppercase tracking-wider text-brand-600 dark:text-brand-400 font-bold border-b border-slate-100 dark:border-white/10 pb-1.5">
              Arbeit &amp; Flexibilität
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-m shrink-0 shadow-xs">M</div>
                <span className="font-medium">Mobiles Arbeiten</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd>M</Kbd></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-m-2 shrink-0 shadow-xs">M/2</div>
                <span className="font-medium">Mob. Arb. (Halb)</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd keys={["⇧", "M"]} /></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-b shrink-0 shadow-xs">B</div>
                <span className="font-medium">Bildungsurlaub</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd>B</Kbd></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-d shrink-0 shadow-xs">D</div>
                <span className="font-medium">Dienstreise</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd>D</Kbd></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="w-7 h-6 rounded-md flex items-center justify-center text-[10px] font-mono font-bold status-x shrink-0 shadow-xs">X</div>
                <span className="font-medium">Blockiert</span>
                <span className="hidden md:inline-flex ml-auto shrink-0"><Kbd>X</Kbd></span>
              </div>
            </div>
          </div>

          <div className="hidden md:block text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 p-3 rounded-xl bg-slate-50/80 dark:bg-[#070c12]/60 border border-slate-200/80 dark:border-white/10">
            <p><strong className="text-slate-700 dark:text-slate-200">Eintragen:</strong> Taste gedrückt halten (z. B. <Kbd>U</Kbd>) und auf den Tag klicken. Für halbe Tage zusätzlich <Kbd>Shift</Kbd> halten.</p>
            <p className="mt-2"><strong className="text-slate-700 dark:text-slate-200">Löschen:</strong> Tag einfach ohne gedrückte Taste anklicken.</p>
          </div>
        </div>
      )}
    </div>
  )
}
