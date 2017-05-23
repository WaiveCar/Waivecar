<?php

$handle = fopen("logs.csv", "r");
$allCars = [];
$weekly = [];
$tracked = [ 'CREATE_BOOKING', 'COMPLETE_BOOKING', 'MAKE_CAR_UNAVAILABLE', 'MAKE_CAR_AVAILABLE' ];
$one_week = 7 * 24 * 60 * 60;
$current_week = false;
$order = [];
$late = 0;
$early = 7;
$missing = [];
$test_car = '56000017DC5B6201';

function hour($what) {
  return (intval(date('H', $what)) + 24 - 8) % 24;
}

function at_night($what) {
  global $late, $early;
  return $what > $late && $what < $early;
}

$evt = [];
while (($row = fgetcsv($handle, 1000, ",")) !== FALSE) {
  list($booking, $car, $user, $action, $date_str) = $row;
  $date = strtotime($date_str);

  if(!$current_week) {
    $current_week = $date;
  }

  if($date - $current_week > $one_week) {
    $duration = ($date - $current_week) / 100;// * (24 - $early - $late) / 24;

    $avg = [0,0,0];
    $car_ttl = 0;
    printf("\n%-17s ava use una | ava use una min\n", date("Y-m-d", $current_week));
    foreach($order as $car) {
      if(!isset($weekly[$car])) {
        if(!isset($missing[$car])) {
          $missing[$car] = 0;
        }
        $missing[$car]++;
        if($missing[$car] < 3) {
         // printf(" %s %3s %3s %3s | %3s %3s %3s\n", $car, '-', '-', '-', '-', '-', '-', '-');
        }
        continue;
      }
      $data = $weekly[$car];
      $car_duration = $duration - $weekly[$car]['scrub'];

      $avail = round($data['avail'] / $car_duration);
      $unavail = round($data['unavail'] / $car_duration);
      $use = round($data['use'] / $car_duration);

      if($avail > 0 && $unavail > 0 && $use > 0) {
        $_avail = round($data['avail'] / $data['_avail'] / 60);
        $_use = round($data['use'] / $data['_use'] / 60);
        $_unavail = round($data['unavail'] / $data['_unavail'] / 60);
        $ttl_accounted = ($avail + $unavail + $use);
        $scale = 100 / $ttl_accounted;

        $avg[0] += $data['avail'] * $scale;
        $avg[1] += $data['use'] * $scale;
        $avg[2] += $data['unavail'] * $scale;
        printf(" %s %3d %3d %3d %3d %3d | %3d %3d %3d %f\n", 
          $car, $avail, $unavail, $use, 
          ($data['ttl']), ($ttl_accounted),
          $_avail, $_use, $_unavail,
          $car_duration / 60 / 60 / 24 * 100);
        $car_ttl++;
      }
    }
    $weekly = [];
    $sum = 0;
    $report = [date("Y-m-d", $current_week)];
    foreach($avg as $unit) {
      // so a smaller report for a smaller week should increase.
      $col = round($unit / $car_ttl * ($one_week / ($date - $current_week)));
      $sum += $col;
      $report[] = $col;
    }
    $this_week = $date - $current_week;
    $delta = 1 - ($sum / $one_week);
    echo "Avg:" . implode(',', $report);// . " $sum $one_week ($delta)\n";


    $current_week = $date;
  }

  if(!isset($allCars[$car])) {
    $order[] = $car;
    
    $allCars[$car] = [
      'state' => false,
      'last' => false,
      '_last_special' => false
    ];
  }

  if(!isset($weekly[$car])) {
    $weekly[$car] = [
      'avail' => 0,
      'use' => 0,
      'unavail' => 0,
      '_avail' => 0,
      '_use' => 0,
      '_unavail' => 0,
      'ttl' => 0,
      'scrub' => 0
    ];
  }
  
  if ($action === 'UNIMMOBILIZE_CAR') {
    $allCars[$car]['_last_special'] = $date;
  }

  if (in_array($action, $tracked)) {

    if($allCars[$car]['last']) {
      // make sure that we don't dip into prior weeks.
      $last = max($allCars[$car]['last'], $current_week);

      // understand the duration between our two events
      $delta = $date - $last;
      $weekly[$car]['ttl'] += $delta;

      $start = hour($last);
      $end = hour($date);
      $last_state = $allCars[$car]['state'];

      if(at_night($end) && at_night($start)) {
        $delta = 0;
      } elseif(at_night($end)) {
        $delta -= ($end - $late) * 60 * 60;
      } elseif(at_night($start)) {
        $delta -= ($start - $early) * 60 * 60;
      } 

      //$hour = round($delta / 60 / 60);
      //echo "$start - $end $hour \n";
      if($delta > 0) {

        $type = 'none';
        if($action == 'CREATE_BOOKING') {
          if($delta > (180 * 60)) {
            //$weekly[$car]['scrub'] += $delta;
          } else {
            // this means a timer expired ... we remove 15 minutes
            /*
            if($last_state == 'CREATE_BOOKING') {
              $delta -= (60 * 15);
              $delta = max($delta, 0);
            }
             */
            $weekly[$car]['avail'] += $delta;
            $weekly[$car]['_avail'] ++;
            $type = 'avail';
          }
        } elseif($action == 'COMPLETE_BOOKING') {
          $weekly[$car]['use'] += $delta;
          $weekly[$car]['_use'] ++;
          $type = 'use';
        } elseif($action == 'MAKE_CAR_AVAILABLE') {
          $weekly[$car]['unavail'] += $delta;
          $weekly[$car]['_unavail'] ++;
          $type = 'unav';
        }
      }
    }
    $evt = [];
    $allCars[$car]['state'] = $action;
    $allCars[$car]['last'] = $date;
    /*
    if($car == $test_car) {
      echo "*$car $date $action\n";
    }
     */

  } /*else if($car == $test_car) {
    echo " $car $date $action\n";
    }*/
  $evt[] = $action;
}

fclose($handle);
