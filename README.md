# Warenherstellung Calculator

Statisches Webinterface für den Warenherstellungs-Workflow von **Arma 3 Fishers Life DE**. Die Anwendung dient zur Pflege von Fabriken, Waren, Materialien, Rezepten und Produktionsplänen. Aus den eingegebenen Rezeptdaten berechnet sie automatisch Produktionsläufe, direkten Materialbedarf, rekursiv aufgelöste Rohmaterialien und eine optionale Wirtschaftlichkeitsauswertung.

Die Seite ist für GitHub Pages ausgelegt und benötigt keinen Build-Prozess, kein Backend und keine Serverdatenbank.

## Funktionsumfang

### Calculator

- Produktionspositionen mit Fabrik, Ware und Zielmenge anlegen
- Produktionsläufe automatisch anhand von Ausstoß pro Lauf berechnen
- direkten Materialbedarf über alle Positionen aggregieren
- Rohmaterialbedarf rekursiv aus Zwischenprodukt-Rezepten auflösen
- Material- und Rohmaterialtabellen in die Zwischenablage kopieren
- Wirtschaftlichkeit je Ware berechnen

### Fabriken und Waren

- Waren pro Fabrik verwalten
- Ausstoß pro Produktionslauf definieren
- Rezept je Ware hinterlegen
- optionale Preisfelder je Ware pflegen:
  - Importpreis
  - Exportpreis
  - Marktwert
  - Laufkosten pro Produktionslauf

### Materialien

- Materialstammdaten verwalten
- Materialien als Rohmaterial oder verarbeitetes Zwischenprodukt behandeln
- optionalen Wert pro Einheit hinterlegen
- optionale Import- und Exportpreise für handelbare Rohstoffe hinterlegen
- Unterrezepte für Zwischenprodukte definieren

### Datenverwaltung

- lokale Daten als JSON exportieren
- JSON-Daten wieder importieren
- lokal gespeicherte Daten zurücksetzen
- alle Daten werden browserseitig gespeichert

## Wirtschaftlichkeitslogik

Die Preisberechnung ist hybrid aufgebaut, damit sie auch funktioniert, wenn nicht für jede Ware Händlerpreise vorhanden sind.

### Materialkosten

Für jedes benötigte Material wird ein hinterlegter Materialwert verwendet. Wenn ein **Importpreis** vorhanden ist, wird dieser als Kostenbasis bevorzugt. Andernfalls nutzt die Anwendung den **Wert pro Einheit**. Wenn ein Material ein eigenes Unterrezept besitzt, wird es rekursiv bis zu seinen Rohmaterialien aufgelöst.

Fehlen notwendige Materialpreise, wird die Kalkulation nicht künstlich mit `0` gerechnet, sondern als unvollständig markiert.

### Verkaufspreis einer Ware

Die Anwendung verwendet folgende Priorität:

1. **Exportpreis**, wenn vorhanden  
   Der Exportpreis gilt als belastbarster Händlerwert.
2. **Marktwert**, wenn kein Exportpreis vorhanden ist  
   Der Marktwert kann als interner RP-, Markt- oder Schätzpreis genutzt werden.
3. **Herstellungskosten + Standardmarge**, wenn weder Exportpreis noch Marktwert vorhanden sind  
   Die Standardmarge kann im Calculator angepasst werden.
4. **Unvollständig**, wenn die Herstellungskosten wegen fehlender Materialpreise nicht berechnet werden können

### Importvergleich

Wenn für eine Ware ein Importpreis vorhanden ist, kann die Herstellung gegen den Import verglichen werden. Dadurch wird sichtbar, ob Eigenproduktion wirtschaftlicher ist als Einkauf/Import.

## Datenmodell, vereinfacht

Die Anwendung arbeitet intern mit:

- Fabriken
- Waren je Fabrik
- Materialien
- Rezepten
- optionalen Preisfeldern
- globaler Standardmarge
- Produktionsplan im Calculator

