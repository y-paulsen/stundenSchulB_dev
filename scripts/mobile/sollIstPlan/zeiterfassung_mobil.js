/**
 * Funktion wird beim Laden des Zeiteintragungsdialogs aufgerufen. 
 * Senden und Speichern wird standardmäßig versteckt/deaktiviert. 
 * Monatsarbeitszeiten und Schichtzeiten werden berechnet.
 * Klienten werden nach eingeloggtem Assistenten/Zeitraum angezeigt.
 */
function onloadDia() {

    jr_disable_send();

    jr_set_value('cb_absendenMonat', 0);
    jr_set_value('txb_version', 'App');
    
    serviceListUpdate();

    showPool();

}



/* ----- EINTRAGUNG CONVINIENCE ----- */


/**
 * Funktion zur Zeitberechnung der Schicht auf Basis der Datumswerte.
 */
function getTime() {

    var beginn = jr_get_value('dt_beginn');
    var ende = jr_get_value('dt_ende');
    
    if (beginn != 'Invalid Date' && ende != 'Invalid Date') {

        var minuten = jr_date_diff(ende, beginn, 'm');

        if (minuten > 540) {

            minuten = minuten - 45;
            
        } else if (minuten > 360) {

            minuten = minuten - 30;

        }

        var decZeit = minuten / 60;
        var anzZeit = decTimeToShowTime(minuten);
    
        jr_set_value('dcm_stunden', decZeit);
        jr_set_value('tx_stunden', anzZeit);
        jr_set_value('txb_minuten', minuten);

    }

}


/**
 * Helferfunktion zum Konvertieren der Zeit in Minuten in [Stunden:Minuten]
 * @param {number} minuten - Übergabe der Arbeitszeit in Minuten, z.B. _163_ 
 * @returns {String} - Angezeigte Zeit in der Übersicht nach Schema [Stunden:Minuten]
 */
