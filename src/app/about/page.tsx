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
            {/* V 0.3.6 */}
            <div className="relative pl-6 border-l-2 border-brand-500">
               <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-brand-500" />
               <div className="flex items-center gap-3 mb-2">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0">Version 0.3.6</h3>
                 <span className="text-xs px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded font-medium">Aktuell</span>
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
