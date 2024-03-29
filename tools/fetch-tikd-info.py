import csv, pytz, datetime, re
import dateparser
import MySQLdb as mysql
#mysql_connection = mysql.connect(database='waivecar_development', user='waivecar', password='eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X')
mysql_connection = mysql.connect(database='waivecar_production', user='waivecar_prod', password='Lh4Ds2wAxzlF4e')
import time

start = time.time()
with open('./tikd-sheet-1.csv', 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)
    for i in range(1, len(rows)):
        row = rows[i]
        if not len(row[22]):
            issue_time = row[19]
            issue_time = re.sub('\.', ':', issue_time)
            issue_date = row[18]
            plate_number = row[5]
            date_time = dateparser.parse(issue_time + ' ' + issue_date)
            local = pytz.timezone('America/Los_Angeles')
            naive = datetime.datetime.strptime(str(date_time), '%Y-%m-%d %H:%M:%S')
            local_dt = local.localize(naive, is_dst=None)
            utc_dt = local_dt.astimezone(pytz.utc).replace(tzinfo=None)
            cursor = mysql_connection.cursor()
            try:
                cursor.execute('''
                select
                  booking.booking_id,
                  user.stripe_id,
                  user.number,
                  user.email,
                  user.phone,
                  user.first_name,
                  user.last_name,
                  user.street_1,
                  user.street_2,
                  user.city,
                  user.state,
                  user.zip
                from
                  (
                    select
                      bookings.id as booking_id,
                      bookings.user_id
                    from
                      bookings
                      right join booking_details on booking_details.booking_id = bookings.id
                    where
                      bookings.car_id =(
                        select
                          id
                        from
                          cars
                        where
                          plate_number = "{}"
                      )
                      and booking_details.created_at < '{}'
                    order by
                      booking_details.id desc
                    limit
                      1
                  ) as booking
                  right join (
                    select
                      users.id as id,
                      users.email,
                      users.phone,
                      users.first_name,
                      users.last_name,
                      users.stripe_id,
                      licenses.number,
                      licenses.street_1,
                      licenses.street_2,
                      licenses.city,
                      licenses.state,
                      licenses.zip
                    from
                      users
                      right join licenses on licenses.user_id = users.id
                  ) as user on booking.user_id = user.id
                where
                  booking.user_id = user.id;
                '''.format(plate_number, utc_dt))
            except Exception as e:
                print('error executing query: ', e)
            item = cursor.fetchone()

            if not item:
                row[22] = 'plate number not found'
                print('row not found: ', row, '\n This is probably due to the plate number being missing or wrong in the database')
                continue
            cursor.execute('select created_at, type from booking_details where booking_id = {} and type="end"'.format(item[0]))
            booking_end = cursor.fetchone()
            user_responsibility = True
            cursor.execute('select street_hours from parking_details where booking_id = {}'.format(item[0]))
            parking_detail = cursor.fetchone()
            if booking_end:
                difference = (utc_dt.replace(tzinfo=None) - booking_end[0]).total_seconds()
                is_sm = True if re.search('santa monica', row[3], re.IGNORECASE) else False
                max_time = 3600 * 3 if is_sm else 3600 * 12
                if difference > max_time and not (parking_detail and parking_detail[0] * 3600 > difference):
                    user_responsibility = False
            if user_responsibility:
                for i in range(len(item)):
                    row[22 + i] = item[i]
            else:
                row[22] = 'waivecar ticket'


    with open('./tikd-result-1.csv', 'w') as output:
        writer = csv.writer(output, lineterminator='\n')
        writer.writerows(rows)

mysql_connection.close()

end = time.time()

print('time elapsed: ', end - start)
