#!/bin/bash
path=$1
db=$2
[ -e $1 ] && sudo rm $1

mysql -uroot $2 << ENDL
  create temporary table if not exists total_bookings AS (
    SELECT count(*) as count, user_id FROM bookings group by user_id
  );

  create temporary table if not exists completed_bookings AS (
    SELECT count(*) as count, user_id FROM bookings 
      where status in ('completed', 'ended')
      group by user_id 
  );

  create temporary table if not exists credit_card_count as (
   select count(distinct exp_month,last_4) as count, user_id from shop_payment_cards group by user_id
  );

  select 
      distinct users.id, 
      concat(users.first_name, " ", users.last_name) as name, 
      phone, 
      email, 
      DATE_FORMAT(users.created_at, '%d/%m/%Y') as signup, 
      REPLACE(birth_date, '-', '/') as birth_date,
      users.status as status,
      outcome,
      credit,
      COALESCE(total_bookings.count,'0') as booking_count,
      COALESCE(completed_bookings.count,'0') as completed_bookings,
      COALESCE(credit_card_count.count,'0') as credit_card_count
    from users 
      left join licenses on users.id = licenses.user_id
      left join total_bookings on users.id = total_bookings.user_id
      left join completed_bookings on users.id = completed_bookings.user_id
      left join credit_card_count on users.id = credit_card_count.user_id
    where 
      users.status != 'suspended' and 
      users.deleted_at is null 
      INTO OUTFILE '$1'
      FIELDS TERMINATED BY ',' 
      ENCLOSED BY '"' LINES 
      TERMINATED BY '\n';

  drop table total_bookings;
  drop table completed_bookings;
  drop table credit_card_count;
ENDL

sudo mv $1 /tmp/all-users.csv
cat /tmp/all-users.csv | tail
