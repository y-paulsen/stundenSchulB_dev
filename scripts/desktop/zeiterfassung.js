var dateClass = "required jr-dialog-form-control jr-form-control-with-icon jr-dialog-form-date with-time stv_datetime validate-date validate-min-date validate-max-date min-date-error validation-failed";
var sqlListClass = "required jr-dialog-form-control jr-form-control-full stv_sqllist jr-dialog-form-table-select jr-dialog-form-select validation-failed";

var dateClassUndo = "jr-dialog-form-control jr-form-control-with-icon jr-dialog-form-date with-time stv_datetime validate-date validation-passed";
var sqlListClassUndo = "jr-dialog-form-control jr-form-control-full stv_sqllist jr-dialog-form-table-select jr-dialog-form-select";

const resCheck = 0;

const cb_false = '<div style="text-align:center"><img src="https://jrdev.lebenshilfe-muenster.de/jobrouter/assets/cache/jobselect/images/not_active.png" alt="" title=""></div>';
const cb_true = '<div style="text-align:center"><img src="https://jrdev.lebenshilfe-muenster.de/jobrouter/assets/cache/jobselect/images/active.png" alt="" title=""></div>';




/* ------------------------------------------ ONLOAD ------------------------------ */


/**
 * Funktion wird beim Laden des Zeiteintragungsdialogs aufgerufen. 
 * Senden und Speichern wird standardmäßig versteckt/deaktiviert. 
 * Monatsarbeitszeiten und Schichtzeiten werden berechnet.
 * Klienten werden nach eingeloggtem Assistenten/Zeitraum angezeigt.
 */
function onloadDia() {

    jr_set_value('txb_version', 'Desktop');
    //jr_set_value('txb_schulB', jr_get_value('sls_schulB'));
    //console.log(jr_get_value('txb_schulB'));
    
    jr_hide_step_action('send');
    jr_hide_step_action('save');
    jr_set_disabled('btn_send', 1);
    jr_set_disabled('btn_save', 1);

    $("schichten_add_value").hide();

    // Hier wird gecheckt, ob eine neue Zeile der Untertabelle hinzugefügt wird
    document.getElementById("schichten_add").addEventListener("click", function () {

        jr_hide_step_action('send');
        jr_hide_step_action('save');
        jr_set_disabled('btn_send', 1);
        jr_set_disabled('btn_save', 1);

        var maxID = jr_get_subtable_max_id('schichten');
        console.log('maxID in EventListener onClick:'+maxID);

        const start = Date.now();
        console.log('starting timer...');

        //setTimeout(()=>{

        jQuery( "#div_plan" ).ready( function() {

            const millis = Date.now() - start;
            console.log(`seconds elapsed = ${millis / 1000}`);
            // Expected output: "seconds elapsed = 2"

            updateClient(maxID, start);
    
        });

        //},200);

    });

    jQuery( document ).ready( function() {

        updateData();
        showPool();
        poolUpdate();

        //jr_loop_table('stb_arbeitstage', showWorkdayCheckbox);
  
    });

}


/**
 * SQL-Felder werden geupdated
 * Datumsfelder für Vertragslaufzeit werden gesetzt
 */
function updateData() {

    jr_sql_refresh(['stx_firstDateContract', 'stx_koordination', 'stx_schule', 'stx_schule_txt']);
    jr_sql_refresh('stx_lastDateContract', updateDataCallback);

}




/* ------------------------------------------ UNTERTABELLEN CONVENIENCE ------------------------------ */


/**
 * Helferfunktion zum Updaten der Zeiten für jede Zeile der Untertabelle.
 * Siehe @method getTime()
 */
function timeDisplayUpdate() {

    var rowIDs = jr_get_subtable_row_ids('schichten');
    //console.log('timeDisplayUpdate() rowIDs: '+rowIDs);
    rowIDs.forEach(getTime);

}


/**
 * Helferfunktion zum Updaten der Tätigkeiten für jede Zeile der Untertabelle.
 * Siehe @method serviceListUpdate()
 */
function serviceDisplayUpdate() {

    var rowIDs = jr_get_subtable_row_ids('schichten');
    //console.log('serviceDisplayUpdate() rowIDs: '+rowIDs);
    rowIDs.forEach(serviceListUpdate);

}


/**
 * Aufruffunktion für die Untertabellenansicht
 */
function springerUpdate(elementId) {

    let sc = jr_get_subtable_value('schichten', elementId, 'springer');
    //console.log(sc);

    if (sc == 1) {

        jr_subtable_refresh('schichten', 'klient', elementId);

    }

}


/**
 * Helferfunktion für die Klientenauswahl in der Untertabelle
 * @param {number} elementId
 * @param {number} start
 */
function updateClient(elementId, start) {

    setTimeout(()=>{

        var maxID = jr_get_subtable_max_id('schichten');
        console.log('maxID in Schichten:'+maxID);
    
        var schulB = jr_get_value('txb_schulB');
        console.log(`ID aus txb_schulB: ${schulB}`);
    
        if (elementId < 0) {
    
            jQuery( "#div_plan" ).ready( function() {
    
                let millis = Date.now() - start;
                console.log(`1st if: seconds elapsed = ${millis / 1000}`);
    
                jr_set_subtable_value('schichten', 0, 'schulB', schulB);
                jr_subtable_refresh('schichten', 'klient', 0);
                
                serviceListUpdate(0);
        
            });
    
        } else if (maxID > elementId) {
    
            jQuery( "#div_plan" ).ready( function() {
    
                let millis = Date.now() - start;
                console.log(`2nd if: seconds elapsed = ${millis / 1000}`);
    
                jr_set_subtable_value('schichten', maxID, 'schulB', schulB);
                jr_subtable_refresh('schichten', 'klient', maxID);
    
                serviceListUpdate(maxID);
        
            });
    
        } else {
    
            jQuery( "#div_plan" ).ready( function() {
    
                let millis = Date.now() - start;
                console.log(`3rd if: seconds elapsed = ${millis / 1000}`);
    
                if ( maxID == elementId) {
    
                    jr_set_subtable_value('schichten', elementId+1, 'schulB', schulB);
                    jr_subtable_refresh('schichten', 'klient', elementId+1);
        
                    serviceListUpdate(elementId+1);    
    
                }
        
            });
    
        }

    },1500);

}


/**
 * Funktion zur Zeitberechnung der Schichten auf Basis der Datumswerte in der Untertabelle.
 * @param {number} elementId 
 */
function getTime(elementId) {
    
    var rowId = elementId;
    var beginn = jr_get_subtable_value('schichten', rowId, 'von');
    var ende = jr_get_subtable_value('schichten', rowId, 'bis');
    
    //console.log('getTime() Beginn: '+beginn.toISOString().slice(0, 19).replace('T', ' '));
    
    var minuten = jr_date_diff(ende, beginn, 'm');

    if (minuten > 540) {

        minuten = minuten - 45;
        
    } else if (minuten > 360) {

        minuten = minuten - 30;

    }
    
    var decZeit = minuten / 60;
    var anzZeit = decTimeToShowTime(minuten);

    //console.log('Stunden (Dezimal Schichten): '+decZeit);
    //console.log('Stunden (Anzeige Schichten): '+anzZeit);

    jr_set_subtable_value('schichten', rowId, 'zeit', decZeit);
    jr_set_subtable_value('schichten', rowId, 'zeit2', anzZeit);
    jr_set_subtable_value('schichten', rowId, 'zeit3', minuten);

}


/**
 * Helferfunktion zum Konvertieren der Zeit in Minuten in [Stunden:Minuten]
 * @param {number} minuten - Übergabe der Arbeitszeit in Minuten, z.B. _163_ 
 * @returns {String} - Angezeigte Zeit in der Übersicht nach Schema [Stunden:Minuten]
 */
function decTimeToShowTime(minuten) {

    var modZeit = Math.floor(Math.abs(minuten) % 60);
    //console.log(modZeit);

    var zeit = Math.floor(Math.abs(minuten) / 60);
    //console.log(zeit);

    if (modZeit <= 9 && modZeit >= 0) {
        var anzZeit = zeit + ':0' + modZeit;
    } else {
        var anzZeit = zeit + ':' + modZeit;
    }

    if (minuten < 0) {
        anzZeit = '-'+anzZeit;
    }
    
    return anzZeit;

}


/**
 * Setzt den 'bis' Datumswert auf den 'von' Datumswert, sofern nicht schon ein 'bis'-Wert existiert.
 * @param {number} elementId 
 */
function changeTimespan(elementId) {

    let bis = jQuery(`#schichten_bis_${elementId}`).val();
    //console.log(bis);

    if (bis) {

        getTime(elementId);

    } else {

        jr_set_subtable_value('schichten', elementId, 'bis', jr_get_subtable_value('schichten', elementId, 'von'));
        getTime(elementId);

    }

}


/**
 * Funktion um Tätigkeiten der ausgewählten Leistungsart anzupassen.
 * @param {number} elementId
 */
function serviceListUpdate(elementId) {

    var rowId = elementId;
    var serviceType = jr_get_subtable_value('schichten', rowId, 'leistungsart');

    jr_set_value('txb_leistungsartDings', serviceType);

    if (serviceType == 'U' || serviceType == 'R') {

        jr_set_disabled('schichten_taetigkeit_' + rowId, false);
        jr_subtable_refresh('schichten', 'taetigkeit', rowId);
        jr_sql_refresh('sls_taetigkeit');

    } else {

        jr_set_disabled('schichten_taetigkeit_' + rowId, true);
        jr_subtable_refresh('schichten', 'taetigkeit', rowId);
        jr_sql_refresh('sls_taetigkeit');

    }

    //console.log(`${rowId}: ${new Date().toISOString()}`);

}


/**
 * Funktion um das SQL-Feld des Klienten für Springerdienste zu aktualisieren.
 * @param {number} elementId 
 */
function springerCheck(elementId) {

    if (jr_get_subtable_value('schichten', elementId, 'springer') == 1) {

        jr_set_subtable_value('schichten', elementId, 'schulB', '');
        jr_subtable_refresh('schichten', 'klient', elementId);

    } else {    

        var schulB = jr_get_value('sls_schulB');
        jr_set_subtable_value('schichten', elementId, 'schulB', schulB);
        jr_subtable_refresh('schichten', 'klient', elementId);

    }

}


/**
 * Funktion zum Deaktivieren der Klientenauswahl beim Anhaken des Klientenpools.
 * @param {number} elementId 
 */
function clientPool(elementId) {

    if (jr_get_subtable_value('schichten', elementId, 'pool')) {

        jr_set_subtable_value('schichten', elementId, 'klient', '');
        jr_set_disabled('schichten_klient_' + elementId);

    } else {

        jr_set_disabled('schichten_klient_' + elementId, 0);

    }
}


/**
 * Funktion zeigt das Pool-Dropdown, falls Assistent an Poolschule
 */
