<?php
include('common.php');

function dodate($what) {
  return sprintf("'%d-%02d'", $what[0], $what[1]);
}

$current = [2016, 5];
$last = [2016, 4];
$setList = [ 'users', 'waitlist', 'bookings'];

$handle = fopen('php://stdout', 'w');
$first = true;
while ( true ) {
  $count = [['date', dodate($last)]];

  $res = all("select * from booking_details bd join bookings bk on bk.id = bd.booking_id where bd.created_at > " . dodate($last) . " and bd.created_at < " . dodate($current) . " order by bd.booking_id asc, bd.created_at asc");

  if(count($res) === 0) { 
    break; 
  }

  $current_booking = false;
  $car_map = [];
  $ttl_month = 0;
  $day_map = [];
  $userList = [];
  foreach($res as $row) {
    $userList[] = $row['user_id'];
    if($row['type'] === 'start') {
      $current_booking = $row;
    } else {
      if($row['booking_id'] === $current_booking['booking_id']) {
        $duration = strtotime($row['updated_at']) - strtotime($current_booking['created_at']);
        if($duration < (18 * 60 * 60)) {
          $d = strtotime($row['updated_at']);
          $day = date('j', $d);
          if(!array_key_exists($day, $day_map)) {
            $day_map[$day] = [];
          }
          $day_map[$day][$row['car_id']] = true;

          $ttl_month += $duration;
        }
      }
    }
  }
  $res = all("select * from logs where created_at > " . dodate($last) . " and created_at < " . dodate($current) . " and action in ('END_BOOKING','CREATE_BOOKING', 'MAKE_CAR_AVAILABLE', 'MAKE_CAR_UNAVAILABLE') order by id asc");

  $count[] = ['unique users', count(array_unique($userList))];
  $carMap = [];
  $idleList = [];
  $bookList = [];
  foreach($res as $row) {
    $hour = (intval(date('G', strtotime($row['created_at']))) + 16) % 24;
    if($hour > 21 || $hour < 8) {
      $carMap[$row['car_id']] = false;
    } else {
      if(array_key_exists($row['car_id'], $carMap)) {
	//echo $row['car_id'] . " " . $row['action'] . "\n";
        if($row['action'] === 'CREATE_BOOKING' && in_array($carMap[$row['car_id']]['action'], ['END_BOOKING', 'MAKE_CAR_AVAILABLE'])) {
          $duration = strtotime($row['created_at']) - strtotime($carMap[$row['car_id']]['created_at']);
          $idleList[] = $duration;
        } else if($row['action'] === 'END_BOOKING' && $carMap[$row['car_id']]['action'] === 'CREATE_BOOKING') {
          $duration = strtotime($row['created_at']) - strtotime($carMap[$row['car_id']]['created_at']);
          $bookList[] = $duration;
        }
      }
      $carMap[$row['car_id']] = $row;
    }
  }
  if(count($idleList) === 0) {
    $avg_available = 0;
  } else {
    sort($idleList);
    $avg_available = $idleList[ ceil(count($idleList) / 2)];// array_sum($idleList) / count($idleList);
    $mean_available = array_sum($idleList) / count($idleList);
  }
  $avail_util = 0;
  if(count($bookList) !== 0 && count($idleList) !== 0) {
    $avail_util = array_sum($bookList) / (array_sum($bookList) + array_sum($idleList));
  }
  $count[] = ['median available time between bookings', $avg_available];
  $count[] = ['mean available time between bookings', $mean_available];
  $count[] = ['utilization when available', $avail_util];

  $total_active = 0;
  foreach($day_map as $day => $carList) {
    $total_active += count(array_keys($carList));
  }
  
  // 365/12(months) * 12(hours)
  $utilization = ($ttl_month / 60) / ($total_active * 60 * 12);
  $count[] = ['utilization', $utilization];
  //echo  dodate($last) . " " . $total_active . " " . $utilization . "\n";

  foreach($setList as $set) {
    $res = one("select count(*) as ttl from $set where created_at > " . dodate($last) . " and created_at < " . dodate($current));
    $count[] = [$set, $res['ttl']];
  }
  $last = $current;
  $current[1] ++;
  if($current[1] === 13) {
    $current[1] = 1;
    $current[0]++;
  }

  if($first) {
    fputcsv($handle, array_map(function($row) { return $row[0]; }, $count));
    $first = false;
  }
  fputcsv($handle, array_map(function($row) { 
	$m = round($row[1] < 1 ? $row[1] * 100 : $row[1], 2); 
	if($m == 0) { return $row[1] ;}
	return $m;
  }, $count));
}

