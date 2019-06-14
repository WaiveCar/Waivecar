import MySQLdb as mysql
import datetime
import dateutil.relativedelta
mysql_connection = mysql.connect(database='waivecar_development', user='waivecar', password='eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X')
#mysql_connection = mysql.connect(database='waivecar_production', user='waivecar_prod', password='Lh4Ds2wAxzlF4e')

today = datetime.datetime.strptime(datetime.datetime.today().strftime('%Y-%m-%d'), "%Y-%m-%d")
month_ago = (today - dateutil.relativedelta.relativedelta(months=1)).strftime('%Y-%m-%d')

cursor = mysql_connection.cursor()
cursor.execute('''
SELECT car_id, 
       bookings.booking_id, 
       bookings.data * 0.621371, 
       total_mileage * 0.621371, 
       ( total_mileage - bookings.data ) * 0.621371 
FROM   waivework_payments 
       JOIN (SELECT a.booking_id, 
                    a.car_id, 
                    a.data, 
                    total_mileage 
             FROM   (SELECT bookings.id      AS booking_id, 
                            bookings.car_id, 
                            car_history.data AS data 
                     FROM   bookings 
                            JOIN car_history 
                              ON bookings.car_id = car_history.car_id 
                     WHERE  car_history.created_at LIKE "{}%") AS a 
                    JOIN cars 
                      ON a.car_id = cars.id) AS bookings 
         ON waivework_payments.booking_id = bookings.booking_id 
WHERE  booking_payment_id IS NULL 
       AND waivework_payments.deleted_at IS NULL 
GROUP  BY bookings.car_id;'''.format(month_ago))

print('(car id, booking id, mileage a month ago, current mileage, mileage difference)')
for line in cursor:
    print(line)

cursor.execute('''
SELECT ( Sum(diff) / Count(diff) ) * 0.621371 
FROM   (SELECT car_id, 
               bookings.booking_id, 
               bookings.data, 
               total_mileage, 
               total_mileage - bookings.data AS diff 
        FROM   waivework_payments 
               JOIN (SELECT a.booking_id, 
                            a.car_id, 
                            a.data, 
                            total_mileage 
                     FROM   (SELECT bookings.id      AS booking_id, 
                                    bookings.car_id, 
                                    car_history.data AS data 
                             FROM   bookings 
                                    JOIN car_history 
                                      ON bookings.car_id = car_history.car_id 
                             WHERE  car_history.created_at LIKE "{}%") AS a 
                            JOIN cars 
                              ON a.car_id = cars.id) AS bookings 
                 ON waivework_payments.booking_id = bookings.booking_id 
        WHERE  booking_payment_id IS NULL 
               AND waivework_payments.deleted_at IS NULL 
        GROUP  BY bookings.car_id) AS b; '''.format(month_ago))

for line in cursor:
    print("Average of all cars in the last month: ", line)

