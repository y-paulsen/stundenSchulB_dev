## Kalender

Zur Generierung wird eine externe Library verwendet. Sie trägt den Namen [Toast UI](https://ui.toast.com/tui-calendar) und verwendet ihrerseits viele Assets und Funktionen vom Standard-Google-Kalender.

Der Kalender wird im JobRouter sowohl als Widget (was deutlich besser läuft) und in den Prozessschritten der Stundenerfassung für die Schulbgl. und die Sachbearbeitung genutzt. Über das Widget muss immer zunächst über ein Dropdown ein Monat ausgewählt werden, in den Stundenzetteln ist es dementsprechend immer der Monat des Zettels. 

Es gibt zudem minimale Unterschiede zwischen den Kalendern den die Schulbgl. und die Sachbearbeitung zu sehen bekommen. Die Unterschiede ziehlen aber lediglich auf die Texte bei bestimmten Abwesenheiten ab, die Sachbearbeitung sieht z.B. _Krank (ohne AU)_, wogegen die Schulbgl. nur _Krank_ angezeigt bekommen.

### Aufbau einer Kalender-Instanz

```javascript
    var Calendar = window.tui.Calendar;
    var calendarDiv = '<div id="calendar" style="height: 600px;"></div>';
    
    jQuery('#column33').after(calendarDiv);
    
    const cal = new Calendar('#calendar', {
      defaultView: 'month',
      usageStatistics: false,
      useDetailPopup: true,
      useFormPopup: false,
      isReadOnly: true,
      month: {
        startDayOfWeek: 1,
        narrowWeekend: true,
        dayNames: ['Son', 'Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam'],
        isAlways6Weeks: false
      },
    });
```
Hier wird ein Kalenderobjekt initialisiert und mit jQuery in die 33. Spalte gesetzt. Für das Objekt werden danach einige Optionen festgelegt. Alle möglichen Optionen kann man [hier](https://nhn.github.io/tui.calendar/latest/CalendarCore) einsehen.

### Loop zur Generierung der Einträge (Stundenzettel)
```javascript
    async function eventLoop() {

      let fom = jr_get_value('dt_firstOfMonth');
      cal.setDate(fom);
      cal.clear(true);

      jr_loop_table('schichten', leiCalEvents);
      jr_loop_table('stb_abwesend', abwCalEvents);
      jr_loop_table('stb_abwesend_kind', abwCalEventsKind);
      jr_loop_table('stb_ferien', holCalEvents);

      return `Events eingeladen - Starttermin ${fom}.`;
      
    }
```
Hier sieht man da die Verwendung von 'jr_'-Funktionen möglich ist, dass der Kalender innerhalb der JobRouter-Umgebung eingebunden ist. Bei den Widgets ist das nicht der Fall.

Zunächst wird hier das Datum des Kalenders auf den 1. des jeweiligen Monats festgelegt. Danach werden die Untertabelle mit den Leistungen und die SQL-Tabellen mit Abwesenheiten und Ferien durchlaufen. Pro Leistung/Abwesenheit/Ferien-/Feiertag wird ein so genanntes 'Event' erstellt. Also ein Kalendereintrag. Beispielhaft nehmen wir mal die 'abwCalEvents()' unter die Lupe:

#### abwCalEvents()
```javascript
    function abwCalEvents(sqltable, rowId) {

      let date = jr_get_table_value('stb_abwesend', rowId, 'datum');
      let grund = jr_get_table_value('stb_abwesend', rowId, 'grund');
      let name = jr_get_table_value('stb_abwesend', rowId, 'name');

      let dateArr = [date.substring(0, 2), date.substring(3, 5), date.substring(6)];

      date = dateArr[2]+'-'+dateArr[1]+'-'+dateArr[0];

      bdC = "#222";

      if (grund == 'Krank' || grund == 'Krank (ohne AU)' || grund == 'Krank (mit AU)') {
        bgC = '#ffff00';
      } //[...]
      else if (grund == 'AU (während Urlaub)') {
        bgC = '#ccff33';
      }

      cal.createEvents([
        {
          title: grund,
          start: date,
          end: date,
          attendees: [name],
          isAllDay: true,
          state: 'abwesend',
          category: 'allday',
          backgroundColor: bgC,
          color: bdC
        },
      ]);

    }
```
Pro Tabelleneintrag wird die Funktion durchlaufen. Die Daten werden sich geholt, obligatorisch wird das Date-Object den Entsprechungen von Toast-Ui umgeformt und für jede Abwesenheitsart ein Color-Code hinterlegt.

In 'createEvents()' wird die Abwesenheit dann im Kalender hinzugefügt.

### Generierung der Einträge (Widget)
```javascript
      jQuery.post(
        'dashboard/LHMWidgets/kalender_perso/getAbsence.php',
        { idAssi: ida},
        function( data ){ 
            
            var absences = JSON.parse(data);

            var index = 0;

            if (absences) {

              absences.forEach(function(absence) {

                bdC = '#222';

                var grund;

                if (absence.datum.date > fom && absence.datum.date < lom)  {

                  if (absence.grund == 1 || absence.grund == 28) {
                    bgC = '#ffff00';
                    grund = 'Krank';
                    //[...]
                  } else if (absence.grund == 32) {
                    bgC = '#ccff33';
                    grund = 'AU (während Urlaub)';
                  } 

                  cal.createEvents([
                    {
                      title: grund,
                      start: absence.datum.date,
                      end: absence.datum.date,
                      //attendees: [name],
                      isAllDay: true,
                      state: 'abwesend',
                      category: 'allday',
                      backgroundColor: bgC,
                      color: bdC
                    },
                  ]);
                }
            });
          }
      });
```
Hier wird eine PHP-Funktion und ein Post-Request zur Hilfe genommen, da wir beim Widget nicht auf eine Tabelle im UI zurückgreifen können. Der Rest funktioniert analog zum Stundenzettel.

Ein kleiner Blick auf die PHP-Funktion:

#### getAbsence.php
```php
<?php

    $serverName = "sql03";
    $connectionInfo = array( "Database"=>"jobdata", "UID"=>"jobrouter", "PWD"=>"LHM48143synapsis");
    $conn = sqlsrv_connect( $serverName, $connectionInfo);

    if( $conn ) {

        $ida = $_POST["idAssi"];
        $sql1 = 'SELECT DISTINCT datum, abwesenheitsgrund FROM ISB_ABWESEND WHERE stammdatenId = \''. $ida .'\'';
        $result1 = sqlsrv_query($conn, $sql1);

        $Arr = [];
        
        if ($result1 == FALSE)
                die(FormatErrors(sqlsrv_errors()));
            $resultCount = 0;
            while($row = sqlsrv_fetch_array($result1, SQLSRV_FETCH_ASSOC))
            {
                $datum = $row['datum']; 
                $grund = $row['abwesenheitsgrund'];
                $Arr[] = array("datum" => $datum, "grund" => $grund);
                $resultCount++;
            }
            echo json_encode($Arr, JSON_UNESCAPED_UNICODE);
            sqlsrv_free_stmt($result1);
            sqlsrv_close($conn);

    }else{

        echo "Connection could not be established.<br />";
        die( print_r( sqlsrv_errors(), true));

    }

?>
```
Da wir quasi außerhalb der JobRouter-Umgebung sind, müssen wir über die 'sqlsrv_'-Funktionen auf die Datenbank zugreifen. Das Auslesen an sich ist ähnlich der PHP-Getter in der Zeiterfassung. Über 'echo' wird das Results-Array dann wieder dem JS-Code übergeben.