function showPool() {

    let maxID = jr_get_table_max_id('stb_pool');

    //console.log(maxID);

    if (maxID || maxID == 0) {

        jr_show_subtable_column('schichten', 'pool');

    }

}

/**
 * Pool-Dropdown in der Untertabelle beim Neu-Laden der Seite
 */
function poolUpdate() {

    var rowIDs = jr_get_subtable_row_ids('schichten');
    //console.log('poolUpdate() rowIDs: '+rowIDs);
    rowIDs.forEach(clientPool);

}




/* -------------------------------------- PRÜFUNG LEISTUNGEN -------------------------------------- */


/**
 * Aufruffunktion um zu Prüfen, ob alle Daten der Untertabelle korrekt sind.
 */
function onDiaSave() {
    
    jr_reset_value('sls_klientFilter');
    jr_set_value('txb_checkSafe', 0);
    
    document.getElementById("schichten_add_value").value = 1;

    var rowIDs = jr_get_subtable_row_ids('schichten');
    
    rowIDs.forEach(reset_2to1);
    
    rowIDs.forEach(saveCheck);
    
    var checkSave = jr_get_value('txb_checkSafe');
    //console.log("before dateOverlap() CheckSave: "+checkSave);

    if (checkSave == resCheck) {
        rowIDs.forEach(dateOverlapCheck);
    }
    

    checkSave = jr_get_value('txb_checkSafe');
    //console.log("before holidayCheck() checkSave: "+checkSave);

    if (checkSave == resCheck) {
        holidayCheck();
    }

    document.getElementById("schichten").addEventListener("click", function () {
    
        rowIDs.forEach(resetError);

    });
}


/**
 * Setzt die Styles der Zeilen mit fehlerhaften Eingaben zurück
 * @param {number} rowId 
 */
function resetError(rowId) {

    var kl = document.getElementById("schichten_klient_" + rowId);
    if (kl) {
        if (kl.className == sqlListClass) {
            kl.className = sqlListClassUndo;
        }
    }

    var von = document.getElementById("schichten_von_" + rowId);
    if (von) {
        if (von.className == dateClass) {
            von.className = dateClassUndo;
        }
    }

    var bis = document.getElementById("schichten_bis_" + rowId);
    if (bis) {
        if (bis.className == dateClass) {
            bis.className = dateClassUndo;
        }
    }

    var la = document.getElementById("schichten_leistungsart_" + rowId);
    if (la) {
        if (la.className == sqlListClass) {
            la.className = sqlListClassUndo;
        }
    }

    var tk = document.getElementById("schichten_taetigkeit_" + rowId);
    if (tk) {
        if (tk.className == sqlListClass) {
            tk.className = sqlListClassUndo;
        }
    }

}


/**
 * Funktion zum Zurücksetzen der Zwei-zu-Eins-Beziehung Checkbox.
 * @param {number} elementId 
 */
function reset_2to1(elementId) {
    jr_set_subtable_value('schichten', elementId, 'zwei-zu-eins', 0);
}


/**
 * Umfangreiche Prüfung, ob Leistung korrekt eingetragen wurde.
 * @param {number} elementId
 *  
 */
function saveCheck(elementId) {

    var idK = jr_get_subtable_value('schichten', elementId, 'klient');
    var von = jr_get_subtable_value('schichten', elementId, 'von');
    var bis = jr_get_subtable_value('schichten', elementId, 'bis');
    var la = jr_get_subtable_value('schichten', elementId, 'leistungsart');
    var tk = jr_get_subtable_value('schichten', elementId, 'taetigkeit');
    var time = jr_get_subtable_value('schichten', elementId, 'zeit3');
    var pool = jr_get_subtable_value('schichten', elementId, 'pool');

    var vonMonat = jr_get_value('dt_firstOfMonth');
    console.log(`Monatsbeginn: ${vonMonat}`);
    
    var bisMonat = jr_get_value('dt_lastOfMonth');
    bisMonat.setHours(23, 59, 59, 999);
    console.log(`Monatsende: ${bisMonat}`);

    var vonVertr = jr_get_value('dt_firstOfContract');
    console.log(`Vertragsbeginn: ${vonVertr}`);
    var bisVertr = jr_get_value('dt_lastOfContract');
    console.log(`Vertragsende: ${bisVertr}`);

    var schule = jr_get_value('stx_schule');

    console.log('Reihe '+elementId+': '+idK+' '+von+' '+bis+' '+la+' '+tk+' '+time+' '+pool);

    if (isValidDate(vonVertr)) {

        if(isValidDate(von) && isValidDate(bis)) {

            if (idK == '' && pool == 0 && (tk != 'Betriebsratsarbeit' && tk != 'Fortbildung' && tk != 'Koordination' && tk != 'Teamsitzung' )) {

                jr_notify_error(`Es wurde am ${von.toLocaleDateString()} kein/e Klient*in angegeben.`, 5);
                var elem = document.getElementById("schichten_klient_" + elementId);
                elem.className = sqlListClass;
                jr_set_value('txb_checkSafe', 1);
        
            } else if (von == '' ) {
        
                jr_notify_error(`Es wurde am ${von.toLocaleDateString()} kein Startdatum angegeben.`, 5);
                var elem = document.getElementById("schichten_von_" + elementId);
                elem.className = dateClass;
                jr_set_value('txb_checkSafe', 1);
        
            } else if (bis == '') {
        
                jr_notify_error(`Es wurde am ${von.toLocaleDateString()} kein Enddatum angegeben.`, 5);
                var elem = document.getElementById("schichten_bis_" + elementId);
                elem.className = dateClass;
                jr_set_value('txb_checkSafe', 1);
        
            } else if (dateCheck(vonMonat, bisMonat, von)) {
        
                jr_notify_error(`Startdatum ist außerhalb des Monats (${von.toLocaleDateString()}).`, 5);
                var elem = document.getElementById("schichten_von_" + elementId);
                elem.className = dateClass;
                jr_set_value('txb_checkSafe', 1);

            } else if (dateCheck(vonMonat, bisMonat, bis)) {
        
                jr_notify_error(`Enddatum ist außerhalb des Monats (${bis.toLocaleDateString()}).`, 5);
                var elem = document.getElementById("schichten_bis_" + elementId);
                elem.className = dateClass;
                jr_set_value('txb_checkSafe', 1);
        
            } /* else if (isValidDate(bisVertr)) {

                bisVertr.setHours(23, 59, 59, 999);
                console.log(`Vertragsende +23:59: ${bisVertr}`);

                if (dateCheck(vonVertr, bisVertr, von)) {
        
                    jr_notify_error(`Startdatum ist außerhalb der Vertragslaufzeit (${von.toLocaleDateString()}).`, 5);
                    var elem = document.getElementById("schichten_von_" + elementId);
                    elem.className = dateClass;
                    jr_set_value('txb_checkSafe', 1);
            
                } else if (dateCheck(vonVertr, bisVertr, bis)) {
        
                    jr_notify_error(`Enddatum ist außerhalb der Vertragslaufzeit (${bis.toLocaleDateString()}).`, 5);
                    var elem = document.getElementById("schichten_bis_" + elementId);
                    elem.className = dateClass;
                    jr_set_value('txb_checkSafe', 1);
                
                } 

            } */ else if (la == '') {
        
                jr_notify_error(`Am ${von.toLocaleDateString()} wurde keine Leistungsart angegeben.`, 5);
                var elem = document.getElementById("schichten_leistungsart_" + elementId);
                elem.className = sqlListClass;
                jr_set_value('txb_checkSafe', 1);
        
            } else if (time < 1) {
        
                jr_notify_error(`Am ${von.toLocaleDateString()} beträgt die Leistungsdauer 0 Minuten.`, 5);
                jr_set_value('txb_checkSafe', 1);
        
            } else if (time > 645 && (la == 'U' || la == 'R')) {
        
                jr_notify_error('Bei unmittelbaren Leistungen darf maximal 10 Stunden gearbeitet werden.', 5);
                jr_set_value('txb_checkSafe', 1);
        
            } else if (time > 720 && (la == 'Kf')) {
        
                jr_notify_error('Bei Klassenfahrten sind täglich bis zu 12 Stunden eintragbar.', 5);
                jr_set_value('txb_checkSafe', 1);
        
            } else if ((dayCheck(von, bis)) && la == 'U' && (schule != '95' || schule != '97' )) {
        
                jr_notify_error('Unmittelbare Leistungen dürfen ausschließlich an Wochentagen stattfinden.', 5);
                var elem = document.getElementById("schichten_von_" + elementId);
                elem.className = dateClass;
                var elem1 = document.getElementById("schichten_bis_" + elementId);
                elem1.className = dateClass;
                jr_set_value('txb_checkSafe', 1);
        
            } else if (la == 'R' && !tk) {
        
                jr_notify_error('Bei Regieleistungen muss eine Tätigkeit angegeben werden.', 5);
                var elem = document.getElementById("schichten_taetigkeit_" + elementId);
                elem.className = sqlListClass;
                jr_set_value('txb_checkSafe', 1);
        
            } else if ((tk == 'Kind krank' || tk == 'Schule geschlossen') && time > 120) {

                jr_notify_error('Bei Bereitschaftszeiten sind maximal 2 Stunden zulässig.', 5);
                var elem = document.getElementById("schichten_taetigkeit_" + elementId);
                elem.className = sqlListClass;
                jr_set_value('txb_checkSafe', 1);

            } else if (tk == 'Dokumentation' && time > 120) {

                jr_notify_error(`Bei der Regietätigkeit "Dokumentation" am ${von.toLocaleDateString()} sind maximal 2 Stunden zulässig.`, 5);
                var elem = document.getElementById("schichten_taetigkeit_" + elementId);
                elem.className = sqlListClass;
                jr_set_value('txb_checkSafe', 1);

            } else if (tk == 'Zeiterfassung') {

                zeiterfassungCheck();

            } 

        } else {

            jr_notify_error(`Kein gültiges Start- oder Enddatum der Leistung angegeben.`, 5);
            var elem = document.getElementById("schichten_von_" + elementId);
            elem.className = dateClass;
            var elem1 = document.getElementById("schichten_bis_" + elementId);
            elem1.className = dateClass;
            jr_set_value('txb_checkSafe', 1);

        }

    } else {

        jr_notify_warn('Die automatische Leistungsprüfung konnte nicht durchlaufen werden, bitte prüft selbst vor dem Abschicken auf Korrektheit der Leistungen.', 5);
        //jr_set_value('txb_checkSafe', 0);

    } 
}


/**
 * Prüfung, ob Zeitraum der Leistung sich mit einer anderen Leistung überschneidet.
 * @param {number} elementId 
 */
