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

function curldo($url, $params = [], $verb = 'GET') {
  $verb = strtoupper($verb);
  $ch = curl_init();

  if(!empty($params['header'])) {
    $header = $params['header'];
  } else {
    $header = [];
  }
    
  if($verb !== 'GET') {
    if(!isset($params['isFile'])) {
      if(!$params) {
        $params = [];
      }
      $params = json_encode($params);
      $header[] = 'Content-Type: application/json';
    } else {
      $header[] = 'Content-Type: multipart/form-data';
    }
    curl_setopt($ch, CURLOPT_POSTFIELDS, $params);  
  }

  if($verb === 'POST') {
    curl_setopt($ch, CURLOPT_POST,1);
  }

  if(!empty($params['user'])) {
    curl_setopt($ch, CURLOPT_USERPWD, $params['user']);
  }
  if(!empty($header)) {
    curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
  }
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $verb);  
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

  $res = curl_exec($ch);
  
  $resJSON = @json_decode($res, true);
  if($resJSON) {
    return $resJSON;
  }
  return $res;
}
