<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{

        $idA= $this->getParameter('idA');
        $this->setTableValue('schulB', $idA);
        $this->save();
        
	}
}
?>