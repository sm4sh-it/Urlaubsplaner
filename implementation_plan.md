# Implementierungsplan: Kombinierte halbe Tage & Sabbatical-Anpassungen

## 1. Goal Description
Der Nutzer wünscht sich drei wesentliche Neuerungen:
1. **Kombinierbare halbe Tage:** Man soll zwei verschiedene halbe Tage (z.B. halber Tag Urlaub + halber Tag Mobiles Arbeiten) am selben Tag eintragen können. Das System soll dabei wie ein Stack (LIFO) funktionieren: Fügt man einen dritten halben Tag hinzu, wird der älteste verdrängt. Beim Löschen (Klick) wird immer der zuletzt hinzugefügte Tag zuerst entfernt.
2. **Neuer Eintragstyp:** Halber Tag Sonderurlaub.
3. **Farbänderung:** Sabbatical (Auszeit) soll überall in ein Türkis (Teal) geändert werden.

## 2. Open Questions & User Review Required

> [!WARNING]
> **Architektur-Entscheidung: Datenbank-Schema vs. Komma-Separierte Strings**
> Da die Datenbank aktuell pro Tag und Profil nur EINEN Eintrag zulässt (`@@unique([date, profileId])`), gibt es zwei Wege, dies zu lösen:
> **Ansatz A:** Wir speichern zwei halbe Tage als kommagetrennten String im selben Datenbankfeld, z.B. `type: "2,5"`. 
> *Vorteil:* Keine riskante Datenbankmigration nötig, die bei SQLite oft Probleme macht.
> *Nachteil:* Wir müssen an allen Stellen (Statistiken, Kalender, Backend) den String splitten und einzeln auswerten.
> 
> **Ansatz B:** Wir ändern die Datenbankstruktur und erlauben zwei Zeilen pro Tag.
> *Nachteil:* Kann auf dem Server beim Docker-Neustart durch die Schema-Migration zu Fehlern führen, da SQLite Unique Constraints nicht einfach löschen kann, ohne die Tabelle neu aufzubauen.
>
> **Mein Vorschlag:** Ich werde **Ansatz A** implementieren, da er absolut robust ist, keine Datenbankmigration erfordert und die Abwärtskompatibilität zu allen bestehenden Einträgen zu 100% wahrt.

Bitte bestätige kurz, ob ich mit Ansatz A starten soll und ob Türkis für Sabbatical in Ordnung ist!

## 3. Proposed Changes

### `src/types/index.ts`
- Erweitere `EntryType` so, dass es auch kombinierte Strings zulässt (oder ändere den Typ in den Funktionen, sodass `.split(',')` genutzt werden kann).
- Füge den Code `'6'` als neuen Typen für "Halber Tag Sonderurlaub" hinzu.

### `src/app/globals.css`
- Ändere `--c-auszeit` von Blau auf Türkis (z.B. `#0d9488` im Lightmode und `#14b8a6` im Darkmode).
- Füge `.status-s-2` (Sonderurlaub halber Tag) hinzu.

### `src/app/actions.ts` (Backend)
- Überarbeite die `toggleEntry` Funktion (bzw. eine neue `addEntry` Funktion), um die LIFO Stack-Logik umzusetzen:
  - Wenn ein ganzer Tag eingetragen wird -> überschreibt alles.
  - Wenn ein halber Tag eingetragen wird:
    - Zelle leer -> eintragen.
    - Zelle hat 1 halben Tag -> `old,new`
    - Zelle hat 2 halbe Tage -> `old2,new` (der erste fällt raus).
  - Beim Löschen:
    - Hat 2 halbe Tage -> der letzte verschwindet, der erste bleibt stehen.

### `src/components/YearCalendar.tsx`
- Die Zelle muss zwei halbe Tage rendern können. Anstatt starrer CSS-Klassen (`.status-u-2`) generieren wir das `linear-gradient` dynamisch per `style={{ background: ... }}`, wenn `type.includes(',')`.
- So können wir beliebige Kombinationen wie z.B. Urlaub (`#16a34a`) + Mobiles Arbeiten (`#1d4ed8`) als Diagonale anzeigen.

### Statistik-Widgets & Utilities (`src/lib/profileUtils.ts`, `Widgets.tsx`)
- Alle Berechnungen (`isVacationCostingDay`, Schleifen über `entries`) müssen angepasst werden:
  - Aus `if (e.type === 'U')` wird eine Schleife über `e.type.split(',')`.
  - Jeder gefundene Teil wird separat als 1 (bei ganzen) oder 0.5 (bei halben) gewertet.

## 4. Verification Plan
- Lokaler Test des Eintragen/Überschreiben/Löschen-Stacks im Kalender.
- Verifizieren, dass der Kalender einen diagonalen Split anzeigt, wenn zwei verschiedene halbe Tage kombiniert werden.
- Prüfen der Dashboard-Statistiken, dass `2,5` (Halb Urlaub, Halb Mobile) korrekt zu 0.5 Urlaub und 0.5 Fehltag etc. aufsummiert wird.
- Kontrolle der Sabbatical-Farbe auf der Dashboard-Ansicht und im Kalender.
