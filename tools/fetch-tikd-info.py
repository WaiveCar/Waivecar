import csv

with open('./tikd-sheet.csv', 'r') as f:
    reader = csv.reader(f)
    rows = list(reader)
    for row in rows:
        if not len(row[18]):
            issue_time = row[13]
            issue_date = row[14]
            plate_number = row[16]
            print(issue_time, issue_date, plate_number)
