## Zeiterfassung

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

### Ferien-Check & Abwesenheits-Check (Leistungsprüfung)

#### holidayCheck()

##### JS Ausführungsfunktion
```javascript
function holidayCheck() {

    let von = jr_get_value('dt_firstOfMonth');
    let bis = jr_get_value('dt_lastOfMonth');

    von = new Date(von.getTime() - (von.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    bis = new Date(bis.getTime() - (bis.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

    jr_execute_dialog_function('getHolidays', { von: von, bis: bis }, getHolidayCallback, errorCallback);

}
```
Hier passiert nicht viel, aber entscheident ist die ```jr_execute_dialog_function``` - diese nimmt Parameter entgegen, in dem Fall den ersten und letzten Tag des Monats und führt eine PHP-Funktion aus. Dahinter sind noch Callbacks angegeben, die nach erfolgreichem oder fehlerhaften Ausführen der PHP-Funktion ausgeführt wird.

##### PHP Funktion getHolidays.php
```php
<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{
        $von = $this->getParameter('von');
        $bis = $this->getParameter('bis');

        $jobDB = $this->getDBConnection('JobData');
	    
        $sql01 = 'SELECT * FROM DATA_SCHOOLHOLIDAYS WHERE (beginDate BETWEEN \''. $von .'\' AND \''. $bis .'\') OR (endDate BETWEEN \''. $von .'\' AND \''. $bis .'\') OR (\''. $von .'\' BETWEEN beginDate AND endDate) OR (\''. $bis .'\' BETWEEN beginDate AND endDate)';
        $result01 = $jobDB->query($sql01);

        if ($result01 === false) {

            throw new JobRouterException($jobDB->getErrorMessage());

        }while ($row = $jobDB->fetchRow($result01)) {
            
            $vonPHP = $row['beginDate'];
            $bisPHP = $row['endDate'];
            $descPHP = $row['description'];

            $vonArr[] = $vonPHP;
            $bisArr[] = $bisPHP;
            $descArr[] = $descPHP;
            
        }

        $this->setReturnValue('von', $vonArr);
        $this->setReturnValue('bis', $bisArr);
        $this->setReturnValue('desc', $descArr);
	}
}
?>
```
Die Funktion nimmt die Monatsparameter aus holidayCheck() und führt eine SQL-Abfrage damit aus um alle Ferientage des Zeitraums zu bekommen. Diese werden dann mitsamt Beschreibung zurückgegeben.

##### getHolidayCallback() 
```javascript
function getHolidayCallback(returnObject) {

    if (returnObject.result.desc) {
        
        let von = returnObject.result.von;
        let bis = returnObject.result.bis;
        let desc = returnObject.result.desc;
        let rowIDs = jr_get_subtable_row_ids('schichten');

        for (h = 0; h < desc.length; h++) {

            let vonDate = new Date(von[h]);
            let bisDate = new Date(bis[h]);

            for (i = 0; i < rowIDs.length; i++) {

                let fromSub = jr_get_subtable_value('schichten', rowIDs[i], 'von');
                let toSub = jr_get_subtable_value('schichten', rowIDs[i], 'bis');
                let la = jr_get_subtable_value('schichten', rowIDs[i], 'leistungsart');

                if (((fromSub > vonDate && fromSub < bisDate) || (toSub > vonDate && toSub < bisDate)) && !(la == 'R')) {

                    jr_notify_error('Eingetragene Leistung überschneidet sich mit Ferien/Feiertagen: '+desc+'.');
                    var elem = document.getElementById("schichten_von_" +rowIDs[i]);
                    elem.className = dateClass;
                    var elem1 = document.getElementById("schichten_bis_" +rowIDs[i]);
                    elem1.className = dateClass;
                    jr_set_value('txb_checkSafe', 1);

                }
            }
        }

        let checkSave = jr_get_value('txb_checkSafe');
    
        if (checkSave == resCheck) {
            
            absenceCheck();
        }

    } else {

        let checkSave = jr_get_value('txb_checkSafe');
    
        if (checkSave == resCheck) {
            absenceCheck();
        }
    }
}
```
Hier werden nun die Ergebnisse der PHP-Funktion in einem Doppelloop über die Leistungstabelle geschickt. Sollte eine Leistung nun innerhalb der Ferien oder auf einem Feiertag liegen, wird diese rot markiert und eine Fehlermeldung wird angezeigt. Das Sichern wird geblockt und der User muss die Leistungen abändern und erneut auf "Leistung prüfen" klicken.

Falls alle Leistungen den 'holidayCheck()' bestehen oder gar keine Ferien/Feiertage in diesem Monat liegen, wird der 'absenceCheck' aufgerufen. Dieser funktioniert analog, daher skippe ich die Doku ob der Übersichtlichkeit.

