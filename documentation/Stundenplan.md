## Stundenplan Dialog

Aus dem Stundenplan-Dialog möchte ich aus Redudanz nur auf eine JS-Funktion eingehen. 

### OnSave

```javascript
function onSavePlan() {

    jr_set_value('tx_gueltigkeit', String(jr_get_value('dt_gueltigAb').toLocaleDateString('de-DE')+' - '+jr_get_value('dt_gueltigBis').toLocaleDateString('de-DE')));

    let json_week01 = JSON.stringify({
        "week01": {
            "monday": {
                "type": jr_get_value('ls_leistungsartMon1'),
                "client": jr_get_value('sls_klientMon1'),
                "client2": jr_get_value('sls_klientMon_2zu1'),
                "pool": jr_get_value('sls_pool_Mon1'),
                "start": jr_get_value('tx_vonMon1'),
                "end": jr_get_value('tx_bisMon1')
            },
            "tuesday": {
                "type": jr_get_value('ls_leistungsartDie1'),
                "client": jr_get_value('sls_klientDie1'),
                "client2": jr_get_value('sls_klientDie_2zu1'),
                "pool": jr_get_value('sls_pool_Die1'),
                "start": jr_get_value('tx_vonDie1'),
                "end": jr_get_value('tx_bisDie1')
            },
            "wednesday": {
                "type": jr_get_value('ls_leistungsartMit1'),
                "client": jr_get_value('sls_klientMit1'),
                "client2": jr_get_value('sls_klientDie_2zu1'),
                "pool": jr_get_value('sls_pool_Mit1'),
                "start": jr_get_value('tx_vonMit1'),
                "end": jr_get_value('tx_bisMit1')
            },
            "thursday":{
                "type": jr_get_value('ls_leistungsartDon1'),
                "client": jr_get_value('sls_klientDon1'),
                "client2": jr_get_value('sls_klientDie_2zu1'),
                "pool": jr_get_value('sls_pool_Don1'),
                "start": jr_get_value('tx_vonDon1'),
                "end": jr_get_value('tx_bisDon1')
            },
            "friday":{
                "type": jr_get_value('ls_leistungsartFre1'),
                "client": jr_get_value('sls_klientFre1'),
                "client2": jr_get_value('sls_klientFre_2zu1'),
                "pool": jr_get_value('sls_pool_Fre1'),
                "start": jr_get_value('tx_vonFre1'),
                "end": jr_get_value('tx_bisFre1')
            }
        }
    });

    jr_set_value('txb_week01', json_week01);
}
```
Beim Sichern des Stundenplans wird hier nämlich ein JSON-Objekt erzeugt, dass dann auf der anderen Seite (auf dem Stundenzettel) wieder ausgelesen wird. Das ist eigentlich schon die Ganze Magie. 

Da sich der Stundenplanerstellungs-Dialog und der Stundenzettel im selben Prozess befindet, teilen sie sich dementsprechend eine Prozesstabelle. Durch das "Sichern" des Schrittes wird der Prozesstabellenwert also immer auf den zuletzt gesicherten Stundenplan überschrieben.

## Stundenplan einfügen auf dem Stundenzettel

### readJSONPlan()

