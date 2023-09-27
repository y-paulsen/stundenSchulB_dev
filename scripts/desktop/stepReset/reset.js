/**
 * Funktion wird beim on-click auf Button "Stundenzettel anzeigen" ausgeführt
 */
function zettelAnzeigen() {

    jr_sql_refresh('stb_stundenzettel');

    console.log("Value:");
    console.log(jr_get_value('sls_assis'));

    console.log("DP-Value:");
    console.log(jr_get_display_value('sls_assis'));

    jr_show('section4');

}


function onListClicked(rowID) {

    console.log(rowID);

    jQuery('#btn_ok').parent().css('text-align', 'center');

    let dateF = dateConvertSqlTableToJs(jr_get_table_value('stb_stundenzettel', rowID, 'firstOfMonth'));
    let dateL = dateConvertSqlTableToJs(jr_get_table_value('stb_stundenzettel', rowID, 'lastOfMonth'));

    console.log(dateF);
    console.log(dateL);

    jr_set_value('dt_monthStart', dateF);
    jr_set_value('dt_monthEnd', dateL);

    jr_sql_refresh('sls_abgerechnet', jr_set_disabled('btn_ok', false));

    jr_set_value('dsc_data', `<center>Name: ${jr_get_display_value('sls_assis')}<br>Monat: ${jr_get_table_value('stb_stundenzettel', rowID, 'monat')}<br><br></center>`);

    jQuery("#ModalReset").dialog({
        title: 'Stundenzettel zurücksetzen',
        modal: true,
        width: "auto",
        height: "auto",
        buttons: {
            "Schließen": function () {
    
                jQuery(this).dialog("close");
            }
        }
    });

    jQuery("#btn_ok").click(function(){

        let tbCount = jr_get_table_count('sls_abgerechnet');

        if (!tbCount ||tbCount <= 0) {
            
            console.log('wird zurückgesetzt');
            zettelReset(rowID);
            jQuery("#ModalReset").dialog("close");
            
        } else {

            jr_show(['dsc_abgerechnet', 'sls_abgerechnet']);
            jr_notify_info('Bitte schaue vorher in der Übersicht SB Schule -> Zeiterfassung (bearbeiten), ob die Leistungen nicht bereits abgerechnet wurden.');
            jr_set_disabled('btn_ok', true);

        }

        
      });

}

/**
 * Funktion wird beim on-click auf SQL-Tabellenzeile ausgeführt
 */
function zettelReset(rowID) {

    console.log(rowID);

    let stepid = jr_get_table_value('stb_stundenzettel', rowID, 'step_id');

    console.log(stepid);

    let processid = jr_get_table_value('stb_stundenzettel', rowID, 'processid');

    console.log(processid);

    jr_execute_dialog_function('resetZettel', { stepid: stepid, processid: processid, rowID: rowID }, ResetCallback, errorCallback);

}

/**
 * Callback der resetZettel PHP-Funktion
 * @param {Object} returnObject 
 */
function ResetCallback(returnObject) {

    console.log(returnObject);

    let rowID = returnObject.result.rowID;

    let assid = jr_get_value('sls_assis');

    console.log(assid);

    let month = jr_get_table_value('stb_stundenzettel', rowID, 'monat');

    console.log(month);

    jr_notify_success('Der Stundenzettel wurde erfolgreich zurückgesetzt.');

    jr_execute_dialog_function('deleteMonthHours', { idassi: assid, month: month, rowID: rowID }, DeleteMonthCallback, errorCallback);

}

/**
 * Callback der deleteMonthHours PHP-Funktion
 * @param {Object} returnObject 
 */
function DeleteMonthCallback(returnObject) {

    console.log(returnObject);

    let assid = jr_get_value('sls_assis');

    //let rowID = returnObject.result.rowID;

    let firstOfMonth = jr_get_value('dt_monthStart');
    let lastOfMonth = jr_get_value('dt_monthEnd');

    console.log(firstOfMonth);
    console.log(lastOfMonth);

    firstOfMonth = new Date(firstOfMonth.getTime() - (firstOfMonth.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    lastOfMonth = new Date(lastOfMonth.getTime() - (lastOfMonth.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

    console.log(firstOfMonth);
    console.log(lastOfMonth);

    jr_notify_success('Die Monatsstunden wurden erfolgreich gelöscht.');

    jr_execute_dialog_function('deleteShifts', { idassi: assid, firstOfMonth: firstOfMonth, lastOfMonth: lastOfMonth }, DeleteShiftsCallback, errorCallback);

}

/**
 * Callback der deleteShifts PHP-Funktion
 */
function DeleteShiftsCallback() {

    jr_notify_success('Die Einzel-Leistungen wurden erfolgreich gelöscht.');

    jr_sql_refresh('stb_stundenzettel');

}

/**
 * Standard Callback Fehler
 * @param {Object} returnObject 
 */
function errorCallback(returnObject) {

    console.log(returnObject);

    jr_notify_error('Fehler beim ausführen der PHP-Funktion resetZettel: ' + returnObject.message);

    console.log(returnObject);

}

/**
 * Helferfunktion um Datumswerte aus SQL-Tabellen in JS-Datumsobjekte zu konvertieren
 * @param {String} date 
 * @returns {Date} date
 */
function dateConvertSqlTableToJs(date) {

    console.log(date);

    let dateArr = [date.substring(0, 2), date.substring(3, 5), date.substring(6)];

    console.log(dateArr);

    date = dateArr[2]+'-'+dateArr[1]+'-'+dateArr[0];

    console.log(date);

    date = new Date(date);

    console.log(date);

    return date;

}