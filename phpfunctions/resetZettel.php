<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{
		$stepid = $this->getParameter('stepid');
        $processid = $this->getParameter('processid');
        $rowID = $this->getParameter('rowID');
		
        $jobDB = $this->getDBConnection('JobRouter');
        
        $sql_user = 'UPDATE USER_CLIENT SET status = 0 WHERE step_id = :stepid';
        $sql_incident = 'UPDATE JRINCIDENT SET status = 0, reactivated = 0 WHERE processid = :processid';
        $sql_incidents = 'UPDATE JRINCIDENTS SET status = 0, username = \'\' WHERE processid = :processid AND step = 2';

        $parameters = [
            'stepid' => $stepid
        ];

        $parameters_inc = [
            'processid' => $processid
        ];

        $types = [
            JobRouter\Common\Database\ConnectionInterface::TYPE_TEXT
        ];
    
        $jobDB->preparedExecute($sql_user, $parameters, $types);
        $jobDB->preparedExecute($sql_incident, $parameters_inc, $types);
        $jobDB->preparedExecute($sql_incidents, $parameters_inc, $types);

        $this->setReturnValue('rowID', $rowID);
        
	}
}
?>