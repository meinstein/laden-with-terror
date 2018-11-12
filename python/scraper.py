import unicodecsv as csv
from nytimesarticle import articleAPI
# api = articleAPI('f507f70d25c67d529f25cbd715cc5de9:5:67901820')
api = articleAPI('6f3db26878b18ab77f5cb78e82dd4496:3:67969482')

# articles = api.search( q = 'Obama', 
#      fq = {'headline':'Obama', 'source':['Reuters','AP', 'The New York Times']}, 
#      begin_date = 20111231 )

def parse_articles(articles):
    '''
    This function takes in a response to the NYT api and parses
    the articles into a list of dictionaries
    '''
    news = []
    for i in articles['response']['docs']:
        dic = {}
        # dic['id'] = i['_id']
        # if i['abstract'] is not None:
        #     dic['abstract'] = i['abstract'].encode("utf8")
        # dic['headline'] = i['headline']['main'].encode("utf8")
        if type(i['headline']) is dict:
            dic['headline'] = i['headline']['main'].encode("utf8")
        # dic['desk'] = i['news_desk']
        dic['date'] = i['pub_date'][0:10] # cutting time of day.
        #dic['section'] = i['section_name']
        # if i['snippet'] is not None:
        #     dic['snippet'] = i['snippet'].encode("utf8")
        #dic['source'] = i['source']
        # dic['type'] = i['type_of_material']
        dic['url'] = i['web_url']
        #dic['word_count'] = i['word_count']
        # locations
        # locations = []
        # for x in range(0,len(i['keywords'])):
        #     if 'glocations' in i['keywords'][x]['name']:
        #         locations.append(i['keywords'][x]['value'])
        # dic['locations'] = locations
        # subject
        # subjects = []
        # for x in range(0,len(i['keywords'])):
        #     if 'subject' in i['keywords'][x]['name']:
        #         subjects.append(i['keywords'][x]['value'])
        # dic['subjects'] = subjects   
        news.append(dic)
    return(news) 

def get_articles(date,query):
    '''
    This function accepts a year in string format (e.g.'1980')
    and a query (e.g.'Amnesty International') and it will 
    return a list of parsed articles (in dictionaries)
    for that year.
    '''
    all_articles = []
    for i in range(0,100): #NYT limits pager to first 100 pages. But rarely will you find over 100 pages of results anyway.
        articles = api.search(q = query,
               fq = {'source':['Reuters','AP', 'The New York Times']},
               begin_date = date + '0101',
               end_date = date + '1231',
               sort='oldest',
               page = str(i))
        articles = parse_articles(articles)
        all_articles = all_articles + articles
    return(all_articles)


Amnesty_all = []
for i in range(2010,2013):
    print 'Processing ' + str(i) + '...'
    Amnesty_year =  get_articles(str(i),'Saddam Hussein')
    Amnesty_all = Amnesty_all + Amnesty_year
    # print Amnesty_all


keys = Amnesty_all[0].keys()
with open('saddam_hussein_2003_09_11.csv', 'wb') as output_file:
    dict_writer = csv.DictWriter(output_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(Amnesty_all)
