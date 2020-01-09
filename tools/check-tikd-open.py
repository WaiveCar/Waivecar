import csv
import MySQLdb as mysql
#mysql_connection = mysql.connect(database='waivecar_development', user='waivecar', password='eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X')
mysql_connection = mysql.connect(database='waivecar_production', user='waivecar_prod', password='Lh4Ds2wAxzlF4e')
import time

with open('./Waivecar_open_service_started_events.csv', 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)
    print(rows[1][0])
    cursor = mysql_connection.cursor()
    for row in rows[1:]:
        booking_id = row[0].split('-')[1]
        cursor.execute('''
            select status from bookings where id={}
        '''.format(booking_id))
        item = cursor.fetchone()
        row.append(item[0])
    with open('./tikd-closed-bookings.csv', 'w') as output:
        writer = csv.writer(output, lineterminator='\n')
        writer.writerows(rows)

mysql_connection.close()

