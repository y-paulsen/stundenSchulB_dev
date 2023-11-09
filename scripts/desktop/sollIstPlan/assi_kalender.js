jQuery('head').append( jQuery('<link rel="stylesheet" type="text/css" />').attr('href', 'https://uicdn.toast.com/calendar/latest/toastui-calendar.min.css') );

jQuery.getScript( "https://uicdn.toast.com/calendar/latest/toastui-calendar.min.js" )
  .done(function( script, textStatus ) {
    
    console.log( textStatus );

    // Erstellung Kalender-Instanz
    const Calendar = window.tui.Calendar;
    const calendarDiv = '<div id="calendar" style="height: 600px;"></div>';
    jQuery('#column33').after(calendarDiv);
    var cal = new Calendar('#calendar', {
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
  
    // Farben für Tage werden festgelegt
    cal.setTheme({
      common: {
        dayName: {
          color: '#515ce6',
        },
        holiday: {
          color: 'rgba(255, 64, 64, 0.5)',
        },
        saturday: {
          color: 'rgba(255, 64, 64, 0.5)',
        }
      },
    });

    // Event-Templates und Pop-Up-Optionen
    cal.setOptions({
      template: {
        U(event) {
          return `<span>${event.start.d.d.toLocaleTimeString('de-DE')} - ${event.end.d.d.toLocaleTimeString('de-DE')}</span>`;
        },
        R(event) {
          return `<span>${event.start.d.d.toLocaleTimeString('de-DE')} - ${event.end.d.d.toLocaleTimeString('de-DE')}</span>`;
        },
        Kf(event) {
          return `<span>${event.start.d.d.toLocaleTimeString('de-DE')} - ${event.end.d.d.toLocaleTimeString('de-DE')}</span>`;
        },
        popupDetailDate({ start, end }) {
          return `${start.d.d.toLocaleTimeString('de-DE')} - ${end.d.d.toLocaleTimeString('de-DE')}`;
        },
        popupEdit() {
          return 'Ändern';
        },
        popupDelete() {
          return 'Löschen';
        },
      },
    });

    // Einfügen Leistungen
    function leiCalEvents(sqltable, rowId) {

      var beginn = jr_get_subtable_value('schichten', rowId, 'von');
      var ende = jr_get_subtable_value('schichten', rowId, 'bis');
      var la = jr_get_subtable_value('schichten', rowId, 'leistungsart');
      var tk = jr_get_subtable_value('schichten', rowId, 'taetigkeit');
      var beschr = jr_get_subtable_value('schichten', rowId, 'beschr');
      let klQ = jQuery( "#schichten_klient_"+rowId+" option:selected" ).text();

      var laTex;
      var bgC;
      var bdC = "#222";

      if (la == 'U'){
        laTex = "Unmittelbare Leistung";
        bgC = "#887CAF";
        if (tk == 'Häusliche Assistenz') {
          bgC = "#9688C0";
        } else if (tk == 'Notbetreuung') {
          bgC = "#A596D3";
        } else if (tk == 'Springereinsatz') {
          bgC = "#B6A5E8";
        } else if (tk == 'Telefoneinsatz') {
          bgC = "#C8B6FF";
        } else if (tk == 'Video-Chat') {
          bgC = "#CDBDFF";
        }
      } else if (la == "R") {
        laTex = "Regie";
        if (tk == 'Betriebsratsarbeit') {
          bgC = "#0377A8";
        } else if (tk == 'Dokumentation') {
          bgC = "#118FB0";
        } else if (tk == 'Elterngespräch') {
          bgC = "#1FA6B8";
        } else if (tk == 'Fortbildung') {
          bgC = "#2FB5C7";
        } else if (tk == 'Hilfeplangespräch') {
          bgC = "#3EC4D6";
        } else if (tk == 'Koordination') {
          bgC = "#51CCD1"; 
        } else if (tk == 'Hospitation') {
          bgC = "#62d6da"; 
        } else if (tk == 'Arztbesuch Schulbgl.') {
          bgC = "#de878b"; 
        } else if (tk == 'Lehrergespräch') {
          bgC = "#63D4CC";
        } else if (tk == 'Elternsprechtag') {
          bgC = "#8BE8D7";
        } else if (tk == 'Teamsitzung') {
          bgC = "#A0F1DA";
        } else if (tk == 'Zeiterfassung') {
          bgC = "#B4FADC";
        } else if (tk == 'Kind krank') {
          bgC = "#cc444b";
        } else if (tk == 'Schule geschlossen') {
          bgC = "#da5552";
        } 
      } else {
        laTex = "Klassenfahrt";
        bgC = "#ff8f4b";
      }

      //console.log(beginn);
      //console.log(ende);
      
      cal.createEvents([
        {
          id: rowId,
          calendarId: rowId,
          title: laTex,
          category: la,
          start: beginn,
          end: ende,
          body: beschr,
          attendees: [klQ],
          state: tk,
          backgroundColor: bgC,
          borderColor: bdC
        },
      ]);
    }

    // Einfügen Abwesenheiten Assistent
    function abwCalEvents(sqltable, rowId) {

      let date = jr_get_table_value('stb_abwesend', rowId, 'datum');
      let grund = jr_get_table_value('stb_abwesend', rowId, 'grund');
      let name = jr_get_table_value('stb_abwesend', rowId, 'name');

      let dateArr = [date.substring(0, 2), date.substring(3, 5), date.substring(6)];

      date = dateArr[2]+'-'+dateArr[1]+'-'+dateArr[0];

      bdC = "#222";

      if (grund == 'Krank' || grund == 'Krank (ohne AU)' || grund == 'Krank (mit AU)') {
        bgC = '#ffff00';
      } else if (grund == 'Urlaub') {
        bgC = '#1e90ff';
      } else if (grund == 'Quarantäne') {
        bgC = '#edfe6f';
      } else if (grund == 'eigenes Kind krank') {
        bgC = '#00ffff';
      } else if (grund == 'Kur/Reha') {
        bgC = '#cd5c5c';
      } else if (grund == 'Unbekannt') {
        bgC = '#ff0000';
      } else if (grund == 'Klärung (Pooltest)') {
        bgC = '#d3d3d3';
      } else if (grund == 'unbezahlte Freistellung') {
        bgC = '#3712f1';
        bdC = '#fff';
      } else if (grund == 'Unbesetzt') {
        bgC = '#b0c4de';
      } else if (grund == 'Fortbildung') {
        bgC = '#2FB5C7';
      } else if (grund == 'Sonderurlaub') {
        bgC = '#5BBA6F';
      } else if (grund == 'Wiedereingliederung') {
        bgC = '#3FA34D';
      } else if (grund == 'Aus Lohnfortzahlung') {
        bgC = '#137547';
        bdC = '#fff';
      } else if (grund == 'Arbeitsbefreiung') {
        bgC = '#054A29';
        bdC = '#fff';
      } else if (grund == 'Elternzeit < 6 Wochen') {
        bgC = '#f2cc8f';
      } else if (grund == 'Beschäftigungsverbot') {
        bgC = '#81b29a';
        bdC = '#fff';
      } else if (grund == 'Bildungsurlaub') {
        bgC = '#3d405b';
        bdC = '#fff';
      } else if (grund == 'Gleitzeit') {
        bgC = '#f4f1de';
      } else if (grund == 'Springerdummy') {
        bgC = '#e07a5f';
      } else if (grund == 'AU (in Ferien)') {
        bgC = '#fca311';
      } else if (grund == 'AU (während Urlaub)') {
        bgC = '#ccff33';
      }

      //console.log(grund);

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

    //Einfügen Abwesenheiten Kind
    function abwCalEventsKind(sqltable, rowId) {

      let date = jr_get_table_value('stb_abwesend_kind', rowId, 'datum');
      let grund = jr_get_table_value('stb_abwesend_kind', rowId, 'grund');
      let name = jr_get_table_value('stb_abwesend_kind', rowId, 'name');

      jr_get_value('dt_firstOfMonth');
      jr_get_value('dt_lastOfMonth');

      let dateArr = [date.substring(0, 2), date.substring(3, 5), date.substring(6)];

      //console.log(dateArr);

      date = dateArr[2]+'-'+dateArr[1]+'-'+dateArr[0];

      //console.log(date+': '+grund);

      bdC = '#575757';

      if (grund == 'Krank (ohne AU)' || grund == 'Krank (mit AU)') {
        grund = 'Krank';
      }

      if (grund == 'Krank') {
        bgC = '#ffff00';
      } else if (grund == 'Quarantäne') {
        bgC = '#edfe6f';
      } else if (grund == 'Kur/Reha') {
        bgC = '#cd5c5c';
      } else if (grund == 'Unbekannt') {
        bgC = '#ff0000';
      } else if (grund == 'Klärung (Pooltest)') {
        bgC = '#d3d3d3';
      } else if (grund == 'Schule geschlossen') {
        bgC = '#da5552';
      } else if (grund == 'Lehrerkonferenz') {
        bgC = '#63D4CC';
      } else if (grund == 'Beweglicher Ferientag') {
        bgC = '#da5552';
      } else if (grund == 'Klassenfahrt') {
        bgC = '#ff8f4b';
      } else if (grund == 'Praktikum') {
        bgC = '#ff36ab';
      }

      //console.log(grund);

      cal.createEvents([
        {
          title: 'Schüler '+grund,
          start: date,
          end: date,
          attendees: [name],
          isAllDay: true,
          state: 'abwesend',
          category: 'allday',
          backgroundColor: bgC,
          borderColor: bdC
        },
      ]);

    }

    //Einfügen Ferien
    function holCalEvents(sqltable, rowId) {

      let sdate = jr_get_table_value('stb_ferien', rowId, 'beginDate');
      let edate = jr_get_table_value('stb_ferien', rowId, 'endDate');
      let name = jr_get_table_value('stb_ferien', rowId, 'description');

      jr_get_value('dt_firstOfMonth');
      jr_get_value('dt_lastOfMonth');

      let sdateArr = [sdate.substring(0, 2), sdate.substring(3, 5), sdate.substring(6)];
      let edateArr = [edate.substring(0, 2), edate.substring(3, 5), edate.substring(6)];

      //console.log(sdateArr);
      //console.log(edateArr);

      sdate = sdateArr[2]+'-'+sdateArr[1]+'-'+sdateArr[0];
      edate = edateArr[2]+'-'+edateArr[1]+'-'+edateArr[0];

      bdC = '#222';
      bgC = '#b8fb3c';

      cal.createEvents([
        {
          title: name,
          start: sdate,
          end: edate,
          isAllDay: true,
          state: 'Ferien & Feiertage',
          category: 'allday',
          backgroundColor: bgC,
          color: bdC
        },
      ]);

    }

    async function eventLoop() {

      let fom = jr_get_value('dt_firstOfMonth');
      cal.setDate(fom);
      cal.clear(true);
      //console.log('set calendar date');

      //console.log('start event loop');
      jr_loop_table('schichten', leiCalEvents);
      jr_loop_table('stb_abwesend', abwCalEvents);
      jr_loop_table('stb_abwesend_kind', abwCalEventsKind);
      jr_loop_table('stb_ferien', holCalEvents);
      //console.log('end event loop');

      return `Events eingeladen - Starttermin ${fom}.`;
      
    }

    jQuery( document ).ready( function() {

      console.log('the DOM is loaded and can be manipulated');

      //console.log('Kalender geladen.');

      jr_select_page('abwkal');
      eventLoop().then(
        function(value) {

          //console.log(value);

          jQuery('.toastui-calendar-daygrid-cell').click(function (e) {

            //console.log(jQuery(e.target).is( "span" ));
  
            if(!jQuery(e.target).is( "span" )) {
  
                var dpCldELem = jQuery(this).children();
  
                while( dpCldELem.length ) {

                    dpCldELem = dpCldELem.children();

                }
  
                var dateNr = dpCldELem.end().html();
  
                OnCalendarClicked(dateNr);
  
            }
  
          });
        }
        
      );
    


    });

    jQuery('#btn_calendarReload').click(function (e) {

      jQuery('#column33').after(calendarDiv);
      var cal = new Calendar('#calendar', {
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
    
      // Farben für Tage werden festgelegt
      cal.setTheme({
        common: {
          dayName: {
            color: '#515ce6',
          },
          holiday: {
            color: 'rgba(255, 64, 64, 0.5)',
          },
          saturday: {
            color: 'rgba(255, 64, 64, 0.5)',
          }
        },
      });
  
      // Event-Templates und Pop-Up-Optionen
      cal.setOptions({
        template: {
          U(event) {
            return `<span>${event.start.d.d.toLocaleTimeString('de-DE')} - ${event.end.d.d.toLocaleTimeString('de-DE')}</span>`;
          },
          R(event) {
            return `<span>${event.start.d.d.toLocaleTimeString('de-DE')} - ${event.end.d.d.toLocaleTimeString('de-DE')}</span>`;
          },
          Kf(event) {
            return `<span>${event.start.d.d.toLocaleTimeString('de-DE')} - ${event.end.d.d.toLocaleTimeString('de-DE')}</span>`;
          },
          popupDetailDate({ start, end }) {
            return `${start.d.d.toLocaleTimeString('de-DE')} - ${end.d.d.toLocaleTimeString('de-DE')}`;
          },
          popupEdit() {
            return 'Ändern';
          },
          popupDelete() {
            return 'Löschen';
          },
        },
      });

      eventLoop();

    })
  
    // Erstellung der Kalender-Legende
    var uLegend = '<ul id="uLeg" class="leg"></ul>';
    var rLegend = '<ul id="rLeg" class="leg"></ul>';
    var kfLegend = '<ul id="kfLeg" class="leg"></ul>';
    var aLegend = '<ul id="aLeg" class="leg"></ul>';
    var hLegend = '<ul id="hLeg" class="leg"></ul>';

    jQuery('#column34').after(uLegend);
    jQuery('#column34').after(rLegend);
    jQuery('#column34').after(kfLegend);
    jQuery('#column35').after(aLegend);
    jQuery('#column35').after(hLegend);

    jQuery('#uLeg')
    .append(`<li><span class="u"></span><b>Unmt. Leistung</b></li>`)
    .append(`<li><span class="un"></span>Notbetreeung</li>`)
    .append(`<li><span class="uh"></span>Häusl. Assistenz</li>`)
    .append(`<li><span class="us"></span>Springereinsatz</li>`)
    .append(`<li><span class="ut"></span>Telefoneinsatz</li>`)
    .append(`<li><span class="uv"></span>Video-Chat</li>`)

    jQuery('#rLeg')
    .append(`<li><span class="r"></span><b>Regie</b></li>`)
    .append(`<li><span class="br"></span>Betriebsratsarbeit</li>`)
    .append(`<li><span class="dr"></span>Dokumentation</li>`)
    .append(`<li><span class="er"></span>Elterngespräch</li>`)
    .append(`<li><span class="fr"></span>Fortbildung</li>`)
    .append(`<li><span class="hr"></span>Hilfeplangespräch</li>`)
    .append(`<li><span class="kor"></span>Koordination</li>`)
    .append(`<li><span class="ho"></span>Hospitation</li>`)
    .append(`<li><span class="lr"></span>Lehrergespräch</li>`)
    .append(`<li><span class="spr"></span>Elternsprechtag</li>`)
    .append(`<li><span class="tr"></span>Teamsitzung</li>`)
    .append(`<li><span class="zr"></span>Zeiterfassung</li>`)
    .append(`<li><span class="ab"></span>Arztbesuch Schulbgl.</li>`)
    .append(`<li><span class="kr"></span>Kind krank</li>`)
    .append(`<li><span class="sr"></span>Schule geschl.</li>`)

    jQuery('#kfLeg')
    .append(`<li><span class="kf"></span><b>Klassenfahrt</b></li>`)

    jQuery('#aLeg')
    .append(`<li><span class="ak"></span>Krank</li>`)
    .append(`<li><span class="au"></span>Urlaub</li>`)
    .append(`<li><span class="aq"></span>Quarantäne</li>`)
    .append(`<li><span class="ae"></span>eigenes Kind krank</li>`)
    .append(`<li><span class="aku"></span>Kur/Reha</li>`)
    .append(`<li><span class="auf"></span>Unbekannt</li>`)
    .append(`<li><span class="akp"></span>Klärung (Pooltest)</li>`)
    .append(`<li><span class="auu"></span>unbezahlte Freistellung</li>`)
    .append(`<li><span class="aub"></span>Unbesetzt</li>`)
    .append(`<li><span class="afo"></span>Fortbildung</li>`)
    .append(`<li><span class="aso"></span>Sonderurlaub</li>`)
    .append(`<li><span class="aw"></span>Wiedereingliederung</li>`)
    .append(`<li><span class="alf"></span>Aus Lohnfortzahlung</li>`)
    .append(`<li><span class="aab"></span>Arbeitsbefreiung</li>`)
    .append(`<li><span class="aez"></span>Elternzeit < 6 Wochen</li>`)
    .append(`<li><span class="abv"></span>Beschäftigungsverbot</li>`)
    .append(`<li><span class="abu"></span>Bildungsurlaub</li>`)
    .append(`<li><span class="agz"></span>Gleitzeit</li>`)
    .append(`<li><span class="aaf"></span>AU (in Ferien)</li>`)
    .append(`<li><span class="aau"></span>AU (während Urlaub)</li>`)
    .append(`<li><span class="asd"></span>Springerdummy</li>`)
    

    jQuery('#hLeg')
    .append(`<li><span class="fe"></span>Ferien</li>`)
    
    jQuery('.leg').css("list-style-type", "none");
    jQuery('.leg li').css("margin", "1px");
    jQuery('.leg span').css("border-left", "3px solid #222");
    jQuery('.leg span').css("float", "left");
    jQuery('.leg span').css("width", "24px");
    jQuery('.leg span').css("height", "24px");
    jQuery('.leg span').css("margin", "-4px 6px");
    
    jQuery('.leg .u').css("background-color", "#887CAF");
    jQuery('.leg .un').css("background-color", "#9688C0");
    jQuery('.leg .uh').css("background-color", "#A596D3");
    jQuery('.leg .us').css("background-color", "#B6A5E8");
    jQuery('.leg .ut').css("background-color", "#C8B6FF");
    jQuery('.leg .uv').css("background-color", "#CDBDFF");

    jQuery('.leg .br').css("background-color", "#0377A8");
    jQuery('.leg .dr').css("background-color", "#118FB0");
    jQuery('.leg .er').css("background-color", "#1FA6B8");
    jQuery('.leg .fr').css("background-color", "#2FB5C7");
    jQuery('.leg .hr').css("background-color", "#3EC4D6");
    jQuery('.leg .kor').css("background-color", "#51CCD1");
    jQuery('.leg .ho').css("background-color", "#62d6da");
    jQuery('.leg .lr').css("background-color", "#63D4CC");
    jQuery('.leg .spr').css("background-color", "#8BE8D7");
    jQuery('.leg .tr').css("background-color", "#A0F1DA");
    jQuery('.leg .zr').css("background-color", "#B4FADC");
    jQuery('.leg .ab').css("background-color", "#de878b");
    jQuery('.leg .kr').css("background-color", "#cc444b");
    jQuery('.leg .sr').css("background-color", "#da5552");

    jQuery('.leg .kf').css("background-color", "#ff8f4b");

    jQuery('.leg .ak').css("background-color", "#ffff00");
    jQuery('.leg .au').css("background-color", "#1e90ff");
    jQuery('.leg .aq').css("background-color", "#edfe6f");
    jQuery('.leg .ae').css("background-color", "#00ffff"); 
    jQuery('.leg .aku').css("background-color", "#cd5c5c");
    jQuery('.leg .auf').css("background-color", "#ff0000");
    jQuery('.leg .akp').css("background-color", "#d3d3d3");
    jQuery('.leg .auu').css("background-color", "#3712f1");
    jQuery('.leg .aub').css("background-color", "#b0c4de");
    jQuery('.leg .afo').css("background-color", "#2FB5C7");
    jQuery('.leg .aso').css("background-color", "#5BBA6F");
    jQuery('.leg .aw').css("background-color", "#3FA34D");
    jQuery('.leg .alf').css("background-color", "#137547");
    jQuery('.leg .aab').css("background-color", "#054A29");
    jQuery('.leg .aez').css("background-color", "#f2cc8f");
    jQuery('.leg .abv').css("background-color", "#81b29a");
    jQuery('.leg .abu').css("background-color", "#3d405b");
    jQuery('.leg .agz').css("background-color", "#f4f1de");
    jQuery('.leg .aaf').css("background-color", "#fca311");
    jQuery('.leg .aau').css("background-color", "#ccff33");
    jQuery('.leg .asd').css("background-color", "#e07a5f");

    jQuery('.leg .fe').css("background-color", "#b8fb3c");

  })
  .fail(function( jqxhr, settings, exception ) {
    jQuery( "div.log" ).text( "Triggered ajaxError handler." );
});