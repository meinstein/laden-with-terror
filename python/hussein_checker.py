import unicodecsv as csv
import mechanize
from bs4 import BeautifulSoup
import re
from json import dumps

csv_input = open('HUSSEIN_MASTER.csv', 'rU')
reader = csv.reader(csv_input)
url_before = ''
counter = 0
#next(reader, None) # skip headers 

def striphtml(data):
    p = re.compile(r'<.*?>')
    return p.sub('', data)

def stripws(data):
	p = re.sub(r"\s+", " ", data)
	return p

new_csv = []
br = mechanize.Browser()

for row in reader:

	if row[2] != url_before:

		try:

			html = br.open(row[2]).read()

			soup = BeautifulSoup(html, "html.parser")
			paragraphs = soup.findAll('p')

			for p in paragraphs:

				stripped = striphtml(str(p))
				stripped = stripws(stripped)

				if stripped.find('Saddam Hussein') > -1:

					counter += 1
					print counter

					dic = {}
					#dic['headline'] = row[0]
					dic['date'] = row[1] 
					dic['url'] = row[2] 
					new_csv.append(dic)

					break

		except:

			print '************* // ERROR // ***************'


	url_before = row[2]


keys = new_csv[0].keys()
with open('HUSSEIN_MASTER_CHECKED.csv', 'wb') as output_file:
    dict_writer = csv.DictWriter(output_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(new_csv)
