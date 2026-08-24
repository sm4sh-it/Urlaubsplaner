# Changelog

## [1.8.6] - 2026-08-24
### Added & Improved
- **Unified Glass Kalender-Seitenleiste (`CalendarSidebar.tsx`):**
  - Zusammenführung von Statistik und Legende in einen einzigen, durchgängigen Midnight Glass Container.
  - Neuer Segmented Control Switcher (`[ 📊 Statistik ]` &bull; `[ 📖 Legende ]`) und integrierter Schließen-Button im Header (`PanelRightClose`).
  - Schlankes 1-Spalten-Layout der Monatsübersicht ohne verschachtelte Scrollbalken und ohne doppelte Kastenrahmen (`divide-y` Typografie-Zeilen).
  - Schwebender Öffnen-Button (`btn-glass` mit `PanelRightOpen`) exakt bündig auf Höhe der Kalender-Überschrift.
  - Responsives automatisches Einklappen bei Bildschirmen `< 1280px` beim Laden und bei Fenstergrößenänderungen.
- **ICS-Kalenderexport nach RFC 5545 (`src/lib/icsUtils.ts`):**
  - Neuer Action-Button *„Kalender (.ics)“* im Dialog „Reise bearbeiten“ (`TripModal.tsx`).
  - Direkter clientseitiger Download standardisierter Kalenderdateien mit automatischer Dateinamen-Generierung (`Reisetitel.ics`), exakter Ganztags-Berechnung (`DTEND` +1 Tag) sowie Übernahme von Ort, Status, Kategorie, Transportmittel, Teilnehmern und Notizen.
  - 100 % kompatibel mit Apple Kalender (iOS/macOS), Google Kalender (Android) und Microsoft Outlook.
- **Budget-Modal mit intelligenter Reise-Verknüpfung (`CreateBudgetModal.tsx`):**
  - Vorgeschaltetes Dropdown zur Auswahl des Reisejahres.
  - Filtert und sortiert Reisen chronologisch absteigend (neueste Reise zuerst), um langes Scrollen bei vielen Reisen zu verhindern.
- **Perfekt synchronisierte Wochentags-Höhe in der Heatmap (`YearlyContributionGraph.tsx`):**
  - Mathematisch präzise 7-Zeilen-CSS-Grid-Koppelung (`flex items-stretch` mit `grid grid-rows-7`) für die Wochentage `Mo`, `Mi`, `Fr`, `So` auf dem Dashboard.
- **Styling- & Kontur-Bereinigung bei Mobilem Arbeiten:**
  - Entfernung störender grauer Innenrahmen / Konturen bei ganztägigem (`status-m`) und halbtägigem Mobilen Arbeiten (`status-m-2`) im Kalenderraster und in der Legende.
- **Mobile Layout & Header-Spacing Feinschliff:**
  - Großzügiger oberer Freiraum unter der fixierten Navigationsleiste (`pt-5 sm:pt-6 md:pt-8`) zur Vermeidung von Überschriften-Kollisionen auf Smartphones.
  - Kompakte, scrollbare Profilauswahl im Mobile-Menü (`max-h-36 overflow-y-auto`), direkter Link zu *„Über das Projekt & Changelog“* (`/about`) und bereinigter Drawer-Footer (`by sm4sh.it • v1.8.6`).

## [1.8.0] - 2026-08-23
### Added & Improved
- **Midnight Glass Design System (Globales Redesign):**
  - **Karten- & Container-Ästhetik:** Umstellung aller Views (Dashboard, Kalender-Sidebar, Budget, Statistiken, Archiv, Einstellungen, Hilfe) auf edles Midnight Glass Design (`bg-white dark:bg-[#0d141d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-sm`).
  - **Standardisierte Content-Breite:** Vereinheitlichung auf `max-w-[1600px] mx-auto p-3 sm:p-5 md:p-8 pt-2 sm:pt-4 md:pt-6 pb-24 md:pb-28` über alle Seiten hinweg.
  - **Bereinigung der Überschriften (Regel 1.1):** Striktes Entfernen von Icons vor H1-, H2- und H3-Überschriften für einen cleanen, modernen Look.
  - **2-Stufige Button-Hierarchie:**
    - **1. Ebene (Seiten-Aktionen):** Glassmorphism-Buttons (`.btn-glass`) mit dezentem Lift- & Glow-Effekt.
    - **2. Ebene (Modals & Pop-ups):** Schlichter, unaufdringlicher Text- & Accent-Button Standard (`TripModal`, `CreateBudgetModal`, `ExpenseModal`, `CategoryModal`, `AddParticipantModal`, `ProfileModal`, `HelpModal`).
  - **Disketten-Icons (`Save`):** Einheitliches Speichern-Icon in allen Formularen und Modals.
  - **Typografie & Zahlen:** Durchgehende Monospace-Hervorhebung (`font-mono font-bold`) für Beträge, Währungen, Salden, Zähler und Datumsangaben.
- **Vollständig integriertes Toast- & Notification-System:**
  - Anbindung aller Kernaktionen an das Midnight Glass Toast-System (Erstellen, Bearbeiten, Löschen von Reisen, Budgets, Ausgaben, Kategorien, Teilnehmern, Profilen sowie Feiertage-Sync und WhatsApp-Abrechnungsexport).
  - Vollständige Eliminierung aller alten Browser-`alert()` Dialoge zugunsten animierter `success`, `info` und `error` Toasts.
- **Fluide & Responsive Jahres-Aktivitätsübersicht (WQHD & 4K optimiert):**
  - Umstellung der 53-Wochen-Heatmap auf ein dynamisches CSS-Grid (`repeat(weeksCount, minmax(0, 1fr))`), das sich stufenlos bis zur vollen 1600px Content-Breite auf WQHD- und 4K-Monitoren vergrößert.
  - Pixelgenaue Ausrichtung der Monats- und Wochentagszeilen per Grid-Koppelung.
  - Verstärkter Kachel-Schatten im Light Mode für optimalen Kontrast (`shadow-[0_1px_3px_rgba(15,23,42,0.22)]`) und vergrößerter Freiraum ohne Hover-Abschneiden (`hover:scale-130`).
  - Eleganter `min-w-[960px]` Fallback mit horizontalem Scrollen auf kleinen Tablet-/Mobil-Bildschirmen.
- **Statistik-Dashboard & Widget-Verbesserungen:**
  - Neue thematische Icons in der Kachel *„Urlaubsverteilung über die Jahre“*: `Parasol` (Urlaub) und `Bandage` (Krankheit).
  - Korrektur von doppelten Währungszeichen im Chart *„Kosten vs. Reisedauer“*.

