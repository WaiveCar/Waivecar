<?php

$db_instance = false;

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
