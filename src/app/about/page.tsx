import { CalendarDays, Info, History } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 mt-4">
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
          <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400">
            <Info className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Über das Projekt</h1>
            <p className="text-slate-500 dark:text-slate-400">sm4shReisen - Der smarte Urlaubsplaner</p>
          </div>
        </div>

        <div className="max-w-none">
          <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
            Der <strong>sm4shReisen Urlaubsplaner</strong> wurde entwickelt, um die Urlaubsplanung für Teams oder die ganze Familie 
            schnell, übersichtlich und einfach zu machen. Er kombiniert automatische Feiertags- und Ferienberechnungen 
            mit einem intuitiven, tastaturgesteuerten Interface.
          </p>

          <h2 className="flex items-center gap-2 mt-12 mb-6 text-xl font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
            <History className="h-5 w-5 text-brand-500" />
            Changelog
          </h2>

          <div className="space-y-8">
            {/* V 0.8.1 */}
            <div className="relative pl-6 border-l-2 border-brand-500">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-brand-500" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.8.1</h3>
                 <span className="text-xs px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded font-medium">Aktuell</span>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Statistik Design:</strong> Revert der Recharts-Kreisdiagramme für "Buchungsstatus" und "Art der Reise" zurück auf das cleane, selbsterstellte SVG-Design inkl. platzsparender Legende.</li>
               </ul>
            </div>

            {/* V 0.8.0 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.8.0</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Erweiterte Statistiken:</strong> Interaktive Recharts-Graphen für den "Urlaubs-Guthaben Verlauf", "Krankheitstage nach Wochentag" und "Kosten vs. Reisedauer" zur Statistikseite hinzugefügt.</li>
                 <li><strong>Statistik Layout:</strong> Neue, sauber getrennte Jahresauswertung am oberen Rand der Statistikseite sowie optimierte Hydration für ein robusteres Neuladen.</li>
                 <li><strong>Sabbatical (Auszeit):</strong> Sabbaticals haben ab sofort eine eigenständige Kategorie (`A`) und erstrahlen im Kalender nun farblich abgesetzt in Himmelblau.</li>
               </ul>
            </div>

            {/* V 0.7.1 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.7.1</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Design-Feinschliff:</strong> Dashboard und Statistik nutzen nun dieselbe Breite. Die Jahresübersicht ist vergrößert und besser zentriert.</li>
                 <li><strong>Statistik-Graphen:</strong> Kreisdiagramme haben kontrastreichere Farben, und die Darstellung der Reisetypen ist nun extrem sauber und modern ohne Balken gelöst.</li>
                 <li><strong>Einstellungen:</strong> Wochentage lassen sich nun via eleganter, kalender-ähnlicher Kästchen-Buttons umschalten.</li>
               </ul>
            </div>

            {/* V 0.7.0 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.7.0</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Statistik-Seite:</strong> Eine völlig neue, umfangreiche Statistikseite mit Auswertungen zu Urlaubsdauer, Budget und Reisearten.</li>
                 <li><strong>Virtueller User 'AlleFerien':</strong> Ein neuer virtueller Profil-Eintrag, der eine gebündelte Schulferienübersicht aller 16 Bundesländer liefert.</li>
                 <li><strong>Auto-Archivierung:</strong> Vergangene Reisen werden beim Öffnen der App automatisch auf "Abgeschlossen" gesetzt.</li>
                 <li><strong>Reisekalkulation:</strong> Sabbaticals, Sonderurlaube, Mobiles Arbeiten und Überstundenabbau verbrauchen als Reiseart nun keinen regulären Urlaub mehr.</li>
               </ul>
            </div>

            {/* V 0.6.3 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.6.3</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Rollover-Fix:</strong> Ein Fehler beim Jahreswechsel wurde behoben, bei dem die Urlaubstage von Reisen/Trips im Vorjahr beim Ausrechnen des Resturlaubs ignoriert wurden.</li>
                 <li><strong>Wochenenden & Feiertage:</strong> Manuell an arbeitsfreien Tagen oder Feiertagen eingetragene Urlaubstage im Kalender ("U") kosten nun keine Tage mehr vom Urlaubsbudget.</li>
               </ul>
            </div>

            {/* V 0.6.2 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.6.2</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Startjahr:</strong> In den Profil-Einstellungen kann nun das Startjahr festgelegt werden, ab dem das Urlaubsbudget (inklusive Resturlaub) gezählt wird. Ideal für neue Nutzer, die in späten Jahren dazustoßen.</li>
                 <li><strong>Trip Status Farben:</strong> Die Farben für "In Planung", "Idee" und "Gebucht" wurden verfeinert. Die Option "Ansparphase" wurde entfernt.</li>
               </ul>
            </div>

            {/* V 0.6.1 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.6.1</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Auto-Cleanup:</strong> Manuelle Kalendereinträge, die sich mit Trips überschneiden, werden nun automatisch gelöscht.</li>
                 <li><strong>Frontend Sync:</strong> Nach dem Hinzufügen, Bearbeiten oder Löschen von Trips wird der Zustand live im Store aktualisiert.</li>
                 <li><strong>Dashboard Redesign:</strong> Kompaktere Statistiken, Github-Style Jahresübersicht, und aufgeräumte UI Elemente.</li>
               </ul>
            </div>

            {/* V 0.6.0 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.6.0</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Trips & Reisen:</strong> Neues Modell für Ausflüge, das automatisch im Kalender blockiert.</li>
                 <li><strong>Individuelle Arbeitstage:</strong> Arbeitstage pro Profil einstellbar, Feiertage/Wochenenden kosten keinen Urlaub mehr.</li>
                 <li><strong>Home Dashboard:</strong> Startseite durch ein neues Premium-Dashboard ersetzt.</li>
               </ul>
            </div>

            {/* V 0.5.0 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.5.0</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Premium UI:</strong> Neues Kachel-Design mit abgerundeten Ecken, Glassmorphism-Elementen und subtilem Glow im Darkmode für ein hochwertigeres Look & Feel.</li>
                 <li><strong>Mobiles Arbeiten:</strong> Home-Office (`M`) und halbe Home-Office-Tage (`Shift+M`) können nun im Kalender eingetragen und in der Statistik separat erfasst werden.</li>
                 <li><strong>Ergonomie & Layout:</strong> Statistiken und Legende lassen sich nun individuell ein- und ausklappen. Das Profil-Menü wurde linksbündig ausgerichtet und alle Farbcodes global über CSS-Variablen harmonisiert.</li>
               </ul>
            </div>

            {/* V 0.4.0 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.4.0</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Layout:</strong> Die Seitenleiste (Statistik & Legende) ist nun über einen mittig platzierten, deutlich sichtbaren Pfeil-Button einklappbar, um mehr Platz für den Kalender zu bieten.</li>
                 <li><strong>Neue Kürzel:</strong> Halbtage für Urlaub (Shift+U), Krankheit (Shift+K) und Überstunden (Shift+Ü) lassen sich nun intuitiver eintragen und werden mit U/2, K/2 und Ü/2 (im helleren Farbton) im Kalender angezeigt.</li>
               </ul>
            </div>

            {/* V 0.3.9 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.3.9</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Docker Build-Cache:</strong> Ein kritischer Fehler wurde behoben, bei dem Next.js während des Docker-Builds Standardprofile generierte und diese fest ins Cache-HTML einbrannte, was nach dem Start zu unsichtbaren Profilen oder "Foreign Key"-Fehlern beim Eintragen von Urlauben führte.</li>
               </ul>
            </div>

            {/* V 0.3.8 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.3.8</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Datenbank Fehler:</strong> Ein Fehler beim Hinzufügen von Urlauben nach einem Datenbank-Reset wurde behoben. Der Browser bereinigt nun automatisch alte Profil-IDs, die nicht mehr existieren.</li>
               </ul>
            </div>

            {/* V 0.3.7 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.3.7</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Dokumentation:</strong> Das Docker Compose-Beispiel in der README wurde auf benannte Volumes (`urlaubsplaner_data:/app/data`) aktualisiert.</li>
               </ul>
            </div>

            {/* V 0.3.6 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.3.6</h3>
               </div>
               <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                 <li><strong>Docker SQLite-Rechte:</strong> Ein Problem mit fehlenden Schreibrechten beim Einhängen lokaler Verzeichnisse unter Linux-Host-Systemen wurde behoben, indem das Dateisystem-Volume (`./data:/app/data`) in ein natives Docker-Volume (`urlaubsplaner_data:/app/data`) umgewandelt wurde.</li>
               </ul>
            </div>

            {/* V 0.3.5 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.3.5</h3>
              </div>
              <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Passwort-Fix über HTTP:</strong> Das Cookie-Attribut <code>secure</code> wurde deaktiviert, damit die Anmeldung über unverschlüsselte lokale Netzwerkverbindungen (z. B. auf dem Raspberry Pi) nicht vom Browser blockiert wird.</li>
              </ul>
            </div>

            {/* V 0.3.4 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 m-0">Version 0.3.4</h3>
              </div>
              <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Port-Korrektur:</strong> Die Portweiterleitung in <code>docker-compose.yml</code> wurde auf <code>8666:8666</code> korrigiert, um Erreichbarkeitsprobleme zu beheben.</li>
                <li><strong>Datenbank-Persistence:</strong> Der SQLite-Pfad wurde im Dockerfile auf <code>/app/data/dev.db</code> gelegt und im Compose-Setup als robustes Verzeichnis-Volume (<code>./data:/app/data</code>) konfiguriert.</li>
              </ul>
            </div>

            {/* V 0.3.3 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 m-0">Version 0.3.3</h3>
              </div>
              <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Docker Fix 3:</strong> Die Datenbank-URL wurde im Dockerfile wieder auf <code>/app/prisma/dev.db</code> zurückgesetzt, um Berechtigungsfehler (<em>unable to open database file</em>) bei existierenden Volume-Mounts zu beheben.</li>
                <li><strong>Port-Anpassung:</strong> Die <code>docker-compose.yml</code> lauscht nun standardmäßig auf dem gewünschten Port <code>8666</code>.</li>
              </ul>
            </div>

            {/* V 0.3.2 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 m-0">Version 0.3.2</h3>
              </div>
              <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Docker Fix 2:</strong> Behebung von <code>Cannot find module</code> Fehlern für <code>dotenv</code> und <code>@prisma/config</code> beim Starten des Containers.</li>
              </ul>
            </div>

            {/* V 0.3.1 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 m-0">Version 0.3.1</h3>
              </div>
              <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Docker Fix:</strong> Die neue <code>prisma.config.ts</code> wird nun ordnungsgemäß ins Production-Image kopiert.</li>
              </ul>
            </div>

            {/* V 0.3.0 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 m-0">Version 0.3.0</h3>
              </div>
              <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Prisma 7 Upgrade:</strong> Vollständiges Upgrade auf Prisma 7.8 unter Verwendung des neuen <code>@prisma/adapter-libsql</code> für verbesserte Performance und &quot;Rust-free&quot; Execution.</li>
                <li><strong>Node 22:</strong> Upgrade des Docker-Basis-Images auf Node 22 für Prisma 7 Kompatibilität und besseren Support in GitHub Actions.</li>
              </ul>
            </div>

            {/* V 0.2.3 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 m-0">Version 0.2.3 & 0.2.2</h3>
              </div>
              <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Standard-Port:</strong> Wechsel von 3000 auf 8666, um Konflikte mit anderen Diensten zu vermeiden.</li>
                <li><strong>Docker Build:</strong> Fixes für Next.js Prerendering und Prisma CLI Versionskonflikte.</li>
              </ul>
            </div>

            {/* V 0.2.1 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 m-0">Version 0.2.1</h3>
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-medium">Release</span>
              </div>
              <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>GitHub Actions:</strong> Automatisierte CI/CD Pipeline für Docker-Image Builds über ghcr.io.</li>
                <li><strong>Docker Compose:</strong> Bereitstellung einer fertigen <code>docker-compose.prod.yml</code> Vorlage.</li>
              </ul>
            </div>

            {/* V 0.2.0 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 m-0">Version 0.2.0</h3>
              </div>
              <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>UI/UX Redesign:</strong> Wechsel auf ein tiefes Anthrazit im Darkmode und Einführung der neuen <code>#0088c2</code> Brand-Farbe.</li>
                <li><strong>Kalender Redesign:</strong> Die Kalender-Matrix nutzt nun direkt die Farben der Legende als Hintergrund. Die Personenfarbe dient zur besseren Unterscheidung als Rahmen.</li>
                <li><strong>Tooltips:</strong> Wochentage und detaillierte Datumsanzeigen beim Hover über Kalendertage.</li>
                <li><strong>Jahreswechsel & Resturlaub:</strong> Komplexe rekursive Logik für die automatische Übertragung von ungenutztem Resturlaub in Folgejahre.</li>
                <li><strong>API Schutzmechanismen:</strong> Sperre für Jahre vor 2022 und Begrenzung auf +4 Jahre ab aktuellem Jahr zur Schonung von externen Rate Limits.</li>
                <li><strong>Overrides:</strong> Neues System, um Urlaubsansprüche für einzelne Jahre isoliert anpassen zu können.</li>
              </ul>
            </div>

            {/* V 0.1.0 */}
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600" />
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 m-0">Version 0.1.0</h3>
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded font-medium">Initial Release</span>
              </div>
              <ul className="list-disc list-outside ml-4 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                <li><strong>Grundgerüst:</strong> Next.js App Router Setup mit Tailwind CSS und Prisma (SQLite).</li>
                <li><strong>Kalender-Engine:</strong> Tastaturgesteuerte schnelle Eingabe von Urlauben, Krankheitstagen und Dienstreisen.</li>
                <li><strong>API Anbindung:</strong> Automatischer Sync für länderspezifische Feiertage und Schulferien mit internem Caching.</li>
                <li><strong>Statistiken:</strong> Live-Berechnung von genommenen Tagen, Resturlaub und Warnungen bei drohendem Verfall von Urlaubsansprüchen.</li>
                <li><strong>Profilverwaltung:</strong> Anlage und Verwaltung von mehreren Familienmitgliedern oder Kollegen.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
