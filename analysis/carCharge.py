#!/usr/bin/env python3
#The first argument for this script is an object with the mysql configuration information and
#the second is a list of users whose status needs to be recalculated
import MySQLdb as mysql
import json
import os
import sys

db_config = json.loads(sys.argv[1])

mysql_connection = mysql.connect(database=db_config['database'], user=db_config['username'], password=db_config['password'])
cursor = mysql_connection.cursor()

def get_ratios():
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
    for key in distance.keys():
        if key in charge_difference and charge_difference[key]:
            r = float(distance[key])/charge_difference[key]
            if r > -5.5 and r < 5.5:
                ratio += [r]
            if r < -0:
                if user[key] not in freq:
                    freq[user[key]] = 0
                freq[user[key]] += 1
    return sorted(ratio)[::-1]

#This calculates the maximum ratios of users for placement in each level (drainers, normal, chargers, super-chargers)
def get_thresholds(ratio_list):
    #The minmum threshold for normal may need to be placed a bit higher. When using 0.1 as the multiplier barely any
    #users are marked as drainers. This is likely because few users have many bookings that fall into the bottom 10th of
    #all bookings. When the window is increased to the bottom 20%, there are definitely some users who are marked as drainers
    normal_index = round(0.15 * len(ratio_list))
    charger_index = round(0.8 * len(ratio_list))
    super_charger_index = round(0.97 * len(ratio_list))
    return {
        "normalMaximum": ratio_list[normal_index],
        "chargerMaximum": ratio_list[charger_index],
        "superChargerMaximum": ratio_list[super_charger_index]
    }
#This function gets the ratio for a booking with row1 being the row containing the starting booking
#detail and row2 being the row containing the ending booking detail
def get_ratio(row1, row2):
    multiplier = 0.7 if row1[1].lower() in ["waive{}".format(x) for x in range(1, 20)] else 1.4
    difference_in_charge = (row1[4] - row2[4]) * multiplier
    if difference_in_charge == 0:
        difference_in_charge = 0.1
    return (float(row2[3] - row1[3])) / difference_in_charge

#This function gets each user in the list's 20 most recent bookings, calculates their average ratios
def get_ratios_for_users(users_to_update):
    new_ratios = {}
    for user_id in users_to_update:
        query = """select bookings.id, cars.license, booking_details.type, booking_details.mileage, booking_details.charge, bookings.user_id 
        from bookings join booking_details on bookings.id = booking_details.booking_id
        join cars on bookings.car_id = cars.id where bookings.user_id={} and bookings.status="completed"
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
        current_user_ratios = []
        for booking in bookings_to_details:
            if len(bookings_to_details[booking]) > 1:
                current_user_ratios.append(get_ratio(bookings_to_details[booking][0], bookings_to_details[booking][1]))
        current_user_ratios = list(filter(lambda x: (-5.5 <= x <= 5.5), current_user_ratios))
        #An error will be caused if there is not a usable ratio in the list and a user should 
        #not be given a rating if this is the case 
        if len(current_user_ratios) == 0:
            continue
        new_ratios[user_id] = sum(current_user_ratios) / len(current_user_ratios)
    return new_ratios

if __name__ == "__main__":
    booking_ratios = get_ratios() 
    current_thresholds = get_thresholds(booking_ratios)
    #This loads in the list of users to update that was passed in as the first argument when running this script
    recent_users = json.loads(sys.argv[2])
    new_user_ratios = get_ratios_for_users(recent_users)
    mysql_connection.close()
    print(json.dumps({
        "currentThresholds": current_thresholds,
        "newUserRatios": new_user_ratios
    }))