```javascript
function readJSONplan() {

    let maxID = jr_get_table_max_id('stb_stundenplan');
    let week01 = JSON.parse(jr_get_table_value('stb_stundenplan', maxID, 'woche01'));
 
    if (jr_get_table_value('stb_stundenplan', maxID, 'woche02')) {

        let week02 = JSON.parse(jr_get_table_value('stb_stundenplan', maxID, 'woche02'));

    }

    let fom = jr_get_value('dt_firstOfMonth');
    let lom = jr_get_value('dt_lastOfMonth');
    let assiID = jr_get_value('txb_schulB');
    let currentDate = fom;

    var result = 1;
    var strSchichten = '{';

    var beginn, ende, lart, client, client2, pool;

    while (currentDate <= lom)  {  

        var weekDay = currentDate.getDay();

        if(weekDay != 0 && weekDay != 6) {

            if (weekDay == 1) {

                let von = week01.week01.monday.start;
                let bis = week01.week01.monday.end;
                let vonArr = von.split(':');
                let bisArr = bis.split(':');               
                beginn = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), vonArr[0], vonArr[1]).toLocaleString('de-DE');
                ende = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), bisArr[0], bisArr[1]).toLocaleString('de-DE');
                lart = week01.week01.monday.type;
                client = week01.week01.monday.client;
                client2 = week01.week01.monday.client2;
                pool = parseInt(week01.week01.monday.pool);
                

            }

            if (weekDay == 2) {

                let von = week01.week01.tuesday.start;
                let bis = week01.week01.tuesday.end;
                let vonArr = von.split(':');
                let bisArr = bis.split(':');               
                beginn = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), vonArr[0], vonArr[1]).toLocaleString('de-DE');
                ende = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), bisArr[0], bisArr[1]).toLocaleString('de-DE');
                lart = week01.week01.tuesday.type;
                client = week01.week01.tuesday.client;
                client2 = week01.week01.tuesday.client2;
                pool = parseInt(week01.week01.tuesday.pool);

            }

            if (weekDay == 3) {

                let von = week01.week01.wednesday.start;
                let bis = week01.week01.wednesday.end;
                let vonArr = von.split(':');
                let bisArr = bis.split(':');               
                beginn = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), vonArr[0], vonArr[1]).toLocaleString('de-DE');
                ende = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), bisArr[0], bisArr[1]).toLocaleString('de-DE');
                lart = week01.week01.wednesday.type;
                client = week01.week01.wednesday.client;
                client2 = week01.week01.wednesday.client2;
                pool = parseInt(week01.week01.wednesday.pool);

            }

            if (weekDay == 4) {

                let von = week01.week01.thursday.start;
                let bis = week01.week01.thursday.end;
                let vonArr = von.split(':');
                let bisArr = bis.split(':');               
                beginn = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), vonArr[0], vonArr[1]).toLocaleString('de-DE');
                ende = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), bisArr[0], bisArr[1]).toLocaleString('de-DE');
                lart = week01.week01.thursday.type;
                client = week01.week01.thursday.client;
                client2 = week01.week01.thursday.client2;
                pool = parseInt(week01.week01.thursday.pool);

            }

            if (weekDay == 5) {

                let von = week01.week01.friday.start;
                let bis = week01.week01.friday.end;
                let vonArr = von.split(':');
                let bisArr = bis.split(':');               
                beginn = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), vonArr[0], vonArr[1]).toLocaleString('de-DE');
                ende = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), bisArr[0], bisArr[1]).toLocaleString('de-DE');
                lart = week01.week01.friday.type;
                client = week01.week01.friday.client;
                client2 = week01.week01.friday.client2;
                pool = parseInt(week01.week01.friday.pool);

            }

            if (lart && beginn != 'Invalid Date' && ende != 'Invalid Date') {

                if (result > 1 && lart && (client || pool)) {

                    strSchichten += ',';
    
                }

                if (client) {

                    strSchichten += 
                    `"${result}": {
                        "von": "${beginn}",
                        "bis": "${ende}",
                        "leistungsart": "${lart}",
                        "klient": "${client}",
                        "schulB": "${assiID}"
                    }`

                }

                if (client2) {

                    if (client) {

                        result++;
                        strSchichten += ',';

                    }

                    strSchichten += 
                    `"${result}": {
                        "von": "${beginn}",
                        "bis": "${ende}",
                        "leistungsart": "${lart}",
                        "klient": "${client2}",
                        "schulB": "${assiID}"
                    }`

                }

                if (pool) {

                    strSchichten += 
                    `"${result}": {
                        "von": "${beginn}",
                        "bis": "${ende}",
                        "leistungsart": "${lart}",
                        "pool": ${pool},
                        "schulB": "${assiID}"
                    }`

                }

                if (client || client2 || pool) {

                    result++;

                }

            }

        }

        currentDate.setDate(currentDate.getDate()+1); 

    }

    strSchichten += '}';

    jr_subtable_init('schichten', JSON.parse(strSchichten), stundenplanCallback, errorCallback);

}
```
> Sehr unschöne Funktion muss man sagen. Ist eines der letzten Projekte die zur Stundenerfassung dazu gekommen sind und ist sicher noch ausbaufähig. Das initiale JSON hätte ich auch schon vorformatiert in der Prozesstabelle speichern können, dann hätte ich mir mit Sicherheit das ganze Rum-Formatieren wie hier "new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), vonArr[0], vonArr[1]).toLocaleString('de-DE');" gespart. 

Hier wird die Prozesstabelle ausgelesen und für jeden Wochentag ein Objekt in einem Array gespeichert, dass die Informationen für die Leistung enthält. Im Anschluss wird dann noch abgeglichen, ob es sich um eine Pool-Leistung, Einzel-Leistung oder 2-zu-1-Leistung handelt. Dementsprechend wird dann ein neuer JSON-String befüllt, der dann über [jr_subtable_init](https://docs.jobrouter.com/2023.1/de/designer/jsapi_jr_subtable_init.html?q=jr_subtable) in die Leistungstabelle geschrieben wird.

#### TBD
- Kürzung und Vereinfachung des Codes
- Einbezug von feststehenden Abwesenheiten und Ferien/Feiertagen
- Performance-Issues (z.T. Laden bis in die Unendlichkeit)