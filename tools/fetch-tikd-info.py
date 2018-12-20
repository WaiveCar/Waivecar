import csv, pytz, datetime
import MySQLdb as mysql
mysql_connection = mysql.connect(database='waivecar_development', user='waivecar', password='eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X')
cursor = mysql_connection.cursor()

with open('./tikd-sheet.csv', 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)
    for i in range(1, len(rows)):
        row = rows[i]
        if not len(row[18]):
            issue_time = row[13]
            issue_date = row[14]
            plate_number = row[16]
            local = pytz.timezone ('America/Los_Angeles')
            naive = datetime.datetime.strptime ('{} {}'.format(issue_date, issue_time), '%m/%d/%Y %H:%M:%S %p')
            local_dt = local.localize(naive, is_dst=None)
            utc_dt = local_dt.astimezone(pytz.utc)
            try:
                cursor.execute('''
                    select 
                      license, 
                      plate, 
                      booking_id, 
                      info.user_id, 
                      info.stripe_id, 
                      licenses.number, 
                      info.email, 
                      info.phone,
                      info.first_name, 
                      info.last_name, 
                      licenses.street_1, 
                      licenses.street_2, 
                      licenses.city, 
                      licenses.state, 
                      licenses.zip 
                    from 
                      (
                        select 
                          booking.car_id, 
                          booking.license, 
                          booking.plate, 
                          booking.user_id, 
                          booking.booking_id, 
                          users.email, 
                          users.first_name, 
                          users.last_name, 
                          users.phone,
                          users.stripe_id 
                        from 
                          (
                            select 
                              car.id as car_id, 
                              car.license, 
                              car.plate, 
                              bookings.id as booking_id, 
                              bookings.user_id 
                            from 
                              (
                                select 
                                  id, 
                                  license, 
                                  plate_number as plate 
                                from 
                                  cars 
                                where 
                                  plate_number = "{}"
                              ) as car 
                              right join bookings on bookings.car_id = car.id 
                            where 
                              bookings.car_id = car.id 
                              and bookings.created_at < '{}' 
                            order by 
                              bookings.id desc 
                            limit 
                              1
                          ) as booking 
                          right join users on booking.user_id = users.id 
                        where 
                          booking.user_id = users.id
                      ) as info 
                      right join licenses on licenses.user_id = info.user_id 
                    where 
                      licenses.user_id = info.user_id;
                '''.format(plate_number, utc_dt))
            except exception as e:
                print('error executing query: ', e)
            for item in cursor:
                row[15] = item[0]
                for i in range(1, len(item)):
                    row[16 + i] = item[i]
    with open('./tikd-result.csv', "w") as output:
        writer = csv.writer(output, lineterminator='\n')
        writer.writerows(rows)

mysql_connection.close()
