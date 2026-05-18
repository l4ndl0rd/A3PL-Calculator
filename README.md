# Warenherstellung Calculator

Statisches Webinterface für GitHub Pages zur Verwaltung von Produktionsrezepten und Materialbedarf für Project-Life-Fabriken.

## Enthalten

- `index.html`
- `styles.css`
- `app.js`

## Funktionen

- Calculator für Produktionsplan und aggregierten Materialbedarf
- Materialstammdaten mit alphabetischer Sortierung und Dialog zum Hinzufügen
- Rezeptverwaltung für:
  - Stahlfabrik
  - Fahrzeugfabrik
  - Kleidungsfabrik
  - Luftfahrzeugsfabrik
  - Bootsfabrik
  - Ölfabrik
  - Warenfabrik
  - Chemiefabrik
  - Illegale Waffenfabrik
- Calculator, alle Fabriken und Materialien in einer gemeinsamen, responsive umbrechenden Tab-Zeile
- Sticky Navigation beim Scrollen
- Automatische Übernahme von Warenrezepten als Material-Unterrezepte
- Rekursive Rohmaterialberechnung über Waren- und Material-Unterrezepte
- Lokale Speicherung im Browser per `localStorage`
- JSON Export/Import
- Reset auf leere Standarddaten

## GitHub Pages Deployment

1. Repository erstellen.
2. Dateien aus diesem Ordner in das Repository kopieren.
3. In GitHub `Settings -> Pages` öffnen.
4. Source: `Deploy from a branch`.
5. Branch: `main`, Ordner: `/root` auswählen.
6. Speichern.

Danach ist das Interface über die GitHub-Pages-URL des Repositorys erreichbar.
