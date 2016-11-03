#!/usr/bin/python
import httplib, requests, time, datetime
from subprocess import call

failCount = 0

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
  global failCount

  failCount += 1

  subject = 'waivecar server: '

  if failCount > 1:
    if failCount == 2:
      subject += 'restarting'
      call(["/etc/init.d/node-waivecar", "restart"])

    elif failCount > 4:
      subject += 'system down (%s)' %s

    for email in ['kristopolous@yahoo.com', 'moe@waive.car']:
      res = send_email(who=email, subject=subject, body='total failure', sender='WaiveCar HealthCheck <info@indycast.net>')

    print "[%d] Found failure (%s). Emailing" % (failCount, what)
  else:
    print "[%d] Not sufficient for emailing." % failCount

while True:

  print str(datetime.datetime.now())

  try:
    #c = httplib.HTTPConnection("9ol.es")
    c = httplib.HTTPSConnection("api.waivecar.com")
    c.request('GET', '/ping')

    response = c.getresponse()

    if response.status != 200:
      dofail(str(response.status)) 
    else:
      failCount = 0

  except Exception as exc:
    dofail(str(exc))

  time.sleep(10)

