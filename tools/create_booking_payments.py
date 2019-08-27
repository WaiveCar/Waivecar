import MySQLdb as mysql
import datetime
#The lines below need to be toggled for prod
mysql_connection = mysql.connect(database='waivecar_development', user='waivecar', password='eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X')
#mysql_connection = mysql.connect(database='waivecar_production', user='waivecar_prod', password='Lh4Ds2wAxzlF4e')

# Selecting all the currently open waivework bookings
cursor = mysql_connection.cursor()
cursor.execute("""
    select id, user_id, created_at from bookings where flags like "%work%" and status not in ('ended','completed','closed');
""")
bookings_to_process = [row for row in cursor]

for booking in bookings_to_process:
    cursor.execute("""
        select shop_orders.id, booking_payments.id from shop_orders left outer join booking_payments on shop_orders.id=booking_payments.order_id where shop_orders.created_at > "{}" and user_id={}
    """.format(booking[2], booking[1]))
    shop_orders = [row for row in cursor]
    now = datetime.datetime.now()
    for order in shop_orders:
        if not order[1]:
            cursor.execute("""insert into booking_payments (booking_id, order_id, created_at, updated_at) values ({}, {}, "{}", "{}")""".format(booking[0], order[0], now, now))

mysql_connection.commit()