function dateOverlapCheck(elementId) {

    var idK = jr_get_subtable_value('schichten', elementId, 'klient');
    var von = jr_get_subtable_value('schichten', elementId, 'von');
    var bis = jr_get_subtable_value('schichten', elementId, 'bis');    
    var la = jr_get_subtable_value('schichten', elementId, 'leistungsart');

    var rowIDs = jr_get_subtable_row_ids('schichten');

    for (i = 0; i < rowIDs.length; i++) {

        if (rowIDs[i] != elementId) {

            var von2 = jr_get_subtable_value('schichten', rowIDs[i], 'von');
            var bis2 = jr_get_subtable_value('schichten', rowIDs[i], 'bis');
            var klient2 = jr_get_subtable_value('schichten', rowIDs[i], 'klient');
            var la2 = jr_get_subtable_value('schichten', rowIDs[i], 'leistungsart');
            
            if (!(dateCheck(von, bis, von2) && dateCheck(von, bis, bis2) && dateCheck(von2, bis2, von) && dateCheck(von2, bis2, bis)) && idK != klient2) {

                jr_set_subtable_value('schichten', rowIDs[i], 'zwei-zu-eins', 1);

            } else if (!(dateCheck(von, bis, von2) && dateCheck(von, bis, bis2) && dateCheck(von2, bis2, von) && dateCheck(von2, bis2, bis)) && idK == klient2) {

                jr_notify_error('Leistungen beim selben Klienten dürfen sich nicht überschneiden.', 5);
                var elem = document.getElementById("schichten_von_" + elementId);
                elem.className = dateClass;
                var elem1 = document.getElementById("schichten_bis_" + elementId);
                elem1.className = dateClass;
                jr_set_value('txb_checkSafe', 1);

            }
        }
    }
}


/**
 * Prüfung, ob Tätigkeit Zeiterfassung insgesamt nur eine halbe Stunde pro Klient eingetragen wurde.
 */
function zeiterfassungCheck() {

    var rowIDs = jr_get_subtable_row_ids('schichten');

    var anzKl = document.getElementById("sls_klientFilter").length;
    //console.log(anzKl);

    var minuten = 0;

    for (i = 0; i < rowIDs.length; i++) {
        let tk = jr_get_subtable_value('schichten', rowIDs[i], 'taetigkeit');
        if (tk == 'Zeiterfassung') {
            let von = jr_get_subtable_value('schichten', rowIDs[i], 'von');
            let bis = jr_get_subtable_value('schichten', rowIDs[i], 'bis');
            minuten += jr_date_diff(bis, von, 'm');
            //console.log(minuten);
        }
    } if (minuten > (30 * anzKl)) {
    
        jr_notify_error('Bei der Tätigkeit Zeiterfassung dürfen maximal 30 Minuten pro Klient innerhalb eines Monats eingetragen werden.', 5);
        jr_set_value('txb_checkSafe', 1);

    }

}


/**
 * Prüfung, ob Leistung in Ferienzeit ist.
 */
