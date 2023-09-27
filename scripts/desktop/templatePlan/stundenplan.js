
/**
 * Zeigt den Stundenplan, sobald eine User-ID gefunden wurde
 * Pools werden der Checkbox gemaess ein und augeblendet
 */
function onloadDiaPlan() {
    setTimeout(()=>{

        console.log(jr_get_value('sls_schulB'));

        if (jr_get_value('sls_schulB')) {

            jr_show('row2');
        }

        /*
        if (jr_get_value('cb_alternierend')) {

            jr_show('row2_1');
            
        }
        */

        if (jr_get_value('cb_pools')) {

            poolCheck();

        }

    },100);
}

/**
 * Speichert die Stundenplan-Eingabe als JSON-String zur Weiterverarbeitung
 */
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

    console.log(json_week01);
    jr_set_value('txb_week01', json_week01);

    if (jr_get_value('cb_alternierend')) {

        let json_week02 = JSON.stringify({
            "week02": {
                "monday": {
                    "type": jr_get_value('ls_leistungsartMon2'),
                    "client": jr_get_value('sls_klientMon2'),
                    "start": jr_get_value('tx_vonMon2'),
                    "end": jr_get_value('tx_bisMon2')
                },
                "tuesday": {
                    "type": jr_get_value('ls_leistungsartDie2'),
                    "client": jr_get_value('sls_klientDie2'),
                    "start": jr_get_value('tx_vonDie2'),
                    "end": jr_get_value('tx_bisDie2')
                },
                "wednesday": {
                    "type": jr_get_value('ls_leistungsartMit2'),
                    "client": jr_get_value('sls_klientMit2'),
                    "start": jr_get_value('tx_vonMit2'),
                    "end": jr_get_value('tx_bisMit2')
                },
                "thursday":{
                    "type": jr_get_value('ls_leistungsartDon2'),
                    "client": jr_get_value('sls_klientDon2'),
                    "start": jr_get_value('tx_vonDon2'),
                    "end": jr_get_value('tx_bisDon2')
                },
                "friday":{
                    "type": jr_get_value('ls_leistungsartFre2'),
                    "client": jr_get_value('sls_klientFre2'),
                    "start": jr_get_value('tx_vonFre2'),
                    "end": jr_get_value('tx_bisFre2')
                }
            }
        });

        console.log(json_week02);
        jr_set_value('txb_week02', json_week02);

    }
}

/**
 * Spewichert die Stundenplan-Eingabe in der Untertabelle "STUNDENPLAN" für die PDF-Erstellung
 */
function onSendPlan() {

    jr_subtable_init('stundenplan', {
        1: {
                //Template Montag
                lei_mon: jr_get_display_value('ls_leistungsartMon1'),
                kli_mon: jr_get_display_value('sls_klientMon1'),
                kli_mon2: jr_get_display_value('sls_klientMon_2zu1'),
                pool_mon: jr_get_display_value('sls_pool_Mon1'),
                von_mon: jr_get_value('tx_vonMon1'),
                bis_mon: jr_get_value('tx_bisMon1'),
                //Template Dienstag
                lei_die: jr_get_display_value('ls_leistungsartDie1'),
                kli_die: jr_get_display_value('sls_klientDie1'),
                kli_die2: jr_get_display_value('sls_klientDie_2zu1'),
                pool_die: jr_get_display_value('sls_pool_Die1'),
                von_die: jr_get_value('tx_vonDie1'),
                bis_die: jr_get_value('tx_bisDie1'),
                //Template Mittwoch
                lei_mit: jr_get_display_value('ls_leistungsartMit1'),
                kli_mit: jr_get_display_value('sls_klientMit1'),
                kli_mit2: jr_get_display_value('sls_klientMit_2zu1'),
                pool_mit: jr_get_display_value('sls_pool_Mit1'),
                von_mit: jr_get_value('tx_vonMit1'),
                bis_mit: jr_get_value('tx_bisMit1'),
                //Template Donnerstag
                lei_don: jr_get_display_value('ls_leistungsartDon1'),
                kli_don: jr_get_display_value('sls_klientDon1'),
                kli_don2: jr_get_display_value('sls_klientDon_2zu1'),
                pool_don: jr_get_display_value('sls_pool_Don1'),
                von_don: jr_get_value('tx_vonDon1'),
                bis_don: jr_get_value('tx_bisDon1'),
                //Template Freitag
                lei_fre: jr_get_display_value('ls_leistungsartFre1'),
                kli_fre: jr_get_display_value('sls_klientFre1'),
                kli_fre2: jr_get_display_value('sls_klientFre_2zu1'),
                pool_fre: jr_get_display_value('sls_pool_Fre1'),
                von_fre: jr_get_value('tx_vonFre1'),
                bis_fre: jr_get_value('tx_bisFre1')
        }
    });
    
    jr_subtable_refresh('stundenplan');
}

