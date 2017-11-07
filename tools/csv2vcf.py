#!/usr/bin/env python

"""
select last_name, first_name, email, phone from users where status != 'suspended' and deleted_at is null INTO OUTFILE '/var/lib/mysql-files/all-users.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';
"""
import csv
with open('users.csv', 'rb') as csvfile:
    contacts = csv.reader(csvfile, delimiter=',', quotechar='"')
    for row in contacts:
        if len(row) == 4:
            last, first, email, phone = row

            if phone != "\N":
                if email != "\N":
                    print("""BEGIN:VCARD
                    VERSION:2.1
                    N:{1};WC:{0};;;
                    FN:WC:{0} {1}
                    EMAIL;PREF:{3}
                    TEL;CELL:{2}
                    END:VCARD""".format(first, last, phone, email))
                else:
                    print("""BEGIN:VCARD
                    VERSION:2.1
                    N:{1};WC:{0};;;
                    FN:WC:{0} {1}
                    TEL;CELL:{2}
                    END:VCARD""".format(first, last, phone))

