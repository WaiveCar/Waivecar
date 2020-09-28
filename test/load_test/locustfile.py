import time
import random
import mysql.connector
from locust import HttpUser, task, between
from env import *


conn = mysql.connector.connect(user=db_user, password=db_pass, host=db_host, database=db_name)
c = conn.cursor(dictionary= True)
c.execute("SELECT id AS booking_id, user_id, car_id FROM bookings WHERE status in ('started', 'reserved')")
active_bookings = c.fetchall()
print('active: {}'.format(len(active_bookings)))
c.execute("SELECT id AS booking_id, user_id, car_id FROM bookings")
all_bookings = c.fetchall()
print('all: {}'.format(len(all_bookings)))

bookings_list = active_bookings


class WaivecarUser(HttpUser):
  wait_time = between(2, 8)
  host = api_url

  def on_start(self):
    self.client.headers = api_headers

  def common_gets(self):
    self.client.get('/roles')
    self.client.get('/users/me')
    
  @task(10)
  def cars_page(self):
    self.common_gets()
    for i in range(random.randint(1, 6)):
      self.client.get('/carsWithBookings?order=updated_at%2CDESC&offset={}&limit=20'.format(i * 20),
                 name='/carsWithBookings?order=updated_at%2CDESC&offset=[]&limit=20')

  @task(10)
  def users_page(self):
    self.common_gets()
    for i in range(random.randint(1, 6)):
      self.client.get('/users?includeOrgs=true&order=created_at%2CDESC&offset={}&limit=20'.format(i * 20),
                 name='/users?includeOrgs=true&order=created_at%2CDESC&offset=[]&limit=20')

  @task(10)
  def bookings_page(self):
    self.common_gets()
    for i in range(random.randint(1, 6)):
      self.client.get('/bookings?details=true&order=created_at%2CDESC&offset={}&limit=20'.format(i * 20),
                 name='/bookings?details=true&order=created_at%2CDESC&offset=[]&limit=20')

  @task(50)
  def car_page(self):
    car_id = random.choice(bookings_list)['car_id']
    self.common_gets()
    self.client.get('/cars/{}'.format(car_id),
               name='/cars/[]')
    self.client.get('/bookings?carId={}&details=true&order=created_at,DESC&limit=1'.format(car_id),
               name='/bookings?carId=[]&details=true&order=created_at,DESC&limit=1')
    self.client.get('/cars/{}/bookings?limit=1&status=completed'.format(car_id),
               name='/cars/[]/bookings?limit=1&status=completed')
    self.client.get('/history/car/{}'.format(car_id),
               name='/history/car/[]')
    self.client.get('/reports/car/{}?fromDate=2020-06-11T05:50:28Z'.format(car_id),
               name='/reports/car/[]?fromDate=2020-06-11T05:50:28Z')
    self.client.get('/airtable/users')
    self.client.get('/cars/{}/notes'.format(car_id),
               name='/cars/[]/notes')
    self.client.get('/audit/log?order=created_at%2CDESC&offset=0&limit=15&carId={}'.format(car_id),
               name='/audit/log?order=created_at%2CDESC&offset=0&limit=15&carId=[]')

  @task(50)
  def user_page(self):
    user_id = random.choice(bookings_list)['user_id']
    self.common_gets()
    self.client.get('/users/{}'.format(user_id),
               name='/users/[]')
    self.client.get('/users/{}/notes'.format(user_id),
               name='/users/[]/notes')
    self.client.get('/users/{}/stats'.format(user_id),
               name='/users/[]/stats')
    self.client.get('/licenses?userId={}'.format(user_id),
               name='/licenses?userId=[]')
    self.client.get('/logs/event?userId={}'.format(user_id),
               name='/logs/event?userId=[]')
    self.client.get('/bookings?userId={}&order=id%2CDESC&details=true&status=started%2Creserved%2Cended&limit=1&includeWaiveworkPayment=true'.format(user_id),
               name='/bookings?userId=[]&order=id%2CDESC&details=true&status=started%2Creserved%2Cended&limit=1&includeWaiveworkPayment=true')
    self.client.get('/audit/log?order=created_at%2CDESC&offset=0&limit=15&actorId={}'.format(user_id),
               name='/audit/log?order=created_at%2CDESC&offset=0&limit=15&actorId=[]')
    self.client.get('/shop/cards?showSelected=true&userId={}'.format(user_id),
               name='/shop/cards?showSelected=true&userId=[]')
    self.client.get('/files?userId={}&collectionId=insurance'.format(user_id),
               name='/files?userId=[]&collectionId=insurance')
    self.client.get('/users/{}/communications?offset=0&type=sms&limit=20'.format(user_id),
               name='/users/[]/communications?offset=0&type=sms&limit=20')
    self.client.get('/bookings?userId={}&order=id%2CDESC&details=true&status=started%2Creserved%2Cended%2Ccompleted%2Cclosed&offset=0&limit=15'.format(user_id),
               name='/bookings?userId=[]&order=id%2CDESC&details=true&status=started%2Creserved%2Cended%2Ccompleted%2Cclosed&offset=0&limit=15')
    self.client.get('/shop/orders?userId={}&order=id%2CDESC&status=failed%2Cpaid%2Crefunded&offset=0&limit=15'.format(user_id),
               name='/shop/orders?userId=[]&order=id%2CDESC&status=failed%2Cpaid%2Crefunded&offset=0&limit=15')
    self.client.get('/group')

  @task(50)
  def booking_page(self):
    booking = random.choice(bookings_list)
    booking_id = booking['booking_id']
    user_id = booking['user_id']
    self.common_gets()
    self.client.get('/bookings/{}?reports=true'.format(booking_id),
               name='/bookings/[]?reports=true')
    self.client.get('/users/{}'.format(user_id),
               name='/users/[]')
    self.client.get('/licenses?userId={}'.format(user_id),
               name='/licenses?userId=[]')
    self.client.get('/bookings/{}/notes'.format(booking_id),
               name='/bookings/[]/notes')
    self.client.get('/bookings/{}/parkingDetails'.format(booking_id),
               name='/bookings/[]/parkingDetails')
    self.client.get('/history/booking/{}'.format(booking_id),
               name='/history/booking/[]')

  @task
  def dashboard_page(self):
    self.common_gets()
    self.client.get('/dashboard')

