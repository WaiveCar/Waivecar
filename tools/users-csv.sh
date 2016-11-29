#!/bin/sh
out=/var/lib/mysql-files/users.csv
[ -e $out ] && unlink $out
mysql waivecar_production <<HERE 
select last_name, first_name, email, phone from users where phone is not null inTO OUTFILE '$out' FIELDS TERMINATED BY ';' LINES TERMINATED BY '\n'
HERE
mv $out /tmp
