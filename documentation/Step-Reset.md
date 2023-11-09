## Schritte zurücksetzen Dialog

Hier ist das UI weniger interessant, oder wäre nur redudant aufzugreifen. Es gibt einen Button mit hinterlegter Funktionalität und beim 'onClick' auf eine Zeile der SQL-Tabelle wird ein Modal-Window (siehe [Pop-Ups](Pop-Ups.md)) geöffnet.

Daher beschränken wir uns hier auf die PHP-Funktionen, die zwar nicht unbedingt komplex, aber dafür kritisch sind.

> Löschen auf Datenbankebene in einer Produktivtabelle kritisch. Daher sollten diese zu 100% funktionieren.

### resetZettel.php

```php
<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{
		$stepid = $this->getParameter('stepid');
        $processid = $this->getParameter('processid');
        $rowID = $this->getParameter('rowID');
		
        $jobDB = $this->getDBConnection('JobRouter');
        
        $sql_user = 'UPDATE USER_CLIENT SET status = 0 WHERE step_id = :stepid';
        $sql_incident = 'UPDATE JRINCIDENT SET status = 0, reactivated = 0 WHERE processid = :processid';
        $sql_incidents = 'UPDATE JRINCIDENTS SET status = 0, username = \'\' WHERE processid = :processid AND step = 2';

        $parameters = [
            'stepid' => $stepid
        ];

        $parameters_inc = [
            'processid' => $processid
        ];

        $types = [
            JobRouter\Common\Database\ConnectionInterface::TYPE_TEXT
        ];
    
        $jobDB->preparedExecute($sql_user, $parameters, $types);
        $jobDB->preparedExecute($sql_incident, $parameters_inc, $types);
        $jobDB->preparedExecute($sql_incidents, $parameters_inc, $types);

        $this->setReturnValue('rowID', $rowID);
        
	}
}
?>
```
In der Funktion, wie der Name schon sagt, wird der Stundenzettel auf den "Schritt 2: Prüfschritt" zurückgesetzt. Dabei sind 3 verschiedene Tabellen von Interesse:
- USER_CLIENT --> hier wird der Status gesetzt, sodass nach erneuter Prüfung kein neuer Archiveintrag für das PDF erstellt, sondern der alte Eintrag überschrieben wird
- JRINCIDENT --> der Vorgangsstatus ändert sich ebenfalls
- JRINCIDENTS --> der Status des Schritts und der Unsername werden zurückgesetzt (Username referenziert in dem Fall den Nutzer der Sachbearbeitung)

### deleteShifts.php

```php
<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{
		
        $jobDB = $this->getDBConnection('JobData');
        $sql = 'DELETE FROM ISB_ZEITERFASSUNG WHERE idAssistent = :idassi AND von BETWEEN :firstOfMonth AND :lastOfMonth';
        $parameters = [
            'idassi' => $this->getParameter('idassi'),
            'firstOfMonth' => $this->getParameter('firstOfMonth'),
            'lastOfMonth' => $this->getParameter('lastOfMonth')
        ];
    
        $types = [
            JobRouter\Common\Database\ConnectionInterface::TYPE_INTEGER,
            JobRouter\Common\Database\ConnectionInterface::TYPE_DATETIME,
            JobRouter\Common\Database\ConnectionInterface::TYPE_DATETIME
        ];
    
        $jobDB->preparedExecute($sql, $parameters, $types);

	}

}
?>
```
Hier werden alle Leistungen des ausgewählten Monats gelöscht. Analog funktioniert es auch mit den Monatsstunden.

Interessant vielleicht noch anzumerken, dass hier "preparedExecute()" verwendet wird. Die Festlegung der genauen Datentypen und Parameter verhindert zB. eine fälschliche Datumswert-Umkehrung (aus 01.12.22 mache 12.01.22 oder schlimmer 22.12.01) oder dass keine ID ausgelesen wird und somit alle Leistungen jedes Schulbgl. aus diesem Monat entfernt werden.