import csv, pytz, datetime, re
import dateparser
import MySQLdb as mysql
mysql_connection = mysql.connect(database='waivecar_development', user='waivecar', password='eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X')

with open('./tikd-sheet.csv', 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)
    for i in range(1, len(rows)):
        row = rows[i]
        #if not len(row[19]):
        issue_time = row[13]
        issue_time = re.sub('\.', ':', issue_time)
        issue_date = row[14]
        plate_number = row[17]
        date_time = dateparser.parse(issue_time + ' ' + issue_date)
        local = pytz.timezone('America/Los_Angeles' if row[15] == 'PT' else 'US/Eastern')
        naive = datetime.datetime.strptime (str(date_time), '%Y-%m-%d %H:%M:%S')
        local_dt = local.localize(naive, is_dst=None)
        utc_dt = local_dt.astimezone(pytz.utc)
        cursor = mysql_connection.cursor()
        try:
            cursor.execute('''
            select
              booking.booking_id,
              user.id,
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
                  and booking_details.created_at < "{}"
                  and booking_details.type = "start"
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
            print('row not found: ', row)
            continue
        for i in range(len(item)):
            row[19 + i] = item[i]

    with open('./tikd-result.csv', "w") as output:
        writer = csv.writer(output, lineterminator='\n')
        writer.writerows(rows)

mysql_connection.close()
