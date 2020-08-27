#!/usr/bin/env python3
import random
import logging
import mysql.connector
import requests
from concurrent.futures import ThreadPoolExecutor

logging.basicConfig(level=logging.INFO)

test_count = 1000
db_host = 'waivecar-development.c9qxbaxup5ni.us-east-1.rds.amazonaws.com'
db_user = 'admin'
db_pass = 'password'
db_name = 'waivecar_development'
authorization_token = 'tcfQCLay7Ob9wRC6IjPUl00t7A20Wkjb8DQtyQN5kfMJsdWXOfEbOrwcqeC2awnm'

booking_url = 'http://typhoeus:3080/bookings'
headers = { 'Authorization': authorization_token }

bookings = []

def load_fake_data_into_db():
  lat1, lat2 = 33.758807, 34.148135
  lng1, lng2 = -118.382916, -117.828095

  cars = []
  telems = []
  users = []
  licenses = []
  cards = []
  lics = []
  groups = []
  global bookings

  logging.info('Connecting to MySQL database: {}'.format(db_host))
  conn = mysql.connector.connect(user=db_user, password=db_pass, host=db_host, database=db_name)
  c = conn.cursor()

  logging.info('Deleting old test data...')
  c.execute("DELETE FROM logs WHERE car_id LIKE 'test%%'")
  c.execute("DELETE FROM booking_details WHERE booking_id IN (SELECT id FROM bookings WHERE car_id LIKE 'test%%')")
  #c.execute("DELETE FROM booking_locations WHERE booking_id IN (SELECT id FROM bookings WHERE car_id LIKE 'test%%')") # Super Slow
  c.execute("DELETE FROM bookings WHERE car_id LIKE 'test%%'")
  c.execute("DELETE FROM cars WHERE id LIKE 'test%%'")
  c.execute("DELETE FROM telematics WHERE telem_id LIKE 'telemtest%%'")
  c.execute("DELETE FROM group_users WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'testuser%%@waive.car')")
  c.execute("DELETE FROM licenses WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'testuser%%@waive.car')")
  c.execute("DELETE FROM shop_payment_cards WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'testuser%%@waive.car')")
  c.execute("DELETE FROM users WHERE email LIKE 'testuser%%@waive.car'")


  for i in range(1, test_count + 1):
    cars.append(('test{:05d}'.format(i), 'Test{:05d}'.format(i), 'TST{:04x}'.format(i), '{:.8f}'.format(random.uniform(lat1, lat2)), '{:.8f}'.format(random.uniform(lng1, lng2))))
    telems.append(('telemtest{:05d}'.format(i), 'test{:05d}'.format(i)))
    users.append(('Test', 'User{:05d}'.format(i), 'testuser{:05d}@waive.car'.format(i), 'test{:05d}'.format(i)))

  logging.info('Inserting test cars...')
  c.executemany("INSERT INTO cars (id, make, model, license, plate_number, charge, latitude, longitude, is_available, created_at, updated_at) VALUES (%s, 'Tesla', 'W', %s, %s, 42, %s, %s, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", cars)
  logging.info('Inserting test telematics...')
  c.executemany("INSERT INTO telematics (telem_id, car_id, created_at, updated_at) VALUES (%s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", telems)
  logging.info('Inserting test Users...')
  c.executemany("INSERT INTO users (first_name, last_name, email, stripe_id, verified_phone, verified_email, tested, created_at, updated_at) VALUES (%s, %s, %s, %s, 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", users)
  
  logging.info('Committing changes to database...')
  conn.commit()

  c.execute("SELECT id, stripe_id FROM users WHERE email LIKE 'testuser%%@waive.car'")
  for uid, sid in c.fetchall():
    cards.append((sid, uid))
    lics.append((uid,))
    groups.append((1, uid, 1))
    groups.append((2, uid, 6))
    bookings.append( (uid, sid) )

  logging.info('Inserting User data...')
  c.executemany("INSERT INTO shop_payment_cards (id, user_id, exp_month, exp_year, type, created_at, updated_at) VALUES (%s, %s, 6, 2042, 'credit', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", cards)
  c.executemany("INSERT INTO licenses (user_id, number, state, status, outcome, created_at, updated_at) VALUES (%s, 'TEST', 'CA', 'completed', 'clear', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", lics)
  c.executemany("INSERT INTO group_users (group_id, user_id, group_role_id) VALUES (%s, %s, %s)", groups)

  logging.info('Committing changes to database...')
  conn.commit()
  conn.close()

def create_test_bookings():
  
  def make_booking(ids):
    uid, cid = ids
    data = {  'source': 'web',
              'carId': cid,
              'userId': uid }
    logging.debug('{} Booking...'.format(cid))
    res = requests.post(booking_url, json=data, headers=headers)
    if res.status_code != 200:
      logging.error('Booking ({}, {}) failed with {}: {}'.format(uid, cid, res.status_code, res.text))
    else:
      logging.debug('{} Booked'.format(cid))

  logging.info('Making bookings...')
  with ThreadPoolExecutor(max_workers=64) as executor:
    executor.map(make_booking, bookings)


load_fake_data_into_db()
create_test_bookings()
