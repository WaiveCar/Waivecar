#The first argument for this script is an object with the mysql configuration information 
import MySQLdb as mysql
import json
import os
import sys

db_config = json.loads(sys.argv[1])
mysql_connection = mysql.connect(database=db_config['database'], user=db_config['username'], password=db_config['password'])
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
#This calculates the charge differences for bookings
charge_difference = {}
for key in charge.keys():
    if len(charge[key]) == 2 and charge[key][1][0] and charge[key][0][0]:
        c = float(charge[key][0][0] - charge[key][1][0])
     
        if charge[key][0][2].lower() in ["waive{}".format(x) for x in range(1, 20)]:
            charge_difference[key] = c*.70
        else:
            charge_difference[key] = c*1.45
#This is a list of all of the diffent ratios that have been calculated
ratio = []
#This is is a hash table of all the different users with a rating below 0
freq = {}
#This table matches bookings to their ratio
booking_ratios = {}
for key in distance.keys():
    if key in charge_difference and charge_difference[key]:
        r = float(distance[key])/charge_difference[key]
        booking_ratios[key] = r
        if r > -5.5 and r < 5.5:
            ratio += [r]
        if r < -0:
            if user[key] not in freq:
                freq[user[key]] = 0
            freq[user[key]] += 1

#This calculates the maximum ratios of users for placement in each level (drainers, normal, chargers, super-chargers)
def get_thresholds(ratio_list):
    sorted_ratios = sorted(ratio_list)
    normal_index = round(0.1 * len(ratio_list))
    charger_index = round(0.8 * len(ratio_list))
    super_charger_index = round(0.97 * len(ratio_list))
    return {
        "normalMinimum": sorted_ratios[normal_index],
        "chargerMinimum": sorted_ratios[charger_index],
        "superChargerMinimum": sorted_ratios[super_charger_index]
    }

current_thresholds = get_thresholds(ratio)
print('Current Thresholds: ', current_thresholds)

#This function gets the ratio for a booking with row1 being the row containing the starting booking
#detail and row2 being the row containing the ending booking detail
def get_ratio(row1, row2):
    multiplier = 0.7 if row1[1].lower() in ["waive{}".format(x) for x in range(1, 20)] else 1.4
    difference_in_charge = (row1[4] - row2[4]) * multiplier
    if difference_in_charge == 0:
        difference_in_charge = 0.1
    return (float(row2[3] - row1[3])) / difference_in_charge

#This loads in the list of users to update that was passed in as the first argument when running this script
recent_users = json.loads(sys.argv[2])
#This function gets each user in the list's 20 most recent bookings, calculates their average ratios
def get_ratios_for_users(users_to_update):
    for user_id in users_to_update:
        query = """select bookings.id, cars.license, booking_details.type, booking_details.mileage, booking_details.charge, bookings.user_id 
        from bookings join booking_details on bookings.id = booking_details.booking_id
        join cars on bookings.car_id = cars.id where bookings.user_id={}
        order by bookings.created_at desc, cars.license asc limit 40;""".format(user_id);
        cursor.execute(query)
        rows = list(cursor)
        bookings_to_details = dict()
        for row in rows:
            if not row[0] in bookings_to_details:
                bookings_to_details[row[0]] = []
            bookings_to_details[row[0]].append(row)
        for booking in bookings_to_details:
            if len(bookings_to_details[booking]) < 2:
                continue
            if bookings_to_details[booking][0][2] == "end":
                bookings_to_details[booking][0], bookings_to_details[booking][1] = bookings_to_details[booking][1], bookings_to_details[booking][0] 
        for booking in bookings_to_details:
            if len(bookings_to_details[booking]) > 1:
                print(get_ratio(bookings_to_details[booking][0], bookings_to_details[booking][1]))

get_ratios_for_users(recent_users)

mysql_connection.close()
