"use client"

import { X, CalendarDays, MousePointerClick, CalendarRange, Users, Settings } from "lucide-react"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white dark:bg-[#0d1117] w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-[var(--border-subtle)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-100 dark:bg-brand-500/20 p-2 rounded-lg">
              <CalendarDays className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Hilfe & Funktionen</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-8">
          
          {/* Section 1: Einträge */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              <MousePointerClick className="w-5 h-5 text-brand-500" />
              Tage eintragen & löschen
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Um einen Tag (wie Urlaub oder Krankheit) im Kalender zu markieren, nutzt du eine Kombination aus Tastatur und Maus:
              </p>
              <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-2">
                <li><strong>Ganzer Tag:</strong> Halte die jeweilige Taste (z. B. <kbd className="px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono">U</kbd> für Urlaub) gedrückt und klicke auf das gewünschte Datum.</li>
                <li><strong>Halber Tag:</strong> Halte zusätzlich die <kbd className="px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono">Shift</kbd> Taste gedrückt (z. B. <kbd className="px-2 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono">Shift + U</kbd>). Halbe Tage werden in helleren Farben dargestellt.</li>
                <li><strong>Eintrag löschen:</strong> Klicke einfach auf einen bereits markierten Tag, <em>ohne</em> eine Taste gedrückt zu halten.</li>
              </ul>
              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
                Tipp: Die Tastenbelegung für jeden Typen (z. B. <strong>M</strong> für Mobiles Arbeiten) findest du jederzeit in der Legende links!
              </div>
            </div>
          </section>

          {/* Section 2: Kalender-Anzeige */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              <CalendarRange className="w-5 h-5 text-brand-500" />
              Besondere Markierungen
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="font-medium text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-orange-400/20 border-t-2 border-[#ff7b72]" />
                  Gesetzliche Feiertage
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Feiertage werden durch einen leicht orangenen Hintergrund und einen roten Balken am oberen Rand der Zelle hervorgehoben. Sie zählen bei der Urlaubsberechnung nicht mit.
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="font-medium text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                  <div className="w-4 h-0 border-b-2 border-amber-500" />
                  Schulferien
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Zeiten, in denen Schulferien stattfinden, sind mit einem gelben Strich am unteren Rand der Zelle markiert. Sehr praktisch für Eltern!
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Profile & Verwaltung */}
          <section>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              <Users className="w-5 h-5 text-brand-500" />
              Profile verwalten
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 space-y-3">
              <p>
                Du kannst für jedes Familien- oder Teammitglied ein eigenes Profil anlegen. Wechsle das aktive Profil einfach über das Dropdown oben rechts in der Navigationsleiste.
              </p>
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-[var(--surface)] border border-slate-200 dark:border-[var(--border-subtle)] rounded-lg">
                <Settings className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs">
                  <strong>Neu erstellen & bearbeiten:</strong> Klicke auf das Zahnrad-Symbol oben rechts. Dort legst du Namen, Bundesland (wichtig für korrekte Feiertage) und Urlaubsansprüche fest.
                </p>
              </div>
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-[var(--border-subtle)] bg-slate-50 dark:bg-slate-900 text-center shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  )
}
