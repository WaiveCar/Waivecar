<?php
include('common.php');
logs('16');

$allCars = [];
$weekly = [];
$order = [];
$late = 0;
$early = 7;
$missing = [];

function hour($what) {
  return (intval(date('H', $what)) + 24 - 8) % 24;
}

function at_night($what) {
  global $late, $early;
  return $what > $late && $what < $early;
}

function debit_cards() {
  list($start, $end) = monthRange(['2016','01']); 
  function query($what, $start, $end) {
    $sStart = sqldate($start);
    $sEnd = sqldate($end);
    if($what) {
      $what = "and type $what";
    }
    return one("select count(*) as m from shop_payment_cards where user_id in (select distinct user_id from bookings 
      where created_at > $sStart and created_at < $sEnd) $what and (deleted_at is null or deleted_at > $sEnd) and created_at < $sEnd")['m'];
  }

  while ( true ) {
    $dateStr =sprintf("%d-%02d", $start[0], $start[1]);
    $row = [
      ['date', $dateStr],
      ['all', query(false, $start, $end)],
      ['either', query("is not null", $start, $end)],
      ['credit', query("='credit'", $start, $end)],
      ['debit', query("='debit'", $start, $end)],
      ['unknown', query("is null", $start, $end)],
    ];
    
    if($row[1][1] == 0) {
      break;
    }

    csvrow($row);
    list($start, $end) = monthRange($end);
  }


}

function booking_location() {
  $start = '2018-08-15';
  $end = '2018-10-30';
  $durationMap = [];
  $bookingMap = [];
  $max = 0;
  $dMax = 0;
  $cnt = 0;
  $factor = 4 * 60;
  $heatMap = [];
  $res = [];

  $rowList = all("select * from booking_details where created_at > '$start' and created_at < '$end'");

  foreach($rowList as $row) {
    $id = $row['booking_id'];
    if($row['type'] === 'start') {
      $bookingMap[$id] = [
        'start' => $row['created_at'], 
        'lat' => round($row['latitude'], 4), 
        'lng' => round($row['longitude'], 4)
      ];
    }
    if($row['type'] === 'end' && isset($bookingMap[$id])) {
      $duration = strtotime($row['created_at']) - strtotime($bookingMap[$id]['start']);
      $key = "{$bookingMap[$id]['lat']}|{$bookingMap[$id]['lng']}";
      if(!isset($heatMap[$key])) {
        $heatMap[$key] = ['count' => 0, 'ttl' => 0 ];
      }
      $duration -= (60 * 120);
      $heatMap[$key]['count']++;
      if($duration  < (60 * 60 * 10) && $duration > 0) {
        $heatMap[$key]['ttl'] += $duration;
      } else {
        $heatMap[$key]['ttl'] += 1;
      }
    }
  }
  foreach($heatMap as $key => $value) {
    list($lat, $lng) = explode('|', $key);
    $res[] = [floatval($lat), floatval($lng), max(1,round($value['ttl'] / (60 * $value['count'])))];
  }
  echo json_encode($res);
}

function booking_duration_perbooking() {
  $start = '2016-04-02';
  $end = '2017-07-10';
  $durationMap = [];
  $bookingMap = [];
  $max = 0;
  $dMax = 0;
  $cnt = 0;
  $factor = 4 * 60;

  $rowList = all("select * from booking_details where created_at > '$start' and created_at < '$end'");

  foreach($rowList as $row) {
    $id = $row['booking_id'];
    if($row['type'] === 'start') {
      $bookingMap[$id] = $row['created_at'];
    }
    if($row['type'] === 'end' && isset($bookingMap[$id])) {
      $user = $row['user_id'];
      $duration = strtotime($row['created_at']) - strtotime($bookingMap[$id]);
      $duration = round($duration / $factor) * $factor;
      $duration = min($duration, 21600);
      if(!isset($durationMap[$duration])) {
        $durationMap[$duration] = 0;
      }
      $max = max($max, $duration);
      $durationMap[$duration] ++;
      $dMax = max($dMax, $durationMap[$duration]);
      $cnt ++;
    }
  }
  $mult = $dMax / 180;

  for($ix = 0; $ix <= $max; $ix+= $factor) {
    echo ($ix / 60 ) . " " . $durationMap[$ix] , "\n";
    /*
    if(isset($durationMap[$ix])) {
      for($iy = 0; $iy < $durationMap[$ix]; $iy += $mult) {
        echo '*';
      }
    }
    echo "\n";
     */
  }
  echo $cnt;
}

