#!/usr/bin/python
import httplib, requests, time, datetime

# Taken from https://bradgignac.com/2014/05/12/sending-email-with-python-and-the-mailgun-api.html
def send_email(who, subject, body, sender):
  request_url = "https://api.mailgun.net/v3/indycast.net/messages"

  request = requests.post(request_url, auth=('api', "key-e4a007ff52b01a55add689ba470477bb"), data={
    'from': sender,
    'to': who,
    'subject': subject,
    'text': body,
    'html': body
  })

  return request

def dofail(what):
  for email in ['kristopolous@yahoo.com', 'moe@waive.car']:
    res = send_email(who=email, subject="waivecar server: %s " % what, body='total failure', sender='WaiveCar HealthCheck <info@indycast.net>')

  print "Found failure (%s). Emailing" % what

while True:

    print str(datetime.datetime.now())

    try:
      c = httplib.HTTPSConnection("api.waivecar.com")
      c.request('GET', '/ping')

      response = c.getresponse()

      if response.status != 200:
        dofail(str(response.status)) 

    except Exception as exc:
      dofail(str(exc))

    time.sleep(10)

