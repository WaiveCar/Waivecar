#!/bin/bash
user=$1;
cat > /tmp/delete-user.sql << ENDL
 delete from logs where user_id=$user or actor_id=$user or booking_id in (select id from bookings where user_id=$user);
 delete from parking_details where booking_detail_id in (select id from booking_details where booking_id in (select id from bookings where user_id=$user));
 delete from booking_details where booking_id in (select id from bookings where user_id=$user);
 delete from booking_payments where booking_id in (select id from bookings where user_id=$user);
 delete from booking_locations where booking_id in (select id from bookings where user_id=$user);
 delete from report_files where report_id in (select id from reports where booking_id in (select id from bookings where user_id=$user));
 delete from reports where booking_id in (select id from bookings where user_id=$user);
 delete from shop_order_items where order_id in (select id from shop_orders where user_id=$user);
 delete from log_events where user_id=$user;
 delete from bookings where user_id=$user;
 delete from group_users where user_id=$user;
 delete from licenses where user_id=$user;
 delete from files where user_id=$user;
 delete from shop_orders where user_id=$user;
 delete from shop_payment_cards where user_id=$user;
 delete from user_notes where user_id=$user;
 delete from waitlist where user_id=$user;
 delete from users where id=$user;
ENDL
mysql -uroot waivecar_development < /tmp/delete-user.sql