>Lediglich das Callback 'getAbsenceCallback()' ist eventuell noch interessant:

#### absenceCheck()

>Analog zu holidayCheck() nur über die Tabelle der Abwesenheiten

##### getAbsenceCallback()
```javascript
function getAbsenceCallback(returnObject) {

    if (returnObject.result.date) {
        
        let date = returnObject.result.date;
        let idKrankArr = returnObject.result.ida;
        let rowIDs = jr_get_subtable_row_ids('schichten');

        for (h = 0; h < date.length; h++) {

            let absDate = new Date(date[h]);
            let idKrank = idKrankArr[h];

            let absDate = absDate.toLocaleDateString('de-DE');

            rowIDs.forEach(klientName);
            rowIDs.forEach(poolName);
    
            for (i = 0; i < rowIDs.length; i++) {
    
                let fromSub = jr_get_subtable_value('schichten', rowIDs[i], 'von');
                let toSub = jr_get_subtable_value('schichten', rowIDs[i], 'bis');

                if (fromSub && toSub) {

                    fromSub = fromSub.toLocaleDateString('de-DE');
                    toSub = toSub.toLocaleDateString('de-DE');
        
                    let idA = jr_get_subtable_value('schichten', rowIDs[i], 'schulB');
                    let idK = jr_get_subtable_value('schichten', rowIDs[i], 'klient');
                    let la = jr_get_subtable_value('schichten', rowIDs[i], 'leistungsart');
        
                    if ((fromSub == absDate || toSub == absDate) && (idA == idKrank || idK == idKrank) && !(la == 'R')) {
        
                        jr_notify_error('Eingetragene Leistung vom '+fromSub+' überschneidet sich mit Abwesenheitszeiten.');
        
                        var elem = document.getElementById("schichten_von_" +rowIDs[i]);
                        elem.className = dateClass;
                        var elem1 = document.getElementById("schichten_bis_" +rowIDs[i]);
                        elem1.className = dateClass;
                        
                        jr_set_value('txb_checkSafe', 1);
        
                    }
                }
            }
        }
    } 

    let checkSave = jr_get_value('txb_checkSafe');

    if (checkSave == resCheck) {

        jr_set_disabled('btn_save', 0);
        jr_show_step_action('save');

        sortShifts();
        getTimeSum();
        
        let bis = jr_get_value('dt_lastOfMonth');
        bis.setHours(23, 59, 59, 999);

        let today = new Date();

        if (today > bis) {
            
            jr_set_disabled('btn_send', 0);
            jr_show_step_action('send');

        }

        document.getElementById("schichten").addEventListener("click", function () {

            jr_hide_step_action('send');
            jr_hide_step_action('save');
            jr_set_disabled('btn_save', 1);
            jr_set_disabled('btn_save', 1);

        });  
    } 
}
```
Interessant hier ist, dass nach erfolgreichem Durchlaufen der Doppelschleife die 'getTimeSum()' ausgeführt wird. Also kommen wir auch im Stundenzettel der Schulbgl. nun zur Stundenberechnung. 

### Stundenberechnung

>Essentiell für den gesamten Prozess und wichtig!

Besteht immer aus einer Aufruffunktion, wie schon zuvor mit der Leistungsprüfung, und den Einzelteilen Soll-Stunden-Berechnung und Ist-Stunden-Berechnung

#### getTimeSum() & getTimeSumSB() Aufruffunktion
```javascript
function getTimeSum() {

    let monat = jr_get_value('txb_month');
    let minuten = timeSum();
    let rowIDs2 = jr_get_subtable_row_ids('monatsplan');

    if (rowIDs2) {
        rowIDs2.forEach(deleteSubRow);
    }

    jr_subtable_refresh('monatsplan');

    if (minuten || minuten == 0) {

        let sollMonStuArr = multipleContracts();
        let sollMonStu = sollMonStuArr[0].reduce(function (a, b) {
            return a + b;
          }, 0);

        minuten += sollMonStuArr[1].reduce(function (a, b) {
            return a + b;
          }, 0);

        let stundenKonto = minuten - sollMonStu;

        let anzZeit = decTimeToShowTime(minuten);
        let anzStundenKonto = decTimeToShowTime(stundenKonto);
        let anzSollMonStu = decTimeToShowTime(sollMonStu);

        let decSoll = (sollMonStu/60);
        let decStd = (minuten/60);
        let decKonto = (stundenKonto/60);

        jr_execute_dialog_function('saveMonStu', { monat: monat, soll_stunden: decSoll, 
            soll_stunden_txt: anzSollMonStu, 
            stunden: decStd, stunden_txt: anzZeit, 
            stundenkonto: decKonto, stundenkonto_txt: anzStundenKonto}, saveMonStuCallback, errorCallback);

    }

}
```
Zunächst werden hier die Minuten in 'timeSum()' aufgerechnet, die Monatsstunden-Prozesstabelle geleert und falls Leistungen exisitieren, werden die Soll-Stunden berechnet. In ```stundenKonto = minuten - sollMonStu``` wird dann die Differenz gespeichert. Alle werden werden auch als Anzeigewerte (etwa 23,25 = 23:15) gespeichert. Dann wird alles in der Tabelle per PHP-Funktion hinterlegt.

