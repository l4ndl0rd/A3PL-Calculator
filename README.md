# Warenherstellung Calculator

Statisches Webinterface für GitHub Pages zur Verwaltung von Fabrik-Rezepten und zur Berechnung des Materialbedarfs.

## Enthalten

- Calculator mit Produktionsplan
- Fabrik-Rezeptverwaltung für:
  - Stahlfabrik
  - Fahrzeugfabrik
  - Kleidungsfabrik
  - Luftfahrzeugsfabrik
  - Bootsfabrik
  - Ölfabrik
  - Warenfabrik
  - Chemiefabrik
  - Illegale Waffenfabrik
- Materialstammdaten
- Direkter Materialbedarf je Produktionsplan
- Rohmaterialbedarf durch rekursive Auflösung von Unterrezepten
- Lokale Speicherung im Browser per localStorage
- JSON Export/Import

## Besonderheiten

Das Projekt startet ohne Beispielwerte. Materialien, Waren und Rezepte werden manuell angelegt.

Wenn ein Material in einem Rezept exakt denselben Namen wie eine angelegte Ware trägt, wird es im Bereich „Rohmaterialien“ als Zwischenprodukt behandelt und rekursiv über dessen eigenes Rezept aufgelöst.

Beispiel:

- Stahl benötigt Eisenbarren und Kohlebarren
- Eisenbarren benötigt Eisenerz
- Kohlebarren benötigt Kohleerz

Dann zeigt der Calculator oben den direkten Bedarf an Eisenbarren/Kohlebarren und unten den Rohmaterialbedarf an Eisenerz/Kohleerz.

## GitHub Pages

1. Dateien in ein GitHub-Repository hochladen.
2. Repository öffnen.
3. `Settings -> Pages` öffnen.
4. Source: `Deploy from a branch`.
5. Branch: `main`, Ordner: `/root`.
6. Speichern.

Es ist kein Backend und kein Build-Prozess erforderlich.
