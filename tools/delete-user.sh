#!/bin/bash
user=$1;
cat > /tmp/delete-user.sql << ENDL
 delete from logs where user_id=$user or actor_id=$user or booking_id in (select id from bookings where user_id=$user);
 delete from reports where booking_id in (select id from bookings where user_id=$user);
 delete from booking_details where booking_id in (select id from bookings where user_id=$user);
 delete from booking_locations where booking_id in (select id from bookings where user_id=$user);
 delete from bookings where user_id=$user;
 delete from files where user_id=$user;
 delete from group_users where user_id=$user;
 delete from licenses where user_id=$user;
 delete from shop_orders where user_id=$user;
 delete from shop_payment_cards where user_id=$user;
 delete from users where id=$user;
ENDL
echo 'mysql -uroot waivecar_production < /tmp/delete-user.sql'
