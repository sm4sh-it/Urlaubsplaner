"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, CalendarDays, MousePointerClick, CalendarRange, Plane, Users, Settings, Sparkles } from "lucide-react"

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
        className="bg-white dark:bg-[#0d1117] w-full max-w-2xl max-h-[90vh] my-auto rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-100 dark:bg-brand-500/20 p-2.5 rounded-xl text-brand-600 dark:text-brand-400">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Hilfe &amp; Funktionen</h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">So nutzt du sm4sh's Urlaubsplaner optimal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 overflow-y-auto flex flex-col gap-6 text-slate-700 dark:text-slate-300">
          
          {/* Section 1: Einträge */}
          <section className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 md:p-5 border border-slate-100 dark:border-slate-800">
            <h3 className="flex items-center gap-2 text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              <MousePointerClick className="w-5 h-5 text-brand-500" />
              Tage eintragen &amp; löschen
            </h3>
            <ul className="space-y-2.5 text-sm md:text-base leading-relaxed">
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Ganzer Tag:</strong> Halte die Taste gedrückt (z. B. <kbd className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold font-mono">U</kbd> für Urlaub) und klicke auf das Datum.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Halber Tag:</strong> Halte zusätzlich <kbd className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold font-mono">Shift</kbd> gedrückt (z. B. <kbd className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-bold font-mono">Shift + U</kbd>). Halbe Tage lassen sich auch kombinieren!
              </li>
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Löschen:</strong> Klicke ohne gedrückte Taste auf einen markierten Tag.
              </li>
            </ul>
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs md:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              Alle Tastenbelegungen (z. B. <strong>M</strong> für Mobiles Arbeiten) findest du in der seitlichen Legende.
            </div>
          </section>

          {/* Section 2: Reisen & Ideen */}
          <section className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 md:p-5 border border-slate-100 dark:border-slate-800">
            <h3 className="flex items-center gap-2 text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              <Plane className="w-5 h-5 text-brand-500" />
              Reisen &amp; Urlaubsideen
            </h3>
            <p className="text-sm md:text-base leading-relaxed mb-2">
              Trage Urlaubsreisen direkt auf der Home-Seite ein.
            </p>
            <ul className="space-y-2 text-sm md:text-base leading-relaxed">
              <li>
                <strong className="text-amber-500">Idee:</strong> Wird im Kalender vormerkt, zieht aber erst dann Urlaubstage ab, wenn du den Status auf <em>"In Planung"</em> oder <em>"Gebucht"</em> umstellst.
              </li>
              <li>
                <strong className="text-slate-900 dark:text-slate-100">Finanzen:</strong> Geplantes Budget &amp; tatsächliche Kosten eintragen, um die Ausgaben im Blick zu behalten.
              </li>
            </ul>
          </section>

          {/* Section 3: Feiertage & Ferien */}
          <section className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2 text-sm md:text-base">
                <div className="w-4 h-4 rounded-sm bg-orange-400/20 border-t-2 border-[#ff7b72]" />
                Feiertage
              </div>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Werden automatisch für dein Bundesland geladen und kosten dich 0 Urlaubstage.
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2 text-sm md:text-base">
                <div className="w-4 h-0 border-b-2 border-amber-500" />
                Schulferien
              </div>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Mit gelben Balken am Tagesende hervorgehoben für optimale Familienplanung.
              </p>
            </div>
          </section>

          {/* Section 4: Profile & Einstellungen */}
          <section className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 md:p-5 border border-slate-100 dark:border-slate-800">
            <h3 className="flex items-center gap-2 text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">
              <Users className="w-5 h-5 text-brand-500" />
              Profile &amp; Anpassung
            </h3>
            <p className="text-sm md:text-base leading-relaxed mb-3">
              Wechsle Profile bequem über die Navigationsleiste. 
            </p>
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-xl text-xs md:text-sm">
              <Settings className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-slate-100">Einstellungen:</strong> Über das Zahnrad-Symbol oben kannst du Jahresanspruch, Übertragsfrist und Bundesland für jedes Profil individuell anpassen.
              </div>
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center shrink-0">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm md:text-base rounded-xl shadow-md transition-all cursor-pointer"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
