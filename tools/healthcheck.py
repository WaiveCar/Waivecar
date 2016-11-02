#!/usr/bin/python
import httplib, requests, time

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

while True:
    c = httplib.HTTPSConnection("api.waivecar.com")
    c.request('GET', '/ping')
    response = c.getresponse()

    if response.status != 200:
        res = send_email(who='kristopolous@yahoo.com', subject="waivecar server: %d " % response.status, body='total failure', sender='Indycast Admin <info@indycast.net>')
        print "Found failure (%d). Emailing" % response.status

    time.sleep(10)

