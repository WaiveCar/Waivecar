#!/usr/bin/env python3
import MySQLdb as mysql
import json
import os
import sys
db_config = json.loads(sys.argv[1])

mysql_connection = mysql.connect(database=db_config['database'], user=db_config['username'], password=db_config['password'])
cursor = mysql_connection.cursor()

output = "output to be added"

if __name__ == "__main__":
    print(json.dumps(output))