Die gespeicherten Daten liegen im Browser in `localStorage`. Export und Import verwenden JSON.

## Datenspeicherung

Diese Anwendung ist rein clientseitig. Dadurch gilt:

- jeder User hat eigene lokale Browserdaten
- Daten werden nicht automatisch zwischen Usern synchronisiert
- ein anderer Browser oder ein anderer PC hat eine eigene Datenbasis
- gelöschte Browserdaten entfernen auch die gespeicherten Calculator-Daten
- gemeinsamer Austausch erfolgt über JSON Export/Import

Für zentrale gemeinsame Daten wäre ein Backend mit Datenbank nötig, zum Beispiel eine kleine API mit SQLite. GitHub Pages allein kann keine zentrale schreibbare Datenbank betreiben.

## GitHub-Pages-Deployment

1. Repository auf GitHub erstellen oder vorhandenes Repository öffnen.
2. Dateien aus diesem Projekt in das Repository hochladen:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `fishers-life-logo.png`
   - `README.md`
3. In GitHub öffnen: `Settings -> Pages`.
4. Unter **Build and deployment** auswählen:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Speichern.
6. Nach kurzer Zeit ist die Seite über die GitHub-Pages-URL erreichbar.

Es werden keine Node.js-Abhängigkeiten, kein Build-Befehl und keine Serverkonfiguration benötigt.

## Projektstruktur

```text
waren-calculator-web/
├── index.html              # Seitenstruktur und Dialoge
├── styles.css              # Layout, Farben, Navigation, Responsive Design
├── app.js                  # Calculator-, Rezept-, Material- und Datenlogik
├── fishers-life-logo.png   # Logo im Header
└── README.md               # Projektdokumentation
```

## Bedienhinweise

### Neue Ware anlegen

1. In der Navigation eine Fabrik auswählen.
2. `Ware hinzufügen` klicken.
3. Warenname und Ausstoß pro Produktionslauf eintragen.
4. Optional Importpreis, Exportpreis, Marktwert und Laufkosten eintragen.
5. Rezeptmaterialien hinzufügen.
6. Ware speichern.

### Neues Material anlegen

1. Bereich `Materialien` öffnen.
2. `Material hinzufügen` klicken.
3. Materialname eintragen.
4. Optional Wert pro Einheit sowie Import- und Exportpreis setzen.
5. Falls das Material selbst hergestellt wird, `Verarbeitetes Material` aktivieren und ein Unterrezept eintragen.
6. Material speichern.

### Produktionsbedarf berechnen

1. Bereich `Calculator` öffnen.
2. `Position hinzufügen` klicken.
3. Fabrik, Ware und Zielmenge auswählen.
4. Die Anwendung berechnet automatisch:
   - Produktionsläufe
   - benötigte Materialien
   - benötigte Rohmaterialien
   - Wirtschaftlichkeit

## Backup und Austausch

Für Backups oder gemeinsame Datenpflege sollte regelmäßig ein JSON-Export erstellt werden.

Empfohlener Ablauf:

1. Daten pflegen.
2. Über `Daten -> Daten exportieren` sichern.
3. Exportdatei versionieren oder im Team teilen.
4. Andere User können die Datei über `Daten -> Daten importieren` übernehmen.

## Hinweise zur Weiterentwicklung

Sinnvolle nächste Ausbaustufen wären:

- zentrale Datenhaltung über kleines Backend mit SQLite
- bestätigungspflichtiger Bearbeitungsmodus für Datenpflege
- öffentlich lesbare, zentral gepflegte Stammdaten
- Lesemodus als Standard, Bearbeitung erst nach ausdrücklicher Bestätigung
- optionaler Preisvergleich zwischen Händlerimport, Eigenproduktion und Export
- weitere Auswertungen für Gewinn pro Produktionslauf oder pro Rohmaterialeinsatz

## Aktueller Stand

Diese Version enthält:

