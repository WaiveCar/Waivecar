import MySQLdb as mysql
import datetime
import dateutil.relativedelta
mysql_connection = mysql.connect(database='waivecar_development', user='waivecar', password='eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X')
#mysql_connection = mysql.connect(database='waivecar_production', user='waivecar_prod', password='Lh4Ds2wAxzlF4e')

today = datetime.datetime.strptime(datetime.datetime.today().strftime('%Y-%m-%d'), "%Y-%m-%d")
month_ago = (today - dateutil.relativedelta.relativedelta(months=1)).strftime('%Y-%m-%d')

cursor = mysql_connection.cursor()
cursor.execute('select car_id, bookings.booking_id, bookings.data, total_mileage, total_mileage - bookings.data from waivework_payments join (select a.booking_id, a.car_id, a.data, total_mileage from (select bookings.id as booking_id, bookings.car_id, car_history.data as data from bookings join car_history on bookings.car_id=car_history.car_id where car_history.created_at like "{}%") as a join cars on a.car_id=cars.id) as bookings on waivework_payments.booking_id=bookings.booking_id where booking_payment_id is null and waivework_payments.deleted_at is null group by bookings.car_id;'.format(month_ago))


for line in cursor:
    print(line)
