# sm4shReisen - Urlaubsplaner

Ein moderner, interaktiver Single-Page Urlaubsplaner für Familien und kleine Teams. 

## Features
- **Alles auf einen Blick:** Jahresübersicht, die ohne Scrollen komplett auf einen Desktop-Monitor passt.
- **Tastaturgesteuert:** Superschnelle Eingabe von Urlauben durch einen Klick auf den Kalendertag in Kombination mit einem Tastendruck (z.B. `U` für Urlaub, `K` für Krank).
- **Multi-User fähig:** Profile für verschiedene Personen mit eigenen Farben anlegen und gleichzeitig anzeigen.
- **Auto-Sync:** Feiertage und Schulferien werden automatisch basierend auf dem gewählten deutschen Bundesland geladen.
- **Resturlaub:** Komplexe Übertragung von Resturlaub ins Folgejahr inkl. Verfallsdatum-Warnung.
- **Sicher:** Optionaler globaler Passwortschutz für Self-Hosting.
- **Modern:** Dark/Light-Mode und Responsive Design.

## Installation via Docker Compose (Empfohlen)

Die einfachste Möglichkeit, den Urlaubsplaner zu betreiben, ist über Docker. Kopiere die Datei `docker-compose.prod.yml` aus diesem Repository (und benenne sie ggf. in `docker-compose.yml` um) oder nutze diesen Schnipsel:

```yaml
version: '3.8'

services:
  urlaubsplaner:
    image: ghcr.io/sm4sh-it/urlaubsplaner:latest
    container_name: sm4sh-urlaubsplaner
    restart: unless-stopped
    ports:
      - "8666:8666"
    volumes:
      # Die Datenbank lokal im Ordner 'data' speichern, damit Daten bei Updates erhalten bleiben!
      - ./data:/app/data
    environment:
      - APP_PASSWORD=Familie123 # ÄNDERE DIESES PASSWORT
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

## Lizenz
Dieses Projekt steht unter der [MIT Lizenz](LICENSE). Du darfst es frei verwenden und anpassen.