/**
 * Zeigt die Pool-Spalte an
 */
function poolCheck() {

    //Setze Klienten-Wert von Montag zurück und deaktiviere Eingabe
    jr_set_value('sls_klientMon1', '');
    jr_set_disabled('sls_klientMon1');
    jr_set_value('sls_klientMon_2zu1', '');
    jr_set_disabled('sls_klientMon_2zu1');

    //Setze Klienten-Wert von Dienstag zurück und deaktiviere Eingabe
    jr_set_value('sls_klientDie1', '');
    jr_set_disabled('sls_klientDie1');
    jr_set_value('sls_klientDie_2zu1', '');
    jr_set_disabled('sls_klientDie_2zu1');

    //Setze Klienten-Wert von Mittwoch zurück und deaktiviere Eingabe
    jr_set_value('sls_klientMit1', '');
    jr_set_disabled('sls_klientMit1');
    jr_set_value('sls_klientMit_2zu1', '');
    jr_set_disabled('sls_klientMit_2zu1');

    //Setze Klienten-Wert von Donnerstag zurück und deaktiviere Eingabe
    jr_set_value('sls_klientDon1', '');
    jr_set_disabled('sls_klientDon1');
    jr_set_value('sls_klientDon_2zu1', '');
    jr_set_disabled('sls_klientDon_2zu1');

    //Setze Klienten-Wert von Freitag zurück und deaktiviere Eingabe
    jr_set_value('sls_klientFre1', '');
    jr_set_disabled('sls_klientFre1');
    jr_set_value('sls_klientFre_2zu1', '');
    jr_set_disabled('sls_klientFre_2zu1');

    //Zeige Pool-Eingabe
    jr_show(['tx_pool', 'sls_pool_Mon1', 'sls_pool_Die1', 'sls_pool_Mit1', 'sls_pool_Don1', 'sls_pool_Fre1', ])

}

/**
 * Blendet die Pool-Spalte aus
 */
function poolUncheck() {

        //aktiviere Eingabe für Montag
        jr_set_disabled('sls_klientMon1', false);
        jr_set_disabled('sls_klientMon_2zu1', false);
    
        //aktiviere Eingabe für Dienstag
        jr_set_disabled('sls_klientDie1', false);
        jr_set_disabled('sls_klientDie_2zu1', false);
    
        //aktiviere Eingabe für Mittwoch
        jr_set_disabled('sls_klientMit1', false);
        jr_set_disabled('sls_klientMit_2zu1', false);
    
        //aktiviere Eingabe für Donnerstag
        jr_set_disabled('sls_klientDon1', false);
        jr_set_disabled('sls_klientDon_2zu1', false);
    
        //aktiviere Eingabe für Freitag
        jr_set_disabled('sls_klientFre1', false);
        jr_set_disabled('sls_klientFre_2zu1', false);
    
        //Verstecke Pool-Eingabe und setze Werte zurück
        jr_set_value('sls_pool_Mon1', '');
        jr_set_value('sls_pool_Die1', '');
        jr_set_value('sls_pool_Mit1', '');
        jr_set_value('sls_pool_Don1', '');
        jr_set_value('sls_pool_Fre1', '');
        
        jr_hide(['tx_pool', 'sls_pool_Mon1', 'sls_pool_Die1', 'sls_pool_Mit1', 'sls_pool_Don1', 'sls_pool_Fre1', ]);
    
}