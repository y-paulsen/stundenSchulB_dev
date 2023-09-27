/**
 * Funktion zum Oeffnen der Leistungseingabe beim Klicken auf den Kalender.
 * @param {number} dateNr
 */
function OnCalendarClicked(dateNr) {

    jr_hide('btn_saveShift');

    var fom = jr_get_value('dt_firstOfMonth');
    //console.log(dateNr);
    //console.log(fom);

    let newDate = new Date(fom);
    newDate.setDate(dateNr);

    //console.log(newDate);

    let maxID = jr_get_table_max_id('stb_vertrag');

    var std = jr_get_table_value('stb_vertrag', maxID, 'stundenVertrag');
    var tpw = jr_get_table_value('stb_vertrag', maxID, 'tageProWoche');

    //console.log(std);
    //console.log(tpw);

    if (tpw) {

        var taz = Math.round(8+(parseFloat(std)/parseFloat(tpw)));

    } else {

        var taz = Math.round(8+(parseFloat(std)/5));

    }
    

    console.log(taz);

    let begDate = new Date(newDate.setHours(8, 0, 0));
    let endDate = new Date(newDate.setHours(taz, 0, 0));

    //console.log(begDate);
    //console.log(endDate);

    jr_set_value('dt_beginn', begDate);
    jr_set_value('dt_ende', endDate);

    jQuery("#ModalWindow").dialog({
        title: 'neue Leistung eintragen',
        modal: true,
        width: "auto",
        height: "auto",
        buttons: {
            "Schließen": function () {
    
                jQuery(this).dialog("close");
            }
        }
    });

    showPoolMod();
    getTimeMod();
    serviceListUpdateMod();

    jQuery( "#ModalWindow" ).on( "change", function() {

        console.log('Dialog has changed.');
        jr_hide('btn_saveShift');
        
      } );

}


/**
 * Funktion zum Oeffnen der Leistungseingabe beim Klicken auf ein Event.
 * @param {number} rowID
 */
function OnEventClicked(rowID) {

    console.log(rowID);

    var idK = jr_get_subtable_value('schichten', rowID, 'klient');
    var von = jr_get_subtable_value('schichten', rowID, 'von');
    var bis = jr_get_subtable_value('schichten', rowID, 'bis');
    var la = jr_get_subtable_value('schichten', rowID, 'leistungsart');
    var tk = jr_get_subtable_value('schichten', rowID, 'taetigkeit');
    var time = jr_get_subtable_value('schichten', rowID, 'zeit3');
    var pool = jr_get_subtable_value('schichten', rowID, 'pool');
    var spr = jr_get_subtable_value('schichten', rowID, 'springer');
    var bschr = jr_get_subtable_value('schichten', rowID, 'beschr');

    if (spr) {
        jr_set_value('cb_springer', spr);
        jr_set_value('sls_KlientSpringer', idK);
    } else {
        jr_set_value('sls_klient', idK);
    }

    if (pool) {
        jr_set_value('cb_pool', pool);
    }

    //console.log(von);
    jr_set_value('dt_beginn', von);
    jr_set_value('dt_ende', bis);
    jr_set_value('ls_leistungsart', la);
    jr_set_value('sls_taetigkeitMod', tk);
    jr_set_value('txb_minuten', time);
    jr_set_value('txa_beschreibung', bschr);

    jQuery("#ModalWindow").dialog({
        title: 'Leistung editieren',
        modal: true,
        width: "auto",
        height: "auto",
        buttons: {
            "Schließen": function () {
    
                jQuery(this).dialog("close");
            }
        }
    });

    showPoolMod();
    getTimeMod();

}


/**
 * Funktion um das SQL-Feld des Klienten für Springerdienste zu aktualisieren im modalen Fenster.
 */
