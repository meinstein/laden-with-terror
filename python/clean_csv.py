import csv
import datetime
import calendar
from collections import Counter
from json import dumps

csv_input = open('FULL_00_12.csv', 'rU')
reader = csv.reader(csv_input)
next(reader, None) # skip headers
date_array = []
sections = []
sections_container = []
headlines = []
output = {}
month_obj = {}
url_before = ''
month_before = '2000-01'
counter = 0
word_count_total = 0
days_from_month_before = 0

for row in reader:
	
	date = row[4]
	monthRaw = datetime.datetime.strptime(date, "%m/%d/%y") 
	month = monthRaw.strftime("%Y-%m") 
	month_sans_zero = monthRaw.strftime("%Y-%-m") 
	monthUse = monthRaw.strftime("%-m/%-d/%y") 
	month_only = int(month_sans_zero.split('-')[1])
	year_only = int(month_sans_zero.split('-')[0])
	days = int(calendar.monthrange(year_only,month_only)[1])

	if row[3] == url_before:

		continue

	elif month == month_before:

		counter += 1

		headline_id = int(row[5])
		word_count = int(row[2])
		word_count_total = int(word_count_total) + word_count
		headline = row[0].encode("utf8")
		month_before = month
		days_from_month_before = days

		if not row[1]:
			sections_arr = ['N/A']
		else:
			sections_raw = row[1]
			sections_arr = sections_raw.split('; ')

		sections.extend(sections_arr)

		url = row[3]
		url_mod = url.replace('http://www.nytimes.com', '')
		url_mod = url_mod.replace("http://", '')
		url_before = row[3]
		headlineDic = {
			'h':[
				headline,
				url_mod,
				monthUse,
				sections_arr,
				headline_id,
				word_count
		]}
		headlines.append(headlineDic)

	else:

		month_obj['articles'] = headlines
		month_obj['dailyAvg'] = float(counter) / float(days_from_month_before)
		month_obj['wordCountAvg'] = round(float(word_count_total) / float(counter),2)
		print counter

		sections_dict = dict(Counter(sections))
		for key in sections_dict:
			each_counter = {
				'section': key,
				'count': sections_dict[key]
			}
			sections_container.append(each_counter)

		final_sections_list = sorted(sections_container, key=lambda k: k['count'], reverse=True)
		final_sections_list.insert(0,{'section': 'All', 'count': len(headlines)})
		month_obj['sections'] = final_sections_list

		output[month_before] = month_obj
		month_before = month
		headlines = []
		sections = []
		sections_container = []
		month_obj = {}
		counter = 0
		word_count_total = 0
		
		if not row[1]:
			sections_arr = ['N/A']
		else:
			sections_raw = row[1]
			sections_arr = sections_raw.split('; ')

		sections.extend(sections_arr)

		counter += 1
		headline_id = int(row[5])
		word_count = int(row[2])
		word_count_total = int(word_count_total) + word_count
		headline = row[0].encode("utf8")
		url = row[3]
		url_mod = url.replace("http://www.nytimes.com", '')
		url_mod = url_mod.replace("http://", '')
		url_before = row[3]
		headlineDic = {
			'h':[
				headline,
				url_mod,
				monthUse,
				sections_arr,
				headline_id,
				word_count
		]}
		headlines.append(headlineDic)

json_output = open('MASTER_WITH_DATE_TEST_CALENDAR.json', 'w')
json_output.write(dumps(output, json_output, separators=(',',':'), sort_keys=True))