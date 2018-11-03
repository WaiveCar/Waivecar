#!/usr/bin/env python3
import MySQLdb as mysql
import json
import os
import sys
from statistics import pstdev, stdev 

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

    line = cursor.fetchone()

    i = 1
    end_time = 0
    sit_time = []
    mult = 200.0
    
    while line:
        if i == 1:
            i+=1
            line = cursor.fetchone()
        else:
            carId = line[1]
            while line and line[1] == carId:
                if line[2] == 'end':
                    end_time = line[5]
                    long_end = round(line[3] * mult) / mult
                    lat_end = round(line[4] * mult) / mult
                else:
                    start_time = line[5]
                    time_between = start_time - end_time
                   
                    long_start= round(line[3] * mult) / mult
                    lat_start = round(line[4] * mult) / mult
                    if long_start == long_end and lat_start == lat_end:
                        sit_time += [(round(line[4]*2 * mult)/(2 * mult), round(line[3]*2 * mult)/(2 * mult), time_between.seconds, line[0], line[6])]
                i += 1
                line = cursor.fetchone()

            line = cursor.fetchone()
    averages = {}
    for i in sit_time:
        points = (round(i[0]*2 * mult)/(2 * mult) , round(i[1]*2 * mult)/(2 * mult))
        seconds = i[2]
        if points in averages:
            averages[points] += [seconds]
        else:
            averages[points] = [seconds]
      
    for i in averages.keys():
        av = sum(averages[i])/len(averages[i])
        averages[i] = [av, len(averages[i])]
    
    
    real_sit_time= []
    for i in averages.keys():
        long = i[0]
        lat = i[1]
        time = averages[i][0]
        freq = averages[i][1]
        real_sit_time += [(long, lat, time, freq)]
    
    
    with open("sit-time-points.js", "w") as outfile:  
        outfile.write("{}{}".format("var points=", json.dumps(real_sit_time)))
    # The indicies in the subarray are [lat, lng, sit_time, booking_id, user_id]
    return sit_time
    #return list(map(lambda x: x[2], sit_time))

def get_standard_deviation(sit_times):
    only_times = list(map(lambda x: x[2], sit_times))
    return stdev(only_times)

def get_outlier_bookings(standard_deviation, sit_times, percent_outside_accepted):
    outliers = list(filter(lambda x: abs(standard_deviation - x[2]) > standard_deviation + ((percent_outside_accepted / 100) * standard_deviation) , sit_times))
    return outliers

def outliers_by_user(booking_list):
    outliers_counts = {}
    for user in booking_list:
        if user[4] in outliers_counts:
            outliers_counts[user[4]] += 1
        else:
            outliers_counts[user[4]] = 1
    users_list = list(filter(lambda x: outliers_counts[x], outliers_counts))
    users_list = list(map(lambda x: str(x), users_list))
    query = "select id, first_name, last_name from users where id in ({});".format(", ".join(users_list))
    cursor.execute(query)
    user_names = {a : (b, c) for a, b, c in cursor}
    query = "select user_id, count(id) from bookings where user_id in ({}) group by user_id;".format(", ".join(users_list))
    cursor.execute(query)
    bookings_counts = {a : b for a, b in cursor}
    user_ratios = {}
    for key in outliers_counts:
        user_ratios[key] = {
            "ratio": outliers_counts[key] / bookings_counts[key],
            "bookings": bookings_counts[key],
            "outliers": outliers_counts[key]
        }
    output = {}
    for user in user_names:
        output[user_names[user]] = user_ratios[user]
    for row in output:
        print(row, ": ", output[row])

    return user_ratios

if __name__ == "__main__":
    sit_times = get_sit_times()
    standard_deviation = get_standard_deviation(sit_times)
    outliers = get_outlier_bookings(standard_deviation, sit_times, 0)
    users_with_outliers = outliers_by_user(outliers) 
    mysql_connection.close()