function springerCheckMod() {

    console.log(`springerCheckMod()-->jr_get_value('cb_springer'):${jr_get_value('cb_springer')}`);

    if (jr_get_value('cb_springer') == 1) { // Wenn die Checkbox angehakt ist

        jr_set_value('txb_schulbID', ''); // Hier ist die Textbox die als Variable im SQL genutzt wird - sie wird auf NULL bzw. leerer String gesetzt

        jr_hide('sls_klient'); // Hier wird das "normale" Feld ausgeblendet
        jr_show('sls_KlientSpringer'); // Hier wird das Springer-Feld eingeblendet

        // das folgende nimmt noch 2-zu-1 mit auf und kann für deinen Fall jetzt ignoriert werden
        console.log(`springerCheckMod()-->jr_get_value('cb_zweizueins'):${jr_get_value('cb_zweizueins')}`);

        if (jr_get_value('cb_zweizueins') == 1) {

            jr_show('sls_klientSpringer_2');
            jr_hide('sls_klient_2');

        } else {

            jr_hide('sls_klientSpringer_2');
            jr_hide('sls_klient_2');

        }

    } else { // Wenn die Checkbox nicht angehakt ist

        jr_set_value('txb_schulbID', jr_get_value('txb_schulB')); //Textbox wird mit der ID überschrieben

        jr_hide('sls_KlientSpringer'); // Hier wird das Springer-Feld ausgeblendet
        jr_show('sls_klient'); // Hier wird das "normale" Feld eingeblendet

        // das folgende nimmt noch 2-zu-1 mit auf und kann für deinen Fall jetzt ignoriert werden
        console.log(`springerCheckMod()-->jr_get_value('cb_zweizueins'):${jr_get_value('cb_zweizueins')}`);

        if (jr_get_value('cb_zweizueins') == 1) {

            jr_show('sls_klient_2');
            jr_hide('sls_klientSpringer_2');

        } else {

            jr_hide('sls_klient_2');
            jr_hide('sls_klientSpringer_2');

        }

    }

}


/**
 * Funktion zeigt das Pool-Häkchen, falls Pool-Vertrag exisitiert.
 */
function showPoolMod() {

    let maxID = jr_get_table_max_id('stb_pool');

    console.log(maxID);

    if (maxID || maxID == 0) {

        jr_show('cb_pool');

    }

}


/**
 * Funktion zum Deaktivieren der Klientenauswahl beim Anhaken des Klientenpools im modalen Fenster.
 */
function clientPoolMod() {

    if (jr_get_value('cb_pool') == 1) {

        jr_set_value('sls_klient', '');
        jr_set_value('cb_springer', 0);
        jr_set_value('cb_zweizueins', 0);

        jr_set_disabled('sls_klient');
        jr_set_disabled('sls_klient_2');
        jr_set_disabled('sls_KlientSpringer');
        jr_set_disabled('sls_klientSpringer_2');
        jr_set_disabled('cb_springer');
        jr_set_disabled('cb_zweizueins');

        jr_hide('sls_klient');
        jr_hide('sls_klient_2');
        jr_hide('sls_KlientSpringer');
        jr_hide('sls_klientSpringer_2');

        jr_show('sls_pools');

    } else {

        jr_set_disabled('sls_klient', 0);
        jr_set_disabled('sls_klient_2', 0);
        jr_set_disabled('sls_KlientSpringer', 0);
        jr_set_disabled('sls_klientSpringer_2', 0);
        jr_set_disabled('cb_springer', 0);
        jr_set_disabled('cb_zweizueins', 0);

        jr_show('sls_klient');

        jr_hide('sls_pools');

    }
}


/**
 * Setzt den 'bis' Datumswert auf den 'von' Datumswert im modalen Fenster.
 */
function changeTimespanMod() {

    if (jr_get_value('dt_ende') == 'Invalid Date') {

        jr_set_value('dt_ende', jr_get_value('dt_beginn'));
        getTimeMod();

    } else {

        getTimeMod();

    }

}


/**
 * Funktion zur Zeitberechnung der Schicht auf Basis der Datumswerte im modalen Fenster.
 */
