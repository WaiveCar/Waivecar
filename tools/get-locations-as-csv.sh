#!/bin/sh

fname=/tmp/locations-`date +"%Y%m%d-%H%M"`.csv

mysql -uroot waivecar_production << ENDL
select cars.license,bl.longitude,bl.latitude,bl.created_at from 
        booking_locations as bl 
                left join bookings on bl.booking_id = bookings.id 
                left join cars on cars.id = bookings.car_id 
        order by bl.created_at desc 
        INTO OUTFILE '$fname' FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';
ENDL

zip -9 ${fname}.zip ${fname}
echo "created ${fname}.zip"