## [1.6.6] - 2026-08-16
### Added & Improved
- **Neues Einstellungs- & Profil-Dashboard (Kachel- & Modal-Workflow):**
  - **Profil-Kacheln:** Alle Benutzerprofile werden nun als informative Kacheln mit Farb-Avatar, Bundesland im Klartext, Urlaubsansprüchen und aktiven Wochentag-Chips dargestellt.
  - **Neues Profil-Modal (`ProfileModal`):** Vollständig konsistenter Dialog zum Erstellen und Bearbeiten von Profilen mit Farbwähler, Schnellpaletten, Bundeslandauswahl, Kontingenten und Wochentagsschaltern.
  - **Visuelles Feedback:** Optische Toast-Bestätigung beim Speichern, Erstellen oder Löschen von Profilen.
- **Budget-Kategorie „Ausgleich“ & Standard-Kategorien Wiederherstellung:**
  - Neue vordefinierte Standard-Kategorie `Ausgleich` für Schuldenbegleichungen zwischen Teilnehmern (inkl. automatischer Bereitstellung für alle bestehenden Budgets).
  - Ausgleichszahlungen fließen **nicht** in die Gesamtausgaben der Reise, die Kategorieverteilung oder die synchronisierten Reisekosten ein, werden aber voll in den individuellen Teilnehmer-Salden („Wer schuldet wem wie viel?“) angerechnet.
  - Ein-Klick-Aktion *„Ausgleichen“* im Saldenausgleichs-Tab zum direkten Vorbefüllen des Ausgaben-Modals.
  - **Standard-Kategorien wiederherstellen:** Neuer Button im Kategorie-Modal und im Analytics-Tab sowie Schnell-Vorlagen-Chips für fehlende Standardkategorien (z. B. bei älteren Budgets oder versehentlich gelöschten Kategorien).
- **Kalender-Optimierungen:**
  - Fixierte Kalendertage (1–31) beim vertikalen Scrollen auf kleineren Bildschirmen (`sticky top-0`) mit transparentem Hintergrund.
  - Farbangleichung der Kalendertage an die Monatsnamen (`slate-500` / `slate-300`).
  - Zellentexte `--status-text` harmonisiert auf `slate-700` (`#334155`) im Light-Mode und `slate-300` (`#cbd5e1`) im Dark-Mode.

## [1.6.2] - 2026-08-14
### Added & Improved
- **Lokale Kategorie-Icons & Icon-Auswahl im Budget:**
  - Standard-Ausgabekategorien (Unterkunft, Transport, Verpflegung, Aktivitäten, Shopping, Sonstiges) verfügen nun automatisch über zugehörige Lucide-Icons (Hotel, Flugzeug, Besteck, Kompass, Einkaufstasche, Beleg).
  - Neuer interaktiver, MIT-lizenzierter und lokal gehosteter Icon-Picker (`lucide-react`) im Kategorie-Modal zur flexiblen Auswahl individueller Icons beim Anlegen neuer Kategorien.
  - Nahtlose, dynamische Darstellung der Icons in der Ausgabenliste und im Kategorie-Analytics-Tab.
- **Harmonisiertes 3-Stufen-Typografie- & Farbsystem (Less is More):**
  - Vollständige Konsolidierung aller Schriftstärken (Entfernung von `font-extrabold` zugunsten eleganter `font-semibold` und `font-bold` Stile).
  - Bereinigung aller inkonsistenten Textfarben (wie harte `slate-800` Kontraste im Light Mode und grelles `slate-100` im Dark Mode) im gesamten Projekt (Dashboard, Kalender, Budget, Statistiken, Einstellungen, Hilfe, Modals und Diagramme).
  - Umfassender Kontrast-Audit nach WCAG 2.1 AA/AAA für alle Text- und Hintergrundkombinationen.
- **Kalender-Lesbarkeit & halbe Tage im Light-Mode:**
  - Einführung der dynamischen `--status-text` CSS-Variable (`#0f172a` im Light Mode, `#ffffff` im Dark Mode).
  - Behebung des Problems unleserlicher Buchstabeneinträge bei halben Tagen (`U/2`, `K/2`, `M/2`, `S/2`, etc.) auf diagonalen Verlaufshintergründen im Light Mode.

## [1.6.1] - 2026-08-14
### Fixed & Improved
- **Scrollverhalten & Verlaufshintergrund auf allen Budget-Seiten:** Behebung des Scrollfehlers auf der Hauptübersicht (`/budget`) und der Reisedetailseite (`/budget/[tripBudgetId]`). Die Seiten nutzen nun den einheitlichen, flüssigen Scroll-Container und lassen den dynamischen Verlaufshintergrund nahtlos durchscheinen.
- **Sticky Kalender-Tage (Vertikales Scrollen):** Die Tage-Kopfzeile (1–31) bleibt nun beim vertikalen Scrollen auf kleineren Bildschirmen oben fixiert (`sticky top-0`), sodass beim Durchscrollen der Monate stets die Tagesnummern sichtbar bleiben (analog zur fixierten Monatsspalte beim horizontalen Scrollen).
- **Harmonisierte Überschriften & Responsive Spacing:** Perfekt vereinheitlichte Überschriftenhöhen, Schriftgrößen und optimierte Abstände auf der Kalender-, Budget- und Home-Seite zur maximalen Platzausnutzung auf mobilen Geräten.

## [1.6.0] - 2026-08-14
### Added & Improved
- **Vollwertiges Modul "Budget- & Reisekostenverwaltung":**
  - **Hauptübersicht (`/budget`):** KPI-Dashboard zu Gesamtausgaben, geplantem Budgetlimit, erfassten Belegen und aktiven Budgets. Filterung nach Jahren und Echtzeit-Suche.
  - **Reisedetailseite (`/budget/[tripBudgetId]`):**
    - **Header & Schnellübersicht:** Gesamtkosten, Ø Kosten pro Reisetag, Ø Kosten pro Person und Budgetlimit-Fortschrittsbalken.
    - **Tab "Ausgaben":** Chronologische Belegerfassung mit Kategorie-Icons, Notizen, Zahler-Zuordnung und flexibler Kostenaufteilung (Gleichmäßig auf alle / ausgewählte Teilnehmer oder benutzerdefinierte Einzelbeträge).
    - **Tab "Kategorien & Analytics":** Auswertung der Ausgaben nach Kategorien mit Multi-Segment-Visualisierung, Tagesschnitt, Highlight der größten Einzelausgabe sowie Erstellung eigener Kategorien.
    - **Tab "Abrechnung & Salden":** Automatische Saldenberechnung pro Teilnehmer ($\text{Bezahlt} - \text{Eigenanteil}$) und **Smart Debt Settlement** zur Minimierung von Ausgleichszahlungen ("Wer schuldet wem wie viel?") samt Ein-Klick-Export/Kopieren für Messenger.
    - **Tab "Teilnehmer":** Verwaltung von Mitreisenden aus echten Profilen sowie externen Gästen (mit individuellem Namen & Farbe).
