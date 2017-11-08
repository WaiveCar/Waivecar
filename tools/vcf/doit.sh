#!/bin/bash
rm x*vcf
name=waivecar-users-20171106.vcf
./csv2vcf.py > $name
split -d -l 28000 --additional-suffix=.vcf $name
scp x*vcf 9ol.es:www/wc
rm *.vcf
