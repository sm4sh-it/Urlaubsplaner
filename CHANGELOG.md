# Changelog

All notable changes to this project will be documented in this file.

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