function getTimeMod() {

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
 * Funktion um Tätigkeiten der ausgewählten Leistungsart anzupassen im modalen Fenster.
 */
function serviceListUpdateMod() {
    
    var serviceType = jr_get_value('ls_leistungsart');

    jr_set_value('txb_leistungsartDings', serviceType);

    if (serviceType == 'U' || serviceType == 'R') {

        jr_set_disabled('sls_taetigkeitMod', false);
        jr_sql_refresh('sls_taetigkeitMod');

    } else {

        jr_set_disabled('sls_taetigkeitMod', true);
        jr_sql_refresh('sls_taetigkeitMod');
        
    }

}


/**
 * Aufruffunktion um zu Prüfen, ob alle Daten der Untertabelle korrekt sind im modalen Fenster.
 */
function onDiaSaveMod() {

    //jr_set_value('txb_schulB', jr_get_value('sls_schulB'));

    jr_set_value('txb_checkSafe', 0);

    //jr_set_value('cb_zweizueins', 0);
    
    saveCheckMod();

    var check = jr_get_value('txb_checkSafe');

    var resCheck = 0;

    //jr_notify_info('before dateOverlap: '+check);

    if (check == resCheck) {

        dateOverlapCheckMod();

    }
    
    check = jr_get_value('txb_checkSafe');

    //jr_notify_info('before holidayCheck: '+check);

    if (check == resCheck) {

        holidayCheckMod();

    }
}


/**
 * Umfangreiche Prüfung, ob Leistung korrekt eingetragen wurde.
 */
function saveCheckMod() {

    var spr = jr_get_value('cb_springer');

    if (spr) {

        var idK = jr_get_value('sls_KlientSpringer');

    } else {

        var idK = jr_get_value('sls_klient');

    }
    
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

            if (dateCheck(vonVertr, bisVertr, bis)) {
    
                jr_notify_error('Enddatum ist außerhalb der Vertragslaufzeit.', 5);
                jr_set_value('txb_checkSafe', 1);
            
            } else if (dateCheck(vonVertr, bisVertr, von)) {
    
                jr_notify_error('Startdatum ist außerhalb der Vertragslaufzeit.', 5);
                jr_set_value('txb_checkSafe', 1);
        
            } 

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

            zeiterfassungCheckMod();

        } 
    } else {

        jr_notify_error('Es exisitiert kein Start- oder Enddatum des Vertrags.', 5);
        jr_set_value('txb_checkSafe', 1);

    }
}


/**
 * Prüfung, ob Zeitraum der Leistung sich mit einer anderen Leistung überschneidet.
 */
function dateOverlapCheckMod() {
    
    var spr = jr_get_value('cb_springer');

    if (spr) {

        var idK = jr_get_value('sls_KlientSpringer');

    } else {

        var idK = jr_get_value('sls_klient');

    }

    var von = jr_get_value('dt_beginn');
    var bis = jr_get_value('dt_ende');    
    var la = jr_get_value('ls_leistungsart');

    var rowIDs = jr_get_subtable_row_ids('schichten');

    for (i = 0; i < rowIDs.length; i++) {

        var von2 = jr_get_subtable_value('schichten', rowIDs[i], 'von');
        var bis2 = jr_get_subtable_value('schichten', rowIDs[i], 'bis');
        var klient2 = jr_get_subtable_value('schichten', rowIDs[i], 'klient');
        var la2 = jr_get_subtable_value('schichten', rowIDs[i], 'leistungsart');
        
        if (!(dateCheck(von, bis, von2) && dateCheck(von, bis, bis2) && dateCheck(von2, bis2, von) && dateCheck(von2, bis2, bis)) && la == 'U' && la2 == 'U' && idK != klient2) {
            
            jr_set_value('cb_zweizueins', 1);

        } else if (!(dateCheck(von, bis, von2) && dateCheck(von, bis, bis2) && dateCheck(von2, bis2, von) && dateCheck(von2, bis2, bis)) && la == 'U' && la2 == 'U' && idK == klient2) {
            
            jr_notify_error('Unmittelbare Leistungen beim selben Klienten dürfen sich nicht überschneiden.', 5);
            jr_set_value('txb_checkSafe', 1);

        }
    }
}


/**
 * Prüfung, ob Tätigkeit Zeiterfassung insgesamt nur eine halbe Stunde pro Klient eingetragen wurde.
 */
