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
    booking_details.latitude, booking_details.created_at, bookings.user_id from bookings
    join booking_details on bookings.id = booking_details.booking_id 
    where date(bookings.created_at) > date('2018-09-01') 
    and hour(bookings.created_at) between 7 + 7 and 20 + 7 
    order by car_id desc, bookings.created_at asc
    ;""")
    count = 0
    for row in cursor:
        count += 1
    print("{} rows".format(count))

    line = cursor.fetchone()
    count = 0
    for row in cursor:
        count += 1
    print("{} lines".format(count))

    i = 1
    endtime = 0
    sitTime = []
    mult = 200.0
    
    while line:
        if i == 1:
            i+=1
            line = cursor.fetchone()
        else:
            carId = line[1]
            while line and line[1] == carId:
                if line[2] == 'end':
                    endTime = line[5]
                    longEnd = round(line[3] * mult) / mult
                    latEnd = round(line[4] * mult) / mult
                else:
                    startTime = line[5]
                    timeBetween = startTime - endTime
                   
                    longStart= round(line[3] * mult) / mult
                    latStart = round(line[4] * mult) / mult
                    if longStart == longEnd and latStart == latEnd:
                        sitTime += [(round(line[4]*2 * mult)/(2 * mult), round(line[3]*2 * mult)/(2 * mult), timeBetween.seconds, line[0], line[6])]
                i += 1
                line = cursor.fetchone()
            
            line = cursor.fetchone()
    print(sitTime) 
    averages = {}
    for i in sitTime:
        points = (round(i[0]*2 * mult)/(2 * mult) , round(i[1]*2 * mult)/(2 * mult))
        seconds = i[2]
        if points in averages:
            averages[points] += [seconds]
        else:
            averages[points] = [seconds]
      
    for i in averages.keys():
        av = sum(averages[i])/len(averages[i])
        averages[i] = [av, len(averages[i])]
    
    
    realSitTime= []
    for i in averages.keys():
        long = i[0]
        lat = i[1]
        time = averages[i][0]
        freq = averages[i][1]
        realSitTime += [(long, lat, time, freq)]
    
    
    with open("sit-time-points.js", "w") as outfile:  
        outfile.write("{}{}".format("var points=", json.dumps(realSitTime)))
    # The indicies in the subarray are [lat, lng, sit_time, booking_id, user_id]
    return sitTime


if __name__ == "__main__":
    cursor.execute("select * from booking_details order by id desc limit 10")
    sit_times = get_sit_times()
    mysql_connection.close()

