import MySQLdb as mysql
import csv
#mysql_connection = mysql.connect(database='waivecar_development', user='waivecar', password='eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X')
mysql_connection = mysql.connect(database='waivecar_production', user='waivecar_prod', password='Lh4Ds2wAxzlF4e')
cursor = mysql_connection.cursor()

header = ['customer_id', 'First_Name', 'Last_Name', 'Address City', 'State', 'Zip','Phone1', 'Phone2', 'Employer', 'Work_Phone', 'Email', 'Description of Charges', 'Invoice_Ids','Last_Charge_Date', 'Debt_Total', 'Driver\'s_License_Number', 'Social_Security_Number', 'Date_of_Birth']

cursor.execute('''select users.id, users.first_name, users.last_name, city, licenses.state, zip, 
phone, null, null, null, email, null, null, null, abs(credit / 100), licenses.number, null, birth_date
from users left join licenses on users.id = licenses.user_id where credit < -2500 group by users.id''')

rows = [row for row in cursor]
rows.insert(0, header)

with open('./users-for-collections.csv', 'w') as output:
    writer = csv.writer(output, lineterminator='\n')
    writer.writerows(rows)
