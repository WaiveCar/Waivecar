import csv

with open('./tikd-sheet.csv', 'r') as f:
    reader = csv.reader(f)
    your_list = list(reader)
    print(your_list)