- **Manuelle Reise-Synchronisation:** Nahtlose Verknüpfung von Budgets mit bestehenden Reisen im Kalender (`Trip`). Über den Button *"Kosten in Reise übernehmen"* können Gesamtausgaben und geplantes Budgetlimit gezielt und ohne Serverlast in die Kalender-/Dashboard-Statistiken übernommen werden.
- **Smarte Datepicker-Synchronisation:** Beim Auswählen eines Startdatums setzt das Enddatum-Feld automatisch das Startdatum als `min`-Datum, sodass sich der Kalender-Popup des Enddatums direkt im passenden Monat und Jahr öffnet.
- **Navigation:** Neuer Menüpunkt *"Budget"* nahtlos integriert zwischen *"Kalenderansicht"* und *"Statistiken"* (Desktop & Mobile).
### Fixed
- **Kalender Crash bei 'Alle Ferien':** Klicks auf den Kalender bei alleinig oder zusätzlich ausgewähltem virtuellem Profil *Alle Ferien* führten bisher zu einem Datenbank-Absturz. Das virtuelle Profil wird nun für Klick-Aktionen im Kalender korrekt ignoriert, während reguläre Profil-Auswahlen weiterhin normal verarbeitet werden.

## [1.5.1] - 2026-07-28
### Added & Improved
- **Doppel-Kreisdiagramme (Dual Donut Charts):** Gegenüberstellung von gewähltem Jahr und Gesamt-Durchschnitt ($Ø$) für *Buchungsstatus*, *Art der Reise* und *Reisetyp* mit flüssiger Mount-Ladeanimation und zentrierter Legende.
- **Statistik-Dashboard Re-Ordering & Raster-Symmetrie:** Neusortiertes 5-Zeilen-Raster ($1/3$ in Reihe 1–3, $1/4$ in Reihe 4–5). Ausrichtung des Jahresverlaufs direkt unter der Hauptzahl bei *Ø Urlaubsdauer* sowie Ergänzung des 3-Jahresverlaufs bei *Budget vs. Realität* und *Genutzte Brückentage*.
- **Widget Finetunings & Easter Egg:** *Urlaubsgewohnheiten* mit angepasster Typografie und dynamischer Oster-Egg Statistik („Was ist arbeiten?“ bei Reisen >20 Tage); *Work - No Work* mit neutralem Badge *% Abwesenheit*.
- **Native-Button Styling („+ Neue Reise“):** Exakt an das Kachel-Design und Mouseover-Verhalten der Reise-Kacheln angepasst.

## [1.5.0] - 2026-07-28
### Added & Improved
- **Feiertags-Effizienz & Urlaubs-Multiplikator Metrik:** Neue Metrik misst das Verhältnis von Brutto-Freizeit zu Netto-Urlaubstagen bei Feiertags-Blöcken ($F/U$). Exakte Anrechnung von halben Urlaubstagen und Freistellungen (Krankheit, Sabbatical, Sonderurlaub, Überstundenabbau).
- **Statistik-Dashboard Redesign & Raster-Optimierung:** Perfekt ausgerichtetes 4-Spalten-Raster im Statistik-Bereich. Neues All-Time Widget "Top Reisemonat" zur Auswertung der beliebtesten Reisemonate über alle Jahre.
- **Dynamische Arbeitstage & Kalender-Tooltips:** Vollständige Persistierung benutzerdefinierter Arbeitstage (`workingDays`) mit dynamischer Wochenend-Hervorhebung im Kalender sowie erweitere Reise-Tooltips mit Wochentag und Datum.
- **Visual Performance & Scroll-Fixes:** Kompaktes, scrollfreies Heatmap-Diagramm ("Urlaubsverteilung über die Jahre"), optimierte Donut-Chart Abstände und schlanke einzeilige Detaillisten.

## [1.4.0] - 2026-07-26
### Added & Improved
- **"Halber Tag" Reiseoption:** Einführung einer Checkbox "Halber Tag" inklusive Umschalter für "Vormittag (AM)" und "Nachmittag (PM)" beim Erstellen und Bearbeiten von Reisen.
- **Berechnung & Überschneidungslogik:** Exakte Anrechnung von 0,5 Urlaubstagen bei halben Urlaubsreisen im Urlaubskonto und Resturlaubs-Übertrag. Erlaubt zwei halbe Reisen am selben Datum (z. B. 0,5 Mobiles Arbeiten + 0,5 Urlaub) mit zweigeteilter Kalenderdarstellung.
- **Transportmittel & Dynamischer Transparenz-Verlauf:** Ergänzung des 7. Transportmittels "Bus" und Einführung eines dynamischen, häufigkeitsbasierten Transparenz-Verlaufs in Markenfarbe (100 % bis 35 % Deckkraft in 10 % Schritten) für Zeilen, Icons und Prozentwerte im Light- und Darkmode.

## [1.3.0] - 2026-07-25
### Added & Redesigned
- **Minimalist Header Redesign:** Umstellung der Navigation von Pillen-Containern auf cleane Tabs mit dezentem Brand-Unterstrich für die aktive Seite. Reine Icon-Buttons mit Brand-Hover-Effekt und feinen vertikalen Trennlinien (`|`).
- **Minimalistisches Mobile-Menü:** Aufgeräumtes, randloses Listen-Design ohne schwere Farbblöcke mit Akzentleiste für den aktiven Tab und integrierter Profilauswahl.
- **Header Branding & Jahreswechsler:** "sm4sh's" in Brand-Farbe. Vergrößerte Touch-Trefferflächen (`p-2`, 22px Pfeile) und Brand-Farbe bei Mouseover im Jahreswechsler.
- **Kalender-Feinabstimmung:** Transparentes Monatsnamen-Design auf Desktop, optimierter Dark-Mode-Kontrast auf Mobile sowie Ausblenden nicht existierender Tage (z. B. 30./31. Feb).