- vier gleichberechtigte Navbar-Punkte: Calculator, Fabriken, Materialien, Daten
- klassisches Dropdown für Fabriken und Daten
- Fishers-Life-Logo im Header
- Copyright mit Discord-Link
- lokale JSON-Datenverwaltung
- hybride Wirtschaftlichkeitskalkulation mit optionalen Händler-/Marktpreisen
- responsive Oberfläche für Desktop und kleinere Viewports

## Lizenz / Rechte

© 2026 l4ndl0rd · Warenherstellung Calculator · Fishers Life DE · Alle Rechte vorbehalten.



## v42: Handelbare Rohstoffe ergänzt

Diese Version erweitert Materialien um optionale Import- und Exportpreise. Importpreise werden bei der Herstellungskostenrechnung als Materialkosten bevorzugt, wenn sie gepflegt sind.

Als Standard-Rohstoffe sind jetzt enthalten:

- Aluminiumerz
- Kohleerz
- Rohöl
- Smaragderz
- Eisenerz
- Saphirerz
- Vivianiterz

## v41: Essensfabrik ergänzt

Diese Version ergänzt die **Essensfabrik** als weitere Fabrik-Kategorie.

- neuer Fabrik-Key: `food`
- neue Anzeige: `Essensfabrik`
- `waren-daten.json` enthält jetzt `products.food` als leere Rezeptliste
- bestehende lokale Daten werden beim Laden automatisch um die fehlende Fabrik ergänzt

## v40: Mitscrollende Hinzufügen-Aktionen

- Zusätzlicher schwebender Button für `Material hinzufügen` im Bereich Materialien
- Zusätzlicher schwebender Button für `Ware hinzufügen` in aktiven Fabrikbereichen
- Abschnittsköpfe mit Add-Button bleiben auch auf kleineren Viewports sticky statt wieder statisch zu werden
- Die schwebenden Add-Buttons erscheinen nur im freigeschalteten Bearbeitungsmodus

## v39: Bearbeitungsmodus ohne Passwort

- Admin-Code entfernt
- `Daten > Bearbeitung aktivieren` schaltet die Bearbeitung nach Bestätigung frei
- Bestätigungsdialog weist auf lokale Speicherung, Risiko und empfohlenen vorherigen Export hin
- UI-Texte von Bearbeitungsmodus auf Bearbeitungsmodus umgestellt

## v38: Bedienbarkeit bei vielen Datensätzen

Diese Version ergänzt mehrere Komfortfunktionen für größere Datenbestände:

- Die Hauptnavigation bleibt beim Scrollen sichtbar.
- In langen Material- und Fabriklisten bleibt der jeweilige Abschnittskopf mit dem Hinzufügen-Button oben sichtbar.
- Ein schwebender Nach-oben-Button erscheint nach längerem Scrollen.
- Tabellen und Warenkarten wurden kompakter und besser lesbar gestaltet.

## Mitgelieferte Datensätze

Die Datei `waren-daten.json` dient als mitgelieferter Standarddatenbestand. Beim ersten Öffnen ohne lokale Browserdaten lädt die Seite diese Datei automatisch. Über `Daten > Standarddaten laden` kann der lokale Bestand durch diese Datei ersetzt werden.

Wichtig: Für GitHub Pages wird die Datei nur gelesen. Änderungen an `waren-daten.json` müssen im Repository committed werden. Der Browser kann diese Datei nicht direkt auf GitHub Pages zurückschreiben.

## Bearbeitungsschutz / Bearbeitungsmodus

Die Stammdatenbereiche Materialien und Fabriken sind standardmäßig im Lesemodus. Bearbeiten, Import, Reset und Standarddaten-Neuladen sind erst nach `Daten > Bearbeitung aktivieren` verfügbar.

Es gibt kein Admin-Passwort mehr. Stattdessen muss der Bearbeitungsmodus per Bestätigungsdialog freigeschaltet werden. Der Hinweis macht klar, dass Änderungen lokal im Browser gespeichert werden und vor größeren Anpassungen ein Export empfohlen ist.

