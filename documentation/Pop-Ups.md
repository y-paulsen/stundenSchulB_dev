## Pop-Up Fenster

### Beispiel Stundenplan einfügen Button

```javascript
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
```
Für ein Pop-Up im Dialog muss das Fenster zunächst im Dialog-Designer in JobRouter angelegt werden und mit dem Status "ausgeblendet" versehen werden. Mithilfe von jQuery kann man dieses Fenster dann sichtbar machen. Das Stichwort ist [Modal Window](https://jqueryui.com/dialog/). 

Hier wird z.B. ein Fenster geöffnet, dass nochmmal abfragt, ob der User wirklich alle bisherigen Leistungen überschreiben möchte und diese des zuvor definierten Stundenplans nutzen möchte. Sobald auf den Button "OK" oder auf das "X" für schließen geklickt wird, schließt das Fenster wieder.