function booking_duration() {
  $start = '2016-04-02';
  $end = '2017-07-10';
  $durationMap = [];
  $bookingMap = [];
  $max = 0;
  $dMax = 0;
  $cnt = 0;
  $factor = 5 * 60;

  $rowList = all("select *, bd.created_at as created_at from booking_details bd join bookings b on bd.booking_id = b.id where bd.created_at > '$start'");

  foreach($rowList as $row) {
    $id = $row['booking_id'];
    if($row['type'] === 'start') {
      $bookingMap[$id] = $row['created_at'];
    }
    if($row['type'] === 'end' && isset($bookingMap[$id])) {
      $user = $row['user_id'];
      $duration = strtotime($row['created_at']) - strtotime($bookingMap[$id]);
      $duration = min($duration, 21600);
      if(!isset($durationMap[$user])) {
        $durationMap[$user] = [0,0];
      }
      $max = max($max, $duration);
      $durationMap[$user][0] += $duration;
      $durationMap[$user][1] ++;
      $cnt ++;
    }
  }

  for($ix = 0; $ix <= $max; $ix+= $factor) {
    $dList[$ix] = 0;
  }

  foreach($durationMap as $user => $map) {
    if($map[1] > 0) {
      $avg = $map[0] / $map[1]; 
      $avg = round($avg / $factor) * $factor;
      $dList[$avg] ++;
    }
  }

  for($ix = 0; $ix <= $max; $ix+= $factor) {
    echo ($ix / 60) . " " . $dList[$ix] , "\n";
    /*
    if(isset($durationMap[$ix])) {
      for($iy = 0; $iy < $durationMap[$ix]; $iy += $mult) {
        echo '*';
      }
    }
    echo "\n";
     */
  }
  //echo $cnt;
}

function boo() {
  $start = '2017-07-02';
  $end = '2018-05-04';
  $bookingMap = [];

  $rowList = all("select * from booking_details as bd join bookings on bd.booking_id = bookings.id where bd.created_at > '$start' and bd.created_at < '$end' order by bd.created_at asc");

  foreach($rowList as $row) {
	if(!(array_key_exists($row['booking_id'], $bookingMap))) {
		$bookingMap[$row['booking_id']] = [$row['car_id'], $row['mileage']];
	} else {
		$bookingMap[$row['booking_id']][] = $row['mileage'];
	}
  }
  $carMap = [];
  foreach($bookingMap as $row) {
	$car = $row[0];
 	if(!(array_key_exists($car, $carMap))) {
		$carMap[$car] = [];
	}
	if(count($row) > 2) {
		$delta = intval($row[2]) - intval($row[1]);
		if($delta > 0) {
		  $carMap[$car][] = $delta;
		}
	}
  }
  foreach($carMap as $key => $value) {
	if(count($value) > 0) {
  	   echo id2car($key) . " " . array_sum($value) / count($value) . " " . count($value) . "\n";
	}
  }
}