function zeiterfassungCheckMod() {

    var rowIDs = jr_get_subtable_row_ids('schichten');

    var minuten = 0;

    var anzKl = jr_get_table_count('stb_schule');

    for (i = 0; i < rowIDs.length; i++) {
        let tk = jr_get_subtable_value('schichten', rowIDs[i], 'taetigkeit');
        if (tk == 'Zeiterfassung') {
            let von = jr_get_subtable_value('schichten', rowIDs[i], 'von');
            let bis = jr_get_subtable_value('schichten', rowIDs[i], 'bis');
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
function holidayCheckMod() {
    
    var von = jr_get_value('dt_beginn');
    var bis = jr_get_value('dt_ende');

    von = new Date(von.getTime() - (von.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    bis = new Date(bis.getTime() - (bis.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

    jr_execute_dialog_function('getHolidays', { von: von, bis: bis }, getHolidayModCallback, errorCallback);

}


/**
 * Prüfung, ob Leistung während Abwesenheitszeiten von Klient/Assistentent eingetragen wurde.
 */
function absenceCheckMod() {

    var von = jr_get_value('dt_firstOfMonth');
    var bis = jr_get_value('dt_lastOfMonth');
    var IDassi = jr_get_value('txb_schulB');
    
    von = new Date(von.getTime() - (von.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    bis = new Date(bis.getTime() - (bis.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    
    jr_execute_dialog_function('getAbsence', { von: von, bis: bis, IDa: IDassi }, getAbsenceModCallback, errorCallback);

}




/* ----- SPEICHERN & LOESCHEN ----- */


/**
 * Speichert Schicht in Untertabelle. 
 */
function schichtSpeichernMod() {

    let subCount = jr_get_subtable_count('schichten');
    let maxID = jr_get_subtable_max_id('schichten');

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

        if(jr_get_value('cb_zweizueins') == 1) {

            let klient_ID = jr_get_value('sls_KlientSpringer');
            let klient_name = jr_get_display_value('sls_KlientSpringer');
            let klient2_ID = jr_get_value('sls_klientSpringer_2');
            let klient2_name = jr_get_display_value('sls_klientSpringer_2');

            jr_execute_dialog_function('saveShift_2zu1', { txb_schulB: sid, dt_beginn: von, dt_ende: bis, 
                sls_klient: klient_ID, sls_klient_display: klient_name,
                sls_klient_2: klient2_ID, sls_klient_2_display: klient2_name,
                cb_springer: jr_get_value('cb_springer'), cb_pool: jr_get_value('cb_pool'),
                tx_stunden: jr_get_value('tx_stunden'), dcm_stunden: jr_get_value('dcm_stunden'), minuten: jr_get_value('txb_minuten'),
                ls_leistungsart: jr_get_value('ls_leistungsart'), sls_taetigkeit: jr_get_value('sls_taetigkeit'),
                txb_beschreibung: jr_get_value('txa_beschreibung'), cb_zweiZuEins: jr_get_value('cb_zweizueins'), maxID: maxID }, 
                saveShiftModCallback, errorCallback);

        } else {

            let klient_ID = jr_get_value('sls_KlientSpringer');
            let klient_name = jr_get_display_value('sls_KlientSpringer');

            jr_execute_dialog_function('saveShift', { txb_schulB: sid, dt_beginn: von, dt_ende: bis, 
                sls_klient: klient_ID, sls_klient_display: klient_name,
                cb_springer: jr_get_value('cb_springer'), cb_pool: jr_get_value('cb_pool'),
                tx_stunden: jr_get_value('tx_stunden'), dcm_stunden: jr_get_value('dcm_stunden'), minuten: jr_get_value('txb_minuten'),
                ls_leistungsart: jr_get_value('ls_leistungsart'), sls_taetigkeit: jr_get_value('sls_taetigkeit'),
                txb_beschreibung: jr_get_value('txa_beschreibung'), cb_zweiZuEins: jr_get_value('cb_zweizueins'), maxID: maxID }, 
                saveShiftModCallback, errorCallback);

        }

    } else {

        if(jr_get_value('cb_zweizueins') == 1) {

            let klient_ID = jr_get_value('sls_klient');
            let klient_name = jr_get_display_value('sls_klient');
            let klient2_ID = jr_get_value('sls_klient_2');
            let klient2_name = jr_get_display_value('sls_klient_2');

            jr_execute_dialog_function('saveShift_2zu1', { txb_schulB: sid, dt_beginn: von, dt_ende: bis, 
                sls_klient: klient_ID, sls_klient_display: klient_name,
                sls_klient_2: klient2_ID, sls_klient_2_display: klient2_name,
                cb_springer: jr_get_value('cb_springer'), cb_pool: jr_get_value('cb_pool'),
                tx_stunden: jr_get_value('tx_stunden'), dcm_stunden: jr_get_value('dcm_stunden'), minuten: jr_get_value('txb_minuten'),
                ls_leistungsart: jr_get_value('ls_leistungsart'), sls_taetigkeit: jr_get_value('sls_taetigkeit'),
                txb_beschreibung: jr_get_value('txa_beschreibung'), cb_zweiZuEins: jr_get_value('cb_zweizueins'), maxID: maxID }, 
                saveShiftModCallback, errorCallback);

        } else {

            if(jr_get_value('cb_pool') == 1) {

                let pool_ID = jr_get_value('sls_pools');
                let pool_name = jr_get_display_value('sls_pools');

                jr_execute_dialog_function('saveShift_pool', { txb_schulB: sid, dt_beginn: von, dt_ende: bis, 
                    sls_pools: pool_ID, sls_pools_display: pool_name,
                    cb_springer: jr_get_value('cb_springer'), cb_pool: jr_get_value('cb_pool'),
                    tx_stunden: jr_get_value('tx_stunden'), dcm_stunden: jr_get_value('dcm_stunden'), minuten: jr_get_value('txb_minuten'),
                    ls_leistungsart: jr_get_value('ls_leistungsart'), sls_taetigkeit: jr_get_value('sls_taetigkeit'),
                    txb_beschreibung: jr_get_value('txa_beschreibung'), cb_zweiZuEins: jr_get_value('cb_zweizueins'), maxID: maxID }, 
                    saveShiftModCallback, errorCallback);

            } else {

                let klient_ID = jr_get_value('sls_klient');
                let klient_name = jr_get_display_value('sls_klient');
    
                jr_execute_dialog_function('saveShift', { txb_schulB: sid, dt_beginn: von, dt_ende: bis, 
                    sls_klient: klient_ID, sls_klient_display: klient_name,
                    cb_springer: jr_get_value('cb_springer'), cb_pool: jr_get_value('cb_pool'),
                    tx_stunden: jr_get_value('tx_stunden'), dcm_stunden: jr_get_value('dcm_stunden'), minuten: jr_get_value('txb_minuten'),
                    ls_leistungsart: jr_get_value('ls_leistungsart'), sls_taetigkeit: jr_get_value('sls_taetigkeit'),
                    txb_beschreibung: jr_get_value('txa_beschreibung'), cb_zweiZuEins: jr_get_value('cb_zweizueins'), maxID: maxID }, 
                    saveShiftModCallback, errorCallback);

            }

        }

    }

    //jr_notify_info(jr_get_display_value('sls_klient'));

    /*
    jr_execute_dialog_function('saveShift', { txb_schulB: sid, dt_beginn: von, dt_ende: bis, 
                                            sls_klient: klient_ID, sls_klient_display: klient_name,
                                            cb_springer: jr_get_value('cb_springer'), cb_pool: jr_get_value('cb_pool'),
                                            tx_stunden: jr_get_value('tx_stunden'), dcm_stunden: jr_get_value('dcm_stunden'), minuten: jr_get_value('txb_minuten'),
                                            ls_leistungsart: jr_get_value('ls_leistungsart'), sls_taetigkeit: jr_get_value('sls_taetigkeit'),
                                            txb_beschreibung: jr_get_value('txa_beschreibung'), cb_zweiZuEins: jr_get_value('cb_zweizueins'), maxID: maxID }, 
                                            saveShiftModCallback, errorCallback);
                                            */

}


/**
 * Callback der getHolidays PHP-Funktion.
 * @param {Object} returnObject 
 */
function getHolidayModCallback(returnObject) {

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

            absenceCheckMod();

        }

    } else {

        var check = jr_get_value('txb_checkSafe');
        //jr_notify_info('before absenceCheck: '+check);
        var resCheck = 0;
        if (check == resCheck) {

            absenceCheckMod();

        }
    }
}


/**
 * Callback der getAbsence PHP-Funktion.
 * @param {Object} returnObject 
 */
function getAbsenceModCallback(returnObject) {

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

        jr_show('btn_saveShift');
        jr_notify_info("Leistungsprüfung erfolgreich durchlaufen.");

    }

}


/**
 * Callback der saveShift PHP-Funktion.
 * @param {Object} returnObject 
 */
function saveShiftModCallback(returnObject) {

    if (typeof returnObject.result !== 'undefined') {

        var datum = jr_get_value('dt_beginn');

        jr_notify_success('Die Leistung vom '+datum.toLocaleDateString('de-DE')+' wurde erfolgreich gespeichert.');

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
        jr_set_value('txa_beschreibung', '');

        jr_subtable_refresh('schichten',"*","*",getTimeSum);
        jQuery('#ModalWindow').dialog("close");
        window.location.reload(true);

    }
}


/**
 * Funktion zum Anzeigen des zweiten Klienten
 */
function show2to1(){

    console.log(`show2to1()-->jr_get_value('cb_springer'):${jr_get_value('cb_springer')}`);

    if (jr_get_value('cb_springer') == 1) {

        jr_hide('sls_klient_2');
        jr_show('sls_klientSpringer_2');

    } else {

        jr_show('sls_klient_2');
        jr_hide('sls_klientSpringer_2');

    }

}


/**
 * Funktion zum Verstecken des zweiten Klienten
 */
function hide2to1(){

    if (jr_get_value('cb_springer') == 1) {

        jr_hide('sls_klient_2');
        jr_hide('sls_klientSpringer_2');

    } else {

        jr_hide('sls_klient_2');
        jr_hide('sls_klientSpringer_2');

    }

}