import csv, pytz, datetime
import MySQLdb as mysql
mysql_connection = mysql.connect(database='waivecar_development', user='waivecar', password='eNwlGGl6g6V0w0qX3vx0S5GKbGvTtR3X')
cursor = mysql_connection.cursor()

with open('./tikd-sheet.csv', 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)
    for row in rows:
        if not len(row[18]):
            issue_time = row[13]
            issue_date = row[14]
            plate_number = row[16]
            local = pytz.timezone ('America/Los_Angeles')
            naive = datetime.datetime.strptime ('{} {}'.format(issue_date, issue_time), '%m/%d/%Y %H:%M:%S %p')
            local_dt = local.localize(naive, is_dst=None)
            utc_dt = local_dt.astimezone(pytz.utc)

mysql_connection.close()
