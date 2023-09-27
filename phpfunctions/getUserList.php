<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\RuleExecutionFunction
{
	public function execute($rowId = null)
	{
        $this->setLogFilePath('./output/log/isb_schulb');
	    $this->setLogFilename('getUserList.log');
	    $this->rawLog();
        
        if (date('d') == '01') {
            
            setlocale(LC_TIME, 'de_DE.UTF-8', 'de_DE@euro', 'de_DE', 'de', 'ge', 'deu_deu');
            $monthNumber = date('m');
            $monthName = strftime('%B', mktime(0, 0, 0, $monthNumber));
            $monthName = utf8_encode($monthName);
    
            $year = date('Y');
            
            $monthYear = $monthName;
            $monthYear .= ' ';
            $monthYear .= $year;
    
            $d = new DateTime(); 
            $firstOfMonth = $d->format('Y-m-d');
            $lastOfMonth = $d->format('Y-m-t');

            $this->dump($monthYear);
            $this->dump($firstOfMonth);
            $this->dump($lastOfMonth);
            
            $string = "firstOfMonth=";
            $string .= $firstOfMonth;
            $string .= ";lastOfMonth=";
            $string .= $lastOfMonth;
            $string .= ";monat=";
            $string .= $monthYear;
            $string .= ";month_text=";
            $string .= $monthName;
            $string .= ";jahr=";
            $string .= $year;
            $string .= ";schulB=";
            
            $this->dump($string);

            $jobDB = $this->getDBConnection('Jobrouter');
            
            $sql01 = 'SELECT JRUSERS.username, JRUSERS.user_defined1, JRUSERS.prename, JRUSERS.lastname, JRUSERS.email FROM JRUSERS INNER JOIN JRUSERJOB ON JRUSERS.username = JRUSERJOB.username WHERE JRUSERJOB.jobfunction = \'JR_OFF_ISB_SCHULBEGLEITER\' AND blocked = 0';
    	    $userlist = $jobDB->query($sql01);
    
            $sqlex = 'INSERT INTO JRJOBIMPORT (processname, version, step, initiator, username, indate, step_escalation_date, insstring) VALUES (\'stundenSchulB\',\'4\', \'1\', :username, :username, \''. $firstOfMonth .'\' , \''. $lastOfMonth .'\', :stringID )';
            
            $sqlex_sommerferien = 'INSERT INTO JRJOBIMPORT (processname, version, step, initiator, pool, indate, insstring) VALUES (\'stundenSchulB\',\'4\', \'2\', :username, \'1\', \''. $firstOfMonth .'\', :stringID )';
    	    
            if ($userlist === false) {
                
                $this->dump($jobDB->getErrorMessage());
                throw new JobRouterException($jobDB->getErrorMessage());
                
            }while ($row = $jobDB->fetchRow($userlist)) {
                
                $stringID = $string;
                $stringID .= $row['user_defined1'];
                $stringID .= ";name=";
                $stringID .= $row['prename'];
                $stringID .= " ";
                $stringID .= $row['lastname'];
                $stringID .= ";vorname=";
                $stringID .= $row['prename'];
                $stringID .= ";nachname=";
                $stringID .= $row['lastname'];
                $stringID .= ";email=";
                $stringID .= $row['email'];
                $stringID .= ";dateiname=stundenzettel_";
                $stringID .= $row['user_defined1'];
                $stringID .= "_";
                $stringID .= $monthName;
                $stringID .= "_";
                $stringID .= $year;
                
                $this->dump($stringID);

                $parameters = [
                    'username' => $row['username'],
                    'stringID' => $stringID
                   ];
                   
                $types = [
                    JobRouter\Common\Database\ConnectionInterface::TYPE_TEXT,
                    JobRouter\Common\Database\ConnectionInterface::TYPE_TEXT,
                   ];
            
                $jobDB->preparedExecute($sqlex, $parameters, $types);
            }
        }
	}
}
?>