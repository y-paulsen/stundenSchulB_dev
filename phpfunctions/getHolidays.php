<?php

class className extends JobRouter\Engine\Runtime\PhpFunction\DialogFunction
{
	public function execute($rowId = null)
	{

        $von = $this->getParameter('von');
        $bis = $this->getParameter('bis');

        $jobDB = $this->getDBConnection('JobData');
	    
        $sql01 = 'SELECT * FROM DATA_SCHOOLHOLIDAYS WHERE (beginDate BETWEEN \''. $von .'\' AND \''. $bis .'\') OR (endDate BETWEEN \''. $von .'\' AND \''. $bis .'\') OR (\''. $von .'\' BETWEEN beginDate AND endDate) OR (\''. $bis .'\' BETWEEN beginDate AND endDate)';
        $result01 = $jobDB->query($sql01);

        if ($result01 === false) {

            throw new JobRouterException($jobDB->getErrorMessage());

        }while ($row = $jobDB->fetchRow($result01)) {
            
            $vonPHP = $row['beginDate'];
            $bisPHP = $row['endDate'];
            $descPHP = $row['description'];

            $vonArr[] = $vonPHP;
            $bisArr[] = $bisPHP;
            $descArr[] = $descPHP;
            
        }

        $this->setReturnValue('von', $vonArr);
        $this->setReturnValue('bis', $bisArr);
        $this->setReturnValue('desc', $descArr);
	}
}
?>