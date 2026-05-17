# Warenherstellung Calculator

Statisches Webinterface für die Warenherstellung in einem Arma-3-/Project-Life-Kontext.

## Funktionen

- getrennte Rezeptverwaltung für Stahlfabrik und Fahrzeugfabrik
- Materialstammdaten frei bearbeitbar
- Produktionsplan mit Zielmenge je Ware
- automatische Berechnung der notwendigen Produktionsläufe
- aggregierter Materialbedarf über alle geplanten Waren
- Speicherung im Browser per localStorage
- JSON Export/Import für Backups oder Weitergabe
- vollständig statisch, daher kompatibel mit GitHub Pages

## Lokale Nutzung

`index.html` im Browser öffnen. Es ist kein Build-Schritt notwendig.

## GitHub Pages Hosting

1. Neues GitHub-Repository erstellen.
2. Diese Dateien in das Repository kopieren:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
3. Änderungen committen und pushen.
4. In GitHub unter `Settings -> Pages` als Source `Deploy from a branch` wählen.
5. Branch `main` und Ordner `/root` auswählen.
6. Speichern. Danach ist die Seite über die GitHub-Pages-URL erreichbar.

## Datenmodell

Die App speichert Daten lokal im Browser. Für Serverbetrieb oder gemeinsame Bearbeitung wäre später ein Backend nötig, z. B. Supabase, Firebase oder eine eigene API.
