#!/usr/bin/env python3
import MySQLdb as mysql
import json
import os
import sys
db_config = json.loads(sys.argv[1])

mysql_connection = mysql.connect(database=db_config['database'], user=db_config['username'], password=db_config['password'])
cursor = mysql_connection.cursor()

def get_sit_times():
    cursor.execute("""select bookings.id, bookings.car_id, booking_details.type, booking_details.longitude,
    booking_details.latitude, booking_details.created_at from bookings
    join booking_details on bookings.id = booking_details.booking_id 
    where bookings.created_at > '2018-09-01'
    order by car_id desc, bookings.created_at asc
    ;""")

    line = cursor.fetchone()
    count = 0
    for row in cursor:
        count += 1
    print("{} lines".format(count))

    i = 1
    endtime = 0
    sitTime = []
    
    while line:
        if i == 1:
            i+=1
            line = cursor.fetchone()
        else:
            carId = line[1]
            while line and line[1] == carId:
                if line[2] == 'end':
                    endTime = line[5]
                    longEnd = round(line[3], 3)
                    latEnd = round(line[4], 3)
                else:
                    startTime = line[5]
                    timeBetween = startTime - endTime
                   
                    longStart= round(line[3], 3)
                    latStart = round(line[4], 3)
                    if longStart == longEnd and latStart == latEnd:
                        sitTime += [(round(line[4]*2,3)/2, round(line[3]*2,3)/2, timeBetween.seconds, line[0])]
                i += 1
                line = cursor.fetchone()
            
            line = cursor.fetchone()
    print(sitTime)   
    
    averages = {}
    for i in sitTime:
        points = (round(i[0]*2, 3)/2 , round(i[1]*2, 3)/2)
        seconds = i[2]
        if points in averages:
            averages[points] += [seconds]
        else:
            averages[points] = [seconds]
      
    for i in averages.keys():
        av = sum(averages[i])/len(averages[i])
        averages[i] = av
    
    
    realSitTime= []
    for i in averages.keys():
        long = i[0]
        lat = i[1]
        time = averages[i]
        realSitTime += [(long, lat, time)]
    
    
    with open("sit-time-points.js", "w") as outfile:  
        outfile.write("{}{}".format("var points=", json.dumps(realSitTime)))


if __name__ == "__main__":
    cursor.execute("select * from booking_details order by id desc limit 10")
    get_sit_times()
    mysql_connection.close()

