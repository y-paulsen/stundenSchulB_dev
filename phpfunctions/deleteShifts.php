<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{
		
        $jobDB = $this->getDBConnection('JobData');
        $sql = 'DELETE FROM ISB_ZEITERFASSUNG WHERE idAssistent = :idassi AND von BETWEEN :firstOfMonth AND :lastOfMonth';
        $parameters = [
            'idassi' => $this->getParameter('idassi'),
            'firstOfMonth' => $this->getParameter('firstOfMonth'),
            'lastOfMonth' => $this->getParameter('lastOfMonth')
        ];
    
        $types = [
            JobRouter\Common\Database\ConnectionInterface::TYPE_INTEGER,
            JobRouter\Common\Database\ConnectionInterface::TYPE_DATETIME,
            JobRouter\Common\Database\ConnectionInterface::TYPE_DATETIME
        ];
    
        $jobDB->preparedExecute($sql, $parameters, $types);

	}

}
?>