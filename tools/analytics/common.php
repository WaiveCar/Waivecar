<?php

$db_instance = false;

define('ONE_WEEK', 7 * 24 * 60 * 60);
function monthRange($start) {
  $next = [$start[0], $start[1] + 1];
  if($next[1] > 12) {
    $next[0] ++;
    $next[1] = 1;
  }
  return [$start, $next];
}


$csvFirst = true;
$csvHandle = false;
function csvrow($row) {
  global $csvFirst, $csvHandle;
  if(!$csvHandle) {
    $csvHandle = fopen('php://stdout', 'w');
  }

  if($csvFirst) {
    fputcsv($csvHandle, array_map(function($obj) { return $obj[0]; }, $row));
    $csvFirst = false;
  }
  fputcsv($csvHandle, array_map(function($obj) { return $obj[1]; }, $row));
}

function sqldate($what) {
  return sprintf("'%d-%02d'", $what[0], $what[1]);
}

function db() {
  global $db_instance;
  if(!$db_instance) {
    $db_instance = @mysqli_connect('localhost', 'root', '', 'waivecar_development');
  }
  return $db_instance;
}

function all($qstr) {
  $qres = mysqli_query(db(), $qstr);
  while(($rowList[] = mysqli_fetch_assoc($qres)) !== NULL);
  array_pop($rowList);
  return $rowList;
}

function one($qstr) {
  $res = all($qstr);
  return $res[0];
}

function car2id($car) {
  if(strlen($car) < 8) {
    $row = one("select id from cars where license like '%$car%'");
    $car = $row['id'];
  }
  return $car;
}

$id_map = [];
function id2car($id) {
  global $id_map;
  if(!isset($id_map[$id])) {
    $row = one("select license from cars where id='$id'");
    $id_map[$id] = $row['license'];
  }
  return $id_map[$id];
}

function logs($car = false, $start = false) {
  $id = car2id($car);
  $where = []; 

  if($car) {
    $where[] = "car_id = '$id'";
  }

  if($start) {
    $where[] = "created_at > '$start'";
  }

  if(count($where) > 0) {
    $where = ' where ' . implode(' and ', $where);
  }

  $qstr = "select * from logs $where order by id asc";

  return all($qstr);
}