function decTimeToShowTime(minuten) {
    
    var modZeit = Math.floor(Math.abs(minuten) % 60);

    var zeit = Math.floor(Math.abs(minuten) / 60);

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
 * Setzt den 'bis' Datumswert auf den 'von' Datumswert.
 */
function changeTimespan() {

    if (jr_get_value('dt_ende') == 'Invalid Date') {

        jr_set_value('dt_ende', jr_get_value('dt_beginn'));
        getTime();

    } else {

        getTime();

    }

}

/**
 * Funktion um Tätigkeiten der ausgewählten Leistungsart anzupassen.
 */
function serviceListUpdate() {
    
    var serviceType = jr_get_value('ls_leistungsart');

    jr_set_value('txb_leistungsartDings', serviceType);

    if (serviceType == 'U' || serviceType == 'R') {

        jr_sql_refresh('sls_taetigkeit');
        jr_set_disabled('sls_taetigkeit', false);

    } else {

        jr_sql_refresh('sls_taetigkeit');
        jr_set_disabled('sls_taetigkeit', true);

    }

}

/**
 * Funktion um das SQL-Feld des Klienten für Springerdienste zu aktualisieren.
 */
function springerCheck() {

    if (jr_get_value('cb_springer') == 1) {

        jr_set_value('txb_schulbID', '');
        jr_sql_refresh('sls_klient');
        jr_sql_refresh('sls_klient_2');


    } else {

        jr_set_value('txb_schulbID', jr_get_value('txb_schulB'));
        jr_sql_refresh('sls_klient');
        jr_sql_refresh('sls_klient_2');

    }

}

/**
 * Funktion zeigt das Pool-Dropdown, falls Assi an Pool-Schule
 */
function showPool() {

    let maxID = jr_get_table_max_id('stb_pool');

    //jr_notify_info(maxID);

    if (maxID || maxID == 0) {

        jr_show('cb_pool');

    }
}

/**
 * Funktion zum Deaktivieren der Klientenauswahl beim Anhaken des Klientenpools.
 */
function clientPool() {

    if (jr_get_value('cb_pool')) {

        jr_set_value('sls_klient', '');
        jr_set_disabled('sls_klient');

        jr_set_value('sls_klient_2', '');
        jr_set_disabled('sls_klient_2');
        
        jr_set_value('cb_springer', 0);
        jr_set_value('cb_zweizueins', 0);

        

        jr_show('sls_pools');

    } else {

        jr_set_disabled('sls_klient', 0);
        jr_set_disabled('sls_klient_2', 0);
        jr_hide('sls_pools');

    }
}

/**
 * Funktion zum Anzeigen des zweiten Klienten
 */
function show2to1(){

    jr_show('sls_klient_2');

}

/**
 * Funktion zum Verstecken des zweiten Klienten
 */
function hide2to1(){

    jr_hide('sls_klient_2');

}


/**
 * Zeigt den Button "Abschicken"
 */
function showAbschicken() {

    bis = jr_get_value('dt_lastOfMonth');

    //jr_notify_info(bis);

    let today = new Date();

    //jr_notify_info(today);

    if (today > bis) {

        jr_show('btn_zettelAbschicken');

    } else {

        bis = bis.toLocaleDateString('de-DE');
        jr_notify_warn(`Der Stundenzettel darf erst nach dem ${bis} abgeschickt werden.`);
        
    }
    
}

/**
 * Sendet den Stundenzettel ab
 */
function sendForm() {

    bis = jr_get_value('dt_lastOfMonth');

    //jr_notify_info(bis);

    let today = new Date();

    //jr_notify_info(today);

    if (today > bis) {
        
        jr_enable_send(); 
        jr_execute('send');

    } else {

        bis = bis.toLocaleDateString('de-DE');
        jr_notify_warn(`Der Stundenzettel darf erst nach dem ${bis} abgeschickt werden.`);

    }
}



/* ----- PRÜFUNG LEISTUNGEN ----- */


/**
 * Aufruffunktion um zu Prüfen, ob alle Daten der Untertabelle korrekt sind.
 */
function onDiaSave() {

    //jr_set_value('txb_schulB', jr_get_value('sls_schulB'));

    jr_set_value('txb_checkSafe', 0);

    jr_set_value('cb_zwei-zu-eins', 0);
    
    saveCheck();

    var check = jr_get_value('txb_checkSafe');

    var resCheck = 0;

    //jr_notify_info('before dateOverlap: '+check);

    if (check == resCheck) {

        dateOverlapCheck();

    }
    
    check = jr_get_value('txb_checkSafe');

    //jr_notify_info('before holidayCheck: '+check);

    if (check == resCheck) {

        holidayCheck();

    }
}

/**
 * Umfangreiche Prüfung, ob Leistung korrekt eingetragen wurde.
 */
function saveCheck() {
    
    var idK = jr_get_value('sls_klient');
    var von = jr_get_value('dt_beginn');
    var bis = jr_get_value('dt_ende');
    var la = jr_get_value('ls_leistungsart');
    var tk = jr_get_value('sls_taetigkeit');
    var time = jr_get_value('txb_minuten');
    var pool = jr_get_value('cb_pool');

    var vonMonat = jr_get_value('dt_firstOfMonth');
    
    var bisMonat = jr_get_value('dt_lastOfMonth');
    bisMonat.setHours(23, 59, 59, 999);
    
    //jr_notify_info(bisMonat);

    var vonVertr = jr_get_value('stx_firstDateContract');
    var bisVertr = jr_get_value('stx_lastDateContract');

    if (vonVertr) {

        vonVertr = new Date(vonVertr);

        if (idK == '' && pool == 0 && (tk != 'Betriebsratsarbeit' && tk != 'Fortbildung' && tk != 'Koordination' && tk != 'Teamsitzung' )) {

            jr_notify_error('Es wurde kein(e) Klient*in angegeben.', 5);
            jr_set_value('txb_checkSafe', 1);
    
        } else if (von == '') {
    
            jr_notify_error('Es wurde kein Startdatum angegeben.', 5);
            jr_set_value('txb_checkSafe', 1);
    
        } else if (bis == '') {
    
            jr_notify_error('Es wurde kein Enddatum angegeben.', 5);
            jr_set_value('txb_checkSafe', 1);
    
        } else if (dateCheck(vonMonat, bisMonat, bis)) {
    
            jr_notify_error('Enddatum ist außerhalb des Monats.', 5);
            jr_set_value('txb_checkSafe', 1);
    
        } else if (dateCheck(vonMonat, bisMonat, von)) {
    
            jr_notify_error('Startdatum ist außerhalb des Monats.', 5);
            jr_set_value('txb_checkSafe', 1);
    
        } else if (bisVertr) {

            bisVertr = new Date(bisVertr);
            bisVertr.setHours(23, 59, 59, 999);

            /*

            if (dateCheck(vonVertr, bisVertr, bis)) {
    
                jr_notify_error('Enddatum ist außerhalb der Vertragslaufzeit.', 5);
                jr_set_value('txb_checkSafe', 1);
            
            } else if (dateCheck(vonVertr, bisVertr, von)) {
    
                jr_notify_error('Startdatum ist außerhalb der Vertragslaufzeit.', 5);
                jr_set_value('txb_checkSafe', 1);
        
            } 

            */

        } else if (la == '') {
    
            jr_notify_error('Es wurde keine Leistungsart angegeben.', 5);
            jr_set_value('txb_checkSafe', 1);
    
        } else if (time < 1) {
    
            jr_notify_error('Die Leistungsdauer beträgt 0 Minuten.', 5);
            jr_set_value('txb_checkSafe', 1);
    
        } else if (time > 645 && (la == 'U' || la == 'R')) {
    
            jr_notify_error('Bei unmittelbaren Leistungen darf maximal 10 Stunden gearbeitet werden.', 5);
            jr_set_value('txb_checkSafe', 1);
    
        } else if ((dayCheck(von, bis)) && la == 'U') {
    
            jr_notify_error('Unmittelbare Leistungen dürfen ausschließlich an Wochentagen stattfinden.', 5);
            jr_set_value('txb_checkSafe', 1);
    
        } else if (la == 'R' && !tk) {
    
            jr_notify_error('Bei Regieleistungen muss eine Tätigkeit angegeben werden.', 5);
            jr_set_value('txb_checkSafe', 1);
    
        } else if ((tk == 'Kind krank' || tk == 'Schule geschlossen') && time > 120) {

            jr_notify_error('Bei Bereitschaftszeiten sind maximal 2 Stunden zulässig.', 5);
            jr_set_value('txb_checkSafe', 1);

        } else if (tk == 'Dokumentation' && time > 120) {

            jr_notify_error('Bei Dokumenation sind maximal 2 Stunden zulässig.', 5);
            jr_set_value('txb_checkSafe', 1);

        } else if (tk == 'Zeiterfassung') {

            zeiterfassungCheck();

        } 
    } /*else {
        jr_notify_error('Es exisitiert kein Start- oder Enddatum des Vertrags.', 5);
        //jr_set_value('txb_checkSafe', 1);
    }*/
}

/**
 * Prüfung, ob Zeitraum der Leistung sich mit einer anderen Leistung überschneidet.
 */
function dateOverlapCheck() {
    
    var idK = jr_get_value('sls_klient');
    var von = jr_get_value('dt_beginn');
    var bis = jr_get_value('dt_ende');    
    var la = jr_get_value('ls_leistungsart');

    var rowIDs = jr_get_subtable_row_ids('schichten_mobil');

    for (i = 0; i < rowIDs.length; i++) {

        var von2 = jr_get_subtable_value('schichten_mobil', rowIDs[i], 'von');
        var bis2 = jr_get_subtable_value('schichten_mobil', rowIDs[i], 'bis');
        var klient2 = jr_get_subtable_value('schichten_mobil', rowIDs[i], 'klient');
        var la2 = jr_get_subtable_value('schichten_mobil', rowIDs[i], 'leistungsart');
        
        if (!(dateCheck(von, bis, von2) && dateCheck(von, bis, bis2) && dateCheck(von2, bis2, von) && dateCheck(von2, bis2, bis)) && la == 'U' && la2 == 'U' && idK != klient2) {
            
            jr_set_value('cb_zwei-zu-eins', 1);

        } else if (!(dateCheck(von, bis, von2) && dateCheck(von, bis, bis2) && dateCheck(von2, bis2, von) && dateCheck(von2, bis2, bis)) && la == 'U' && la2 == 'U' && idK == klient2) {
            
            jr_notify_error('Unmittelbare Leistungen beim selben Klienten dürfen sich nicht überschneiden.', 5);
            jr_set_value('txb_checkSafe', 1);

        }
    }
}

/**
 * Prüfung, ob Tätigkeit Zeiterfassung insgesamt nur eine halbe Stunde pro Klient eingetragen wurde.
 */
function zeiterfassungCheck() {

    var rowIDs = jr_get_subtable_row_ids('schichten_mobil');

    var minuten = 0;

    var anzKl = jr_get_table_count('stb_schule');

    for (i = 0; i < rowIDs.length; i++) {
        let tk = jr_get_subtable_value('schichten_mobil', rowIDs[i], 'taetigkeit');
        if (tk == 'Zeiterfassung') {
            let von = jr_get_subtable_value('schichten_mobil', rowIDs[i], 'von');
            let bis = jr_get_subtable_value('schichten_mobil', rowIDs[i], 'bis');
            minuten += jr_date_diff(bis, von, 'm');
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
    
    var von = jr_get_value('dt_beginn');
    var bis = jr_get_value('dt_ende');

    von = new Date(von.getTime() - (von.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    bis = new Date(bis.getTime() - (bis.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

    jr_execute_dialog_function('getHolidays', { von: von, bis: bis }, getHolidayCallback, errorCallback);

}

/**
 * Prüfung, ob Leistung während Abwesenheitszeiten von Klient/Assistentent eingetragen wurde.
 */
function absenceCheck() {

    var von = jr_get_value('dt_firstOfMonth');
    var bis = jr_get_value('dt_lastOfMonth');
    var IDassi = jr_get_value('txb_schulB');
    
    von = new Date(von.getTime() - (von.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    bis = new Date(bis.getTime() - (bis.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    
    jr_execute_dialog_function('getAbsence', { von: von, bis: bis, IDa: IDassi }, getAbsenceCallback, errorCallback);

}



/* ----- SPEICHERN & LOESCHEN ----- */


/**
 * Speichert Schicht in Untertabelle. 
 */
function schichtSpeichern() {

    let subCount = jr_get_subtable_count('schichten_mobil');
    let maxID = jr_get_subtable_max_id('schichten_mobil');

    //jr_notify_info(`subCount: ${subCount}`);
    //jr_notify_info(`maxID: ${maxID}`);
    
    if (subCount > 0) {
        maxID = subCount+1;
    } else {
        maxID = 1;
    }

    const date = new Date();
    //jr_notify_info(`aktuelle Zeit: ${date}`);

    const offset = date.getTimezoneOffset();
    //jr_notify_info(`Timezone Offset aktuell: ${offset}`);

    var von = jr_get_value('dt_beginn');
    //jr_notify_info(`Beginn wie es im Datumsfeld steht: ${von}`);

    var bis = jr_get_value('dt_ende');
    //jr_notify_info(`Ende wie es im Datumsfeld steht: ${bis}`);

    const offsetVon = von.getTimezoneOffset();
    //jr_notify_info(`Timezone Offset von: ${offsetVon}`);

    if (offset == offsetVon ) {

        von = new Date(von.getTime() - (von.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
        bis = new Date(bis.getTime() - (bis.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

    } else if (offset > offsetVon) {

        von = new Date(von.getTime() - (von.getTimezoneOffset() * 60000) + (offset * 60000)).toISOString().slice(0, 19).replace('T', ' ');
        bis = new Date(bis.getTime() - (bis.getTimezoneOffset() * 60000) + (offset * 60000)).toISOString().slice(0, 19).replace('T', ' ');

    } else {

        von = new Date(von.getTime() + (von.getTimezoneOffset() * 60000) - (offset * 60000)).toISOString().slice(0, 19).replace('T', ' ');
        bis = new Date(bis.getTime() + (bis.getTimezoneOffset() * 60000) - (offset * 60000)).toISOString().slice(0, 19).replace('T', ' ');

    }
    
    //jr_notify_info(`Beginn nach getTimezoneOffset(): ${von}`);
    //jr_notify_info(`Ende nach getTimezoneOffset(): ${bis}`);

    var sid = jr_get_value('txb_schulB');

    if (jr_get_value('cb_springer') == 1) {
        sid = '';
    }

    //jr_notify_info(jr_get_display_value('sls_klient'));

    if (jr_get_value('cb_zweizueins') == 1) {

        jr_execute_dialog_function('saveShift_2zu1', { txb_schulB: sid, dt_beginn: von, dt_ende: bis, 
            sls_klient: jr_get_value('sls_klient'), sls_klient_display: jr_get_display_value('sls_klient'),
            sls_klient_2: jr_get_value('sls_klient_2'), sls_klient_2_display: jr_get_display_value('sls_klient_2'),
            cb_springer: jr_get_value('cb_springer'), cb_pool: jr_get_value('cb_pool'),
            tx_stunden: jr_get_value('tx_stunden'), dcm_stunden: jr_get_value('dcm_stunden'), minuten: jr_get_value('txb_minuten'),
            ls_leistungsart: jr_get_value('ls_leistungsart'), sls_taetigkeit: jr_get_value('sls_taetigkeit'),
            txb_beschreibung: jr_get_value('txb_beschreibung'), cb_zweiZuEins: jr_get_value('cb_zweizueins'), maxID: maxID }, 
            saveShiftCallback, errorCallback);

    } else if (jr_get_value('cb_pool') == 1) {

        jr_execute_dialog_function('saveShift_pool', { txb_schulB: sid, dt_beginn: von, dt_ende: bis, 
            sls_pools: jr_get_value('sls_pools'), sls_pools_display: jr_get_display_value('sls_pools'),
            cb_springer: jr_get_value('cb_springer'), cb_pool: jr_get_value('cb_pool'),
            tx_stunden: jr_get_value('tx_stunden'), dcm_stunden: jr_get_value('dcm_stunden'), minuten: jr_get_value('txb_minuten'),
            ls_leistungsart: jr_get_value('ls_leistungsart'), sls_taetigkeit: jr_get_value('sls_taetigkeit'),
            txb_beschreibung: jr_get_value('txb_beschreibung'), cb_zweiZuEins: jr_get_value('cb_zweizueins'), maxID: maxID }, 
            saveShiftCallback, errorCallback);

    } else {

        jr_execute_dialog_function('saveShift', { txb_schulB: sid, sls_klient: jr_get_value('sls_klient'),
        dt_beginn: von, dt_ende: bis, sls_klient_display: jr_get_display_value('sls_klient'),
        cb_springer: jr_get_value('cb_springer'), cb_pool: jr_get_value('cb_pool'),
        tx_stunden: jr_get_value('tx_stunden'), dcm_stunden: jr_get_value('dcm_stunden'), minuten: jr_get_value('txb_minuten'),
        ls_leistungsart: jr_get_value('ls_leistungsart'), sls_taetigkeit: jr_get_value('sls_taetigkeit'),
        txb_beschreibung: jr_get_value('txb_beschreibung'), cb_zweiZuEins: jr_get_value('cb_zwei-zu-eins'), maxID: maxID }, 
        saveShiftCallback, errorCallback);

    }

}

/**
 * Löscht die ausgewählte Schicht aus der Untertabelle
 * @param {number} elementId 
 */
function schichtLoeschen(elementId) {

    //jr_notify_info(`row_id: ${elementId}`);

    let rid = jr_get_table_value('stb_schichtenMobil', elementId, 'row_id');

    jr_execute_dialog_function('removeShift', { rowID: rid }, deleteCallback, errorCallback);

}

/**
 * TBD TBD TBD
 * @param {number} elementId 
 */
function schichtLoeschenStb(elementId) {

    jr_notify_info(`row_id: ${elementId}`);

    let rid = jr_get_table_value('stb_schichtenMobil', elementId, 'row_id');

    jr_notify_info(`row_id stb: ${rid}`);

    jr_execute_dialog_function('removeShiftStb', {rowID: rid});

}



/* ----- CALLBACKS ----- */


/**
 * Standard Callback Fehler
 * @param {Object} returnObject 
 */
function errorCallback(returnObject) {

    jr_notify_error('Fehler beim ausführen der PHP-Funktion: ' + returnObject.message);

}

/**
 * Callback der getHolidays PHP-Funktion.
 * @param {Object} returnObject 
 */
function getHolidayCallback(returnObject) {

    //jr_notify_info(returnObject.result.desc);

    if (returnObject.result.desc) {

        //jr_notify_info(returnObject.result.von);
        //jr_notify_info(returnObject.result.bis);
        
        var von = returnObject.result.von;
        var bis = returnObject.result.bis;
        var desc = returnObject.result.desc;

        var fromSub = jr_get_value('dt_beginn');
        var toSub = jr_get_value('dt_ende');

        for (h = 0; h < desc.length; h++) {

            var vonDate = new Date(von[h]);
            var bisDate = new Date(bis[h]);

            //jr_notify_info(vonDate);
            //jr_notify_info(bisDate);

            if ((fromSub > vonDate && fromSub < bisDate) || (toSub > vonDate && toSub < bisDate)) {

                jr_notify_error('Eingetragene Leistung überschneidet sich mit Ferien/Feiertagen: '+desc+'.');
                jr_set_value('txb_checkSafe', 1);

            } 
        }

        var check = jr_get_value('txb_checkSafe');
        //jr_notify_info('before absenceCheck: '+check);
        var resCheck = 0;
        if (check == resCheck) {

            absenceCheck();

        }

    } else {

        var check = jr_get_value('txb_checkSafe');
        //jr_notify_info('before absenceCheck: '+check);
        var resCheck = 0;
        if (check == resCheck) {

            absenceCheck();

        }
    }
}

/**
 * Callback der getAbsence PHP-Funktion
 * @param {Object} returnObject 
 */
function getAbsenceCallback(returnObject) {

    //jr_notify_info(returnObject.result.date);

    if (returnObject.result.date) {

        //jr_notify_info(returnObject.result.date);
        
        var date = returnObject.result.date;
        var idKrankArr = returnObject.result.ida;

        //jr_notify_info(date.length);

        for (h = 0; h < date.length; h++) {

            var absDate = new Date(date[h]);
            var idKrank = idKrankArr[h];
    
            //jr_notify_info(absDate);
            //jr_notify_info(idKrank);

            absDate = absDate.toLocaleDateString('de-DE');

            var fromSub = jr_get_value('dt_beginn');
            var toSub = jr_get_value('dt_ende');
            var idA = jr_get_value('txb_schulB');
            var idK = jr_get_value('sls_klient');
            var la = jr_get_value('ls_leistungsart');

            //jr_notify_info(la);

            if (fromSub && toSub) {

                fromSub = fromSub.toLocaleDateString('de-DE');
                toSub = toSub.toLocaleDateString('de-DE');

                if ((fromSub == absDate || toSub == absDate) && (idA == idKrank || idK == idKrank) && !(la == 'R')) {

                    jr_notify_error(`Eingetragene Leistung vom ${absDate} überschneidet sich mit Abwesenheitszeiten.`);                
                    jr_set_value('txb_checkSafe', 1);
        
                }
            }
        }

    } 

    var check = jr_get_value('txb_checkSafe');
    //jr_notify_info('before saveShift: '+check);
    var resCheck = 0;

    if (check == resCheck) {

        jr_notify_info("Leistungsprüfung erfolgreich durchlaufen.");

        jr_show('btn_saveShift');

    }

}

/**
 * Callback der saveShift PHP-Funktion
 * @param {Object} returnObject 
 */
function saveShiftCallback(returnObject) {

    if (typeof returnObject.result !== 'undefined') {

        var datum = jr_get_value('dt_beginn');

        jr_notify_success('Die Leistung vom '+datum.toLocaleDateString('de-DE')+' wurde erfolgreich gespeichert.')

        jr_set_value('sls_klient', '');
        jr_set_value('ls_leistungsart', 'U');
        jr_set_value('dt_beginn', '');
        jr_set_value('dt_ende', '');
        jr_set_value('tx_stunden', '0:00');
        jr_set_value('cb_pool', 0);
        jr_set_value('cb_springer', 0);
        jr_set_value('dcm_stunden', 0);
        jr_set_value('txb_minuten', 0);
        jr_set_value('sls_taetigkeit', '');
        jr_set_value('txb_beschreibung', '');

        jr_hide('btn_saveShift');

        jr_subtable_refresh('schichten_mobil',"*","*",getTimeSum);
        jr_sql_refresh('stb_schichtenMobil');
        jr_sql_refresh('stb_schichtenMobil2');
        jr_select_page('page2');

    }
}

/**
 * Callback der saveMonStu PHP-Funktion
 * @param {Object} returnObject 
 */
function saveMonStuCallback(returnObject) {

    if (returnObject.result) {

        jr_subtable_refresh('monatsplan');
        jr_sql_refresh('stb_monatsstunden');

    }
}

/**
 * Callback der removeShift PHP-Funktion
 * @param {number} returnObject 
 */
function deleteCallback(returnObject) {

    //jr_notify_info(returnObject.result);

    var rowID = returnObject.result.rowID;
    
    //jr_notify_info(rowID);
    //var date = jr_get_subtable_value('schichten_mobil', rowID, 'von');
    //date = date.toLocaleDateString('de-DE');
    //jr_notify_info(`Die Schicht Nr. ${rowID} vom ${date} wurde gelöscht`);

    jr_notify_info(`Die Schicht Nr. ${parseInt(rowID)} wurde gelöscht`);

    jr_sql_refresh('stb_schichtenMobil');
    jr_sql_refresh('stb_schichtenMobil2');

    jr_subtable_refresh('schichten_mobil');

    //getTimeSum();

}



/* ----- STUNDENBERECHNUNG ----- */


/**
 * Zentrale Stundenberechnungs-Funktion
 * 1. werden alle Leistungen addiert --> geleistete Stunden
 * 2. werden die Soll-Stunden auf Basis von diversen Unwegbarkeiten berechnet
 * 3. darauf werden die Werte in verschiedener Form in die Untertabelle 'Monatsplan' eingetragen
 */
function getTimeSum() {

    let monat = jr_get_value('txb_month');

    let minuten = timeSum();
    
    //jr_notify_info(minuten);

    if (minuten != 0) {

        /** -------------------------------------------------------------------------------- */

        let sollMonStuArr = multipleContracts();

        let sollMonStu = sollMonStuArr[0].reduce(function (a, b) {
            return a + b;
          }, 0);

        minuten += sollMonStuArr[1].reduce(function (a, b) {
            return a + b;
          }, 0);

        /** -------------------------------------------------------------------------------- */

        let stundenKonto = minuten - sollMonStu;

        let anzZeit = decTimeToShowTime(minuten);

        let anzStundenKonto = decTimeToShowTime(stundenKonto);

        let anzSollMonStu = decTimeToShowTime(sollMonStu);

        let decSoll = (sollMonStu/60);
        let decStd = (minuten/60);
        let decKonto = (stundenKonto/60);

        //jr_notify_info(`Soll-Stunden: ${sollMonStu}, ${anzSollMonStu}, ${decSoll}\nGeleistete Zeit: ${minuten}, ${anzZeit}, ${decStd}\nStundenkonto: ${stundenKonto}, ${anzStundenKonto}, ${decKonto}`);

        jr_execute_dialog_function('saveMonStu', { monat: monat, soll_stunden: decSoll, 
            soll_stunden_txt: anzSollMonStu, 
            stunden: decStd, stunden_txt: anzZeit, 
            stundenkonto: decKonto, stundenkonto_txt: anzStundenKonto}, saveMonStuCallback, errorCallback);

    }

}

/**
 * Loop über die Untertabelle um alle Leistungen aufzuaddieren
 * @returns {number} minuten - Aufaddierte Monatsstunden in Minuten
 */
function timeSum() {
    var rowIDs = jr_get_subtable_row_ids('schichten_mobil');
    var lenID = rowIDs.length;

    var minuten = 0;

    for (var i = 0; i < lenID; i++) {

        var zeit = jr_get_subtable_value('schichten_mobil', rowIDs[i], 'zeit3');
        var zweizueins = jr_get_subtable_value('schichten_mobil', rowIDs[i], 'zweizueins');

        var zeit3 = 0;
        var zeit4 = 0;
        var zeit5 = 0;

        var von = jr_get_subtable_value('schichten_mobil', rowIDs[i],'von');
        var bis = jr_get_subtable_value('schichten_mobil', rowIDs[i],'bis');
        var vonTag = von.toLocaleDateString('de-DE');

        if (zweizueins && i != (lenID-1)) {

            var zweizueins2 = jr_get_subtable_value('schichten_mobil', rowIDs[i+1],'zweizueins');

            if (zweizueins2) {

                var von2 = jr_get_subtable_value('schichten_mobil', rowIDs[i+1],'von');
                var bis2 = jr_get_subtable_value('schichten_mobil', rowIDs[i+1],'bis');
                var von2Tag = von2.toLocaleDateString('de-DE');

                if (vonTag == von2Tag) {

                    if (!dateCheck(von, bis, von2)) {

                        if (!dateCheck(von, bis, bis2)) {

                            zeit3 = jr_date_diff(bis2, von2, 'm');
                            zeit4 = jr_date_diff(von2, von, 'm');
                            zeit5 = jr_date_diff(bis, bis2, 'm');

                        } else {

                            zeit3 = jr_date_diff(bis, von2, 'm');
                            zeit4 = jr_date_diff(von2, von, 'm');
                            zeit5 = jr_date_diff(bis2, bis, 'm');

                        }

                    } else {

                        if (!dateCheck(von, bis, bis2)) {

                            zeit3 = jr_date_diff(bis2, von, 'm');
                            zeit4 = jr_date_diff(von, von2, 'm');
                            zeit5 = jr_date_diff(bis, bis2, 'm');

                        } else {

                            zeit3 = jr_date_diff(bis, von, 'm');
                            zeit4 = jr_date_diff(von, von2, 'm');
                            zeit5 = jr_date_diff(bis2, bis, 'm');

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

                    minuten += dailyMin;

                }
            }
        
        } else {

            if (zweizueins) {
                zeit = 0;
            }

            minuten += parseInt(zeit);

        }

    }

    return minuten;

}

/**
 * Loop über die SQL-Tabelle Abwesenheiten
 * @param {Date} von 
 * @param {Date} bis 
 * @returns {number} sickDays - Anzahl der stundenberechtigten Fehltage
 */
function sickDays(von, bis) {

    let abwMaxID = jr_get_table_max_id('stb_abwesend');

    let sickDays = 0;

    if (abwMaxID != '') {

        for (var j = 0; j <= abwMaxID; j++) {

            let stdB = jr_get_table_value('stb_abwesend', j, 'istStdBer');
            let abwDate = jr_get_table_value('stb_abwesend', j, 'datum');

            abwDate = dateConvertSqlTableToJs(abwDate);
    
            if (stdB == 1 && !dateCheck(von, bis, abwDate)) {

                sickDays++;

            }

        }

    }

    return sickDays;

}

/**
 * Loop über die SQL-Tabelle Abwesenheiten
 * @param {Date} von 
 * @param {Date} bis 
 * @returns {number} sickDays - Anzahl der stundenberechtigten Fehltage
 */
function sickDays2(von, bis) {

    let abwMaxID = jr_get_table_max_id('stb_abwesend');
    let istErh = 0;

    bis = bis.setHours(23, 59, 59, 999);
    bis = new Date(bis);

    if (abwMaxID != '') {

        for (var j = 0; j <= abwMaxID; j++) {

            let stdE = jr_get_table_value('stb_abwesend', j, 'istStdErh');

            let abwDate = jr_get_table_value('stb_abwesend', j, 'datum');
            abwDate = dateConvertSqlTableToJs(abwDate);

            if (!bis || bis == 'Invalid Date') {

                bis = jr_get_value('dt_lastOfMonth');

            }
    
            if (stdE == 1 && !dateCheck(von, bis, abwDate)) {

                istErh++;

            }

        }

    }

    return istErh;

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

    if (holiMaxID || holiMaxID == 0) {

        if(tagewoche < 5) {

            var wdArr = new Array();
            let wdMaxId = jr_get_table_max_id('stb_arbeitstage');
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
    
            }

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
    
            }

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
function targetH(tagesminuten, tagewoche, von, bis) {

    let startMon = jr_get_value('dt_firstOfMonth');
    let endMon = jr_get_value('dt_lastOfMonth');

    let sollMonStu;
    let weekdays;
    let sickoDays = sickDays(von, bis);
    let holioDays = holiDays(von, bis, tagewoche);

    if (!dateCheck(startMon, endMon, von) && !dateCheck(startMon, endMon, bis)) {

        weekdays = getWorkingDays(von, bis, tagewoche);
        sollMonStu = (weekdays-sickoDays-holioDays) * tagesminuten;

    } else if (!dateCheck(startMon, endMon, von)) {

        weekdays = getWorkingDays(von, endMon, tagewoche);
        sollMonStu = (weekdays-sickoDays-holioDays) * tagesminuten;

    } else if (!dateCheck(startMon, endMon, bis)) {

        weekdays = getWorkingDays(startMon, bis, tagewoche);
        sollMonStu = (weekdays-sickoDays-holioDays) * tagesminuten;

    } else if (!dateCheck(von, bis, startMon) && !dateCheck(von, bis, endMon)) {

        weekdays = getWorkingDays(startMon, endMon, tagewoche);
        sollMonStu = (weekdays-sickoDays-holioDays) * tagesminuten;

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

    for (let rowId=0; rowId<=vertMaxID; rowId++) {

        let wochenstunden = parseFloat(jr_get_table_value('stb_vertrag', rowId, 'stundenVertrag').replace(',', '.'));
        let tagewoche = parseInt(jr_get_table_value('stb_vertrag', rowId, 'tageProWoche'));
    
        if (tagewoche) {
    
            var tagesminuten = (wochenstunden / tagewoche) * 60;
    
        } else {
    
            var tagesminuten = (wochenstunden / 5) * 60;
            
        }
    
        let startVert = jr_get_table_value('stb_vertrag', rowId, 'von');    
        let endVert = jr_get_table_value('stb_vertrag', rowId, 'bis');
    
        startVert = dateConvertSqlTableToJs(startVert);

        if (!endVert || endVert == 'Invalid Date') {

            endVert = jr_get_value('dt_lastOfMonth');

        } else {

            endVert = dateConvertSqlTableToJs(endVert);

        }
        
        let sollStu = targetH(tagesminuten, tagewoche, startVert, endVert);
        let istErh = sickDays2(startVert, endVert) * tagesminuten;

        sollStuArr[rowId] = sollStu;
        istErhArr[rowId] = istErh;

    }

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

    var wdArr = new Array();

    if(daysWeek < 5) {

        let wdMaxId = jr_get_table_max_id('stb_arbeitstage');

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
        
        if(daysWeek < 5) {

            if (wdArr.includes(weekDay)) {
    
                result++;

            }

        } else {

            if(weekDay != 0 && weekDay != 6) {

                result++;
    
            }

        }

        currentDate.setDate(currentDate.getDate()+1); 
    }

    return result;

}


/* ----- HILFSFUNKTIONEN ----- */


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

    if ((cDate <= lDate && cDate >= fDate)) {

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

    if ((first_date == 0 || first_date == 6) || (last_date == 0 || last_date == 6)) {

        return true;

    }

    return false;
}

/**
 * Helferfunktion zum Splitten eines ganzen Namen in Vor- und Nachname.
 * @param {String} fullName - Voller Name als Zeichenkette.
 * @returns {Array} - Voller Name, jeweil Vor- und Nachname in Einzelfeldern.
 */
function splitName(fullName) {

    var vorname = fullName.substr(0, fullName.indexOf(' '));
    var name = fullName.substr(fullName.indexOf(' ') + 1);

    return [vorname, name];

}

/**
 * Helferfunktion um Datumswerte aus SQL-Tabellen in JS-Datumsobjekte zu konvertieren
 * @param {String} date 
 * @returns {Date} date
 */
function dateConvertSqlTableToJs(date) {

    let dateArr = [date.substring(0, 2), date.substring(3, 5), date.substring(6)];
    date = dateArr[2]+'-'+dateArr[1]+'-'+dateArr[0];
    date = new Date(date);

    return date;

}