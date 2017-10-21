#!/bin/bash
# This is run on the production machines.  The
# new versions of the js should be in web-js/new
set -x
if [ ! -e web.js ]; then 
  echo 'This is probably not supposed to be run from here.'
  exit -1
fi
cd web-js

goforward() {
  # We preserve the timestamp and copy over whatever was
  # last being served over the wire as our previous version
  cp -p /opt/waivecar-web/scripts/{vendors.js,bundle.js} last

  # Now we move over the new stuff
  sudo cp new/{vendors,bundle}.js /opt/waivecar-web/scripts/
}

undo() {
  # We preserve the timestamp and copy over whatever was
  # last being served over the wire as our previous version
  cp -p last/{vendors,bundle}.js /opt/waivecar-web/scripts/
}

# if any argument is given then we undo our changes
if [ $1 ]; then
  undo
else
  goforward
fi
