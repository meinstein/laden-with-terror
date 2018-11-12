import csv
import datetime
import calendar
from json import dumps

csv_input = open('HUSSEIN_MASTER.csv', 'rU')
reader = csv.reader(csv_input)
next(reader, None) # skip headers

master_obj = {}
url_before = ''
month_before = '2000-01'
counter = 0

for row in reader:
	
	date = row[1]
	monthRaw = datetime.datetime.strptime(date, "%m/%d/%y") 
	month = monthRaw.strftime("%Y-%m") 

	if row[2] == url_before:

		print 'skip this'
		continue

	elif month == month_before:

		counter += 1

	else: # new month

		master_obj[month_before] = counter

		counter = 1

		month_before = month


json_output = open('hussein_counter.json', 'w')
json_output.write(dumps(master_obj, json_output, separators=(',',':'), sort_keys=True))