<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{

        $rowID = $this->getParameter('rowID');
		
        $jobDB = $this->getDBConnection('JobData');
        $sql = 'DELETE FROM ISB_MONATSSTUNDEN WHERE idAssistent = :idassi AND monat = :month';
        $parameters = [
            'idassi' => $this->getParameter('idassi'),
            'month' => $this->getParameter('month')
        ];
    
        $types = [
            JobRouter\Common\Database\ConnectionInterface::TYPE_INTEGER,
            JobRouter\Common\Database\ConnectionInterface::TYPE_TEXT,
        ];
    
        $jobDB->preparedExecute($sql, $parameters, $types);

        $this->setReturnValue('rowID', $rowID);

	}
}
?>