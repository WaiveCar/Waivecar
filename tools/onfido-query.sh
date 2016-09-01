#!/bin/bash
url=https://api.onfido.com/v2/"$1"
echo $url
out=`curl -D /dev/stderr -s https://api.onfido.com/v2/"$1" -H "Authorization:Token token=live_as_IHLB4xIpsv281PmGRfg57U5welUN_"`
echo $out | python -mjson.tool
