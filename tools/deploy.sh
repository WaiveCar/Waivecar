#!/bin/sh

ts=`date +%Y%m%d-%H%M`
path=/opt/waivecar-api
previous=`readlink -f $path-last`

echo -n "Last was: "; cat git-sha-1
git describe > git-sha-1
echo `date` `git describe` >> .deploy-history
echo -n "This is: "; cat git-sha-1

set -x
[ -e $previous ] && rm -r $previous
unlink $path-last
cp -r $path $path-$ts
ln -s $path-$ts $path-last
cp -r * $path
#
# See 1330: Create graceful shutdown for deployment 
# 
# If we just bludgeon things with a restart we could be
# in the middle of a transaction. Potentially the right
# way to do this would be to correct the node-waivecar
# init.d scripts. However, we have an easier way, so
# why not.
#
# We simply bring down nginx through init.d, which will
# wait until requests are satisfied and then shut things
# down. This guarantees that we are in a safe shutdown
# space for our code.  Then we bring nginx back up
# afterwards.
#
# It does add some time to the downtown for the restart,
# but it's a price worth paying.
#
/etc/init.d/nginx stop
/etc/init.d/node-waivecar restart
/etc/init.d/nginx start
tail -f /opt/waivecar-prod.log