Näher wird im folgenden auf die Soll- und Ist-Stunden-Berechnung eingegangen. 

##### Soll-Stunden-Berechnung

###### multipleContracts()

```javascript
function multipleContracts() {

    let vertMaxID = jr_get_table_max_id('stb_vertrag');
    let sollStuArr = [];
    let istErhArr = [];

    for (let rowId=0; rowId<=vertMaxID; rowId++) {

        let wochenstunden = parseFloat(jr_get_table_value('stb_vertrag', rowId, 'stundenVertrag').replace(',', '.'));
        let wochenstundenSchule = parseFloat(jr_get_table_value('stb_vertrag', rowId, 'stundenSchule').replace(',', '.'));
        let tagewoche = parseInt(jr_get_table_value('stb_vertrag', rowId, 'tageProWoche'));

        if (tagewoche) {
    
            var tagesminuten = (wochenstunden / tagewoche) * 60;
            var tagesminutenSchule = (wochenstundenSchule / tagewoche) * 60;
    
        } else {
    
            var tagesminuten = (wochenstunden / 5) * 60;
            var tagesminutenSchule = (wochenstundenSchule / 5) * 60;
            
        }
    
        let startVert = jr_get_table_value('stb_vertrag', rowId, 'von');    
        let endVert = jr_get_table_value('stb_vertrag', rowId, 'bis');

        if (!endVert || endVert == 'Invalid Date') {

            endVert = jr_get_value('dt_lastOfMonth');

        } else {

            endVert = dateConvertSqlTableToJs(endVert);

        }
    
        startVert = dateConvertSqlTableToJs(startVert);

        let sollStu = targetH(tagesminuten, tagesminutenSchule, tagewoche, startVert, endVert); 
        let istErh = parseInt(sickDays2(startVert, endVert, false)) * tagesminuten;

        istErh += parseInt(sickDays2(startVert, endVert, true)) * tagesminutenSchule;

        sollStuArr[rowId] = sollStu;
        istErhArr[rowId] = istErh;

    }

    return [sollStuArr, istErhArr];

}
```
Der Punkt dieser Funktion ist der Fakt, dass Verträge von der Koordination gerne mal am 7. des Monats und am 19. nochmal umgeschrieben werden. Dann gibt es 3 für den Monat relevante Vertragsintervalle, die jeweils ihren Beitrag zu den Soll-Stunden haben. 

Hier werden pro Vertragsabschnitt die Soll-Stunden berechnet - Kern ist die 'targetH()'-Funktion.

###### targetH()
```javascript
function targetH(tagesminuten, tagesminutenSchule, tagewoche, von, bis) {

    let startMon = jr_get_value('dt_firstOfMonth');
    let endMon = jr_get_value('dt_lastOfMonth');
    let sollMonStu;
    let weekdays;
    let sickoDays = sickDays(von, bis, false);
    let sickoDaysSchule = sickDays(von, bis, true);
    let holioDays = holiDays(von, bis, tagewoche);

    if (!dateCheck(startMon, endMon, von) && !dateCheck(startMon, endMon, bis)) {

        weekdays = getWorkingDays(von, bis, tagewoche);
        sollMonStu = (weekdays-sickoDays-holioDays) * tagesminuten;
        
        if (sickoDaysSchule) {

            sollMonStu -= sickoDaysSchule * tagesminutenSchule;

        }


    } else if (!dateCheck(startMon, endMon, von)) {

        weekdays = getWorkingDays(von, endMon, tagewoche);
        sollMonStu = (weekdays-sickoDays-holioDays) * tagesminuten;
        
        if (sickoDaysSchule) {

            sollMonStu -= sickoDaysSchule * tagesminutenSchule;

        }

    } else if (!dateCheck(startMon, endMon, bis)) {

        weekdays = getWorkingDays(startMon, bis, tagewoche);
        sollMonStu = (weekdays-sickoDays-holioDays) * tagesminuten;
        
        if (sickoDaysSchule) {

            sollMonStu -= sickoDaysSchule * tagesminutenSchule;

        }

    } else if (!dateCheck(von, bis, startMon)) {

        weekdays = getWorkingDays(startMon, endMon, tagewoche);
        sollMonStu = (weekdays-sickoDays-holioDays) * tagesminuten;

        if (sickoDaysSchule) {

            sollMonStu -= sickoDaysSchule * tagesminutenSchule;

        }

    } else {

        sollMonStu = 0;

    }

    return sollMonStu;
}
```
Da dies wie zuvor erwähnt pro Vertragsabschnitt ausgeführt wird, gibt es viele if-Bedigungen um auf diese Zeiträume zu prüfen und die Berechnung entsprechent richtig zu stellen. 

