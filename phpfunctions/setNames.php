<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\RuleExecutionFunction
{
	public function execute($rowId = null)
	{
	    $this->setLogFilePath('./output/log/isb_schulb');
	    $this->setLogFilename('setNames.log');
	    $this->rawLog();
	    
		$fullname = $this->getTableValue('name', true);
		$aid = $this->getTableValue('schulB', true);
		$nameArr = explode(" ", $fullname);

        $this->dump($fullname, $aid);
		
		if (count($nameArr) == 2){
		    
		    $vorname = $nameArr[0];
		    $nachname = $nameArr[1];

            $this->dump($vorname, $nachname);
            
            $this->setTableValue('vorname', $vorname);
            $this->setTableValue('nachname', $nachname);
		    
		}
		
        else if (count($nameArr) != 2) {
            
            $jobDB = $this->getDBConnection('Jobrouter');
            $sql01 = 'SELECT JRUSERS.prename, JRUSERS.lastname FROM JRUSERS WHERE JRUSERS.user_defined1 = \''. $aid .'\'';
    	    $names = $jobDB->query($sql01);
    	    
    	    if ($names === false) {
                throw new JobRouterException($jobDB->getErrorMessage());
            }while ($row = $jobDB->fetchRow($names)) {
                
                $vorname = $row['prename'];
                $nachname = $row['lastname'];

                $this->dump($vorname, $nachname);
                
                $this->setTableValue('vorname', $vorname);
                $this->setTableValue('nachname', $nachname);

            }
        }
		
	}
}
?>