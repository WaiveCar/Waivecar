<?php
include('common.php');

$cardList = all('select 
  shop_payment_cards.id as card, stripe_id from users 
  join shop_payment_cards on shop_payment_cards.user_id = users.id 
    and shop_payment_cards.deleted_at is null
    and shop_payment_cards.type is null
');

$ix = 0;
echo "Total: " . count($cardList) . "\n"; 
foreach($cardList as $card) {
  $id = $card['card'];
  $res = curldo(
    "https://api.stripe.com/v1/customers/${card['stripe_id']}/sources/$id",
    ['user' => 'sk_live_cJmUPQAyZcQG67pnUEH81Bi5']
  );

  if($res && !empty($res['funding'])) {
    $name = mysqli_real_escape_string(db(), $res['name']);
    $type = mysqli_real_escape_string(db(), $res['funding']);

    $qres = mysqli_query(db(), "update shop_payment_cards set name='$name', type='$type' where id='$id'");
  }

  $ix ++;
  echo '.';
  if($ix % 10 === 0) {
    echo ' ';
    if($ix % 40 === 0) {
      echo " $ix\n";
    }
  }
}
