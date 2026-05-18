# Warenherstellung Calculator

Statisches Webinterface für den Warenherstellungs-Workflow von **Arma 3 Fishers Life DE**.

Die Anwendung verwaltet Fabriken, Waren, Materialien, Rezepte, Produktionsplan, eigenes Inventar und optionale Preisfelder. Daraus berechnet sie Produktionsläufe, Materialbedarf, Rohmaterialbedarf und Wirtschaftlichkeit.

## Einsatzbereich

- statische Webseite für GitHub Pages
- keine Serverkomponente erforderlich
- lokale Speicherung im Browser über `localStorage`
- Import und Export über JSON
- mitgelieferter Standarddatenbestand über `waren-daten.json`

## Hauptfunktionen

### Calculator

- Produktionsplan mit Fabrik, Ware und Zielmenge
- Plan leeren
- eigenes Inventar erfassen und zurücksetzen
- Inventar wird vom Zukaufbedarf abgezogen
- direkter Materialbedarf
- rekursiv aufgelöster Rohmaterialbedarf
- Wirtschaftlichkeitsberechnung je Ware
- Standardmarge konfigurierbar

### Fabriken und Waren

- Waren je Fabrik verwalten
- Produktion pro Lauf festlegen
- Rezept je Ware hinterlegen
- optionale Preisfelder:
  - Importpreis
  - Exportpreis
  - Marktwert
  - Laufkosten pro Produktionslauf

### Materialien

- Materialstammdaten verwalten
- Rohmaterialien und Zwischenprodukte abbilden
- Produktion pro Lauf definieren
- optionaler Wert pro Einheit
- optionale Import- und Exportpreise
- Unterrezepte für Zwischenprodukte
- Suche im Bearbeitungsmodus

### Datenverwaltung

- Standarddaten aus `waren-daten.json` laden
- JSON importieren
- JSON exportieren
- lokale Browserdaten zurücksetzen
- Bearbeitungsmodus per Bestätigung aktivieren

## Wirtschaftlichkeitslogik

Materialkosten werden bevorzugt aus dem Importpreis berechnet. Wenn kein Importpreis vorhanden ist, wird der Wert pro Einheit genutzt. Hat ein Material ein Unterrezept, kann es rekursiv bis auf Rohmaterialien aufgelöst werden.

Für den Verkaufspreis gilt folgende Priorität:

1. Exportpreis
2. Marktwert
3. Herstellungskosten plus Standardmarge

Inventar senkt die persönlichen Zukaufkosten, nicht aber die grundsätzliche Preisempfehlung auf Basis normaler Herstellungskosten.

## Datenmodell

Die JSON-Datei enthält im Kern:

```json
{
  "materials": [],
  "materialRecipes": {},
  "products": {},
  "plan": [],
  "inventory": {},
  "materialPrices": {},
  "materialImportPrices": {},
  "materialExportPrices": {},
  "pricing": {
    "standardMarginPercent": 30
  }
}
```

Ältere JSON-Dateien ohne neuere optionale Felder können importiert werden, solange `materials`, `products` und `plan` strukturell korrekt vorhanden sind.

## Bearbeitungsmodus

Der Bearbeitungsmodus ist nur ein UI-Schutz. Er verhindert versehentliche Änderungen, ist aber keine echte Zugriffskontrolle. GitHub Pages bietet ohne Backend keine Benutzerverwaltung und keine geschützte zentrale Datenbank.

Für echte zentrale Datenhaltung wäre ein Backend mit API und Datenbank erforderlich, zum Beispiel SQLite.

## GitHub-Pages-Deployment

1. Dateien in ein GitHub-Repository hochladen.
2. In GitHub `Settings -> Pages` öffnen.
3. `Deploy from a branch` auswählen.
4. Branch `main` und Ordner `/root` wählen.
5. Speichern.

Es sind keine Node.js-Abhängigkeiten und kein Build-Prozess nötig.

## Projektstruktur

```text
waren-calculator-web/
├── index.html
├── styles.css
├── app.js
├── waren-daten.json
├── fishers-life-logo.png
├── favicon.ico
├── favicon.png
└── README.md
```

## Hinweise

- Daten bleiben im jeweiligen Browser des Users.
- Andere Browser, Geräte oder gelöschte Browserdaten bedeuten eigene beziehungsweise verlorene lokale Datenstände.
- Für gemeinsame Pflege sollte regelmäßig eine gepflegte `waren-daten.json` verteilt oder später eine zentrale API genutzt werden.