function boo111() {
  $start = '2017-07-02';
  $end = '2018-05-04';
  $bookingMap = [];

  $rowList = all("select * from booking_details as bd join bookings on bd.booking_id = bookings.id where bd.created_at > '$start' and bd.created_at < '$end' order by bd.created_at asc");

  foreach($rowList as $row) {
	if(!(array_key_exists($row['booking_id'], $bookingMap))) {
		$bookingMap[$row['booking_id']] = [$row['car_id'], $row['charge']];
	} else {
		$bookingMap[$row['booking_id']][] = $row['charge'];
	}
  }
  $carMap = [];
  foreach($bookingMap as $row) {
	$car = $row[0];
 	if(!(array_key_exists($car, $carMap))) {
		$carMap[$car] = [];
	}
	if(count($row) > 2) {
		$delta = intval($row[1]) - intval($row[2]);
		if($delta > 5) {
		  $carMap[$car][] = $delta;
		}
	}
  }
  foreach($carMap as $key => $value) {
	if(count($value) > 0) {
  	   echo id2car($key) . " " . array_sum($value) / count($value) . "\n";
	}
  }
exit(0);
  $rowIx = -1;
  $rowTime = 0;
  $row = $rowList[$rowIx];
  $rowTime = strtotime($row['created_at']);
  $lastId = 0;

  for($ix = strtotime($start); $ix < strtotime($end); $ix += 3600) {
    while($rowTime < $ix) {
      $rowIx ++;
      $row = $rowList[$rowIx];
      if($row['type'] === 'start') {
        $bookingMap[$row['booking_id']] = true;
        //echo $row['booking_id'] . '(' . $row['created_at'] . ')';
      }
      if($row['type'] === 'end') {
        unset($bookingMap[$row['booking_id']]);
      }
      $rowTime = strtotime($row['created_at']);// - (7 * 60 * 60);
    }
    $m = ($ix - (7 * 60 * 60));
    if(date('H', $m) === '00') {
      echo "--- " . date('l', $m) . ' ' .( $row['booking_id'] - $lastId ) . "\n";
      $lastId = $row['booking_id'];
    }
    echo date('M d H', $m) . ' '; 
    for($iy = 0; $iy < count($bookingMap); $iy++) {
      echo '*';
    }
    echo "\n";
    // count($bookingMap) . "\n";
  }
}

function booking() {
  $start = '2017-03-02';
  $end = '2017-05-04';
  $bookingMap = [];

  $rowList = all("select * from booking_details where created_at > '$start' and created_at < '$end'");

  $rowIx = -1;
  $rowTime = 0;
  $row = $rowList[$rowIx];
  $rowTime = strtotime($row['created_at']);
  $lastId = 0;
  for($ix = strtotime($start); $ix < strtotime($end); $ix += 3600) {
    while($rowTime < $ix) {
      $rowIx ++;
      $row = $rowList[$rowIx];
      if($row['type'] === 'start') {
        $bookingMap[$row['booking_id']] = true;
        //echo $row['booking_id'] . '(' . $row['created_at'] . ')';
      }
      if($row['type'] === 'end') {
        unset($bookingMap[$row['booking_id']]);
      }
      $rowTime = strtotime($row['created_at']);// - (7 * 60 * 60);
    }
    $m = ($ix - (7 * 60 * 60));
    if(date('H', $m) === '00') {
      echo "--- " . date('l', $m) . ' ' .( $row['booking_id'] - $lastId ) . "\n";
      $lastId = $row['booking_id'];
    }
    echo date('M d H', $m) . ' '; 
    for($iy = 0; $iy < count($bookingMap); $iy++) {
      echo '*';
    }
    echo "\n";
    // count($bookingMap) . "\n";
  }
}

