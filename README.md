<p align="center">
  <img src="public/logo.svg" alt="Urlaubsplaner Logo" width="90" height="90" />
</p>

<h1 align="center">sm4sh's Urlaubsplaner</h1>

<p align="center">
  <strong>Der moderne, tastaturgesteuerte Urlaubs- und Reisekostenplaner für Familien, Paare und Freunde.</strong><br>
  Gebaut mit Next.js 16, React 19, Tailwind CSS v4, Prisma & SQLite.
</p>

<p align="center">
  <a href="https://github.com/sm4sh-it/Urlaubsplaner/releases"><img src="https://img.shields.io/github/v/release/sm4sh-it/Urlaubsplaner?color=0284c7&label=Release" alt="Release"></a>
  <a href="https://ghcr.io/sm4sh-it/urlaubsplaner"><img src="https://img.shields.io/badge/Docker-ghcr.io-blue?logo=docker" alt="Docker"></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Database-SQLite%20%2F%20LibSQL-4ade80?logo=sqlite" alt="SQLite">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-PolyForm_Noncommercial-blue" alt="License: PolyForm Noncommercial 1.0.0"></a>
</p>

> 🌐 **Language Note:** *Why is this project German-only?*  
> Der Urlaubsplaner relies fundamentally on official APIs for German public holidays (*gesetzliche Feiertage*) and school vacation schedules (*Schulferien*) across all 16 German federal states (*Bundesländer*). Because the core logic, holiday calculations, and data sources are strictly tailored to this ecosystem, the application and documentation are exclusively provided in German. *Sorry to our friends in Austria, Switzerland, and international self-hosters – an international release is currently not planned.*

---

## 🌿 Überblick

**sm4sh's Urlaubsplaner** beendet das Chaos aus unübersichtlichen Excel-Tabellen, getrennten Urlaubslisten und mühsamen Reisekosten-Abrechnungen.

Statt manuellem Nachrechnen bietet dir die App eine klare, farbkodierte Jahresübersicht inklusive automatischer Erfassung deiner Urlaubstage, Brückentage, Dienstreisen, Mobilarbeit und der Schulferien aller deutschen Bundesländer. Gepaart mit einem intuitiven Hotkey-System und einer vollwertigen Reisebudget-Verwaltung inklusive Schuldenminimierung (*„Wer schuldet wem wie viel?“*) wird Urlaubsplanung so schnell, transparent und stressfrei wie nie zuvor.

---

## 📸 Screenshots & Showcase

<p align="center">
  <img src="public/screenshots/01_dashboard_dark.png" alt="Urlaubsplaner Dashboard Vorschau" width="100%" />
</p>

<details open>
  <summary><strong>🖼️ Vorschau-Galerie ausklappen (Klicken zum Umschalten)</strong></summary>
  <br>
  <table align="center" width="100%">
    <tr>
      <td width="50%" align="center">
        <strong>📅 Jahreskalender mit Schnell-Legende & Hotkeys</strong><br><br>
        <img src="public/screenshots/02b_calendar_legend_dark.png" alt="Jahreskalender Dark Mode mit Legende" width="100%" />
      </td>
      <td width="50%" align="center">
        <strong>☀️ Clean Light Mode (Kalenderübersicht)</strong><br><br>
        <img src="public/screenshots/02_calendar.png" alt="Jahreskalender Light Mode" width="100%" />
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <strong>💰 Reisebudget & flexible Belegerfassung</strong><br><br>
        <img src="public/screenshots/04_budget_detail_expenses_dark.png" alt="Belegerfassung & flexible Splits" width="100%" />
      </td>
      <td width="50%" align="center">
        <strong>🤝 Smarter Saldenausgleich (Schuldenminimierung)</strong><br><br>
        <img src="public/screenshots/06_budget_detail_settlement_dark.png" alt="Smarter Saldenausgleich" width="100%" />
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <strong>📊 Ausgaben-Analytics & Kategorien</strong><br><br>
        <img src="public/screenshots/05_budget_detail_analytics_dark.png" alt="Ausgaben nach Kategorien" width="100%" />
      </td>
      <td width="50%" align="center">
        <strong>📈 Jahres-Statistiken & Urlaubsanalyse</strong><br><br>
        <img src="public/screenshots/08_statistics_dark.png" alt="Statistiken Dashboard" width="100%" />
      </td>
    </tr>
  </table>
</details>

---

## ✨ Key Features