## [1.2.1] - 2026-07-25
### Fixed
- **Middleware & Statische Assets:** Behebung des Redirect-Fehlers in der Proxy-Middleware für unauthentifizierte Anfragen auf statische Bild- und Icon-Dateien (`/logo.svg`, `/favicon.svg`), sodass das Logo auf der Anmeldeseite auch ohne Cookie zuverlässig angezeigt wird.

## [1.2.0] - 2026-07-25
### Added & Improved
- **Mobile Responsiveness (< 768px):** Umfassendes Responsive-Redesign für Smartphones und kleine Bildschirme.
- **Header & Navigation:** Einkürzen des Brandings auf das Logo-Icon auf Mobilgeräten. Auslagerung von Profilauswahl, Hauptnavigation und Neben-Aktionen in ein aufgeräumtes Mobile-Dropdown-Menü mit hohem Z-Index (`z-[100]`).
- **Kalenderansicht:** Touch-freundliches horizontales Wischen (`overflow-x-auto`, `-webkit-overflow-scrolling: touch`) mit fixer, blickdichter Monatsspalte (`sticky left-0`) ohne Textüberschneidungen.
- **Anmeldeseite:** Optimierte Formular-Paddings (`p-5 sm:p-8`), 48px Touch-Ziele (`h-12`) und iOS Auto-Zoom Schutz (`text-base`).

## [1.1.1] - 2026-07-22
### Fixed & Improved
- **Anmeldeseite & Icons:** Korrektur der Logo-SVG-Einbindung (`/favicon.svg`), Integration des Schloss-Icons im Passwortfeld und Anpassung an das dunkle Kartendesign.
- **GitHub Actions:** Ergänzung von `run-name` für saubere Release-Titel in der GitHub Actions Übersicht.

## [1.1.0] - 2026-07-22
### Added & Changed
- **UI & Glassmorphism Redesign:** Edles Dark-Glassmorphic Design für Header & Footer (`backdrop-blur`), Redesign von Hauptmenü, Jahresauswahl, Profilauswahl, Einstellungs- und About-Seite. Behebung des Sticky-Header Spaltfehlers.
- **Hilfe-Popup (`HelpModal`):** Umstellung auf Portal-Rendering (`createPortal`) zur Behebung von Z-Index/Blur-Überlappungen mit Ganzseiten-Blur und Hinweisen zu Urlaubsideen.
- **Branding & Assets:** Integration des neuen Vektor-Logos (`sm4shUrlaubsplanerLogo.svg`) sowie automatischer Einbindung aller optimierten Favicon-Dateien (`.ico`, `.svg`, `.png`).

