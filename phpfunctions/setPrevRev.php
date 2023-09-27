<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\RuleExecutionFunction
{
	public function execute($rowId = null)
	{
	    $processid = $this->getProcessId();
        
        $jobDB = $this->getDBConnection('JobRouter');
        
        $sql = 'SELECT revision_id FROM USER_CLIENT WHERE processid = :processid AND step = 6';
        
        $parameters = [
            'processid' => $processid
        ];

        $types = [
            JobRouter\Common\Database\ConnectionInterface::TYPE_TEXT
        ];
        
        $result = $jobDB->preparedSelect($sql, $parameters, $types);
    
        while($row = $jobDB->fetchRow($result)) {
            $revID = $row['revision_id'];
        }
        
        //$revID = $this->getTableValue('revision_id');
		
		if (!empty($revID)) {
		    
		    $this->setTableValue('previous_revision_id', $revID);
            $this->setTableValue('prev_rev_job_id', $revID);
            //$this->save();
		    
		}
		
	}
}
?>