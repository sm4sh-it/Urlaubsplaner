# Changelog

All notable changes to this project will be documented in this file.

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
