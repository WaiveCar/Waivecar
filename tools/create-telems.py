import MySQLdb as mysql
import datetime
#The lines below need to be toggled for prod
mysql_connection = mysql.connect(database='waivecar_development', user='waivecar', password='eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X')
#mysql_connection = mysql.connect(database='waivecar_production', user='waivecar_prod', password='Lh4Ds2wAxzlF4e')

# Selecting all the currently open waivework bookings
cursor = mysql_connection.cursor()
cursor.execute("""
    select id from cars;
""")
cars_to_process = [row for row in cursor]
for car in cars_to_process:
    print(car[0])
    try:
        cursor.execute("""
            insert into telematics(car_id, telem_id, created_at, updated_at, deleted_at, last_seen_at) values("{}", "{}", CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), NULL, NULL);
        """.format(car[0], car[0]))
    except Exception as e:
        print('error', e)
        

mysql_connection.commit()

