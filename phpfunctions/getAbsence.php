<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{
        $this->setLogFilePath('./output/log/isb_schulb');
	    $this->setLogFilename('getAbsence.log');
	    $this->rawLog();

        $von = $this->getParameter('von');
        $bis = $this->getParameter('bis');
        $ida = $this->getParameter('IDa');
        
        $this->dump('-----------------------------');
        $this->dump($von);
        $this->dump($bis);
        $this->dump($ida);

        $jobDB = $this->getDBConnection('JobData');
        
        $sqlK = 'SELECT DISTINCT idKind FROM ISB_BETREUUNG WHERE archiv = 0 AND idAssistent = \''. $ida .'\'';

        $resultK = $jobDB->query($sqlK);
        
        if ($resultK === false) {
            
            throw new JobRouterException($jobDB->getErrorMessage());
            
        }while ($row = $jobDB->fetchRow($resultK)) {
            
            $idk = $row['idKind'];

            $idkArr[] = $idk;

        }
        
        //$this->dump(count($idkArr));

        if (isset($idkArr)) {
            
            if (count($idkArr) != 0) {

                $implArr = implode(',', $idkArr);
                $this->dump($implArr);
                $sql01 = 'SELECT datum, stammdatenId FROM ISB_ABWESEND WHERE ( datum BETWEEN \''. $von .'\' AND \''. $bis .'\' ) AND ( stammdatenId = \''. $ida .'\' OR stammdatenId IN (' .  $implArr . '))';
                $result01 = $jobDB->query($sql01);
                $this->dump($result01);

    
            } else {

                $sql01 = 'SELECT datum, stammdatenId FROM ISB_ABWESEND WHERE ( datum BETWEEN \''. $von .'\' AND \''. $bis .'\' ) AND stammdatenId = \''. $ida .'\'';
                $result01 = $jobDB->query($sql01);
                $this->dump($result01);

            }

        } else {

            $sql01 = 'SELECT datum, stammdatenId FROM ISB_ABWESEND WHERE ( datum BETWEEN \''. $von .'\' AND \''. $bis .'\' ) AND stammdatenId = \''. $ida .'\'';
            $result01 = $jobDB->query($sql01);
            $this->dump($result01);

        }


        if ($result01 === false) {
                
            throw new JobRouterException($jobDB->getErrorMessage());
            
        } while ($row = $jobDB->fetchRow($result01)) {
            
            $date = $row['datum'];
            $id_krank = $row['stammdatenId'];
            
            $this->dump($date);
            $this->dump($id_krank);
            
            $dateArr[] = $date;
            $idArr[] = $id_krank;

        }


        $this->setReturnValue('date', $dateArr);
        $this->setReturnValue('ida', $idArr);
        
	}
}
?>