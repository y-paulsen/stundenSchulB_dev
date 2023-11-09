# Stundenerfassung Code-Dokumentation

## Beispiel-Code

```javascript
function isValidDate(d) {

    return d instanceof Date && !isNaN(d);

}
```

### Beispiel-Erklärung
Die Funktion prüft, ob ein korrektes Datumsobjekt vorliegt. Wird für die Leistungsprüfung an mehreren Stellen genutzt.

>_In den verlinkten Dokus werden elementare Funktionen des JavaScript und PHP-Codes erläutert._

Die Zeiterfassung umfasst den Großteil des Codes des gesamten Prozesses. Daneben gibt es noch Code zur Kalender-Darstellung, der Pop-Up-Fenster, der Schrittzurücksetzung und der Stundenplan-Generierung. Es gibt zudem Unterschiede zwischen der mobilen und der Web-Version. 

[Zur Zeiterfassung](/documentation/Zeiterfassung.md)
[Zum Kalender](/documentation/Kalender.md)
[Zu den Pop-Ups](/documentation/Pop-Ups.md)
[Zum Schritte zurücksetzen](/documentation/Step-Reset.md)
[Zur Stundenplan-Generierung](/documentation/Stundenplan.md)