# sm4shReisen - Urlaubsplaner

Ein moderner, interaktiver Single-Page Urlaubsplaner für Familien und kleine Teams mit einem Fokus auf herausragendem Design und erstklassiger Usability.

## Features
- **Alles auf einen Blick:** Jahresübersicht, die ohne Scrollen komplett auf einen Desktop-Monitor passt.
- **Tastaturgesteuert:** Superschnelle Eingabe von Urlauben durch einen Klick auf den Kalendertag in Kombination mit einem Tastendruck (z.B. `U` für Urlaub, `K` für Krank, `M` für Mobiles Arbeiten).
- **Multi-User fähig:** Profile für verschiedene Personen mit eigenen Farben anlegen und gleichzeitig im Kalender anzeigen.
- **Reise-Management:** Plane gemeinsame Reisen (wie Sommerurlaube) für mehrere Familienmitglieder gleichzeitig. Das System kümmert sich automatisch um die Abzüge von Urlaubstagen, auch wenn Reisen über den Jahreswechsel hinausgehen.
- **Tiefgreifende Statistiken:** Umfangreiches Statistik-Dashboard mit Jahresvergleichen, Burn-Down-Charts für Resturlaub, Heatmaps für Urlaubs- und Krankheitsverteilungen, Scatter-Plots zur Reisedauer und viem mehr.
- **Auto-Sync:** Feiertage und Schulferien werden automatisch basierend auf dem gewählten deutschen Bundesland geladen.
- **Resturlaub:** Komplexe Übertragung von Resturlaub ins Folgejahr inkl. Verfallsdatum-Warnung.
- **Sicher:** Optionaler globaler Passwortschutz für Self-Hosting.
- **Premium Design:** Hochmodernes UI mit Dark/Light-Mode, Glassmorphism-Effekten, flüssigen Mikro-Animationen und Responsive Design, das auf Desktop, Tablet und Smartphone perfekt funktioniert.

## Installation via Docker Compose (Empfohlen)

Die einfachste Möglichkeit, den Urlaubsplaner zu betreiben, ist über Docker. Kopiere die Datei `docker-compose.prod.yml` aus diesem Repository (und benenne sie ggf. in `docker-compose.yml` um) oder nutze diesen Schnipsel:

```yaml
version: '3.8'

services:
  urlaubsplaner:
    # Dieses Image wird von der GitHub Action automatisch gebaut
    image: ghcr.io/sm4sh-it/urlaubsplaner:latest
    container_name: sm4sh-urlaubsplaner
    restart: always
    ports:
      - "8666:8666"
    volumes:
      # Mount the database directory so it persists across container restarts and updates
      - urlaubsplaner_data:/app/data
    environment:
      # Optionales Passwort für globalen Schutz
      - APP_PASSWORD=DeinSicheresPasswort123

volumes:
  urlaubsplaner_data:
```

Starte den Container mit:
```bash
docker compose up -d
```
Die App ist nun unter `http://localhost:8666` erreichbar.

## Absicherung (Globales Passwort)
Wenn du die App von außen erreichbar machst, solltest du unbedingt die Umgebungsvariable `APP_PASSWORD` in deiner Docker-Umgebung setzen.
Lässt du sie komplett weg oder leer, ist die App für **jeden** im Netzwerk frei zugänglich.

## Entwicklung (Lokal)
Falls du am Code mitarbeiten möchtest:

1. Repository klonen: `git clone https://github.com/sm4sh-it/Urlaubsplaner.git`
2. Abhängigkeiten installieren: `npm install`
3. Datenbank initialisieren: `npx prisma db push`
4. Server starten: `npm run dev`

## Danksagung
Ein großes Dankeschön geht an die Bereitsteller der öffentlichen und kostenfreien APIs, die diese App nutzen darf, um die automatische Synchronisation von Feiertagen und Ferien zu ermöglichen:
- **[ferien-api.de](https://ferien-api.de/)** – Für die zuverlässigen und aktuellen Daten zu den Schulferien in Deutschland.
- **[feiertage-api.de](https://feiertage-api.de/)** – Für die Bereitstellung der gesetzlichen Feiertage der deutschen Bundesländer.

## Lizenz
Dieses Projekt steht unter der [MIT Lizenz](LICENSE). Du darfst es frei verwenden und anpassen.
