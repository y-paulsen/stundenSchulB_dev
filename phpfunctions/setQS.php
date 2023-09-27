<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\RuleExecutionFunction
{
	public function execute($rowId = null)
	{

        $jobDB = $this->getDBConnection('JobData');

        $ida = $this->getTableValue('schulB', true);
        $von = $this->getTableValue('firstOfMonth', true);
        $bis = $this->getTableValue('lastOfMonth', true);

        $von = date("m.d.Y", strtotime($von));
        $bis = date("m.d.Y", strtotime($bis));
        
        $sqlK = 'UPDATE ISB_ABWESEND SET qs = 1 WHERE ( datum BETWEEN \''. $von .'\' AND \''. $bis .'\' ) AND stammdatenId = \''. $ida .'\'';
        $result = $jobDB->exec($sqlK);

	}
}
?>