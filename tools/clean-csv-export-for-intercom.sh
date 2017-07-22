#!/bin/bash

cp $1 ${1/.csv/}-orig.csv
  # Replace the nulls with empty fields
  # Remove trailing whitespace
  # Remove bogus phone numbers

sed -r 's/,(\+|\\N)/,/g;   s/\s+"/"/g;   s/"0000\/00\/00"/""/g;  s/"\+([0-9]{0,8}|[0-9]{14,40})"//g;' $1 | grep -P '\"[\w\.+-]*@[\w-]+\.[\.\w]*"' > tmp # Remove email addresses that are clearly bogus
[ -s tmp ] && mv tmp all-users.csv
