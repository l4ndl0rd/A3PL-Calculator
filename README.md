# Warenherstellung Calculator

Statisches Webinterface für GitHub Pages zur Verwaltung von Waren, Fabrikrezepten, Materialien und Rohmaterialbedarf für Arma 3 Fishers Life DE.

## Funktionen

- Calculator für Produktionsmengen und Materialbedarf
- Fabriken:
  - Stahlfabrik
  - Fahrzeugfabrik
  - Kleidungsfabrik
  - Luftfahrzeugsfabrik
  - Bootsfabrik
  - Ölfabrik
  - Warenfabrik
  - Chemiefabrik
  - Illegale Waffenfabrik
- Materialstammdaten mit optionalen Unterrezepten
- Rekursive Rohmaterialberechnung
- Dialogfenster zum Hinzufügen und Bearbeiten von Materialien
- Dialogfenster zum Hinzufügen und Bearbeiten von Waren/Fabrikrezepten
- Alphabetische Anzeige und Auswahl von Materialien
- Automatische interne Übernahme von Waren als Material/Zwischenprodukt, ohne diese als manuelle Materialien anzuzeigen
- JSON Import/Export
- Speicherung lokal im Browser per localStorage
- Keine Datenbank, kein Backend, kein Build-Prozess

## GitHub Pages

1. Dateien in ein GitHub-Repository kopieren.
2. In GitHub `Settings -> Pages` öffnen.
3. Source: `Deploy from a branch`.
4. Branch: `main`, Ordner: `/root`.
5. Speichern.

## Daten

Alle Daten liegen lokal im Browser. Für Backups die Funktion `Daten exportieren` verwenden.

## Version 13 Änderungen

- Der Button „Weitere Zeile hinzufügen“ im Materialdialog ist nur noch sichtbar, wenn „Verarbeitetes Material“ aktiv ist.
- Waren aus Fabriken werden intern weiter als Zwischenprodukte geführt, aber nicht mehr in der manuellen Materialienliste angezeigt.
- Manuelle Materialien können nicht mit demselben Namen wie eine Fabrik-Ware angelegt werden.
- Fabrik-Waren werden in Auswahlfeldern als „Ware aus <Fabrik>“ gekennzeichnet.
- Warennamen werden gegen bestehende manuelle Materialien und andere Fabrik-Waren geprüft.
