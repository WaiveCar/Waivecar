<?php
 $db = @mysqli_connect('localhost', 'root', '', 'waivecar_development');
 $res = mysqli_query($db, 'select * from booking_locations bl join bookings b on bl.booking_id = b.id join users u on b.user_id = u.id where bl.created_at > "2017-04-30" order by bl.id asc');
 $map = [];

 $bk = [];
 while($row = mysqli_fetch_assoc($res)) {
   $bkid = $row['user_id'];
   $bkreal = $row['booking_id'];
   $loc = $row['latitude'] . ':' . $row['longitude']; 
   if(!isset($bk[$bkreal])) {
     $bk[$bkreal] = 1;
   } else {
     $bk[$bkreal]++;
   }

   if($bk[$bkreal] > 420) { continue; }

   if(!isset($map[$bkid])){
     $map[$bkid] = [
       'name' => $row['first_name'] . ' ' . $row['last_name'],
       'last' => $loc,
       'total' => 0,
       'moving' => 0
     ];
   } else {
     $map[$bkid]['total'] ++;
     if($loc != $map[$bkid]['last']) {
       $map[$bkid]['moving'] ++;
       $map[$bkid]['last'] = $loc;
     }
   }
 }
 echo implode(',', ['user#', 'duration', 'utilization']) . "\n" ;
 $total = 0;
 $moving = 0;
 foreach($map as $bkid => $row) {
   if($row['total'] > 10 && $row['total'] < 30000) {
     #$moving += $row['moving'];
     #$total += $row['total']; 
     echo implode(',', [$row['name'], $row['total'] * 0.75, $row['moving'] / $row['total']]) . "\n";
   }
 }
echo $moving . ' ' . $total;
?>


