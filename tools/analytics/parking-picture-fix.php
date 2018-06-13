<?php
include('common.php');

$db = db();
$res = mysqli_query($db, "select pd.created_at as dt, booking_details.booking_id as bid, .pd.id as pdid, files.path from parking_details pd 
  join booking_details on pd.booking_detail_id = booking_details.id
  join files on files.id = pd.street_sign_image 
where pd.path is null or pd.booking_id is null order by pd.created_at desc");

$ct = 0;
while( ( $row = mysqli_fetch_assoc($res) ) !== null ) {
  $ct ++;
  $path = $row['path'];
  $id = $row['pdid'];
  $bid = $row['bid'];
  $time = $row['dt'];
  mysqli_query($db, "update parking_details set path='$path', booking_id=$bid where id=$id");
  if($ct % 400 == 0) {
    echo "$ct... ($time)\n";
  }
}