Zuvor werden die Kranktage des Assistenten, Kranktage des Klienten und die Ferientage pro Vertragsabschnitt berechnet. Dann wird eine der if-Bedingungen ausgeführt, der die Werktage ermittelt und alles zusammenführt. 

Als Rückgabe gibt es einen Minutenwert, der die Sollstunden für diesen Vertragsabschnitt ausgibt.

##### Ist-Stunden-Berechnung
```javascript
function timeSum() {

    let rowIDs = jr_get_subtable_row_ids('schichten');
    let lenID = rowIDs.length;

    let minuten = 0;
    let k = 0;

    let anzProTag = [];
    let idArrTemp = [];
    let idArr = [];
    let zeitraum = [];

    for (var i = 0; i < lenID; i++) {

        let von = jr_get_subtable_value('schichten', rowIDs[i],'von');
        let bis = jr_get_subtable_value('schichten', rowIDs[i],'bis');
        let zeit = jr_get_subtable_value('schichten', rowIDs[i], 'zeit3');
        let vonTag = von.toLocaleDateString('de-DE');

        let counter = 1;

        if (!anzProTag.some(e => e.tag == vonTag)) {

            for (var j = i+1; j < lenID; j++) {

                let von2 = jr_get_subtable_value('schichten', rowIDs[j],'von');
                let bis2 = jr_get_subtable_value('schichten', rowIDs[j],'bis');
                let vonTag2 = von2.toLocaleDateString('de-DE');
    
                if (vonTag == vonTag2) {
    
                    counter++;

                    if (!idArrTemp.some(e => e == i)) {

                        idArrTemp.push(i);
                        zeitraum.push([von, bis]);

                    }
                    
                    idArrTemp.push(j);
                    zeitraum.push([von2, bis2]);
    
                }
    
            }

            idArr = idArrTemp;
            if (counter > 1) {

                let anzTag = {anzahl: counter, tag: vonTag, ids: idArr, intervals: zeitraum};
                anzProTag[k] = anzTag;
                k++;

            } else {

                minuten += parseInt(zeit);

            }

            idArrTemp = [];
            zeitraum = [];

        }

    }

    for (let l = 0; l < anzProTag.length; l++) {

        let dailyMin = 0;

        if (anzProTag[l].anzahl > 1) {

            let overlaps = [];
            let gesMin = getGesMin(anzProTag[l].intervals);
            let overlapsStart = calculateOverlap(anzProTag[l].intervals);
            let overlapsEnd = calculateOverlapEnd(anzProTag[l].intervals);
    
            if (getGesMin(overlapsStart) !== getGesMin(overlapsEnd)) {
    
                overlaps = createMinMaxArray(overlapsStart, overlapsEnd);
    
            } else {
    
                overlaps = overlapsStart;
    
            }
            
            let overlapMin = getGesMin(overlaps);
    
            dailyMin = gesMin - overlapMin;

        }


        if (dailyMin > 360) {

            if (dailyMin > 540) {

                dailyMin -= 45;

            } else {

                dailyMin -= 30;

            }

        }

        minuten += dailyMin;

    }
    
    return minuten;
    
}
```
Die Ist-Stunden-Berechnung ist mit Sicherheit eine der umfangreichsten Funktionen. Hängt wieder mit dem Spezialfall zusammen, dass es wohl Schulbgl. geben soll, die drei oder mehr Kinder auf einmal betreuen. Das führt natürlich zu einer Menge Überschneidungen von Einzelleistungen untereinander. 

Um das korrekt abzubilden wird hier zunächst für jeden Tag an dem Leistungen eingetragen wurden die Anzahl der eingetragenen Leistungen, die IDs und die Zeiträume gespeichert. 

Aus diesen mehrdimensionalen Arrays werden in der nächsten Schleife die Überschneidungen errechnet. Da die Überschneidungen immer einen Wert benötigen, wird nach dem Startpunkt und dem Endpunkt die Suche nach Überschneidungen ausgeführt. Stimmen beiden nicht überein wird zudem ein MinMax-Array erstellt um wirklich alle Überschneidungen abzudecken. 

Im Endeffekt werden die täglichen Minuten berechnet und auf die Gesamtminuten addiert. Diese werden zurückgegeben.
