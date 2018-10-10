#!/bin/sh
file=backup-`date +%Y%m%d%H%M`.sql
sudo mysqldump -u root waivecar_production > $file
rm -f current-backup.sql
ln -s $file current-backup.sql
bzip2 -c current-backup.sql > current-backup.sql.bz2