function holidayCheck() {

    var von = jr_get_value('dt_firstOfMonth');
    var bis = jr_get_value('dt_lastOfMonth');

    //console.log('Step 1 - Einlesen der Daten: '+von+' '+bis);

    von = new Date(von.getTime() - (von.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    bis = new Date(bis.getTime() - (bis.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

    //console.log('Step 2 - Konvertieren der Daten: '+von+' '+bis);

    jr_execute_dialog_function('getHolidays', { von: von, bis: bis }, getHolidayCallback, errorCallback);

}


/**
 * Prüfung, ob Leistung während Abwesenheitszeiten von Klient/Assistentent eingetragen wurde.
 */
function absenceCheck() {

    var von = jr_get_value('dt_firstOfMonth');
    var bis = jr_get_value('dt_lastOfMonth');
    var IDassi = jr_get_value('sls_schulB');
    
    //console.log('Step 1 - Einlesen der Daten: '+von+' '+bis+' '+IDassi);
    
    von = new Date(von.getTime() - (von.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    bis = new Date(bis.getTime() - (bis.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    
    //console.log('Step 2 - Konvertieren der Daten: '+von+' '+bis);
    
    jr_execute_dialog_function('getAbsence', { von: von, bis: bis, IDa: IDassi }, getAbsenceCallback, errorCallback);

}




/* ----------------------------------- CALLBACKS -------------------------------------- */


/**
 * Standard Callback Fehler
 * @param {Object} returnObject 
 */
function errorCallback(returnObject) {

    //console.log(returnObject);
    jr_notify_error('Fehler beim ausführen der PHP-Funktion: ' + returnObject.message);

}


/**
 * Callback der getHolidays PHP-Funktion.
 * @param {Object} returnObject 
 */
function getHolidayCallback(returnObject) {

    //console.log(returnObject.result);

    if (returnObject.result.desc) {
        
        var von = returnObject.result.von;
        var bis = returnObject.result.bis;
        var desc = returnObject.result.desc;

        //console.log('Step 3 - PHP Return: '+von+' '+bis);

        for (h = 0; h < desc.length; h++) {

            var vonDate = new Date(von[h]);
            var bisDate = new Date(bis[h]);

            //console.log('Step 4 - Konvertierung zurück in JavaScript: '+vonDate+' '+bisDate);

            rowIDs = jr_get_subtable_row_ids('schichten');

            for (i = 0; i < rowIDs.length; i++) {

                var fromSub = jr_get_subtable_value('schichten', rowIDs[i], 'von');
                var toSub = jr_get_subtable_value('schichten', rowIDs[i], 'bis');
                var la = jr_get_subtable_value('schichten', rowIDs[i], 'leistungsart');

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

        var checkSave = jr_get_value('txb_checkSafe');
        //console.log(" before absenceCheck() checkSave: "+checkSave);
    
        if (checkSave == resCheck) {
            
            absenceCheck();
        }

    } else {

        var checkSave = jr_get_value('txb_checkSafe');
        //console.log(" before absenceCheck() checkSave: "+checkSave);
    
        if (checkSave == resCheck) {
            absenceCheck();
        }
    }
}


/**
 * Callback der getAbsence PHP-Funktion
 * @param {Object} returnObject 
 */
function getAbsenceCallback(returnObject) {

    //console.log(returnObject.result);

    if (returnObject.result.date) {
        
        var date = returnObject.result.date;
        var idKrankArr = returnObject.result.ida;

        //console.log('Step 3 - PHP Return: '+date);
        //console.log('Step 3 - PHP Return: '+idKrankArr);
        //console.log(date.length);

        for (h = 0; h < date.length; h++) {

            var absDate = new Date(date[h]);
            var idKrank = idKrankArr[h];

            //console.log('Step 4 - Konvertierung zurück in JavaScript: '+absDate);
            //console.log(idKrank);
    
            absDate = absDate.toLocaleDateString('de-DE');
    
            //console.log('Step 5 - Konvertierung in Format DD.MM.YYYY: '+absDate);
    
            var rowIDs = jr_get_subtable_row_ids('schichten');

            rowIDs.forEach(klientName);
            rowIDs.forEach(poolName);
    
            //console.log(rowIDs);
            //console.log('rowIDs.length: '+rowIDs.length);
    
            for (i = 0; i < rowIDs.length; i++) {
    
                var fromSub = jr_get_subtable_value('schichten', rowIDs[i], 'von');
                var toSub = jr_get_subtable_value('schichten', rowIDs[i], 'bis');

                if (fromSub && toSub) {

                    fromSub = fromSub.toLocaleDateString('de-DE');
                    toSub = toSub.toLocaleDateString('de-DE');
        
                    var idA = jr_get_subtable_value('schichten', rowIDs[i], 'schulB');
                    var idK = jr_get_subtable_value('schichten', rowIDs[i], 'klient');
                    var la = jr_get_subtable_value('schichten', rowIDs[i], 'leistungsart');
        
                    //console.log('Step 6 - Checken gegen Werte der Untertabelle: '+fromSub);
                    //console.log('Step 6 - Checken gegen Werte der Untertabelle: '+toSub);
        
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

    var checkSave = jr_get_value('txb_checkSafe');
    //console.log("before step action SAVE checkSave: "+checkSave);

    if (checkSave == resCheck) {

        jr_set_disabled('btn_save', 0);
        jr_show_step_action('save');

        sortShifts();
        getTimeSumSB();
        
        let bis = jr_get_value('dt_lastOfMonth');
        bis.setHours(23, 59, 59, 999);

        let today = new Date();

        console.log(bis);
        console.log(today);

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


/**
 * Callback der saveMonStu PHP-Funktion
 * @param {Object} returnObject 
 */
function saveMonStuCallback(returnObject) {

    if (returnObject.result) {

        jr_notify_info(returnObject.result.rowData);
        jr_subtable_refresh('monatsplan','*','*'); // aktualisiert die SQL-Elemente aller Spalten für alle Zeilen
        jr_sql_refresh('stb_monatsplan');


    }
}


/**
 * Callback der saveZettel PHP-Funktion
 */
function saveZettelCallback() {

    jr_notify_info('Der Stundenzettel wurde erfolgreich gesichert.');

}

/**
 * Callback der updateData() JS-Funktion
 */
function updateDataCallback() {

    let fdc = jr_get_value('stx_firstDateContract');
    let ldc = jr_get_value('stx_lastDateContract');

    console.log(`Vertragsbeginn: ${fdc}`);
    console.log(`Vertragsende: ${ldc}`);

    if (fdc) {

        fdc = new Date(fdc);
        jr_set_value('dt_firstOfContract', fdc);

    }
    
    if (ldc) {

        ldc = new Date(ldc);
        jr_set_value('dt_lastOfContract', ldc);

    } else {

        jr_set_value('dt_lastOfContract', '');

    }

    let esc_quick = jr_get_value('stb_escalation_date');
    
    let loc = jr_get_value('dt_lastOfContract');
    console.log(loc);
    
    if (isValidDate(loc)) {

        loc.setHours(23, 59, 59, 999);

    }

    let today = new Date();

    let esc_date = new Date(esc_quick);

    console.log(today);
    console.log(esc_date);
    console.log(loc);

    if (today > esc_date ) {
        
        jr_show_step_action('send');

    } else if (loc) {

        if (today > loc) {

            jr_show_step_action('send');

        }
    }

}




/* ---------------------------------- STUNDENBERECHNUNG ----------------------------------- */


/**
 * Zentrale Stundenberechnungs-Funktion
 * 1. werden alle Leistungen addiert --> geleistete Stunden
 * 2. werden die Soll-Stunden auf Basis von diversen Unwegbarkeiten berechnet
 * 3. darauf werden die Werte in verschiedener Form in die Untertabelle 'Monatsplan' eingetragen
 */
function getTimeSum() {

    let monat = jr_get_value('txb_month');

    let minuten = timeSumSB();

    let rowIDs2 = jr_get_subtable_row_ids('monatsplan');

    if (rowIDs2) {
        rowIDs2.forEach(deleteSubRow);
    }

    jr_subtable_refresh('monatsplan');

    if (minuten || minuten == 0) {

        /** -------------------------------------------------------------------------------- */

        let sollMonStuArr = multipleContracts();

        //console.log(`sollMonStuArr: ${sollMonStuArr}`);

        let sollMonStu = sollMonStuArr[0].reduce(function (a, b) {
            return a + b;
          }, 0);

        //console.log(`Soll-Stunden (Monat): ${sollMonStu}`);

        minuten += sollMonStuArr[1].reduce(function (a, b) {
            return a + b;
          }, 0);

        //console.log(`Minuten (Monat): ${minuten}`);

        /** -------------------------------------------------------------------------------- */

        let stundenKonto = minuten - sollMonStu;
        //console.log(`Stundenkonto (Minuten): ${stundenKonto}`);

        let anzZeit = decTimeToShowTime(minuten);
        //console.log(`Stunden geleistet (Anzeige): ${anzZeit}`);

        let anzStundenKonto = decTimeToShowTime(stundenKonto);
        //console.log(`Stundenkonto (Anzeige): ${anzStundenKonto}`);

        let anzSollMonStu = decTimeToShowTime(sollMonStu);
        //console.log(`Soll-Stunden (Anzeige): ${anzSollMonStu}`);

        let decSoll = (sollMonStu/60);
        let decStd = (minuten/60);
        let decKonto = (stundenKonto/60);

        //console.log(`Soll-Stunden - (Anzeige):${anzSollMonStu} (Dezimal):${decSoll}\nStunden geleistet - (Anzeige):${anzZeit} (Dezimal):${decStd}\nStundenkonto - (Anzeige):${anzStundenKonto} (Dezimal):${decKonto}`);

        /**
        jr_add_subtable_row('monatsplan', {
            monat: monat,
            soll_stunden: decSoll, 
            soll_stunden_txt: anzSollMonStu, 
            stunden: decStd, stunden_txt: anzZeit, 
            stundenkonto: decKonto, stundenkonto_txt: anzStundenKonto
          });
        */

        jr_execute_dialog_function('saveMonStu', { monat: monat, soll_stunden: decSoll, 
            soll_stunden_txt: anzSollMonStu, 
            stunden: decStd, stunden_txt: anzZeit, 
            stundenkonto: decKonto, stundenkonto_txt: anzStundenKonto}, saveMonStuCallback, errorCallback);

        //console.log('Monatsstunden (Anzeige): '+anzZeit);
        //console.log('Monatsstunden (Minuten): '+minuten);

    }

}


/**
 * Loop über die Untertabelle um alle Leistungen aufzuaddieren
 * @returns {number} minuten - Aufaddierte Monatsstunden in Minuten
 */
function timeSum() {
    var rowIDs = jr_get_subtable_row_ids('schichten');
    var lenID = rowIDs.length;

    //console.log(rowIDs);
    //console.log(lenID);

    var minuten = 0;

    for (var i = 0; i < lenID; i++) {

        var zeit = jr_get_subtable_value('schichten', rowIDs[i], 'zeit3');
        var zweizueins = jr_get_subtable_value('schichten', rowIDs[i], 'zwei-zu-eins');

        var zeit3 = 0;
        var zeit4 = 0;
        var zeit5 = 0;

        //console.log('Zeile '+(i+1)+': '+zweizueins);

        var von = jr_get_subtable_value('schichten', rowIDs[i],'von');
        var bis = jr_get_subtable_value('schichten', rowIDs[i],'bis');
        var vonTag = von.toLocaleDateString('de-DE');

        if (zweizueins && i != (lenID-1)) {

            var zweizueins2 = jr_get_subtable_value('schichten', rowIDs[i+1],'zwei-zu-eins');

            //console.log('Zeile '+(i+2)+': '+zweizueins2);

            if (zweizueins2) {

                var von2 = jr_get_subtable_value('schichten', rowIDs[i+1],'von');
                var bis2 = jr_get_subtable_value('schichten', rowIDs[i+1],'bis');
                var von2Tag = von2.toLocaleDateString('de-DE');

                if (vonTag == von2Tag) {

                    //console.log(`-------------------------\n${vonTag}\n${von2Tag}\n----------------------------------`);

                    //console.log(`von: ${von}\nvon2: ${von2}\nbis: ${bis}\nbis2: ${bis2}`);

                    if (!dateCheck(von, bis, von2)) {

                        if (!dateCheck(von, bis, bis2)) {

                            zeit3 = jr_date_diff(bis2, von2, 'm');
                            zeit4 = jr_date_diff(von2, von, 'm');
                            zeit5 = jr_date_diff(bis, bis2, 'm');
                            //console.log(`1. Fall --- von < von2 < bis2 < bis\nHauptdifferenz: ${zeit3}\ndavor: ${zeit4}\ndanach: ${zeit5}`);

                        } else {

                            zeit3 = jr_date_diff(bis, von2, 'm');
                            zeit4 = jr_date_diff(von2, von, 'm');
                            zeit5 = jr_date_diff(bis2, bis, 'm');
                            //console.log(`2. Fall --- von < von2 < bis < bis2\nHauptdifferenz: ${zeit3}\ndavor: ${zeit4}\ndanach: ${zeit5}`);

                        }

                    } else {

                        if (!dateCheck(von, bis, bis2)) {

                            zeit3 = jr_date_diff(bis2, von, 'm');
                            zeit4 = jr_date_diff(von, von2, 'm');
                            zeit5 = jr_date_diff(bis, bis2, 'm');
                            //console.log(`3. Fall --- von2 < von < bis2 < bis\nHauptdifferenz: ${zeit3}\ndavor: ${zeit4}\ndanach: ${zeit5}`);

                        } else {

                            zeit3 = jr_date_diff(bis, von, 'm');
                            zeit4 = jr_date_diff(von, von2, 'm');
                            zeit5 = jr_date_diff(bis2, bis, 'm');
                            //console.log(`4. Fall --- von2 < von < bis < bis2\nHauptdifferenz: ${zeit3}\ndavor: ${zeit4}\ndanach: ${zeit5}`);

                        }

                    }

                    let dailyMin = parseInt(zeit3) + parseInt(zeit4) + parseInt(zeit5);

                    if (dailyMin > 360) {

                        if (dailyMin > 540) {

                            dailyMin = dailyMin - 45;

                        } else {

                            dailyMin = dailyMin - 30;

                        }

                    }

                    //console.log(`tägliche Minuten am ${vonTag}: ${dailyMin}`);

                    minuten += dailyMin;

                    //console.log(`Durchgang ${i}: ${minuten}`);

                }
            }
        
        } else {

            if (zweizueins) {

                zeit = 0;

            }

            //console.log(`tägliche Minuten am ${vonTag}: ${zeit}`);

            minuten += parseInt(zeit);

            //console.log(`Durchgang ${i}: ${minuten}`);

        }

    }

    //console.log('Minuten gesamt: '+minuten);
    return minuten;

}


/**
 * Loop über die SQL-Tabelle Abwesenheiten (soll-reduzierend)
 * @param {Date} von 
 * @param {Date} bis 
 * @param {Boolean} schulStd
 * @returns {number} sollRed - Anzahl der stundenberechtigten Fehltage (Stunden Vertrag)
 * @returns {number} sollRedSchule - Anzahl der stundenberechtigten Fehltage (Stunden Schule)
 */
function sickDays(von, bis, schulStd) {

    let abwMaxID = jr_get_table_max_id('stb_abwesend');
    let sollRed = 0;
    let sollRedSchule = 0;

    bis = bis.setHours(23, 59, 59, 999);
    bis = new Date(bis);

    //console.log(`SQL-Tabelle Abwesend Max-ID: ${abwMaxID}`);

    if (abwMaxID || abwMaxID == 0) {

        for (var j = 0; j <= abwMaxID; j++) {

            let stdR = jr_get_table_value('stb_abwesend', j, 'sollStdRed');

            let abwDate = jr_get_table_value('stb_abwesend', j, 'datum');
            abwDate = dateConvertSqlTableToJs(abwDate);

            //console.log(`Abwesenheitstag: ${abwDate}`);
            //console.log(`Soll-Stunden reduzieren?: ${stdR}`);

            let abwGrund = jr_get_table_value('stb_abwesend', j, 'grund');
            //console.log(`Abwesenheitsgrund: ${abwGrund}`);

            if (!bis || bis == 'Invalid Date') {
                bis = jr_get_value('dt_lastOfMonth');
                //console.log(`Enddatum - Ende des Monats: ${bis}`);
            }

            if (stdR == 1 && !dateCheck(von, bis, abwDate)) {

                if(abwGrund == 'Aus Lohnfortzahlung' || abwGrund == 'Kur/Reha' || abwGrund == 'eigenes Kind krank' || abwGrund == 'unbezahlte Freistellung' ) {

                    sollRedSchule++;

                } else {

                    sollRed++;

                }

            }

            //console.log(`Abwesenheiten Loop ${j} -- sollRed:${sollRed}`);

        }

        //console.log(`Abwesenheitstage im Zeitraum ${von} - ${bis} sollreduzierend mit Stunden Vertrag: ${sollRed}`);
        //console.log(`Abwesenheitstage im Zeitraum ${von} - ${bis} sollreduzierend mit Stunden Schule: ${sollRedSchule}`);

    }

    if (schulStd == true) {

        return sollRedSchule;

    } else {

        return sollRed;

    }

}


/**
 * Loop über die SQL-Tabelle Abwesenheiten (ist-erhöhend)
 * @param {Date} von 
 * @param {Date} bis 
 * @param {Boolean} schulStd
 * @returns {number} istErh - Anzahl der stundenberechtigten Fehltage (Stunden Vertrag)
 * @returns {number} istErhSchule - Anzahl der stundenberechtigten Fehltage (Stunden Schule)
 */
function sickDays2(von, bis, schulStd) {

    let abwMaxID = jr_get_table_max_id('stb_abwesend');
    let istErh = 0;
    let istErhSchule = 0;

    bis = bis.setHours(23, 59, 59, 999);
    bis = new Date(bis);

    //console.log(`SQL-Tabelle Abwesend Max-ID: ${abwMaxID}`);

    if (abwMaxID || abwMaxID == 0) {

        for (var j = 0; j <= abwMaxID; j++) {

            let stdE = jr_get_table_value('stb_abwesend', j, 'istStdErh');

            let abwDate = jr_get_table_value('stb_abwesend', j, 'datum');
            abwDate = dateConvertSqlTableToJs(abwDate);

            //console.log(`Abwesenheitstag: ${abwDate}`);
            //console.log(`Stunden erhöhen?: ${stdE}`);

            let abwGrund = jr_get_table_value('stb_abwesend', j, 'grund');
            //console.log(`Abwesenheitsgrund: ${abwGrund}`);

            if (!bis || bis == 'Invalid Date') {
                bis = jr_get_value('dt_lastOfMonth');
                console.log(`Enddatum - Ende des Monats: ${bis}`);
            }
    
            if (stdE == 1 && !dateCheck(von, bis, abwDate)) {

                if(abwGrund == 'Krank') {

                    istErhSchule++;

                } else {

                    istErh++;

                }

            }

            //console.log(`Abwesenheiten Loop ${j} -- istErh:${istErh}`);

        }

        //console.log(`Abwesenheitstage im Zeitraum ${von} - ${bis} stundenerhöhend (Stunden Vertrag): ${istErh}`);
        //console.log(`Abwesenheitstage im Zeitraum ${von} - ${bis} stundenerhöhend (Stunden Schule): ${istErhSchule}`);

    }

    //console.log(schulStd);

    if (schulStd) {

        //console.log(`Ist-Erhöhung (Schule): ${istErhSchule}`);
        return istErhSchule;
        
    } else {

        //console.log(`Ist-Erhöhung (Vertrag): ${istErh}`);
        return istErh;

    }

}


/**
 * Loop über die SQL-Tabelle Ferien & Feiertage
 * @param {Date} von 
 * @param {Date} bis 
 * @returns {number} holiDays - Anzahl der stundenberechtigten Feiertage
 */
function holiDays(von, bis, tagewoche) {

    let holiMaxID = jr_get_table_max_id('stb_ferien');
    let holiDays = 0;

    //console.log(holiMaxID);

    if (holiMaxID || holiMaxID == 0) {

        if (tagewoche < 5) {

            var wdArr = new Array();

            let wdMaxId = jr_get_table_max_id('stb_arbeitstage');
    
            //console.log(wdMaxId);
    
            let counter = 0;
    
            while(counter <= wdMaxId) {

                if(parseInt(jr_get_table_value('stb_arbeitstage', counter, 'mo'))) {
    
                    wdArr[0] = 1;
    
                } 
                
                if(parseInt(jr_get_table_value('stb_arbeitstage', counter, 'di'))) {
    
                    wdArr[1] = 2;
    
                } 
                
                if(parseInt(jr_get_table_value('stb_arbeitstage', counter, 'mi'))) {
    
                    wdArr[2] = 3;
    
                } 
                
                if(parseInt(jr_get_table_value('stb_arbeitstage', counter, 'do'))) {
    
                    wdArr[3] = 4;
    
                } 
                
                if(parseInt(jr_get_table_value('stb_arbeitstage', counter, 'fr'))) {
    
                    wdArr[4] = 5;
    
                }
    
                counter++;
    
            }

            //console.log(wdArr);

            for (var j = 0; j <= holiMaxID; j++) {

                let stdB = jr_get_table_value('stb_ferien', j, 'bankHoliday');
                let bgDate = jr_get_table_value('stb_ferien', j, 'beginDate');
                let edDate = jr_get_table_value('stb_ferien', j, 'endDate');
    
                bgDate = dateConvertSqlTableToJs(bgDate);
                edDate = dateConvertSqlTableToJs(edDate);
    
        
                if (stdB == 1 && !dateCheck(von, bis, bgDate)) {
    
                    if (wdArr.includes(bgDate.getDay())) {
    
                        holiDays++;
    
                    } 
    
                } else if (stdB == 1 && !dateCheck(von, bis, edDate)) {

                    if (wdArr.includes(bgDate.getDay())) {
    
                        holiDays++;
    
                    } 
    
                }
    
                //console.log(`Feiertage Loop ${j}: ${holiDays}`);
    
            }
    
            //console.log(`Feiertage im Zeitraum ${von} - ${bis}: ${holiDays}`);


        } else {

            for (var j = 0; j <= holiMaxID; j++) {

                let stdB = jr_get_table_value('stb_ferien', j, 'bankHoliday');
                let bgDate = jr_get_table_value('stb_ferien', j, 'beginDate');
                let edDate = jr_get_table_value('stb_ferien', j, 'endDate');
    
                bgDate = dateConvertSqlTableToJs(bgDate);
                edDate = dateConvertSqlTableToJs(edDate);
    
        
                if (stdB == 1 && !dateCheck(von, bis, bgDate)) {
    
                    if (!dayCheck(bgDate, edDate)) {
    
                        holiDays++;
    
                    }
    
                } else if (stdB == 1 && !dateCheck(von, bis, edDate)) {
    
                    if (!dayCheck(bgDate, edDate)) {
    
                        holiDays++;
    
                    }
    
                }
    
                //console.log(`Feiertage Loop ${j}: ${holiDays}`);
    
            }
    
            //console.log(`Feiertage im Zeitraum ${von} - ${bis}: ${holiDays}`);
    
        }

    }

    return holiDays;

}


/**
 * Berechnet die Soll-Stunden pro Vertragsabschnitt im Monat mit Zuhilfenahmen von:
 * sickDays()
 * holiDays()
 * @param {number} tagesminuten 
 * @param {number} tagewoche 
 * @param {Date} von 
 * @param {Date} bis 
 * @returns {number} sollMonStu - Anzahl der Soll-Stunden
 */
function targetH(tagesminuten, tagesminutenSchule, tagewoche, von, bis) {

    let startMon = jr_get_value('dt_firstOfMonth');
    let endMon = jr_get_value('dt_lastOfMonth');

    //console.log(`Start des Monats: ${startMon}\nStart des Vertrags: ${von}\nEnde des Monats: ${endMon}\nEnde des Vertrags: ${bis}`);

    let sollMonStu;
    let weekdays;
    let sickoDays = sickDays(von, bis, false);
    let sickoDaysSchule = sickDays(von, bis, true);
    let holioDays = holiDays(von, bis, tagewoche);

    if (!dateCheck(startMon, endMon, von) && !dateCheck(startMon, endMon, bis)) {

        weekdays = getWorkingDays(von, bis, tagewoche);
        //console.log(`Werktage in Zeitraum: ${weekdays}`);
        //console.log(`Kranktage in Zeitraum (Stunden Vertrag): ${sickoDays}`);
        //console.log(`Kranktage in Zeitraum (Stunden Schule): ${sickoDaysSchule}`);
        //console.log(`Feiertage in Zeitraum: ${holioDays}`);
        sollMonStu = (weekdays-sickoDays-holioDays) * tagesminuten;
        //console.log(`Soll-Stunden Monat (Case 1 Vertrag liegt innerhalb des Monats) - ohne Abzüge Stunden Schule: ${sollMonStu}`);
        
        if (sickoDaysSchule) {

            sollMonStu -= sickoDaysSchule * tagesminutenSchule;
            //console.log(`Soll-Stunden Monat (Case 1 Vertrag liegt innerhalb des Monats): ${sollMonStu}`);

        }


    } else if (!dateCheck(startMon, endMon, von)) {

        weekdays = getWorkingDays(von, endMon, tagewoche);
        //console.log(`Werktage in Zeitraum: ${weekdays}`);
        //console.log(`Kranktage in Zeitraum (Stunden Vertrag): ${sickoDays}`);
        //console.log(`Kranktage in Zeitraum (Stunden Schule): ${sickoDaysSchule}`);
        //console.log(`Feiertage in Zeitraum: ${holioDays}`);
        sollMonStu = (weekdays-sickoDays-holioDays) * tagesminuten;
        //console.log(`Soll-Stunden Monat (Case 1 Vertrag liegt innerhalb des Monats) - ohne Abzüge Stunden Schule: ${sollMonStu}`);
        
        if (sickoDaysSchule) {

            sollMonStu -= sickoDaysSchule * tagesminutenSchule;
            //console.log(`Soll-Stunden Monat (Case 1 Vertrag liegt innerhalb des Monats): ${sollMonStu}`);

        }

    } else if (!dateCheck(startMon, endMon, bis)) {

        weekdays = getWorkingDays(startMon, bis, tagewoche);
        //console.log(`Werktage in Zeitraum: ${weekdays}`);
        //console.log(`Kranktage in Zeitraum (Stunden Vertrag): ${sickoDays}`);
        //console.log(`Kranktage in Zeitraum (Stunden Schule): ${sickoDaysSchule}`);
        //console.log(`Feiertage in Zeitraum: ${holioDays}`);
        sollMonStu = (weekdays-sickoDays-holioDays) * tagesminuten;
        //console.log(`Soll-Stunden Monat (Case 1 Vertrag liegt innerhalb des Monats) - ohne Abzüge Stunden Schule: ${sollMonStu}`);
        
        if (sickoDaysSchule) {

            sollMonStu -= sickoDaysSchule * tagesminutenSchule;
            //console.log(`Soll-Stunden Monat (Case 1 Vertrag liegt innerhalb des Monats): ${sollMonStu}`);

        }

    } else if (!dateCheck(von, bis, startMon)) {

        weekdays = getWorkingDays(startMon, endMon, tagewoche);
        //console.log(`Werktage in Zeitraum: ${weekdays}`);
        //console.log(`Kranktage in Zeitraum (Stunden Vertrag): ${sickoDays}`);
        //console.log(`Kranktage in Zeitraum (Stunden Schule): ${sickoDaysSchule}`);
        //console.log(`Feiertage in Zeitraum: ${holioDays}`);
        sollMonStu = (weekdays-sickoDays-holioDays) * tagesminuten;
        //console.log(`Soll-Stunden Monat (Case 1 Vertrag liegt innerhalb des Monats) - ohne Abzüge Stunden Schule: ${sollMonStu}`);

        if (sickoDaysSchule) {

            sollMonStu -= sickoDaysSchule * tagesminutenSchule;
            //console.log(`Soll-Stunden Monat (Case 1 Vertrag liegt innerhalb des Monats): ${sollMonStu}`);

        }

    } else {

        sollMonStu = 0;

    }

    return sollMonStu;
}


/**
 * Loop über die SQL-Tabelle Verträge
 * @returns sollStuArr - Array der Soll-Stunden aus targetH()
 */
function multipleContracts() {

    let vertMaxID = jr_get_table_max_id('stb_vertrag');
    let sollStuArr = [];
    let istErhArr = [];

    //console.log(vertMaxID);

    for (let rowId=0; rowId<=vertMaxID; rowId++) {

        //console.log(`------------------------------Durchgang Nr. ${rowId}----------------------------------`);

        let wochenstunden = parseFloat(jr_get_table_value('stb_vertrag', rowId, 'stundenVertrag').replace(',', '.'));
        //console.log(`Stunden (Vertrag): ${wochenstunden}`);
        //console.log(`Stunden (Vertrag): ${typeof wochenstunden}`);

        let wochenstundenSchule = parseFloat(jr_get_table_value('stb_vertrag', rowId, 'stundenSchule').replace(',', '.'));
        //console.log(`Stunden (Schule): ${wochenstundenSchule}`);
        //console.log(`Stunden (Schule): ${typeof wochenstunden}`);
    
        let tagewoche = parseInt(jr_get_table_value('stb_vertrag', rowId, 'tageProWoche'));
        //console.log(`Tage pro Woche: ${tagewoche}`);

        if (tagewoche) {
    
            var tagesminuten = (wochenstunden / tagewoche) * 60;
            //console.log(`Minuten pro Tag (Stunden Vertrag): ${tagesminuten}`);
            var tagesminutenSchule = (wochenstundenSchule / tagewoche) * 60;
            //console.log(`Minuten pro Tag (Stunden Schule): ${tagesminutenSchule}`);
    
        } else {
    
            var tagesminuten = (wochenstunden / 5) * 60;
            //console.log(`Minuten pro Tag (Stunden Vertrag): ${tagesminuten}`);
            var tagesminutenSchule = (wochenstundenSchule / 5) * 60;
            //console.log(`Minuten pro Tag (Stunden Schule): ${tagesminutenSchule}`);
            
        }
    
        let startVert = jr_get_table_value('stb_vertrag', rowId, 'von');    
        let endVert = jr_get_table_value('stb_vertrag', rowId, 'bis');

        if (!endVert || endVert == 'Invalid Date') {

            endVert = jr_get_value('dt_lastOfMonth');
            //console.log(`Ende Vertrag = Ende des Monats wenn unbefristet: ${endVert}`);

        } else {

            endVert = dateConvertSqlTableToJs(endVert);

        }
    
        startVert = dateConvertSqlTableToJs(startVert);

        //console.log(`Beginn Vertrag: ${startVert}`);
        //console.log(`Ende Vertrag: ${endVert}`);
        
    
        let sollStu = targetH(tagesminuten, tagesminutenSchule, tagewoche, startVert, endVert);
        //console.log(`Soll (in Minuten): ${sollStu}`);
        
        let istErh = parseInt(sickDays2(startVert, endVert, false)) * tagesminuten;
        //console.log(`Ist-Erhöhung (Vertrag): ${istErh}`);
        istErh += parseInt(sickDays2(startVert, endVert, true)) * tagesminutenSchule;
        //console.log(`Ist-Erhöhung (Schule): ${istErh}`);
        

        sollStuArr[rowId] = sollStu;
        istErhArr[rowId] = istErh;

    }

    //console.log(`Soll-Stunden-Array: ${sollStuArr}`);
    //console.log(`Ist-Erhöhen-Array: ${istErhArr}`);

    return [sollStuArr, istErhArr];

}


/**
 * Errechnet die Anzahl der Werktage pro Vertragsabschnitt
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @param {number} daysWeek 
 * @returns {number} result - Anzahl der Werktage 
 */
function getWorkingDays(startDate, endDate, daysWeek){

    let result = 0;

    let currentDate = new Date(startDate);

    endDate = endDate.setHours(23, 59, 59, 999);
    endDate = new Date(endDate);

    //console.log(`Start-Tag: ${startDate}, End-Tag: ${endDate}`);
    //console.log(`Tage pro Woche: ${daysWeek}`);

    var wdArr = new Array();

    if(daysWeek < 5 && daysWeek > 0) {

        let wdMaxId = jr_get_table_max_id('stb_arbeitstage');

        //console.log(wdMaxId);

        let counter = 0;

        while(counter <= wdMaxId) {

            if(parseInt(jr_get_table_value('stb_arbeitstage', counter, 'mo'))) {

                wdArr[0] = 1;

            } 
            
            if(parseInt(jr_get_table_value('stb_arbeitstage', counter, 'di'))) {

                wdArr[1] = 2;

            } 
            
            if(parseInt(jr_get_table_value('stb_arbeitstage', counter, 'mi'))) {

                wdArr[2] = 3;

            } 
            
            if(parseInt(jr_get_table_value('stb_arbeitstage', counter, 'do'))) {

                wdArr[3] = 4;

            } 
            
            if(parseInt(jr_get_table_value('stb_arbeitstage', counter, 'fr'))) {

                wdArr[4] = 5;

            }

            counter++;

        }

    }

    while (currentDate <= endDate)  {  

        var weekDay = currentDate.getDay();

        //console.log(wdArr);
        //console.log(`derzeitiger Tag: ${currentDate}`);
        //console.log(weekDay);
        

        if(daysWeek < 5) {

            if (wdArr.includes(weekDay)) {
    
                result++;

            }



        } else {

            if(weekDay != 0 && weekDay != 6) {

                result++;
    
            }

        }

        //console.log(result);

        currentDate.setDate(currentDate.getDate()+1); 
    }

    return result;

}


/**
 * Loop über alle Zeitintervalle eines Tages um Überschneidungen zu finden
 * @param {Array} intervals 
 * @returns {Array} overlaps
 */
function calculateOverlap(intervals) {

    // Schritt 1: Sortieren Sie das Array nach dem Startzeitpunkt
    intervals.sort((a, b) => a[0] - b[0]);

    //console.log(intervals);
  
    const overlaps = [];
  
    // Schritt 2: Durchlaufen Sie das sortierte Array und finden Sie Überschneidungen
    for (let i = 0; i < intervals.length - 1; i++) {
      
        const currentInterval = intervals[i];
        const nextInterval = intervals[i + 1];

        //console.log(currentInterval, nextInterval);
  
        if (currentInterval[1] >= nextInterval[0]) {
            // Es gibt eine Überschneidung
            const overlapStart = Math.max(currentInterval[0], nextInterval[0]);
            const overlapEnd = Math.min(currentInterval[1], nextInterval[1]);
            overlaps.push([new Date(overlapStart), new Date(overlapEnd)]);

        }
    }
  
    return overlaps;
}


/**
 * Loop über alle Zeitintervalle eines Tages um Überschneidungen zu finden (nach Endzeitpunkt sortiert)
 * @param {Array} intervals 
 * @returns {Array} overlaps
 */
function calculateOverlapEnd(intervals) {

    // Schritt 1: Sortieren Sie das Array nach dem Endzeitpunkt
    intervals.sort((a, b) => a[1] - b[1]);

    //console.log(intervals);
  
    const overlaps = [];
  
    // Schritt 2: Durchlaufen Sie das sortierte Array und finden Sie Überschneidungen
    for (let i = 0; i < intervals.length - 1; i++) {
      
        const currentInterval = intervals[i];
        const nextInterval = intervals[i + 1];

        //console.log(currentInterval, nextInterval);
  
        if (currentInterval[1] >= nextInterval[0]) {
            // Es gibt eine Überschneidung
            const overlapStart = Math.max(currentInterval[0], nextInterval[0]);
            const overlapEnd = Math.min(currentInterval[1], nextInterval[1]);
            overlaps.push([new Date(overlapStart), new Date(overlapEnd)]);

        }
    }
  
    return overlaps;
}


/**
 * Loop über die Intervals um Gesamtzeit in Minuten zu berechnen
 * @param {Array} intervals 
 * @returns 
 */
function getGesMin(intervals) {

    let gesMin = 0;

    for (let i=0; i < intervals.length; i++) {

        const currentInterval = intervals[i];
        let currIntervalMin = jr_date_diff(currentInterval[1], currentInterval[0], 'm');

        gesMin += currIntervalMin;
        //console.log(`getGesMin() - Durchlauf ${i+1}: ${gesMin}`);

    }

    return gesMin;
}


/**
 * Erstellt aus den beiden Overlaps-Arrays aus calculateOverlap() und calculateOverlapend() ein minMax-Array
 * @param {Array} arr1 
 * @param {Array} arr2 
 * @returns {Array} minMaxArray - Array mit minimalem Überschneidungsbeginn und maximalem Überschneidungsende
 */
function createMinMaxArray(arr1, arr2) {
    // Stellen Sie sicher, dass beide Arrays die gleiche Länge haben
    if (arr1.length !== arr2.length) {
        throw new Error("Die Arrays müssen die gleiche Länge haben.");
    }
  
    // Verwenden Sie Array.map, um die Min- und Max-Werte für jedes Paar von Elementen zu erstellen
    const minMaxArray = arr1.map((value, index) => {

        const minValue = Math.min(value[0], arr2[index][0]);
        const maxValue = Math.max(value[1], arr2[index][1]);
        return [new Date(minValue), new Date(maxValue)];

    });
  
    return minMaxArray;
  }




/**
 * ------------------------------------- HILFSFUNKTIONEN ----------------------------------------
 */


/**
 * Helferfunktion zum Prüfen auf ein korrektes Datumsobjekt
 * @param {Date} d 
 * @returns Boolean
 */
function isValidDate(d) {

    return d instanceof Date && !isNaN(d);

}


/**
 * Helferfunktion zum Ermitteln, ob ein Datum zwischen zwei anderen Daten liegt.
 * @param {Date} from - Der erste Tag.
 * @param {Date} to - Der letzte Tag.
 * @param {Date} check - Der zu überprüfende Tag.
 * @returns {boolean} - Boolesher Übergabewert.
 */
function dateCheck(from, to, check) {
    var fDate, lDate, cDate;

    fDate = Date.parse(from);
    lDate = Date.parse(to);
    cDate = Date.parse(check);

    if (cDate <= lDate && cDate >= fDate) {

        return false;

    }

    return true;
}


/**
 * Helferfunktion zur Prüfung, ob ein bestimmter Tag am Wochenende ist.
 * @param {Date} from - Der erste Tag.
 * @param {Date} to - Der letzte Tag.
 * @return {boolean} true, false - Boolesher Übergabewert.
 */
function dayCheck(from, to) {

    var first_date = from.getDay();
    var last_date = to.getDay();
    //console.log(first_date+' '+last_date);
    if ((first_date == 0 || first_date == 6) || (last_date == 0 || last_date == 6)) {
        return true;
    }
    return false;

}


/**
 * Helferfunktion Sortierung der Schichten.
 * Siehe bubbleSort() & copySubRow()
 */
function sortShifts() {
    
    var rowIDs = jr_get_subtable_row_ids('schichten');
    
    //console.log('rowIDs before bubble sort: '+rowIDs);
    
    bubbleSort(rowIDs);
    
    //console.log('rowIDs after bubble sort: '+rowIDs);

    rowIDs.forEach(copySubRow);
    jr_remove_subtable_row('schichten', rowIDs);

}


/**
 * Sortieralgorithmus nach Bubble-Sort Schema (geklaut von stackoverflow).
 * @param {Array} arr - unsortiertes Array.
 * @returns {Array} - sortiertes Array.
 */
function bubbleSort(arr) {

    var i, j;
    var len = (arr.length - 1);
    var isSwapped = false;

    for (i = 0; i < len; i++) {

        isSwapped = false;

        for (j = 0; j < len; j++) {

            if (jr_get_subtable_value('schichten', arr[j], 'von') > jr_get_subtable_value('schichten', arr[j + 1], 'von')) {
                var temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                //console.log(arr);
                isSwapped = true;
            }
        }

        if (!isSwapped) {

            break;

        }
    }
    //console.log('rowIDs after bubble sort: '+arr);
    return arr;
}


/**
 * Helferfunktion zum Kopieren einer Untertabellenzeile.
 * @param {number} elementId 
 */
function copySubRow(elementId) {
    jr_copy_subtable_row('schichten', elementId);
}


/**
 * Helferfunktion zum Löschen einer Untertabellenzeile.
 * @param {number} elementId 
 */
function deleteSubRow(elementId) {
    jr_remove_subtable_row('monatsplan', elementId);
}


/**
 * Helferfunktion zum Splitten eines ganzen Namen in Vor- und Nachname.
 * @param {String} fullName - Voller Name als Zeichenkette.
 * @returns {Array} - Voller Name, jeweil Vor- und Nachname in Einzelfeldern.
 */
function splitName(fullName) {

    var vorname = fullName.substr(0, fullName.indexOf(' '));
    var name = fullName.substr(fullName.indexOf(' ') + 1);
    //console.log(name+', '+vorname);
    return [vorname, name];

}


/**
 * Helferfunktion um den Namen des Klienten anhand seiner ID in die Untertabelle zu schreiben
 * @param {number} elementId 
 */
function klientName(elementId) {

    let name = jQuery(`#schichten_klient_${elementId}`).find(":selected").text();
    //console.log(name);
    jr_set_subtable_value('schichten', elementId, 'klientName', name);

}


/**
 * Helferfunktion um den Namen des Pools anhand seiner ID in die Untertabelle zu schreiben
 * @param {number} elementId 
 */
function poolName(elementId) {

    let name = jQuery(`#schichten_pool_${elementId}`).find(":selected").text();
    //console.log(name);
    jr_set_subtable_value('schichten', elementId, 'poolName', name);

}


/**
 * Helferfunktion zum Darstellen des Abrechnungszeitraums in der Prüfungsübersicht
 * @returns {String} Abrechnungszeitraum
 */
function abrZeitraum() {

    let fom = jr_get_value('dt_firstOfMonth');
    let lom = jr_get_value('dt_lastOfMonth');

    let maxID = jr_get_table_max_id('stb_vertrag');

    let foc = dateConvertSqlTableToJs(jr_get_table_value('stb_vertrag', maxID, 'von'));
    let loc = dateConvertSqlTableToJs(jr_get_table_value('stb_vertrag', maxID, 'bis'));

    //console.log(`Monatsbeginn: ${fom}\nMonatsende: ${lom}\nVertragsbeginn: ${foc}\nVertragsende: ${loc}`);

    if (!dateCheck(fom, lom, foc)) {
        return `${foc.toLocaleDateString('de-DE')} - ${lom.toLocaleDateString('de-DE')}`;
    } else if (!dateCheck(fom, lom, loc)) {
        return `${fom.toLocaleDateString('de-DE')} - ${loc.toLocaleDateString('de-DE')}`;
    } else {
        return `${fom.toLocaleDateString('de-DE')} - ${lom.toLocaleDateString('de-DE')}`;
    }

}


/**
 * Helferfunktion um Datumswerte aus SQL-Tabellen in JS-Datumsobjekte zu konvertieren
 * @param {String} date 
 * @returns {Date} date
 */
function dateConvertSqlTableToJs(date) {

    //console.log(date);

    let dateArr = [date.substring(0, 2), date.substring(3, 5), date.substring(6)];

    //console.log(dateArr);

    date = dateArr[2]+'-'+dateArr[1]+'-'+dateArr[0];

    //console.log(date);

    date = new Date(date);

    //console.log(date);

    return date;

}




/**
 * ------------------------------------- STUNDENPLAN ----------------------------------------
 */


/**
 * Funktion zum Auslesen der Stundenplandaten. 
 * Führt @method addSubtableRowPlan() aus um die Untertabelle zu befüllen.
 */
function readJSONplan() {

    let maxID = jr_get_table_max_id('stb_stundenplan');
    console.log(maxID);

    let week01 = JSON.parse(jr_get_table_value('stb_stundenplan', maxID, 'woche01'));
    console.log(week01);
    
    if (jr_get_table_value('stb_stundenplan', maxID, 'woche02')) {

        let week02 = JSON.parse(jr_get_table_value('stb_stundenplan', maxID, 'woche02'));
        //console.log(week02);

    }

    let fom = jr_get_value('dt_firstOfMonth');
    let lom = jr_get_value('dt_lastOfMonth');

    let assiID = jr_get_value('txb_schulB');

    console.log(`Start-Tag: ${fom}, End-Tag: ${lom}`);

    let currentDate = fom;

    var result = 1;
    var strSchichten = '{';

    var beginn, ende, lart, client, client2, pool;

    while (currentDate <= lom)  {  

        var weekDay = currentDate.getDay();

        console.log('------------');
        console.log(`derzeitiger Tag: ${currentDate}`);
        console.log(`derzeitiger Wochentag: ${weekDay}`);

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

            console.log(strSchichten);

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

    console.log(strSchichten);
    console.log(JSON.parse(strSchichten));

    jr_subtable_init('schichten', JSON.parse(strSchichten), stundenplanCallback, errorCallback);

    /*
    setTimeout(()=>{
        jQuery( document ).ready( function() {
            timeDisplayUpdate();
            serviceDisplayUpdate();
        })
    },result*800);
    */

}


/**
 * Callback von readJSONplan()
 * Zur korrekten Anzeige der einzelnen Leistungen.
 */
function stundenplanCallback() {

    timeDisplayUpdate();
    
    //console.log(jr_get_subtable_value('schichten', 0, 'pool'));

    showPool();

    $("schichten_add_value").hide();
    //serviceDisplayUpdate();
    jQuery('#ModalWirklich').dialog("close");
    
}


/**
 * Zum Öffnen des Modal-Windows zur Stundenplan-Eingabe.
 */
function OnStundenplanClicked() {

    jQuery('#btn_ok').parent().css('text-align', 'center');

    jQuery("#ModalWirklich").dialog({
        title: 'Wirklich alle Leistungen überschreiben?',
        modal: true,
        width: "auto",
        height: "auto",
        buttons: {
            "Schließen": function () {
    
                jQuery(this).dialog("close");
            }
        }
    });

}




/**
 * ------------------------------------- Prüfschritt ----------------------------------------
 */


/**
 * Funktion wird beim Laden des Prüfdialogs aufgerufen. 
 * Es werden zusätzliche Spalten in der Untertabelle angezeigt:
 * korrigiert, zwei-zu-eins, Pool
 */
function onloadSB() {

    timeDisplayUpdate();

    jr_show_subtable_column('schichten', 'korrigiert');
    jr_show_subtable_column('schichten', 'zwei-zu-eins');
    jr_show_subtable_column('schichten', 'pool');

    $("schichten_add_value").hide();

    jr_show_subtable_column('monatsplan', 'soll_stunden');
    jr_show_subtable_column('monatsplan', 'stunden');
    jr_show_subtable_column('monatsplan', 'stundenkonto');

    jr_hide_subtable_column('monatsplan', 'soll_stunden_txt');
    jr_hide_subtable_column('monatsplan', 'stunden_txt');
    jr_hide_subtable_column('monatsplan', 'stundenkonto_txt');


    //jr_sql_refresh('stx_status');
    jr_sql_refresh('stx_koordination_email');

    let fdc = jr_get_value('stx_firstDateContract');
    let ldc = jr_get_value('stx_lastDateContract');

    //console.log(`Vertragsbeginn: ${fdc}\nVertragsende: ${ldc}`);

    fdc = new Date(fdc);

    if (ldc) {

        ldc = new Date(ldc);

    }

    //console.log(`Vertragsbeginn (Date Object): ${fdc}\nVertragsende (Date Object): ${ldc}`);

    jr_set_value('dt_firstOfContract', fdc);
    jr_set_value('dt_lastOfContract', ldc);

    jr_set_value('cb_back', 0);

    jQuery( document ).ready( function() {

        let zeitraum = abrZeitraum();

        //console.log(`Zeitraum: ${zeitraum}`);
    
        jr_set_value('txb_abrzeit', zeitraum);
  
    });

    jQuery(function() {

        //console.log(jQuery('#stx_status2').val());

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

    jQuery("#monatsplan").change(function(){
        monthHoursOverwrite();
      });

    

}


/**
 * Aufruffunktion um zu Prüfen, ob alle Daten der Untertabelle korrekt sind, spezifisch für die Prüfungsansicht
 * Siehe onDiaSave()
 */
function onDiaSaveSB() {
    
    jr_set_value('txb_checkSafe', 0);
    
    document.getElementById("schichten_add_value").value = 1;

    let rowIDs = jr_get_subtable_row_ids('schichten');
    
    rowIDs.forEach(klientName);
    rowIDs.forEach(poolName);
    rowIDs.forEach(reset_2to1);
    rowIDs.forEach(saveCheck);
    
    let checkSave = jr_get_value('txb_checkSafe');
    //console.log("before dateOverlap() CheckSave: "+checkSave);

    if (checkSave == resCheck) {

        rowIDs.forEach(dateOverlapCheck);

    }

    document.getElementById("schichten").addEventListener("click", function () {
    
        rowIDs.forEach(resetError);

    });

    getTimeSumSB();

}


/**
 * Funktion zum Setzen einer Flag in der Prüfschritt-Eingangsbox (unvollständig [rot] oder Rückfrage [gelb])
 */
function changeFlag() {

    let unv = jr_get_value('cb_unvollstaendig');
    let ruf = jr_get_value('cb_rueckfrage');

    //console.log(unv);
    //console.log(ruf);

    if (unv) {

        jr_set_value('txb_flag', '/icons/redflag.png');

    } else if (ruf) {

        jr_set_value('txb_flag', '/icons/yellowflag.png');

    } else {

        jr_set_value('txb_flag', '');

        console.log('HALLO HIER!');

    }

}


/**
 * Errechnet neue Anzeigewerte bei manueller Änderung der Stunden im Prüfschritt
 */
function monthHoursOverwrite() {

    let decStd = jr_get_subtable_value('monatsplan', 0, 'stunden');
    let decKonto = jr_get_subtable_value('monatsplan', 0, 'stundenkonto');
    let decSoll = jr_get_subtable_value('monatsplan', 0, 'soll_stunden');

    console.log(`Soll-Stunden: ${decSoll}\nStunden: ${decStd}\nStundenkonto:${decKonto}`);
    
    if ((decStd || decStd == 0) && (decKonto || decKonto == 0) && (decSoll || decSoll == 0)) {

        let minuten = decStd * 60;
        let stundenKonto = decKonto * 60;
        let sollMonStu = decSoll * 60;
    
        let anzZeit = decTimeToShowTime(minuten);
        //console.log(`Stunden geleistet (Anzeige): ${anzZeit}`);
    
        let anzStundenKonto = decTimeToShowTime(stundenKonto);
        //console.log(`Stundenkonto (Anzeige): ${anzStundenKonto}`);
    
        let anzSollMonStu = decTimeToShowTime(sollMonStu);
        //console.log(`Soll-Stunden (Anzeige): ${anzSollMonStu}`);
    
        let anzStd = jr_get_subtable_value('monatsplan', 0, 'stunden_txt');
        let anzKonto = jr_get_subtable_value('monatsplan', 0, 'stundenkonto_txt');
        let anzSoll = jr_get_subtable_value('monatsplan', 0, 'soll_stunden_txt');
    
        //console.log(`Soll-Stunden (Anzeige): ${anzSoll}`);
        //console.log(`Stunden geleistet (Anzeige): ${anzStd}`);
        //console.log(`Stundenkonto (Anzeige): ${anzKonto}`);
    
        let monat = jr_get_value('txb_month');
    
        //console.log(monat);
    
        if (anzZeit != anzStd || anzKonto != anzStundenKonto || anzSoll != anzSollMonStu) {
    
            let rowIDs2 = jr_get_subtable_row_ids('monatsplan');
    
            if (rowIDs2) {
    
                rowIDs2.forEach(deleteSubRow);
    
            }
        
            jr_execute_dialog_function('saveMonStu', { monat: monat, soll_stunden: decSoll, 
                soll_stunden_txt: anzSollMonStu, 
                stunden: decStd, stunden_txt: anzZeit, 
                stundenkonto: decKonto, stundenkonto_txt: anzStundenKonto}, saveMonStuCallback, errorCallback);
    
        }    

    }

}


/**
 * Zentrale Stundenberechnungs-Funktion (s.o. getTimeSum())
 * Speziell angepasst auf die Belange der Sachbearbeitung
 */
function getTimeSumSB() {

    let monat = jr_get_value('txb_month');
    let minuten = timeSumSB();
    let rowIDs2 = jr_get_subtable_row_ids('monatsplan');

    if (rowIDs2) {
        rowIDs2.forEach(deleteSubRow);
    }

    if (minuten || minuten == 0) {

        /** -------------------------------------------------------------------------------- */

        let sollMonStuArr = multipleContracts();

        //console.log(`sollMonStuArr: ${sollMonStuArr}`);

        let sollMonStu = sollMonStuArr[0].reduce(function (a, b) {
            return a + b;
          }, 0);

        //console.log(`Soll-Stunden (Monat): ${sollMonStu}`);

        minuten += sollMonStuArr[1].reduce(function (a, b) {
            return a + b;
          }, 0);

        //console.log(`Minuten (Monat): ${minuten}`);

        /** -------------------------------------------------------------------------------- */

        let stundenKonto = minuten - sollMonStu;
        //console.log(`Stundenkonto (Minuten): ${stundenKonto}`);

        let anzZeit = decTimeToShowTime(minuten);
        //console.log(`Stunden geleistet (Anzeige): ${anzZeit}`);

        let anzStundenKonto = decTimeToShowTime(stundenKonto);
        //console.log(`Stundenkonto (Anzeige): ${anzStundenKonto}`);

        let anzSollMonStu = decTimeToShowTime(sollMonStu);
        //console.log(`Soll-Stunden (Anzeige): ${anzSollMonStu}`);

        let decSoll = (sollMonStu/60);
        let decStd = (minuten/60);
        let decKonto = (stundenKonto/60);

        console.log(`Soll-Stunden - (Anzeige):${anzSollMonStu} (Dezimal):${decSoll}\nStunden geleistet - (Anzeige):${anzZeit} (Dezimal):${decStd}\nStundenkonto - (Anzeige):${anzStundenKonto} (Dezimal):${decKonto}`);
        
        jr_execute_dialog_function('saveMonStu', { monat: monat, soll_stunden: decSoll, 
            soll_stunden_txt: anzSollMonStu, 
            stunden: decStd, stunden_txt: anzZeit, 
            stundenkonto: decKonto, stundenkonto_txt: anzStundenKonto}, saveMonStuCallback, errorCallback);
        
        /*
        jr_subtable_init('monatsplan', {
            0: { monat: monat, soll_stunden: decSoll, 
                soll_stunden_txt: anzSollMonStu, 
                stunden: decStd, stunden_txt: anzZeit, 
                stundenkonto: decKonto, stundenkonto_txt: anzStundenKonto}
        });
        */
       
        //console.log('Monatsstunden (Anzeige): '+anzZeit);
        //console.log('Monatsstunden (Minuten): '+minuten);

    }

}

/**
 * Loop über die Untertabelle um alle Leistungen aufzuaddieren (X-zu-1-Kompatibilät)
 * @returns {number} minuten - Aufaddierte Monatsstunden in Minuten
 */
function timeSumSB() {

    var rowIDs = jr_get_subtable_row_ids('schichten');
    var lenID = rowIDs.length;

    var minuten = 0;
    let k = 0;

    let anzProTag = [];
    let idArrTemp = [];
    let idArr = [];
    let zeitraum = [];

    for (var i = 0; i < lenID; i++) {

        let von = jr_get_subtable_value('schichten', rowIDs[i],'von');
        let bis = jr_get_subtable_value('schichten', rowIDs[i],'bis');
        let vonTag = von.toLocaleDateString('de-DE');

        let counter = 1;

        if (!anzProTag.some(e => e.tag == vonTag)) {

            for (var j = i+1; j < lenID; j++) {

                let von2 = jr_get_subtable_value('schichten', rowIDs[j],'von');
                let bis2 = jr_get_subtable_value('schichten', rowIDs[j],'bis');
                let vonTag2 = von2.toLocaleDateString('de-DE');
    
                //console.log(`vonTag2: ${vonTag2}`);
    
                if (vonTag == vonTag2) {
    
                    counter++;
                    //console.log(`Anzahl Leistungen am ${vonTag}: ${counter}`);

                    if (!idArrTemp.some(e => e == i)) {

                        idArrTemp.push(i);
                        zeitraum.push([von, bis]);

                    }
                    
                    idArrTemp.push(j);
                    zeitraum.push([von2, bis2]);
                    //console.log(`Temporäres ID-Array an Stelle ${j}: ${idArrTemp}`);
    
                }
    
            }

            idArr = idArrTemp;
            //console.log(`ID-Array an Stelle ${j}: ${idArr}`);
            let anzTag = {anzahl: counter, tag: vonTag, ids: idArr, intervals: zeitraum};
            anzProTag[k] = anzTag;
            k++;

            idArrTemp = [];
            zeitraum = [];

        }

    }

    console.log(anzProTag);

    for (let l = 0; l < anzProTag.length; l++) {

        console.log('--------------');

        let overlaps = [];

        let gesMin = getGesMin(anzProTag[l].intervals);
        console.log(`Gesamtminuten der Leistungen am ${anzProTag[l].tag}: ${gesMin}`);
        
        let overlapsStart = calculateOverlap(anzProTag[l].intervals);
        console.log(overlapsStart);

        let overlapsEnd = calculateOverlapEnd(anzProTag[l].intervals);
        console.log(overlapsEnd);

        if (getGesMin(overlapsStart) !== getGesMin(overlapsEnd)) {

            overlaps = createMinMaxArray(overlapsStart, overlapsEnd);
            console.log(overlaps);

        } else {

            overlaps = overlapsStart;
            console.log(overlaps);

        }
        
        let overlapMin = getGesMin(overlaps);
        console.log(`Overlap-Minuten der Leistungen am ${anzProTag[l].tag}: ${overlapMin}`);

        let dailyMin = gesMin - overlapMin;
        console.log(`Minuten der Leistungen am ${anzProTag[l].tag}: ${dailyMin}`);

        if (dailyMin > 360) {

            if (dailyMin > 540) {

                dailyMin -= 45;

            } else {

                dailyMin -= 30;

            }

        }

        minuten += dailyMin;
        console.log(`Gesamtminuten aller Leistungen bis zum ${anzProTag[l].tag}: ${minuten}`);

    }
    
    return minuten;
    
}




/**
 * ------------------------------------- TBD TBD TBD ----------------------------------------
 */


/**
 * TBD TBD TBD
 * @param {string} sqltable 
 * @param {number} rowId 
 */
function showWorkdayCheckbox(sqltable, rowId) {

    let tblMaxId = jr_get_table_max_id(sqltable);

    let boolMo = parseInt(jr_get_table_value(sqltable, rowId, 'mo'));
    //console.log(boolMo);

    if (boolMo) {
        
        if (rowId == tblMaxId) {

            jQuery('#stb_arbeitstage td:nth-child(2)').empty();

        }

        jQuery('#stb_arbeitstage td:nth-child(2)').append(cb_true);

    } else {

        if (rowId == tblMaxId) {

            jQuery('#stb_arbeitstage td:nth-child(2)').empty();

        }

        jQuery('#stb_arbeitstage td:nth-child(2)').append(cb_false);

    }

    let boolDi = parseInt(jr_get_table_value(sqltable, rowId, 'di'));
    //console.log(boolDi);

    if (boolDi) {

        if (rowId == tblMaxId) {

            jQuery('#stb_arbeitstage td:nth-child(3)').empty();

        }

        jQuery('#stb_arbeitstage td:nth-child(3)').append(cb_true);

    } else {

        if (rowId == tblMaxId) {

            jQuery('#stb_arbeitstage td:nth-child(3)').empty();

        }

        jQuery('#stb_arbeitstage td:nth-child(3)').append(cb_false);

    }

    let boolMi = parseInt(jr_get_table_value(sqltable, rowId, 'mi'));
    //console.log(boolMi);

    if (boolMi) {

        if (rowId == tblMaxId) {

            jQuery('#stb_arbeitstage td:nth-child(4)').empty();

        }

        jQuery('#stb_arbeitstage td:nth-child(4)').append(cb_true);

    } else {

        if (rowId == tblMaxId) {

            jQuery('#stb_arbeitstage td:nth-child(4)').empty();

        }

        jQuery('#stb_arbeitstage td:nth-child(4)').append(cb_false);

    }

    let boolDo = parseInt(jr_get_table_value(sqltable, rowId, 'do'));
    //console.log(typeof boolDo);
    //console.log(Boolean(boolDo));

    if (boolDo) {

        if (rowId == tblMaxId) {

            jQuery('#stb_arbeitstage td:nth-child(5)').empty();

        }

        jQuery('#stb_arbeitstage td:nth-child(5)').append(cb_true);

    } else {

        if (rowId == tblMaxId) {

            jQuery('#stb_arbeitstage td:nth-child(5)').empty();

        }

        jQuery('#stb_arbeitstage td:nth-child(5)').append(cb_false);

    }

    let boolFr = parseInt(jr_get_table_value(sqltable, rowId, 'fr'));
    //console.log(boolFr);

    if (boolFr) {

        if (rowId == tblMaxId) {

            jQuery('#stb_arbeitstage td:nth-child(6)').empty();

        }

        jQuery('#stb_arbeitstage td:nth-child(6)').append(cb_true);

    } else {

        if (rowId == tblMaxId) {

            jQuery('#stb_arbeitstage td:nth-child(6)').empty();

        }

        jQuery('#stb_arbeitstage td:nth-child(6)').append(cb_false);

    }

}


/**
 * Funktion um Zettel aus der Prüfansicht wieder zurück an den Assi zu schicken
 * TBD weil JobRouter kacke ist
 */
function backToAssi() {

    jr_set_value('cb_back', 1);
    jr_execute('send');

}
