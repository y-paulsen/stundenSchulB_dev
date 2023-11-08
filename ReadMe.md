# Stundenerfassung Code-Dokumentation

## Beispiel-Code

```javascript
function isValidDate(d) {

    return d instanceof Date && !isNaN(d);

}
```

### Beispiel-Erklärung
Die Funktion prüft, ob ein korrektes Datumsobjekt vorliegt. Wird für die Leistungsprüfung an mehreren Stellen genutzt.

>_Im Folgenden werden elementare Funktionen des JavaScript und PHP-Codes erläutert._
## Zeiterfassung
Die Zeiterfassung umfasst den Großteil des Codes des gesamten Prozesses. Daneben gibt es noch Code zur Kalender-Darstellung, der Pop-Up-Fenster, der Schrittzurücksetzung und der Stundenplan-Generierung. Es gibt zudem Unterschiede zwischen der mobilen und der Web-Version. 

### On-Load Funktionalität

#### onloadDia() [Web-Version]

```javascript
function onloadDia() {

    jr_set_value('txb_version', 'Desktop');
    jr_hide_step_action(['send', 'save'];
    $("schichten_add_value").hide();

    // Hier wird gecheckt, ob eine neue Zeile der Untertabelle hinzugefügt wird
    document.getElementById("schichten_add").addEventListener("click", function () {

        jr_hide_step_action(['send', 'save'];

        setTimeout(()=>{

            jQuery( "#div_plan" ).ready( function() {

                updateClient(maxID, start);
        
            });

        },1000);

    });

    jQuery( document ).ready( function() {

        updateData();
        showPool();
        poolUpdate();
  
    });

}
```
Die Funktion wird dem Namen nach bei jedem Laden des Stundenzettels ausgeführt. 

