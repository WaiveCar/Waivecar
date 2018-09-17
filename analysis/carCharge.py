#!/usr/bin/python
import MySQLdb as mariadb
import json
#import pprint
#import matplotlib.pyplot as plt
#from operator import itemgetter



mariadb_connection = mariadb.connect(user='root', database='waivecar_development')
cursor = mariadb_connection.cursor()

cursor.execute("""select bookings.id, cars.license, booking_details.type, booking_details.mileage, booking_details.charge, bookings.user_id from bookings
join booking_details on bookings.id = booking_details.booking_id
join cars on bookings.car_id = cars.id
where bookings.created_at > '2018-06-01'
order by bookings.created_at asc, cars.license asc
;""")

#This matches a booking to a starting and ending mileage
mileage = {}
#This matches the bookings to a user
user = {}
for b in cursor:
    booking_id = b[0] 
    user[booking_id] = b[5]
    if b[5] in [2723,3213,8779,10453]:
        continue
    if booking_id in mileage and b[2] == 'end':
        mileage[booking_id] += [(b[3], b[2], b[1])]
    elif booking_id not in mileage and b[2] == 'start':
        mileage[booking_id] = [(b[3], b[2], b[1])]
a = []
b = []
#This matches a booking to its distance in miles
distance = {}
for key in mileage.keys():
    if len(mileage[key]) == 2:
        d = mileage[key][1][0] - mileage[key][0][0]
        if d > 10:
            distance[key] = d
            a += [d]
        else:
            b += [d]

#This matches bookings with their charges at the starts and ends of rides
charge = {}
for b in cursor:
    booking_id = b[0] 
    if booking_id in charge and b[2] == 'end':
        charge[booking_id] += [(b[4], b[2], b[1])]
    elif booking_id not in charge and b[2] == 'start':
        charge[booking_id] = [(b[4], b[2], b[1])]
#print('charge: ', charge)

#This calculates the charge differences for bookings
chargeDifference = {}
for key in charge.keys():
    if len(charge[key]) == 2 and charge[key][1][0] and charge[key][0][0]:
        c = float(charge[key][0][0] - charge[key][1][0])
     
        if charge[key][0][2].lower() in ["waive{}".format(x) for x in range(1, 20)]:
            chargeDifference[key] = c*.70
        else:
            chargeDifference[key] = c*1.40
#print('chargeDifference: ', chargeDifference)

#This is a list of all of the diffent ratios that have been calculated
ratio = []
#This is is a hash table of all the different users with a rating below 0
freq = {}
#This table matches user ids to a list of ratios from their bookings
userRatios = {}
for key in distance.keys():
    if key in chargeDifference and chargeDifference[key]:
        r = float(distance[key])/chargeDifference[key]
        if r > -5.5 and r < 5.5:
            if not user[key] in userRatios:
                userRatios[user[key]] = []
            userRatios[user[key]].append(r)
            ratio += [r]
        if r < -0:
            if user[key] not in freq:
                freq[user[key]] = 0
            freq[user[key]] += 1
#print(list(reversed(sorted([(user,times) for user,times in freq.items()], key=itemgetter(1)))))

#This function calculates the maximum ratios of a user to be placed in any particular level (drainers, normal, chargers, super-chargers)
def find_levels(ratio_list):
    sorted_ratios = sorted(ratio_list)
    normal_index = round(0.1 * len(ratio_list))
    charger_index = round(0.8 * len(ratio_list))
    super_charger_index = round(0.97 * len(ratio_list))
    return {
        "normal_minimum": sorted_ratios[normal_index],
        "charger_minimum": sorted_ratios[charger_index],
        "super_charger_minimum": sorted_ratios[super_charger_index]
    }
print('Ratio thresholds: ', find_levels(ratio))

mariadb_connection.close()

