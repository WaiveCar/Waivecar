cp all-users.csv all-users-orig.csv
sed -ri 's/,(\+|\\N)/,/' all-users.csv  # Replace the nulls with empty fields
sed -ri 's/\s+"/"/g' all-users.csv # Remove trailing whitespace
sed -ri 's/"\+([0-9]{0,8}|[0-9]{14,40})"//g'  all-users.csv # Remove bogus phone numbers
grep -P '\"[\w\.+-]*@[\w-]+\.[\.\w]*"' all-users.csv > tmp # Remove email addresses that are clearly bogus
mv tmp all-users.csv
