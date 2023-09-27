<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{
        //Logger
        $this->setLogFilePath('./output/log/isb_datenverwaltung');
	    $this->setLogFilename('vertragArchivieren.log');
	    $this->rawLog();


		$id = $this->getParameter('id');
		$sql2 = '';
		$sql3 = '';
		$vontemp = explode('.', $this->getDialogValue('von_a'));
		$bistemp = explode('.', $this->getDialogValue('bis_a'));
        $bisElement = $bistemp[0];
        $this->dump(gettype($bisElement));
        $d = date("m.d.Y");
        $this->dump($d);
        $this->dump('bisElement is '.$bisElement);
        if($bisElement!=null||$bisElement>0||$bisElement!=""){
            $bis = $bistemp[1].'.'.$bistemp[0].'.'.$bistemp[2];
        }else{
            $d = date("m.d.Y");
            $bis = $d;
        }
		$von = $vontemp[1].'.'.$vontemp[0].'.'.$vontemp[2];
		//$bis = $bistemp[1].'.'.$bistemp[0].'.'.$bistemp[2];
		$stundenVertrag = str_replace(",", ".", $this->getDialogValue('stunden_a'));
		$stundenSchule = str_replace(",", ".", $this->getDialogValue('stunden_schule_a'));
		$stundenEntfristet = str_replace(",", ".", $this->getDialogValue('stdEntfristet_a'));
		$tagewoche = $this->getDialogValue('lsTagewoche_a');
		$poolVertrag = $this->getDialogValue('cbPool');
		$pool = $this->getDialogValue('slsPoolName');
        $springtSchulintern = $this->getDialogValue('springtSchulintern_a');
        $pflegeQualifikation = $this->getDialogValue('pflegeQuali_a');
        $qnfkFortbildung = $this->getDialogValue('qnfkFortbildung_a');
        $qnfkErfahrung = $this->getDialogValue('qnfkErfahrung_a');
        $qnfkFKMassn = $this->getDialogValue('qnfkFKMassn_a');
        $schwerbehinderung = $this->getDialogValue('cbSchwerbeh_a');
        $fortbKinderschutz = $this->getDialogValue('cbKinderschPfl');
        $vertrOhneKozu = $this->getDialogValue('vertrOhneKozu_a');
		
		$fk = $this->getDialogValue('fk_a');
		
		$jobDataDB = $this->getDBConnection('DBConn');

        $sql2 = 'INSERT INTO ISB_ASSISTENT (stammdatenId, von, bis, stundenVertrag, fk, stundenSchule, archiv,stdEntfristet,poolVertrag,poolSchule,springtSchulintern,pflegeQualifikation,qnfkFortbildung,qnfkErfahrung,qnfkFKMassn,schwerbehinderung,fortbKinderschutz,vertrOhneKozu)
                    VALUES ('.$id.', \''.$von.'\', \''.$bis.'\', '.$stundenVertrag.', '.$fk.', '.$stundenSchule.', 1,'.$stundenEntfristet.','.$poolVertrag.','.$pool.','.$springtSchulintern.',\''.$pflegeQualifikation.'\','.$qnfkFortbildung.','.$qnfkErfahrung.','.$qnfkFKMassn.','.$schwerbehinderung.','.$fortbKinderschutz.','.$vertrOhneKozu.')';
        $sql3 = 'UPDATE ISB_ASSISTENT SET von=NULL, bis=NULL, stundenVertrag=0, fk=\''.$fk.'\', stundenSchule=0, archiv=0 
                WHERE stammdatenId='.$id.' AND (archiv=0 OR archiv IS NULL)';
            
        $res = $jobDataDB->exec($sql2);
        if ($res === false) {
            throw new JobRouterException($jobDataDB->getErrorMessage());
        }
        
        $res = $jobDataDB->exec($sql3);
        if ($res === false) {
            throw new JobRouterException($jobDataDB->getErrorMessage());
        }
        

        $this->setReturnValue('sql2', $sql2);
        $this->setReturnValue('sql3', $sql3);

	}

    private function extLog($message,$level){
        $date = date("Y/m/d h:i:s");
        $logPrefix = '['.$date.'] ';
        $mes = '['.$level.']'.$logPrefix.$message;
        $this->log($level,$mes);
    }
}
?>