### ⚡ Blitzschnelle Tastatursteuerung & Jahreskalender
- **Vollständige Jahresansicht:** Sämtliche 12 Monate gleichzeitig auf dem Desktop-Bildschirm im Blick – kein lästiges Monats-Klicken.
- **Ultraschnelle Hotkeys:** Direkte Kalendereingabe per Tastendruck:
  - `U` für Urlaub
  - `K` für Krank
  - `M` für Mobiles Arbeiten
  - `Shift+U` / `Shift+M` für halbe Tage (Vormittag / Nachmittag)
  - `Entf` oder `Rücktaste` zum schnellen Löschen
- **Halbtags-Präzision:** Vormittags- und Nachmittags-Abwesenheiten werden exakt mit 0,5 Tagen verrechnet – ideal für Brückentage oder Dienstreisen.
- **Glassmorphism Design:** Wähle zwischen modernem *Midnight Glass Dark Mode* und freundlichem *Clean Stone Light Mode*.

### 👥 Multi-Profil & Familienplanung
- **Gemeinsame Kalenderansicht:** Lege Profile für Partner, Kinder, Freunde oder Teammitglieder mit individuellen Erkennungsfarben an und vergleiche sie synchron.
- **Automatischer Ferien-Abgleich (`ALLE_FERIEN`):** Integriertes Overlay aller Schulferien der 16 Bundesländer, um Urlaubszeiten mit schulpflichtigen Kindern mühelos abzustimmen.
- **Detaillierte Reiseplanung:** Reisen mit Titel, Zeitraum, Transportmitteln (Auto 🚗, Bahn 🚆, Flugzeug ✈️, Bus 🚌) und Notizen hinterlegen.

### 💰 Smarte Reisekosten- & Budgetverwaltung
- **Reisebudgets & Live-Kostenkontrolle:** Setze Ausgabenlimits für Urlaube und behalte das Restbudget immer in Echtzeit im Auge.
- **Flexible Belegerfassung:** Teile Ausgaben entweder gleichmäßig auf alle Teilnehmer auf oder bestimme individuelle Anteile auf den Cent genau.
- **Greedy Debt Minimization (*„Wer schuldet wem wie viel?“*):** Ein intelligenter Algorithmus berechnet den optimalen Saldenausgleich mit der geringst möglichen Anzahl an Transaktionen.
- **1-Klick-Abrechnungsexport & Kategorien:** Exportiere fertige Abrechnungen für WhatsApp oder E-Mail und analysiere Ausgaben nach Kategorien (Unterkunft, Essen, Transport, Aktivitäten).

### 📅 Kalendersynchronisation & Portabilität
- **RFC 5545-konformer ICS-Export:** Exportiere deine gebuchten Urlaube und Reisen mit einem Klick als standardisierte `.ics`-Datei direkt in Apple Kalender, Google Kalender oder Microsoft Outlook.
- **Automatischer Feiertags- & Schulferien-Sync:** Gesetzliche Feiertage und Ferien werden automatisch über zuverlässige deutsche Schnittstellen geladen.

### 📈 Statistiken & Urlaubsanalysen
- **Urlaubs-Burndown & Resturlaub:** Visuelle Fortschrittsbalken über genommene, geplante und verbleibende Urlaubstage inklusive Verfallsdatum-Warnung.
- **Transportmittel- & Jahresvergleiche:** Auswertungen über bevorzugte Reisemittel, Abwesenheitsverteilungen und Vorjahresvergleiche.

---

## 🚀 Quick Start (Docker Compose)

Der Urlaubsplaner ist als schlankes, vorkonfiguriertes Docker-Image verfügbar – ideal für Home-Server und NAS-Systeme (Synology, Unraid, TrueNAS, Raspberry Pi, Proxmox).

Erstelle eine `docker-compose.yml`:

```yaml
services:
  urlaubsplaner:
    image: ghcr.io/sm4sh-it/urlaubsplaner:latest
    container_name: sm4sh-urlaubsplaner
    restart: always
    ports:
      - "8666:8666"
    volumes:
      # Datenbank und persistente Daten sichern
      - urlaubsplaner_data:/app/data
    environment:
      # Optional: Passwortschutz aktivieren (true) oder deaktivieren (false)
      - AUTH_ENABLED=true
      # Das gewünschte Zugangspasswort
      - APP_PASSWORD=sm4sh

volumes:
  urlaubsplaner_data:
```

Starte den Stack:
```bash
docker compose up -d
```

Rufe die Web-App anschließend unter `http://<deine-server-ip>:8666` auf.

---

## 🔒 Sicherheit & Self-Hosting Architektur

