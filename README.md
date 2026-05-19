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
- Vergleich, ob direkte Beschaffung, Farmen oder Produktion günstiger ist
- Zentrale Handelsdaten für Importpreis, Exportpreis und Marktwert
- Farmraten mit persönlichem Arbeitswert pro Stunde
- Materialien mit optionalem Wert pro Einheit und optionalem Unterrezept
- Waren mit Produktionsmenge und Rezeptdaten pro Fabrik
- Gleiche Warennamen können in unterschiedlichen Fabriken existieren
- Bearbeitungsmodus mit Bestätigungsdialog als UI-Sperre
- Suche in Material-, Waren- und Handelslisten
- Responsive Tabellenlayouts nach Materialien-Layout als Referenz
- JSON Import, Export und Zurücksetzen
- Standarddatenbestand über `waren-daten.json`

## Preislogik

Für Material- und Zwischenproduktkosten prüft der Calculator rekursiv die günstigste verfügbare Beschaffungsart:

1. für die angezeigten `Kosten/Stück` wird ohne eigenes Inventar kalkuliert
2. vorhandenes Inventar wird separat für Bedarf, Zukaufbedarf und Beschaffungsempfehlung berücksichtigt
3. kaufbare Materialien oder Zwischenprodukte werden nur über ihren eigenen konkreten Importpreis aus `tradePrices` berücksichtigt
4. herstellbare Zwischenprodukte werden rekursiv aus ihren Rezepten berechnet
5. gleichwertige Ausgaben, zum Beispiel `Amethystbarren` und `Amethystbarren (aus Palette)`, können als alternative Herstellungswege verglichen werden
6. bei mehreren möglichen Wegen wird der günstigere vollständige Weg verwendet

Für Verkaufspreise gilt:

1. zentraler Exportpreis des Artikels
2. sonst zentraler Marktwert des Artikels
3. sonst Herstellungskosten plus Standardmarge

Inventar senkt nicht die angezeigten `Kosten/Stück` und nicht die Preisempfehlung. Es wird nur in der Bedarfs-/Zukaufanzeige und in der Beschaffungsempfehlung berücksichtigt. Dadurch bleibt `Kosten + Marge` eine stabile Preisbasis, auch wenn du Materialien bereits erfarmt hast.

Bei planweiten Sammelproduktionen mit gemeinsamen Zwischenprodukt-Läufen verwendet `Kosten + Marge` dieselbe inventarbereinigte Kostenbasis wie die angezeigten `Kosten/Stück`, damit die Marge nicht durch Rundungs- oder Überschussmengen negativ ausfällt.

Wenn derselbe Warenname in mehreren Fabriken existiert, behandelt der Produktionsplan die konkrete Ware weiterhin über ihre interne ID. Bei Materialbedarf und Preisberechnung werden gleichnamige Herstellungswege als Alternativen betrachtet; der Calculator verwendet dabei den günstigsten berechenbaren Weg. So können beispielsweise `Stahlplatten` sowohl hergestellt als auch aus einer Palette zerlegt werden, ohne unterschiedliche Handelsartikel pflegen zu müssen.

## Farmraten und Arbeitszeit

Farmen kann optional mit einem persönlichen Zeitwert bewertet werden. Dafür gibt es den Bereich **Farmraten**. Farmprofile und Arbeitswert sind Stammdaten und werden nur im Bearbeitungsmodus geändert.

```json
{
  "labor": {
    "hourlyValue": 30000
  },
  "farmProfiles": {
    "Eisenerz": {
      "enabled": true,
      "amountPerHour": 1200,
      "createdAt": 0
    }
  }
}
```

Die Formel lautet:

```text
Farmkosten pro Einheit = Arbeitswert pro Stunde / Farmmenge pro Stunde
```

Crafting selbst hat weiterhin keine Kosten. Bewertet werden für `Kosten/Stück` nur Farmzeit, Importpreise, manuelle Materialwerte und rekursive Herstellungswege. Inventar erscheint nur in der konkreten Beschaffungsempfehlung und in den Bedarfstabellen.

Bei mehreren Produktionsplan-Positionen wird der direkte Materialbedarf zuerst aggregiert. Dadurch werden gemeinsame Zwischenprodukt-Läufe nur einmal bewertet. Beispiel: Zwei Waren mit je 11 Stahlplatten Bedarf ergeben zusammen 22 Stahlplatten; daraus wird ein Stahlplatten-Lauf berechnet, nicht zwei getrennte Läufe.

## Zentrale Handelsdaten

Import-, Export- und Marktpreise werden nicht mehr direkt an Materialien oder Waren gespeichert. Stattdessen gibt es den Bereich **Handel**.

Ein Handelseintrag wird über den Artikelnamen zugeordnet. Wenn ein Material oder eine Ware denselben Namen trägt, übernimmt der Calculator die Werte automatisch. Waren können optional einen Handelsalias verwenden; die Auswahl zeigt nur Artikel, die in den zentralen Handelsdaten tatsächlich als handelbar eingetragen sind.

Die Werte werden automatisch verwendet in:

- Materialienliste
- Fabrik-Warenkarten
- Calculator-Wirtschaftlichkeit
- Kaufen-vs-Craften-Bewertung

Für abweichende Namen kann eine Ware zusätzlich einen Handelsartikel als Preisalias verwenden. Dadurch können Varianten wie `Goldbarren` und `Goldbarren (aus Palette)` denselben zentralen Handelspreis nutzen. Für Namen mit dem Muster `Name (aus Palette)` wird automatisch `Name` als Fallback-Handelsartikel verwendet, sofern dazu ein Handelseintrag existiert.

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
  "tradePrices": {},
  "tradeAliases": {},
  "tradeAliases": {},
  "pricing": {
    "standardMarginPercent": 30
  }
}
```

`tradePrices` verwendet Artikelnamen als Schlüssel:

```json
{
  "tradePrices": {
    "Eisenerz": {
      "importPrice": 25,
      "exportPrice": 5,
      "marketValue": null
    }
  }
}
```


`tradeAliases` verbindet abweichende Anzeigenamen mit einem zentralen Handelsartikel:

```json
{
  "tradeAliases": {
    "Goldbarren (aus Palette)": "Goldbarren"
  }
}
```

Ältere JSON-Dateien mit `materialImportPrices`, `materialExportPrices` oder Preisfeldern direkt an Produkten werden beim Import weiterhin gelesen und in `tradePrices` migriert.

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

## Beschaffungsempfehlung

Die Wirtschaftlichkeit zeigt die konkrete Beschaffung pro Planposition als farbige Tags:

- Grün: Farm
- Gelb: Craft / Zerlegung
- Rot: Import
- Grau: Inventar oder manueller Wert

Das große Gesamturteil wird dadurch nicht mehr prominent dargestellt; relevant sind die Einzelaktionen innerhalb des Rezeptbaums. Die Bezeichnungen der Beschaffungsarten werden zentral in `app.js` gepflegt, damit Tags, Sortierung und spätere Ausgaben konsistent bleiben.
