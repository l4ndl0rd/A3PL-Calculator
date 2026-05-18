# Warenherstellung Calculator

Statisches Webinterface für GitHub Pages zur Verwaltung von Fabrikrezepten und zur Berechnung direkter Materialien sowie rekursiv aufgelöster Rohmaterialien.

## Version v14

Änderungen gegenüber v13:

- Responsive Layout für Desktop, Tablet und Smartphone verbessert.
- Navigationsleiste bleibt sticky und bricht abhängig von der Fensterbreite sauber um.
- Tabellen werden auf kleinen Bildschirmen als kompakte Karten dargestellt, statt starr in den Überlauf zu laufen.
- Calculator, Materialien, Rohmaterialien, Rezepttabellen und Dialogtabellen sind mobil lesbarer.
- Dialogfenster sind auf kleinen Viewports scrollbar und laufen nicht mehr aus dem Bildschirm.
- Datenbuttons skalieren abhängig von der Breite und bleiben im normalen Seitenfluss unten.

## Hosting über GitHub Pages

1. Dateien in ein GitHub-Repository hochladen.
2. Repository öffnen.
3. `Settings -> Pages` öffnen.
4. Source: `Deploy from a branch`.
5. Branch: `main`, Ordner: `/root` auswählen.
6. Speichern.

Es wird kein Backend und kein Build-Prozess benötigt.

## Datenspeicherung

Die Daten werden lokal im Browser per `localStorage` gespeichert. Für Backups stehen JSON Export und Import zur Verfügung.


## Version v15

- Farbvariablen explizit auf die ursprüngliche dunkle/orange Palette gesetzt.
- Navigationsmenü bleibt in einer einzelnen Zeile ohne Zeilenumbruch.
- Bei kleinen Fensterbreiten ist die Navigationszeile horizontal scrollbar, statt umzubrechen.


## Version v16

- Navigation auf verschachteltes Fabrikmenü umgestellt: keine horizontale Scrollbar im Nav-Menü.
- Hauptnavigation bleibt kompakt: Calculator, Fabriken, Materialien.
- Fabriken werden in einem ausklappbaren Raster angezeigt.
- Farb-/Kontrastwirkung wieder näher an v13 belassen.
- Responsive Tabellen-/Dialoglogik aus den neueren Versionen bleibt erhalten.
