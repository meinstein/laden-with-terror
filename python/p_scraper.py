import unicodecsv as csv
import mechanize
from bs4 import BeautifulSoup
import re
from json import dumps

csv_input = open('MASTER_2000_2012.csv', 'rU')
reader = csv.reader(csv_input)
url_before = ''
next(reader, None) # skip headers 

def striphtml(data):
    p = re.compile(r'<.*?>')
    return p.sub('', data)

def stripws(data):
	p = re.sub(r"\s+", " ", data)
	return p

snippet_dic = {}
new_csv = []
br = mechanize.Browser()

for row in reader:

	if row[3] != url_before:

		try:

			html = br.open(row[3]).read()

			soup = BeautifulSoup(html, "html.parser")
			paragraphs = soup.findAll('p')

			for p in paragraphs:

				stripped = striphtml(str(p))
				stripped = stripws(stripped)

				if stripped.find('Osama bin Laden') > -1:

					dic = {}
					dic['headline'] = row[0]
					dic['date'] = row[1] 
					dic['section'] = row[2] 
					dic['url'] = row[3] 
					dic['word_count'] = row[4] 
					dic['id'] = row[5] 
					new_csv.append(dic)

					stripped = stripped.replace("''", "'")
					stripped = stripped.strip()
					snippet_dic[row[5]] = stripped

					print row[5]

					break

		except:

			print '************* // ERROR // ***************'


	url_before = row[3]


keys = new_csv[0].keys()
with open('new_csv.csv', 'wb') as output_file:
    dict_writer = csv.DictWriter(output_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(new_csv)

json_output = open('test.json', 'w')
json_output.write(dumps(snippet_dic, json_output, separators=(',',':'), sort_keys=True))