Es wird für die Logs gespeichert, ob jemand App oder Desktop/Web nutzt ```jr_set_value('txb_version', 'Desktop');```, die Möglichkeit zu Senden und zu Speichern wird versteckt, sowie die Möglichkeit mehrere Zeilen in der Zeiten-Tabelle hinzuzufügen. Alle Funktionen mit dem Präfix ```jr_``` stammen aus der JobRouter-Library und können [hier](https://docs.jobrouter.com/2023.1/de/designer/jsapi_jsapi_sfunktionsubersicht.html) eingesehen werden. 

Dann wird ein Event-Listener initialisiert, um nach jedem Hinzufügen einer Zeile ein Update der Klientenspalte durchzuführen ```updateClient()```. Dabei wird auch ein stumpfer Timeout verwendet, da JobRouter es nicht zulässt auf die internen Funktionen ein Callback zu starten. Das ist ein wenig unschön, führt aber zum Ziel.

Nebendran werden in der ```jQuery( document ).ready( function()``` bestimmte Datensätze aktualisiert und Pool-Features aktiviert, falls der Schulbgl. an einer Pool-Schule tätig ist.


#### onloadDia() [App-Version]

```javascript
function onloadDia() {

    jr_disable_send();

    jr_set_value('cb_absendenMonat', 0);
    jr_set_value('txb_version', 'App');
    
    serviceListUpdate();

    showPool();

}
```

Deutlich abgespeckter kommt der Code der App-Version daher. Die Funktionalität ist relativ gleich, ausgenommen eben die Untertabellen-Funktionen, die in der App eben nicht benötigt werden. Zudem ist jQuery oder die Nutzung anderer JS-Plugins ohnehin [nicht möglich](https://docs.jobrouter.com/2023.1/de/designer/app_designer_limitationen_und_informationen.html).


#### onloadSB()

```javascript
function onloadSB() {

    timeDisplayUpdate();

    jr_show_subtable...

    let fdc = jr_get_value('stx_firstDateContract');
    let ldc = jr_get_value('stx_lastDateContract');

    fdc = new Date(fdc);

    if (ldc) {

        ldc = new Date(ldc);

    }

    jr_set_value('dt_firstOfContract', fdc);
    jr_set_value('dt_lastOfContract', ldc);
    jr_set_value('cb_back', 0);

    jQuery( document ).ready( function() {

        let zeitraum = abrZeitraum();
    
        jr_set_value('txb_abrzeit', zeitraum);
  
    });

    jQuery(function() {

        let status = jQuery('#stx_status2').val();
        let statusDsc = `<h2 align="center" >${status}</h2>`

        jr_set_value('txb_status', status);
        jr_set_value('dsc_status', statusDsc);

        if (status == 'In Maßnahme' || status == 'Verfügbar' || status == 'Springer' || status == 'Dezentrale Koordination' || status == 'Springer Schule') {
    
            jQuery("#div_dsc_status").css( "border", "3px solid green" );
    
        }
    
        else if (status == 'Krank (Langzeit)' || status == 'Beschäftigungsverbot' || status == 'Freistellung' || status == 'Elternzeit' || status == 'Ruhend') {
    
            jQuery("#div_dsc_status").css( "border", "3px solid red" );
    
        }
    
        else {
    
            jQuery("#div_dsc_status").css( "border", "3px solid yellow" );
    
        }

    });

}
```
Hier werden die zusätzlich benötigten Untertabellenspalten für den Prüfschritt hinzugefügt, der Abrechnungszeitraum berechnet, sowie der Status mithilfe von jQuery angezeigt. Es gibt grüne, rote und gelbe Borders, je nach Status. Dieser Part könnte ob des Umfangs bereits in eine eigene Funktion ausgelagert werden...

### On-Save Funktionalität

#### onDiaSave() [Web-Version]

```javascript
function onDiaSave() {

    jr_set_value('txb_checkSafe', 0);

    let rowIDs = jr_get_subtable_row_ids('schichten');
    
    rowIDs.forEach(reset_2to1);
    rowIDs.forEach(saveCheck);
    
    let checkSave = jr_get_value('txb_checkSafe');

    if (checkSave == resCheck) {
        rowIDs.forEach(dateOverlapCheck);
    }
    
    checkSave = jr_get_value('txb_checkSafe');

    if (checkSave == resCheck) {
        holidayCheck();
    }

    document.getElementById("schichten").addEventListener("click", function () {
    
        rowIDs.forEach(resetError);

    });
}
```
Die Funktion wird beim Klicken auf "Leistungen prüfen" ausgeführt. 

Der Check-Bool wird zunächst auf false zurückgesetzt. Und alle IDs der Leistungen ausgelesen.

Danach wird reihenweise zuerst das X-zu-1 zurückgesetzt, dann die Leistungsprüfung durchlaufen. Sollte diese ohne "fehlerhafte" Leistungen durchlaufen worden sein, wird auf Überschneidungen geprüft (und dementsprechend das 2-zu-1-Häkchen gesetzt). Sollten keine Überschneidungen beim gleichen Klienten aufgetreten sein, wird auf Ferien und Feiertage geprüft.

Zuletzt gibt es noch einen Event-Listener, der die markierten Zeilen, die nicht durch die Prüfung gekommen sind, wieder in den "Normalzustand" zurücksetzt.


#### onDiaSave() [Web-Version]

```javascript
function onDiaSave() {

    jr_set_value('txb_checkSafe', 0);
    jr_set_value('cb_zwei-zu-eins', 0);
    
    saveCheck();

    var check = jr_get_value('txb_checkSafe');
    var resCheck = 0;

    if (check == resCheck) {

        dateOverlapCheck();

    }
    
    check = jr_get_value('txb_checkSafe');

    if (check == resCheck) {

        holidayCheck();

    }
}
```
Durchaus wieder ähnlich, nur ohne die Untertabellenspezifischen Funktionen. Und ohne forEach-Loops logischerweise, da nur eine Leistung gleichzeitig geprüft wird.


#### onDiaSaveSB()

```javascript
function onDiaSaveSB() {
    
    jr_set_value('txb_checkSafe', 0);

    let rowIDs = jr_get_subtable_row_ids('schichten');
    
    rowIDs.forEach(klientName);
    rowIDs.forEach(poolName);
    rowIDs.forEach(reset_2to1);
    rowIDs.forEach(saveCheck);
    
    let checkSave = jr_get_value('txb_checkSafe');

    if (checkSave == resCheck) {

        rowIDs.forEach(dateOverlapCheck);

    }

    document.getElementById("schichten").addEventListener("click", function () {
    
        rowIDs.forEach(resetError);

    });

    getTimeSumSB();

}
```
Wieder sehr ähnlich zu der Save-Funktion der Schulbegleiter. 

Unterschiede:
- Es werden die Namen der Kinder und der Pools nochmal als Text in die Untertabelle gespeichert (für die PDF-Ausgabe)
- Es wird nicht auf Ferien & Feiertage geprüft
- Die Stundenberechnung wird direkt im Anschluss ausgeführt