### Zugriffskontrolle (Authentifizierung)
- **Open LAN Mode (`AUTH_ENABLED=false`):** Ideal für die Nutzung im abgesicherten Heimnetzwerk (LAN/VPN) oder hinter vorgeschalteten Reverse-Proxies mit zentralem Identity-Provider (z.B. Traefik mit Authentik/Authelia). Kein Login-Bildschirm erforderlich.
- **Protected Mode (`AUTH_ENABLED=true`):** Die Web-App wird durch ein globales Passwort geschützt (`APP_PASSWORD`). Bei erfolgreicher Anmeldung wird ein sicherer Session-Cookie für 30 Tage ausgestellt – voll kompatibel mit lokalem HTTP und Reverse-Proxy HTTPS.

### 100% Privat & Local-First
- **Keine Cloud, kein Tracking:** Deine Urlaubsdaten, Finanzen und Notizen verbleiben vollständig auf deiner eigenen Hardware in der lokalen SQLite-Datenbank (`/app/data/dev.db`).
- **Keine externen Accounts:** Volle Unabhängigkeit von Drittanbieter-Diensten.

### Robuste Datenintegrität
- **Zod Schema-Validierung:** Sämtliche Server Actions und Mutations sind durch strikte Zod-Schemas gegen ungültige Daten und Injection geschützt.
- **Zeitzonen-Konsistenz (ISO 8601):** Alle Datumsangaben werden als statische ISO-Strings (`YYYY-MM-DD`) verarbeitet. Dadurch entstehen niemals Datumsverschiebungen durch Sommer-/Winterzeit oder unterschiedliche Client-Zeitzonen.

---

## 🤖 Vibe Coded with Gemini & Rigorously Audited

Der Urlaubsplaner wurde mit Stolz im **Pair-Programming mit Google Gemini (über die Antigravity CLI)** entwickelt (*Vibe Coding*) – mit dem Fokus auf rasanter Feature-Entwicklung und modernen React 19 / Next.js 16 Web-Paradigmen.

Hohe Entwicklungsgeschwindigkeit geht hierbei Hand in Hand mit strengen Software-Engineering-Standards:
- 🛡️ **Typ- und Schemasicherheit:** End-to-End TypeScript-Typisierung kombiniert mit Prisma ORM und Zod-Validierung für fehlerfreie Datenflüsse.
- 🧩 **Saubere Trennung virtueller Entitäten:** Virtuelle Profile wie `ALLE_FERIEN` werden clientseitig isoliert gerendert und niemals fälschlicherweise in die Datenbank persistiert.
- 🐳 **Automatisierte CI/CD-Pipeline:** Jedes Release wird vollautomatisch per GitHub Actions gebaut, getestet und als Multi-Arch Docker Image auf der GitHub Container Registry (`ghcr.io`) bereitgestellt.

---

## 🛠️ Lokale Entwicklung

Für Entwickler, die den Urlaubsplaner lokal ausführen, anpassen oder erweitern möchten:

```bash
# 1. Repository klonen
git clone https://github.com/sm4sh-it/Urlaubsplaner.git
cd Urlaubsplaner

# 2. Abhängigkeiten installieren
npm install

# 3. Datenbank initialisieren (SQLite via Prisma)
npx prisma db push

# 4. Optional: Demo-Profile & Beispieldaten generieren
npm run seed

# 5. Entwicklungsserver starten
npm run dev
```

Die Anwendung ist nun unter `http://localhost:8666` erreichbar.

---

## 🙏 Danksagung & Datenquellen

Ein herzliches Dankeschön an die Bereitsteller der kostenfreien, zuverlässigen APIs für gesetzliche Feiertage und Schulferien in Deutschland:
- **[ferien-api.de](https://ferien-api.de/)** – Schulferien der deutschen Bundesländer
- **[feiertage-api.de](https://feiertage-api.de/)** – Gesetzliche Feiertage aller Bundesländer

---

## 📄 Lizenz

Dieses Projekt ist unter der **[PolyForm Noncommercial License 1.0.0](LICENSE)** lizenziert.

- ✅ **Erlaubt:** Kostenlose private Nutzung, Modifikation und Self-Hosting für Familien, Freunde, Vereine und den Eigenbedarf.
- ❌ **Untersagt:** Kommerzielle Nutzung, Weiterverkauf oder das Anbieten als kostenpflichtiger gehosteter Cloud-Dienst (SaaS) ohne vorherige schriftliche Genehmigung des Urhebers.
