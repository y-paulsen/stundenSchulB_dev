<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{
	    
	    $subrow = $this->getParameter('rowIDs');
	    $subcount = $this->getParameter('subCount');
	    
	    $subrow_php = $this->getSubtableRowIds('SCHICHTEN');
	    
	    for ($i = 0; $i < count($subcount); $i++) {
	        
	        $rowData = array('schulB' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'schulB', true), 
	        'klient' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'klient', true), 
	        'klientName' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'klientName', true), 
	        'von' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'von', true), 
	        'bis' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'bis', true), 
	        'zeit' =>$this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'zeit', true), 
	        'zeit2' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'zeit2', true), 
	        'zeit3' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'zeit3', true), 
	        'leistungsart' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'leistungsart', true), 
	        'taetigkeit' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'taetigkeit', true), 
	        'beschreibung' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'beschreibung', true), 
	        'zweizueins' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'zweizueins', true), 
	        'klientenpool' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'klientenpool', true), 
	        'springer' => $this->getSubtableValue('SCHICHTEN', $subrow_php[$i], 'springer', true));
	        
	        $this->insertSubtableRow('SCHICHTEN', $subrow[$i]+1, $rowData);
            
        }


	    $this->save();
	    
	}
}
?>