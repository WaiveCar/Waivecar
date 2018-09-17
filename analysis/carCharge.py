import MySQLdb as mysql
import json


mysql_connection = mysql.connect(user='root', database='waivecar_development')
cursor = mysql_connection.cursor()

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

#This function calculates the maximum ratios of a user to be placed in any particular level (drainers, normal, chargers, super-chargers)
def findLevels(ratioList):
    sortedRatios = sorted(ratioList)
    normalIndex = round(0.1 * len(ratioList))
    chargerIndex = round(0.8 * len(ratioList))
    superChargerIndex = round(0.97 * len(ratioList))
    return {
        "normalMinimum": sortedRatios[normalIndex],
        "chargerMinimum": sortedRatios[chargerIndex],
        "superChargerMinimum": sortedRatios[superChargerIndex]
    }
#print('Ratio thresholds: ', find_levels(ratio))

mysql_connection.close()
print(findLevels(ratio)) 
