<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{

	    $idS = $this->getParameter('txb_schulB');
	    
		
		$idK = $this->getParameter('sls_klient');
		$nameK = $this->getParameter('sls_klient_display');

		$idK2 = $this->getParameter('sls_klient_2');
		$nameK2 = $this->getParameter('sls_klient_2_display');
        
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
		$pool = $this->getParameter('cb_pool');
		
		$maxID = $this->getParameter('maxID');
		$maxID1 = $maxID;
		$maxID2 = $maxID1 + 1;

		$rowData = array('schulB' => $idS, 'klient' => $idK, 'klientName' => $nameK, 'von' => $von, 'bis' => $bis, 
		'zeit' => $zeit, 'zeit2' => $zeit2, 'zeit3' => $zeit3, 'leistungsart' => $la, 'taetigkeit' => $taet, 
		'beschreibung' => $beschr, 'zweizueins' => $zweizueins, 'klientenpool' => $pool, 'springer' => $springer);

		$rowData2 = array('schulB' => $idS, 'klient' => $idK2, 'klientName' => $nameK2, 'von' => $von, 'bis' => $bis, 
		'zeit' => $zeit, 'zeit2' => $zeit2, 'zeit3' => $zeit3, 'leistungsart' => $la, 'taetigkeit' => $taet, 
		'beschreibung' => $beschr, 'zweizueins' => $zweizueins, 'klientenpool' => $pool, 'springer' => $springer);

		$this->insertSubtableRow('SCHICHTEN', $maxID1, $rowData);
		$this->insertSubtableRow('SCHICHTEN', $maxID2, $rowData2);
		
		$answer = implode(",",$rowData);
		
		$this->setReturnValue('rowData', $answer);
		
		$this->save();

	}
}
?>