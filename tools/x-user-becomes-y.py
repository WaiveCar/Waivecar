#!/usr/bin/python
import redis, sys

if len(sys.argv) != 3: 
    print "Need to specify a from_user and a to_user id"
    sys.exit(0)

(cmd, from_user, to_user) = sys.argv

r = redis.StrictRedis(host='localhost', port=6379, db=0)
auth = r.keys('*auth:user:%s*default' % from_user)

if len(auth) == 0:
    print "can't find %s. bye" % from_user
    sys.exit(0)

auth = auth[0]

# Otherwise we copy the auth tokens over
tokenList = r.lrange(auth, 0, -1)

# this is our fake user packet which we inject
to_user_packet = '{"user":%s,"group":1,"source":"%s:default","persist":false}' % (to_user, to_user)
to_user_key = 'waive-car:auth:user:%s:default' % to_user

# The system is a two-way reference so we need to first fake out the packet.
for token in tokenList:
    #r.delete('waive-car:auth:token:%s' % token)
    r.set('waive-car:auth:token:%s' % token, to_user_packet)

    # Then we need to add our token to the tokenlist of the new user
    r.lpush(to_user_key, token)

print "Creds from %s moved to %s" % (from_user, to_user)