function avail($car = false, $start = false, $period = ONE_WEEK) {
  global $late, $early;
  $tracked = [ 'CREATE_BOOKING', 'COMPLETE_BOOKING', 'MAKE_CAR_UNAVAILABLE', 'MAKE_CAR_AVAILABLE' ];
  $evt = [];
  $all = logs($car, '2017-03-20');
  $one_period = $period;
  $current_period = false;

  foreach($all as $row) {
    $booking = $row['booking_id'];
    $car = $row['car_id'];
    $user = $row['user_id'];
    $action = $row['action'];
    $date_str = $row['created_at'];
    $date = strtotime($date_str);

    if(!$current_period) {
      $current_period = $date;
    }

    // our totals are aggregate over one_period
    if($date - $current_period > $one_period) {
      $duration = ($date - $current_period) / 100;// * (24 - $early - $late) / 24;

      $avg = [0,0,0];
      $car_ttl = 0;
      printf("\n%-12s ava use una sum | ava use una min\n", date("Y-m-d", $current_period));
      foreach($order as $car) {
        // If the car dissappears we ignore it.
        if(!isset($weekly[$car])) {
          if(!isset($missing[$car])) {
            $missing[$car] = 0;
          }
          $missing[$car]++;
          if($missing[$car] < 3) {
             printf(" %11s %3s %3s %3s   - | %3s %3s %3s\n", id2car($car), '-', '-', '-', '-', '-', '-', '-');
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
          printf(" %11s %3d %3d %3d %3d | %3d %3d %3d %f\n", 
            id2car($car), $avail, $unavail, $use, 
            $ttl_accounted,
            $_avail, $_use, $_unavail,
            ($data['ttl'] / $car_duration));
          $car_ttl++;
        }
      }
      $weekly = [];
      $sum = 0;
      $report = [date("Y-m-d", $current_period)];
      foreach($avg as $unit) {
        // so a smaller report for a smaller week should increase.
        $col = round($unit / $car_ttl * ($one_period / ($date - $current_period)));
        $sum += $col;
        $report[] = $col;
      }
      $this_week = $date - $current_period;
      $delta = 1 - ($sum / $one_period);
      echo "$car_ttl Avg:" . implode(',', $report);// . " $sum $one_period ($delta)\n";

      $current_period = $date;
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
        $last = max($allCars[$car]['last'], $current_period);

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
            if($delta <= (180 * 60)) {
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

    } /*else if($car == $test_car) {
      echo " $car $date $action\n";
      }*/
    $evt[] = $action;
  }
}

function availability($car = false, $start = false, $period = ONE_WEEK) {
  global $late, $early;
  $tracked = [ 'CREATE_BOOKING', 'COMPLETE_BOOKING', 'MAKE_CAR_UNAVAILABLE', 'MAKE_CAR_AVAILABLE' ];
  $evt = [];
  $all = logs($car, '2017-03-20');
  $one_period = $period;
  $current_period = false;

  foreach($all as $row) {
    $booking = $row['booking_id'];
    $car = $row['car_id'];
    $user = $row['user_id'];
    $action = $row['action'];
    $date_str = $row['created_at'];
    $date = strtotime($date_str);

    if(!$current_period) {
      $current_period = $date;
    }

    // our totals are aggregate over one_period
    if($date - $current_period > $one_period) {
      $duration = ($date - $current_period) / 100;// * (24 - $early - $late) / 24;

      $avg = [0,0,0];
      $car_ttl = 0;
      printf("\n%-12s ava use una sum | ava use una min\n", date("Y-m-d", $current_period));
      foreach($order as $car) {
        // If the car dissappears we ignore it.
        if(!isset($weekly[$car])) {
          if(!isset($missing[$car])) {
            $missing[$car] = 0;
          }
          $missing[$car]++;
          if($missing[$car] < 3) {
             printf(" %11s %3s %3s %3s   - | %3s %3s %3s\n", id2car($car), '-', '-', '-', '-', '-', '-', '-');
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
          printf(" %11s %3d %3d %3d %3d | %3d %3d %3d %f\n", 
            id2car($car), $avail, $unavail, $use, 
            $ttl_accounted,
            $_avail, $_use, $_unavail,
            ($data['ttl'] / $car_duration));
          $car_ttl++;
        }
      }
      $weekly = [];
      $sum = 0;
      $report = [date("Y-m-d", $current_period)];
      foreach($avg as $unit) {
        // so a smaller report for a smaller week should increase.
        $col = round($unit / $car_ttl * ($one_period / ($date - $current_period)));
        $sum += $col;
        $report[] = $col;
      }
      $this_week = $date - $current_period;
      $delta = 1 - ($sum / $one_period);
      echo "$car_ttl Avg:" . implode(',', $report);// . " $sum $one_period ($delta)\n";

      $current_period = $date;
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
        $last = max($allCars[$car]['last'], $current_period);

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
            if($delta <= (180 * 60)) {
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

    } /*else if($car == $test_car) {
      echo " $car $date $action\n";
      }*/
    $evt[] = $action;
  }
}

function details($car = false, $start = false) {
  $rowList = logs($car, $start);
  foreach($rowList as $row) {
    printf("%20s %10s\n", $row['action'], $row['created_at']);
  }
}

debit_cards();
//booking_location();
//booking_duration();
//details('60000018942E1401', '2017-04-24');
//boo();
//boo111();
//avail();
