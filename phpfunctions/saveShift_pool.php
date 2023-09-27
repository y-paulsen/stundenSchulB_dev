<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{

	    $idS = $this->getParameter('txb_schulB');
	    $idP = $this->getParameter('sls_pools');
		$nameP = $this->getParameter('sls_pools_display');
        
		$von = $this->getParameter('dt_beginn');
	    $bis = $this->getParameter('dt_ende');
        $zeit = $this->getParameter('dcm_stunden');
		$zeit2 = $this->getParameter('tx_stunden');
		$zeit3 = $this->getParameter('minuten');
		
		$la = $this->getParameter('ls_leistungsart');
		$taet = $this->getParameter('sls_taetigkeit');
		$beschr = $this->getParameter('txb_beschreibung');
		
		$zweizueins = $this->getParameter('cb_zweiZuEins');
		$springer = $this->getParameter('cb_springer');
		
		$maxID = $this->getParameter('maxID');
		$maxID1 = $maxID;

		$rowData = array('schulB' => $idS, 'klientenpool' => $idP, 'poolName' => $nameP,  'von' => $von, 'bis' => $bis, 
		'zeit' => $zeit, 'zeit2' => $zeit2, 'zeit3' => $zeit3, 'leistungsart' => $la, 'taetigkeit' => $taet, 
		'beschreibung' => $beschr, 'zweizueins' => $zweizueins, 'springer' => $springer);

		$this->insertSubtableRow('SCHICHTEN', $maxID1, $rowData);
		
		$answer = implode(",",$rowData);
		
		$this->setReturnValue('rowData', $answer);
		
		$this->save();

	}
}
?>