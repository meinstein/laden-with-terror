import csv
from json import dumps

hussein = list(csv.reader(open('HUSSEIN_MASTER.csv', 'rU')))
# hussein_reader = csv.reader(hussein)
# next(hussein_reader, None) # skip headers

bin_laden = open('FULL_00_12.csv', 'rU')
bin_laden_reader = csv.reader(bin_laden)
next(bin_laden_reader, None) # skip headers

counter = 0

for bin_laden_row in bin_laden_reader:
	
	bin_laden_url = bin_laden_row[3]

	for obj in hussein:

		hussein_url = obj[2]

		if bin_laden_url == hussein_url:

			counter += 1
			print bin_laden_url


# json_output = open('hussein_counter.json', 'w')
# json_output.write(dumps(master_obj, json_output, separators=(',',':'), sort_keys=True))