## [1.0.0] - 2026-07-21
### Added & Changed
- **Sicherheits-Härtung:** Umstellung auf kryptografisch sichere Verifizierung für das Authentifizierungs-Cookie zur Vermeidung von Bypass-Angriffen.
- **Sicherheits-Header:** Ergänzung robuster HTTP-Sicherheits-Header in der Web-Konfiguration (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
- **Paket-Updates:** Aktualisierung kritischer System-Abhängigkeiten (darunter Next.js, React und Prisma) zur Behebung bekannter externer Schwachstellen.
- **System-Upgrade:** Erfolgreiches Upgrade der Entwicklungsumgebung auf TypeScript 6.0.3 zur Härtung von Typdefinitionen und Nutzung neuer Compiler-Vorteile.
- **Daten-Architektur:** Einführung von automatischem Snapshotting für historische Resturlaubstage mit smarter Cache-Invalidierung bei nachträglichen Vergangenheits-Edits.
- **Repository-Cleanup:** Überarbeitung der `.gitignore`-Regeln und Entfernen temporärer Skripte.

## [0.9.9] - 2026-07-13
### Added & Changed
- **Mobile Optimierung:** Das Layout wurde nach "Mobile-First" Prinzipien für kleine Bildschirme (Handys) optimiert.
- **Navigation:** Einführung eines kompakten Hamburger-Menüs auf mobilen Endgeräten.
- **UI & Layout:** Der Seitenleisten-Button in der Kalenderansicht wurde zu einem "Griff" (ohne Kontur) umgestaltet. "Idee"-Urlaube werden auf der Home-Seite wieder ohne Deckkraft-Reduzierung (wie reguläre Reisen) angezeigt. Statusfarben vereinheitlicht (Idee = Gelb, In Planung = Orange).
- **Branding:** Globale Umbenennung des Projekts in "sm4sh's Urlaubsplaner".
### Fixed
- **Engine:** Behebt einen Scope-Bug (`isIdea` nicht deklariert) im YearlyContributionGraph, der den Production-Build verhinderte.

## [0.9.8] - 2026-07-12
### Changed & Fixed
- **Statistiken & Engine:** Behebt einen kritischen Fehler in der Urlaubsübertragsberechnung, bei dem Feiertage im vergangenen Jahr fälschlicherweise als genommener Urlaub abgezogen wurden. Die Feiertage aller aktiven Jahre werden nun initial im Hintergrund geladen.

## [0.9.7] - 2026-07-12
### Changed & Fixed
- **Kalender:** Die Darstellung im Kalender nutzt ab 3 Einträgen nun ein responsives "Micro-Pills"-Layout (inkl. Grid-Support), um Überlappungen und Overflow zu verhindern.
- **Legende:** "Überstunden" wurden korrekt nach oben zu "Abwesenheit" verschoben. "Gleitzeit" wurde in "Bildungsurlaub" (Kürzel: B) umbenannt.
- **Statistiken:** "Ø Urlaubsdauer" zeigt nun den All-Time-Durchschnitt samt Historie der letzten Jahre; neues Widget "Beliebtes Reiseland" hinzugefügt.
- **Formular (Trips):** Felder "Land" und "Ort" getauscht für eine flüssigere Bedienung.
- **Docker:** Obsoletes `version` Attribut aus `docker-compose.yml` entfernt.

## [0.9.6] - 2026-07-12
### Changed & Fixed
- **UI & Farben:** Globale Farbpalette für Kalendereinträge im Light- und Darkmode komplett überarbeitet, um moderne und konsistente Farbschemata aufzubauen.
- **Statistik-Dashboard:** Kachel-Design optimiert. Alle Inhalte sind nun obenbündig ausgerichtet. Eine neue Multi-Color-Leiste in "Work - No Work" integriert alle Fehltage farbcodiert direkt in den Fortschrittsbalken.

## [0.9.5] - 2026-07-11
### Changed & Fixed
- **Daten & Logik:** Behebt einen Fehler bei gestapelten Kalendereinträgen (z.B. Halber Tag Urlaub + Halber Tag Krank), bei dem sich die Einträge gegenseitig überschrieben haben. Diese werden nun sauber addiert und als gestapelte Strings verarbeitet.
- **Features:** Unterstützung für halbe Tage (0.5) "Sonderurlaub" hinzugefügt.
- **Statistiken:** Manuell eingetragene Brückentage werden nun in der Statistik korrekt erfasst und gezählt.

## [0.9.4] - 2026-07-10
### Fixed
- **UI & Layout (Scrolling):** Behebt ein Problem, bei dem die Dashboard-, Statistik- und Einstellungsseiten nicht mehr gescrollt werden konnten, wenn der Inhalt den Bildschirm überragte. Diese Ansichten haben nun weiche, an das Design angepasste "Custom Scrollbars" (`.custom-scrollbar`).

## [0.9.3] - 2026-07-10
### Fixed
- **Sicherheit (Passwortschutz):** Ein kritisches Versäumnis wurde behoben, bei dem die Middleware (`proxy.ts`) die Variable `AUTH_ENABLED` ignoriert hat. Zuvor wurde die App bei fehlendem `APP_PASSWORD` für jeden freigegeben, selbst wenn `AUTH_ENABLED` aktiv war. Nun wird der Zugriff wie geplant strikt verweigert und stattdessen ein Konfigurationsfehler ausgegeben.
- **Konfiguration:** Eine `.env.sample` Datei wurde als Vorlage hinzugefügt und die Dokumentation / Docker-Dateien bezüglich `AUTH_ENABLED` aktualisiert.

## [0.9.2] - 2026-07-10
### Changed & Fixed
- **Dokumentation:** Die `README.md` wurde umfassend überarbeitet, um alle neuen Features (Reisen, interaktive Statistiken, Auto-Sync) widerzuspiegeln. Zusätzlich wurde die Docker-Compose Konfiguration mit der Produktionseinrichtung abgeglichen und eine Danksagung an die verwendeten API-Schnittstellen (`ferien-api.de` & `feiertage-api.de`) hinzugefügt.
- **UI-Anpassung:** Der vertikale Abstand (Margin) auf der Statistikseite zwischen den großen Jahresgrafiken und den kleineren Widgets wurde verringert, um den Platz auf Desktop-Ansichten besser zu nutzen.

## [0.9.1] - 2026-07-10
### Fixed
- **Daten & Zeitzonen-Bug:** Behebt einen gravierenden Fehler bei der Iteration von Reisedaten. Es wurden teilweise falsche Zeitzonen des Browsers (statt UTC) herangezogen, was dazu führen konnte, dass einzelne Tage beim Eintragen in den Kalender übersprungen oder Reisen gänzlich ignoriert wurden.
- **Jahreswechsel-Bug bei Reisen:** Die Zuordnung von Reise-Tagen wurde grundlegend korrigiert. Eine Reise, die im alten Jahr beginnt und ins neue Jahr reicht, wird nun korrekt und tagesgenau für das jeweilige Jahr in der Urlaubsstatistik abgezogen.
- **Stiller Absturz beim Speichern (Alle Ferien):** Wenn man im Profil "Alle Ferien" auf "Neue Reise" geklickt hat, hat das System stillschweigend abgebrochen (Record to connect not found), wodurch keine Reise gespeichert wurde. Dies wurde gefixt, es werden nun standardmäßig alle Mitglieder ausgewählt, und im Fehlerfall wird dem Nutzer nun eine sprechende Fehlermeldung (`alert`) angezeigt.
- **Design & Layout:** Verringert unnötig großen Leerraum zwischen den Kacheln auf der Statistik-Seite.

## [0.9.0] - 2026-07-09
### Changed & Fixed
- **Premium Light-Mode (Phase 4):** Umfassendes Redesign des Light-Modes mit wärmeren `stone-100` Hintergründen, dreidimensionalen Dashboard-Cards (Schatten & Rahmen) und einem subtilen Radial-Gradienten, der dem Design mehr Raumtiefe verleiht.
- **WCAG-Konformität:** Die Statusfarben (Urlaub, Krank, Mobile etc.) wurden im Light-Mode für bessere Kontraste optimiert (z.B. dunkleres Grün für Urlaub).
- **Komponenten-Styling:** Navbar mit elegantem `backdrop-blur` Effekt, Statistik-Widgets ohne harten schwarzen Hintergrund und gestreifte Wochenenden im Kalender.
- **Feinschliff & Bugfixes (Phase 4.1):** Verbessert die Lesbarkeit der Durchschnitts-Urlaubsdauer, entfernt harte Konturen bei den SVG-Donut-Charts, macht Buttons im Hilfe-Popup lesbar und behebt feststeckende Darkmode-Texte im Urlaubsverteilungs-Graphen.

## [0.8.4] - 2026-07-09
### Performance
- **Kalender-Render:** Behebt einen Performance-Flaschenhals (O(n²) Lookups) in `YearCalendar`, der bei vielen Einträgen oder Profilen zu Rucklern führen konnte. Einträge und Trips werden nun via `useMemo` in performante Maps vorab umgewandelt.
- **Berechnung der Statistik:** Implementiert Caching (Memoization) in `getProfileStatsForYear`, um exponentielle Rekursion bei der Berechnung der Resturlaubstage über mehrere Jahre zu verhindern.
- **Render-Optimierung:** Lagert aufwendige Array-Iterationen in `DashboardHome` und `Statistics` in `useMemo`-Hooks aus.
- **API-Calls reduziert:** Der redundante Aufruf von `getCalendarData` (Ferien-Daten) in der Kalenderkomponente wurde entfernt. Das Holen und Verwalten der Schulferien passiert nun zentral über den Store/Hydrator.

## [0.8.3] - 2026-07-09
### Fixed
- **Sicherheit:** Behebt einen potenziellen Authentifizierungs-Bypass, falls keine Umgebungsvariable für das Passwort gesetzt war. Setzt das `secure`-Flag für Auth-Cookies nun automatisch abhängig von der Umgebung (`production`).
- **Sicherheit & Stabilität:** Fügt Zod-Validierung für externe API-Responses (Ferien/Feiertage) hinzu, um Abstürze bei Strukturänderungen abzufangen.
- **Sicherheit:** Stellt sicher, dass in Produktion zwingend eine `DATABASE_URL` konfiguriert sein muss.
- **Performance/Bugfix:** Behebt einen Render-Bug im Donut-Chart (Mutation von `cumulativePercent`), der unter React Strict Mode zu fehlerhaften Anzeigen führen konnte.

## [0.8.2] - 2026-07-08
### Fixed
- **Sabbatical Bugfixes:** Behebt einen Absturz bei manueller Eingabe ("a") im Kalender durch fehlende Backend-Validierung (Zod). Die Sabbatical-Tage werden nun wieder korrekt in Himmelblau im Kalender eingefärbt. Zudem tauchen Sabbaticals nun auch korrekt im Jahresübersichts-Graphen ("Urlaubsverteilung über die Jahre") auf der Startseite auf.

## [0.8.1] - 2026-07-08
### Changed
- **Statistik Diagramme:** Die Darstellung von "Buchungsstatus" und "Art der Reise" nutzt nun wieder das cleane, SVG-basierte Donut-Design inkl. einer übersichtlichen, integrierten Legende (analog zum "Reisetyp"-Diagramm), um einen einheitlichen und aufgeräumteren Look der Widgets zu gewährleisten.

## [0.8.0] - 2026-07-08
### Added
- **Erweiterte Analysen (Recharts):** Einführung einer neuen Jahresauswertung auf der Statistik-Seite. Beinhaltet drei neue, interaktive Diagramme (erstellt mit Recharts):
  - *Urlaubs-Guthaben Verlauf*: Ein Flächendiagramm (Area Chart), das den Abbau des Resturlaubs über das aktuelle Jahr darstellt.
  - *Krankheitstage nach Wochentag*: Ein Radar-Diagramm, das zeigt, an welchen Wochentagen Krankheitstage am häufigsten vorkommen.
  - *Kosten vs. Reisedauer*: Ein interaktives Streudiagramm (Scatter Plot) zur Analyse der Kosteneffizienz einzelner Reisen.
- **Sabbatical (Auszeit):** Sabbaticals haben nun eine dedizierte eigene Kalender-Kategorie (`A`). Sie werden nicht mehr nur unter "Sonderurlaub" gebündelt und stechen in einer eigenen, himmelblauen Farbe ("Auszeit") im Kalender hervor.

### Changed
- **Statistik Layout:** Die Statistik-Seite wurde umstrukturiert. Jahresabhängige Statistiken sind nun prominent ganz oben gruppiert.
- **Statistik Design:** Der "Buchungsstatus" und die "Art der Reise" wurden modernisiert und als animierte Kreis-/Donut-Diagramme neu visualisiert.
- **Profil-Hydration:** Beim direkten Aufrufen der Statistik-Seite werden die Profildaten nun ebenfalls korrekt aus der Datenbank geladen (Store Hydration), wodurch das Neuladen der Seite fehlerfrei funktioniert.

## [0.7.1] - 2026-07-08
### Changed
- **UI & Layout Feinschliff:** Dashboard und Statistikseite nutzen nun eine einheitliche, maximale Container-Breite (1600px).
- **Jahresübersicht:** Der Übersichts-Graph auf dem Dashboard wurde vergrößert und zentriert, um den vorhandenen Platz besser zu nutzen.
- **Button-Design:** Der "Speichern"-Button in Modalen nutzt nun einen "Ghost-Style", der das Hover-Verhalten des "Abbrechen"-Buttons mit den primären Markenfarben kombiniert.
- **Statistik-Graphen:** Das Kreisdiagramm der Reisetyps hat neue, deutlich kontrastreichere Farben bekommen. Die "Art der Reise" Kategorie wurde in ein klares, modernes Listen-Design ohne Fortschrittsbalken umgebaut.
- **Einstellungen:** Die Auswahl der Arbeitstage (Wochentage) entspricht optisch nun exakt den quadratischen und abgerundeten Zellen des Jahreskalenders.
- **Ausrichtung:** Kasten "Urlaubs- / Krankheitsverteilung" zentriert Toggle-Buttons und Überschrift, wodurch das Layout beim Umschalten stabiler bleibt.


## [0.7.0] - 2026-07-08
### Added
- **Statistik-Seite:** Eine völlig neue, umfangreiche und responsive Statistikseite wurde hinzugefügt. Enthält diverse Auswertungen zu Urlaubsdauer, Budget, Reisearten und historischen Verteilungen.
- **Virtueller User 'AlleFerien':** Ein neuer, immer präsenter virtueller User "AlleFerien", der auf Knopfdruck eine gebündelte Schulferienübersicht aller 16 deutschen Bundesländer im Kalender einblendet, ohne die externe API zu überlasten.
- **Auto-Archivierung von Reisen:** Vergangene Reisen werden beim Öffnen der App nun vollautomatisch in den Status "Abgeschlossen" überführt.

### Changed
- **Dashboard & Layout:** Diverse Designverbesserungen. Transporte sind nun 2-spaltig (über die volle Breite), aktive Buttons in Modal-Dialogen haben einen klaren blauen Indikator.
- **Reisekalkulation:** Sabbaticals, Sonderurlaube, Mobiles Arbeiten und Überstundenabbau als Reiseart verbrauchen ab sofort keinen regulären Urlaub mehr.

### Fixed
- **Resturlaubswarnung:** Die Verfallswarnung für ungenutzten Resturlaub am Stichtag ignoriert keine Trips/Reisen mehr, die vor diesem Stichtag stattfinden.

## [0.6.3] - 2026-07-05
### Fixed
- **Jahreswechsel & Resturlaub:** Ein Fehler wurde behoben, durch den bei der Berechnung des Resturlaubs (Rollover) ins Folgejahr die Urlaubstage von angelegten Trips im Vorjahr ignoriert wurden.
- **Wochenende/Feiertage:** Manuell in den Kalender geklickte Urlaubstage ("U" oder "U/2") verbrauchen nun keine Urlaubstage mehr, wenn sie auf einen im Profil konfigurierten Nicht-Arbeitstag (z.B. Wochenende) oder auf einen gesetzlichen Feiertag fallen.

## [0.6.2] - 2026-07-05
### Added
- **Startjahr in den Profil-Einstellungen:** Das im Hintergrund bereits aktive "Startjahr" für Nutzerprofile ist nun in den Profil-Einstellungen frei bearbeitbar. So können neue Nutzer flexibel in späteren Jahren einsteigen, ohne in Vorjahren Fehler bei der Resturlaubsberechnung zu erzeugen.

### Changed
- **Trip Status Farben:** Die UI-Farben für Ausflüge ("Trips") wurden verfeinert. "Gebucht" entspricht nun exakt dem satten Grün normaler Urlaubstage, "In Planung" erscheint in Orange und "Idee" in Gelb.
- **Ansparphase entfernt:** Die Option "Ansparphase" wurde für Reisen entfernt.

## [0.6.1] - 2026-06-21
### Fixed
- **Auto-Cleanup für Trips und Kalendereinträge:** Manuelle Kalendereinträge (Entries), die sich mit neu erstellten oder aktualisierten Ausflügen (Trips) überschneiden, werden nun automatisch aus der Datenbank gelöscht. Dies verhindert eine doppelte Berechnung von Urlaubstagen.
- **Frontend Sync Update:** Nach dem Hinzufügen, Bearbeiten oder Löschen von Trips wird der Zustand der Kalendereinträge (`entries`) sofort live im Store optimistisch aktualisiert. Dadurch stimmen Dashboard und Kalender-Statistik ohne Page-Reload perfekt überein.

## [0.6.0] - 2026-06-21
### Added
- **Reise- und Ausflugs-Modell (Trips):** Komplette Unterstützung für Ausflüge und Urlaubsreisen. Nutzer können über das neue Dashboard Trips anlegen und Profile zuordnen.
- **Home Dashboard:** Startseite (`/`) durch ein neues Premium-Dashboard ersetzt. Zeigt anstehende Reisen, Statistiken (Gesamturlaub) und ein Archiv vergangener Trips.
- **Virtuelle Kalender-Blocker:** Reisen im Status "In Planung", "Gebucht" oder "Abgeschlossen" blockieren den Jahreskalender (`/calendar`) automatisch. Klicks zum manuellen Überschreiben sind auf diesen Tagen gesperrt.
- **Individuelle Arbeitstage:** Unter Einstellungen lassen sich nun spezifische Arbeitstage (z. B. Mo-Fr) je Profil festlegen. Ausflüge über Wochenenden oder freie Tage kosten keine Urlaubstage mehr.
- **Automatische Feiertagsberechnung für Trips:** Fällt ein Ausflug auf einen gesetzlichen Feiertag, wird dieser bei den Urlaubskosten ignoriert.

### Changed
- **Statistik-Optimierung:** Globale Berechnung von Resturlaub, unter Berücksichtigung von manuellen Einträgen und Ausflügen (inkl. Wochenenden/Feiertagen/Arbeitstagen).
- **Navigation:** Die Navbar enthält jetzt die Tabs "Home" und "Kalenderansicht", da der Kalender eine eigene Route (`/calendar`) erhalten hat.
- **Holidays im Store:** Gesetzliche Feiertage werden jetzt im Hintergrund global über den `Zustand`-Store geladen, damit auch die Startseite sofort Zugriff auf die genauen Budget-Zahlen hat.

## [0.5.0] - 2026-06-21
### Added
- **Premium Design Update:** Komplettes Re-Design der UI mit einem modernen "Dashboard"-Look, sanften Kacheln, feinen Transparenzen und einem subtilen Background-Glow im Darkmode.
- **Mobiles Arbeiten:** Unterstützung für Home-Office (`M`) sowie halbe Tage Mobiles Arbeiten (`Shift+m`). In der Statistik (rechte Spalte) wird dies nun ebenfalls separat erfasst.
- **CSS Variablen:** Dynamische Farbsteuerung (Surface, Backgrounds, Brand-Colors) nun effizient über CSS Variablen mit direkter Tailwind-Anbindung.

### Changed
- **Kalender Layout:** Der Kalender verzichtet auf harte 1-Pixel Gitterlinien zugunsten von weich abgerundeten Einzel-Zellen mit Abständen (`gap`).
- **Feiertage & Ferien:** Gesetzliche Feiertage erhalten eine orangefarbene "Top-Border", Schulferien werden durch eine dezente Leiste am Zellenende markiert, welche die Profil-Einträge nicht mehr verdeckt.
- **Profil Auswahl:** Das Dropdown-Menü für die Profilauswahl richtet sich nun linksbündig unter dem Button aus.
- **Legende:** Verschlanktes Layout im Grid-Design ohne Platzverschwendung, sodass die Statistik auf kleinen Bildschirmen direkt im Sichtbereich bleibt. Die Hilfe-Texte zur Tastaturnutzung wurden vereinfacht.

## [0.4.0] - 2026-06-01
### Added
- **Einklappbare Seitenleiste:** Die Seitenleiste auf dem Dashboard (Legende und Statistik) lässt sich nun über einen auffälligen Pfeil-Button ein- und ausklappen, um mehr Platz für den Kalender zu schaffen.
- **Halbe Überstunden:** Überstunden können nun auch halbtags erfasst werden (`Shift+ü`).

### Changed
- **Tastenbelegung für halbe Tage:** Halbe Tage können nun intuitiver mit `Shift+u` (Urlaub), `Shift+k` (Krankheit) und `Shift+ü` (Überstunden) eingetragen werden. 
- **Kalender-Kürzel:** Halbe Tage werden im Kalender zur besseren Unterscheidbarkeit als `U/2`, `K/2` und `Ü/2` angezeigt.
- **Legende:** Die Legende wurde an die neuen Kürzel angepasst und der Hinweis-Text ist im Dark Mode nun besser lesbar.

## [0.3.9] - 2026-05-28
### Fixed
- **Docker Build-Cache:** Seiten werden nun im Next.js App Router zwingend dynamisch gerendert (`force-dynamic`). Dies behebt einen tiefgreifenden Fehler, bei dem während des Docker-Builds erstellte Standard-Profil-IDs (UUIDs) fest ins HTML eingebrannt wurden und bei Container-Start mit der Laufzeit-Datenbank kollidierten (ERROR P2003 Foreign Key Violation).

## [0.3.8] - 2026-05-28
### Fixed
- **Datenbank Fehler:** Ein Fehler (ERROR 1139987765) beim Hinzufügen von Urlauben nach einem Datenbank-Reset wurde behoben. Der Browser merkt sich nun nicht länger veraltete Profil-IDs, die nach einer Neuinstallation der Datenbank in Konflikte ("Foreign key constraint violated") führten.
- **Verschwindende Profile (Caching):** Es wurde ein Fehler behoben, durch den neu angelegte oder geänderte Profile nicht auf dem Dashboard angezeigt wurden. Alle datenverändernden Aktionen invalidieren nun explizit den Next.js App Router Cache (`revalidatePath`).

## [0.3.7] - 2026-05-28
### Fixed
- **Dokumentation:** Die Installationsanleitung in der `README.md` wurde aktualisiert, sodass der Code-Schnipsel für `docker-compose.yml` nun korrekt die benannten Volumes (`urlaubsplaner_data:/app/data`) anstelle der fehleranfälligen lokalen Ordner (`./data:/app/data`) verwendet.

## [0.3.6] - 2026-05-28
### Fixed
- **Docker Datenbank Permissions:** Der SQLite Datenbank-Mount in den `docker-compose`-Dateien wurde von einem lokalen Verzeichnis (`./data:/app/data`) auf ein benanntes Docker-Volume (`urlaubsplaner_data:/app/data`) umgestellt. Dies verhindert das bekannte "unable to open database file"-Problem auf Linux-Docker-Hosts, bei dem Host-Mounts standardmäßig dem Root-User zugeordnet werden und somit die Dateizugriffsrechte für den internen Container-Nutzer blockieren.

## [0.3.5] - 2026-05-28
### Fixed
- **HTTP/HTTPS Cookie-Fix:** Das Cookie-Attribut `secure` wurde in der `authenticate`-Aktion deaktiviert (auf `false` gesetzt), da der standardmäßige Passwortschutz bei Self-Hosting über HTTP in lokalen Netzwerken (z. B. auf einem Raspberry Pi) sonst vom Browser blockiert und verworfen wird.


## [0.3.4] - 2026-05-28
### Fixed
- **Docker Port-Mapping:** Die Portweiterleitung in `docker-compose.yml` wurde auf `8666:8666` korrigiert, damit das lokale Compose-Setup wieder erreichbar ist (Next.js lauscht containerintern auf Port `8666`).
- **Datenbank-Persistence & Volume-Mounts:** Der Pfad zur SQLite-Datenbank im Dockerfile wurde auf `/app/data/dev.db` festgelegt und in `docker-compose.yml` durch ein robusteres Verzeichnis-Volume (`./data:/app/data`) gemountet. Dadurch werden Datenverlust und Docker-Dateiberechtigungsfehler zuverlässig verhindert.

## [0.3.3] - 2026-05-28
### Fixed
- **Docker SQLite Path:** Der Pfad zur Datenbank im `Dockerfile` wurde von `/app/data/dev.db` wieder auf `/app/prisma/dev.db` zurückgesetzt, damit die existierenden Volume-Mounts (`./prisma/dev.db:/app/prisma/dev.db`) weiterhin sauber funktionieren und keine "unable to open database file" Permission-Fehler mehr auftreten.
- **Docker Port:** Die `docker-compose.yml` wurde nun final auf den Port `8666` angepasst.

## [0.3.2] - 2026-05-28
### Fixed
- **Docker Runtime:** Fehlende Module (`dotenv`, `@prisma/config`) für die Laufzeit-Ausführung der `prisma.config.ts` wurden im Dockerfile zur Runner-Stage hinzugefügt bzw. aus der Config entfernt, sodass der Container nun einwandfrei startet.

## [0.3.1] - 2026-05-28
### Fixed
- **Docker Runtime:** Die Datei `prisma.config.ts` wird nun korrekt in das Production-Image kopiert, um den Fehler `The datasource.url property is required` beim Container-Start zu beheben.

## [0.3.0] - 2026-05-28
### Added
- **Prisma 7 Upgrade:** Vollständiges Upgrade auf Prisma 7.8 unter Verwendung des neuen `@prisma/adapter-libsql` für verbesserte Performance, "Rust-free" Execution und Zukunftssicherheit.
- **Node 22:** Upgrade des Docker-Basis-Images auf Node 22 (Alpine) für Prisma 7 Kompatibilität und besseren Support für GitHub Actions.

### Removed
- Alte `schema.prisma` inline URL-Konfiguration entfernt. Konfiguration erfolgt nun zentral über `prisma.config.ts`.

## [0.2.3] - 2026-05-28
### Fixed
- **Docker Deployment:** Fix für einen Crash beim ersten Start des Docker-Containers, der durch eine Versionsinkompatibilität der Prisma-CLI (v7 vs v6) ausgelöst wurde.

## [0.2.2] - 2026-05-28
### Changed
- **Standard-Port:** Der Default-Port wurde von `3000` auf `8666` geändert, um Konflikte mit anderen Self-Hosted-Apps zu vermeiden.
- **Docker Build:** Anpassung der Build-Pipeline für Next.js Prerendering und Node 24 Action-Kompatibilität.

## [0.2.1] - 2026-05-28
### Added
- **GitHub Actions:** CI/CD Pipeline für automatische Docker-Image Builds über ghcr.io hinzugefügt.
- **Docker Compose:** Bereitstellung einer `docker-compose.prod.yml` Vorlage.

## [0.2.0] - 2026-05-28
### Added
- **Security & Validation:** Globaler Passwortschutz via Next.js Proxy und strikte Zod-Input-Validation.
- **Overrides:** Neues System, um Urlaubsansprüche für einzelne Jahre isoliert anpassen zu können.
- **Jahreswechsel & Resturlaub:** Komplexe rekursive Logik für die automatische Übertragung von ungenutztem Resturlaub in Folgejahre.
- **API Schutzmechanismen:** Sperre für Jahre vor 2022 und Begrenzung auf +4 Jahre ab aktuellem Jahr zur Schonung von externen Rate Limits.
- **Tooltips:** Wochentage und detaillierte Datumsanzeigen beim Hover über Kalendertage.

### Changed
- **UI/UX Redesign:** Wechsel auf ein tiefes Anthrazit im Darkmode und Einführung der neuen `#0088c2` Brand-Farbe.
- **Kalender Redesign:** Die Kalender-Matrix nutzt nun direkt die Farben der Legende als Hintergrund. Die Personenfarbe dient zur besseren Unterscheidung als dickerer Rahmen.

## [0.1.0] - 2026-05-21
### Added
- **Grundgerüst:** Next.js App Router Setup mit Tailwind CSS und Prisma (SQLite).
- **Kalender-Engine:** Tastaturgesteuerte schnelle Eingabe von Urlauben, Krankheitstagen und Dienstreisen.
- **API Anbindung:** Automatischer Sync für länderspezifische Feiertage und Schulferien mit internem Caching.
- **Statistiken:** Live-Berechnung von genommenen Tagen, Resturlaub und Warnungen bei drohendem Verfall von Urlaubsansprüchen.
- **Profilverwaltung:** Anlage und Verwaltung von mehreren Familienmitgliedern oder Kollegen.
