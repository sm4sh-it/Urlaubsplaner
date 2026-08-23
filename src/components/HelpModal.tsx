"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, Sparkles } from "lucide-react"
import Kbd from "@/components/ui/Kbd"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/60 backdrop-blur-md transition-opacity overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#0d141d] w-full max-w-2xl max-h-[90vh] my-auto rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Clean ohne vorangestelltes Icon) */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 dark:border-white/10 shrink-0 bg-slate-50/50 dark:bg-[#070c12]/40">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">
              Hilfe &amp; Funktionen
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              So nutzt du sm4sh's Urlaubsplaner optimal
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 overflow-y-auto flex flex-col gap-5 text-slate-700 dark:text-slate-300 custom-scrollbar">
          
          {/* Section 1: Einträge */}
          <section className="bg-slate-50/80 dark:bg-[#070c12]/60 rounded-2xl p-4 md:p-5 border border-slate-200/80 dark:border-white/10">
            <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-2.5">
              Tage eintragen &amp; löschen
            </h3>
            <ul className="space-y-2.5 text-sm md:text-base leading-relaxed">
              <li className="flex items-center gap-2 flex-wrap">
                <strong className="text-slate-800 dark:text-slate-200">Ganzer Tag:</strong> Halte die Taste gedrückt (z. B. <Kbd>U</Kbd> für Urlaub) und klicke auf das Datum.
              </li>
              <li className="flex items-center gap-2 flex-wrap">
                <strong className="text-slate-800 dark:text-slate-200">Halber Tag:</strong> Halte zusätzlich <Kbd>Shift</Kbd> gedrückt (z. B. <Kbd keys={["Shift", "U"]} />). Halbe Tage lassen sich auch kombinieren!
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Löschen:</strong> Klicke ohne gedrückte Taste auf einen markierten Tag.
              </li>
            </ul>
            <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-white/10 text-xs md:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Alle Tastenbelegungen (z. B. <Kbd>M</Kbd> für Mobiles Arbeiten) findest du in der seitlichen Legende.</span>
            </div>
          </section>

          {/* Section 2: Reisen & Ideen */}
          <section className="bg-slate-50/80 dark:bg-[#070c12]/60 rounded-2xl p-4 md:p-5 border border-slate-200/80 dark:border-white/10">
            <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-2.5">
              Reisen &amp; Urlaubsideen
            </h3>
            <p className="text-sm leading-relaxed mb-2 text-slate-600 dark:text-slate-400">
              Trage Urlaubsreisen direkt auf der Home-Seite ein.
            </p>
            <ul className="space-y-2 text-sm leading-relaxed">
              <li>
                <strong className="text-amber-600 dark:text-amber-400">Idee:</strong> Wird im Kalender vorgemerkt, zieht aber erst dann Urlaubstage ab, wenn du den Status auf <em>"In Planung"</em> oder <em>"Gebucht"</em> umstellst.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Finanzen:</strong> Geplantes Budget &amp; tatsächliche Kosten eintragen, um die Reiseausgaben im Blick zu behalten.
              </li>
            </ul>
          </section>

          {/* Section 3: Feiertage & Ferien */}
          <section className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-50/80 dark:bg-[#070c12]/60 rounded-2xl p-4 border border-slate-200/80 dark:border-white/10">
              <div className="font-bold text-slate-800 dark:text-slate-100 mb-1.5 flex items-center gap-2 text-sm md:text-base">
                <div className="w-3.5 h-3.5 rounded-sm bg-orange-400/20 border-t-2 border-[#ff7b72]" />
                Feiertage
              </div>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Werden automatisch für dein Bundesland geladen und kosten dich 0 Urlaubstage.
              </p>
            </div>
            
            <div className="bg-slate-50/80 dark:bg-[#070c12]/60 rounded-2xl p-4 border border-slate-200/80 dark:border-white/10">
              <div className="font-bold text-slate-800 dark:text-slate-100 mb-1.5 flex items-center gap-2 text-sm md:text-base">
                <div className="w-3.5 h-1 rounded bg-amber-500" />
                Schulferien
              </div>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Mit gelben Balken am Tagesende hervorgehoben für optimale Familienplanung.
              </p>
            </div>
          </section>

          {/* Section 4: Profile & Einstellungen */}
          <section className="bg-slate-50/80 dark:bg-[#070c12]/60 rounded-2xl p-4 md:p-5 border border-slate-200/80 dark:border-white/10">
            <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 mb-2.5">
              Profile &amp; Anpassung
            </h3>
            <p className="text-sm leading-relaxed mb-3 text-slate-600 dark:text-slate-400">
              Wechsle Profile bequem über die Navigationsleiste.
            </p>
            <div className="p-3 bg-white dark:bg-[#0d141d] border border-slate-200 dark:border-white/10 rounded-xl text-xs md:text-sm text-slate-600 dark:text-slate-300">
              <strong className="text-slate-800 dark:text-slate-100">Einstellungen:</strong> Über das Zahnrad-Symbol oben kannst du Jahresanspruch, Übertragsfrist und Bundesland für jedes Profil individuell anpassen.
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-[#070c12]/40 text-center shrink-0">
          <button 
            onClick={onClose}
            className="btn-glass px-8 py-2 font-semibold text-sm text-slate-700 dark:text-slate-200"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
