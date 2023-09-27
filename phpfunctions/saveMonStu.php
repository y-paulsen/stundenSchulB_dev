<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{

	    $monat = $this->getParameter('monat');
		$soll_stunden = $this->getParameter('soll_stunden');
		$soll_stunden_txt = $this->getParameter('soll_stunden_txt');
		$stunden = $this->getParameter('stunden');
		$stunden_txt = $this->getParameter('stunden_txt');
		$stundenkonto = $this->getParameter('stundenkonto');
		$stundenkonto_txt = $this->getParameter('stundenkonto_txt');

		$rowData = array('monat' => $monat, 
		'soll_stunden' => $soll_stunden, 'soll_stunden2' => $soll_stunden_txt, 
		'stunden' => $stunden, 'stunden2' => $stunden_txt, 
		'stundenkonto' => $stundenkonto, 'stundenkonto2' => $stundenkonto_txt);
		
        $this->clearSubtable('MONATSSTUNDEN');
		$this->insertSubtableRow('MONATSSTUNDEN', 1, $rowData);
		
		$answer=implode(",",$rowData);
		$this->setReturnValue('rowData', $answer);
		
		$this->save();

	}
}
?>