Das ist für ein statisches GitHub-Pages-Projekt weiterhin kein echter Zugriffsschutz, sondern nur ein Schutz gegen versehentliche Bearbeitung. Echte Zugriffskontrolle benötigt später ein Backend/API mit Benutzerverwaltung und zentraler Datenhaltung, zum Beispiel SQLite.

Für echte Zugriffskontrolle wäre ein Backend erforderlich, z. B. eine kleine API mit Login und SQLite-Datenbank auf einem Server.

## v43 - Inventar im Calculator

- Neuer Bereich **Eigenes Inventar** im Calculator.
- Erfarmte Items/Materialien können mit vorhandener Menge eingetragen werden.
- Inventar wird vom Materialbedarf abgezogen und als **Aus Inventar** / **Zukaufbedarf** angezeigt.
- Die Wirtschaftlichkeitsberechnung berücksichtigt Inventar als kostenlose Eigenbestände und berechnet dadurch reduzierte effektive Herstellungskosten für den aktuellen Produktionsplan.
- Das neue JSON-Feld `inventory` ist optional. Alte JSON-Dateien ohne dieses Feld bleiben importierbar; beim nächsten Export wird `inventory` ergänzt.

## v44 - Suche im Bearbeitungsmodus und neutrales Projektnaming

- Im Bearbeitungsmodus gibt es jetzt eine Suche für **Materialien**.
- In jeder Fabrik gibt es im Bearbeitungsmodus eine Suche für **Waren**.
- Die Suche filtert nach Name, Preisfeldern und verwendeten Rezeptmaterialien.
- Das interne LocalStorage-Naming wurde von einem alten projektspezifischen Präfix auf neutrales `warenherstellung_*` umgestellt.
- Bestehende lokale Daten aus der alten Browser-Speicherung werden automatisch übernommen, damit Nutzer durch die Umbenennung keine lokalen Daten verlieren.


## Version v45

- Mitgelieferte `waren-daten.json` durch die aktuelle Datenbank ersetzt.
- Preisempfehlung über `Kosten + Marge` nutzt wieder die normalen Herstellungskosten, auch wenn alle benötigten Materialien aus dem eigenen Inventar kommen.
- Inventar-Auswahl nutzt jetzt ein Textfeld mit Vorschlägen aller bekannten Materialien und Waren.
- Neue Inventar- und Produktionsplan-Einträge werden zunächst unten angefügt.
- Nach Auswahl/Änderung werden Inventar und Produktionsplan alphabetisch sortiert.


## Version v46

- Im Produktionsplan gibt es jetzt einen Button **Plan leeren**.
- Der Produktionsplan wird ohne weitere Rückfrage geleert, da er nur die aktuelle Kalkulation betrifft.
- Im Inventarbereich gibt es jetzt einen Button **Inventar zurücksetzen**.
- Der Inventar-Reset fragt vor dem Löschen ausdrücklich nach Bestätigung.
- Beim Inventar-Reset bleiben Produktionsplan, Materialien, Waren und Preise erhalten.


## v47 - Inventar-Reset-Korrektur

- Inventar-Draft-Zeilen starten ohne automatische Menge.
- Auswahl eines Inventar-Items schreibt erst nach Eingabe einer Menge > 0 in den Datenbestand.
- Daten-Reset entfernt zusätzlich alte Legacy-LocalStorage-Daten und leert offene Inventar-Draft-Zeilen.
- Doppeltes Datalist-Element für Inventarvorschläge entfernt.


### v48 - Rezeptmengen-Alignment

- Mengen-Spalte in den Rezepttabellen der Fabrik-Waren vereinheitlicht.
- Benötigte Mengen sind jetzt rechtsbündig mit tabellarischen Ziffern ausgerichtet.
- Materialspalte und Mengenspalte verwenden eine feste Tabellenstruktur, damit Karten mit unterschiedlich langen Materialnamen nicht mehr unruhig wirken.
