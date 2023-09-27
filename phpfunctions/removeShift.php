<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{
	    
	    $row = $this->getParameter('rowID');
	    $this->deleteSubtableRow('SCHICHTEN', $row);
		$this->setReturnValue('rowID', $row);
	    $this->save();
	    
	}
}
?>