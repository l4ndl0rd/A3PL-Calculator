# Warenherstellung Calculator

Statischer Warenherstellung-Calculator für Arma 3 Fishers Life DE.

## Zweck

Die Webseite berechnet aus einem Produktionsplan den Materialbedarf, den rekursiv aufgelösten Rohmaterialbedarf, Inventarverbrauch und eine Wirtschaftlichkeitsbewertung.

Der Calculator läuft vollständig statisch und ist für GitHub Pages geeignet. Es gibt kein Backend und keine echte Zugriffskontrolle.

## Funktionen

- Produktionsplan mit Fabrik, Ware, Zielmenge und Produktionsläufen
- Eigenes Inventar zur Verrechnung erfarmter Items
- Direkter Materialbedarf und rekursiver Rohmaterialbedarf
- Wirtschaftlichkeitsberechnung mit Preisempfehlung
- Vergleich, ob Kaufen oder Farmen/Craften günstiger ist
- Materialien mit optionalem Wert, Importpreis und Exportpreis
- Waren mit Importpreis, Exportpreis und Marktwert
- Bearbeitungsmodus mit Bestätigungsdialog als UI-Sperre
- Suche in Material- und Warenlisten
- JSON Import, Export und Zurücksetzen
- Standarddatenbestand über `waren-daten.json`

## Preislogik

Für Materialkosten gilt:

1. Importpreis des Materials
2. sonst Wert pro Einheit
3. sonst rekursiv berechnete Herstellungskosten, wenn ein Rezept vorhanden ist

Für Verkaufspreise gilt:

1. Exportpreis der Ware
2. sonst Marktwert
3. sonst Herstellungskosten plus Standardmarge

Inventar senkt die persönlichen Herstellungskosten für die aktuelle Kalkulation. Die Preisempfehlung auf Basis von `Kosten + Marge` verwendet weiterhin die normalen Herstellungskosten, damit auch bei vollständig vorhandenem Inventar ein sinnvoller Verkaufspreis angezeigt wird.

## Kaufen oder Craften

Die Bewertung in der Wirtschaftlichkeit vergleicht die normalen Herstellungskosten pro Stück mit einem vorhandenen Einkaufspreis. Als Einkaufspreis wird zuerst der Importpreis der Ware verwendet, andernfalls ein gleichnamiger Material-Importpreis.

## Marktwert

Der Marktwert ist ein manuelles Preisfeld. Er sollte nicht automatisch dauerhaft aus Importpreis, Exportpreis oder Herstellungskosten überschrieben werden. Für berechnete Empfehlungen nutzt der Calculator bereits `Kosten + Marge`, wenn kein Exportpreis oder Marktwert gesetzt ist.

## Datenmodell

Die Standarddaten liegen in:

```text
waren-daten.json
```

Wichtige Felder:

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

## GitHub Pages

Die Dateien können direkt als statische Webseite veröffentlicht werden:

```text
index.html
styles.css
app.js
waren-daten.json
fishers-life-logo.png
favicon.ico
favicon.png
```

Lokale Änderungen werden im Browser gespeichert. Für eine zentrale Datenhaltung wäre später ein Backend mit API und Datenbank erforderlich, zum Beispiel SQLite.
