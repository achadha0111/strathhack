from urllib import FancyURLopener
import json
from bs4 import SoupStrainer, BeautifulSoup
import time

'''Class to provide custom user header to prevent blocking by Google\'s bot watchers. '''
class MyOpener(FancyURLopener):
    version = 'Mozilla/5.0 (X11; U; Linux i686) Gecko/20071127 Firefox/2.0.0.11'
openurl = MyOpener().open




'''Create custom object for each internship '''
class Internships:
	#Constructor
	def __init__(self, title, organisation, start_date, duration, stipend, apply_by, company_details, internship_details, details_url):
		self.title = title
		self.organisation = organisation
		self.start_date = start_date
		self.duration = duration
		self.stipend = stipend
		self.apply_by = apply_by
		self.company_details = company_details
		self.internship_details = internship_details
		self.details_url = details_url
	#Pretty Printer
	def __repr__(self):
		return '"title": "%s", "organisation": "%s", "start_date": "%s", "duration": "%s", "stipend": "%s", "apply_by": "%s",  "organisation_details": "%s",  "internship_details": "%s", "application_url": "%s"' % (self.title, self.organisation, self.start_date, self.duration, self.stipend, self.apply_by, self.company_details, self.internship_details, self.details_url)



data = [] # Empty list used later to create json 
'''Loop over pages
Internshaala has about 23 pages for Mumbai, you'd have to change the range for that'''
for i in range(1, 18):
	time.sleep(60)
	# Modifying url
	url = 'https://internshala.com/internships/internship-in-delhi/page-' + str(i)
	page = BeautifulSoup(openurl(url).read(), "lxml", parse_only=SoupStrainer('div', id='internship_list_container'))

	
	
	for internships in page.find_all('div', {'class': 'individual_internship'}):
		organisations  = internships.find_all('div', {'class': 'individual_internship_header'})

		organisation = organisations[0].find('a').get('title') # Organisation name
		title = organisations[0].find_all('h4')[0].text.encode('utf-8').strip() # Internship Title
		buttons = internships.find_all('div', {'class': 'button_container'})
		
		''' Simulate button click'''
		for link_buttons in buttons:
			time.sleep(30)
			for details in link_buttons.find_all('a', href=True):
				details_url = 'https://internshala.com/'+details['href']
				details_page = BeautifulSoup(openurl(details_url).read(), "lxml", parse_only=SoupStrainer('div', {'class': 'table-cell'}))
				individual_internship_details = details_page.find_all('td')

				''' Pick relevant information from the table on details page'''
				start_date = individual_internship_details[0].text.encode('utf-8').strip()
				duration = individual_internship_details[1].text.encode('utf-8').strip()
				stipend = individual_internship_details[2].text.encode('utf-8').strip()
				apply_by = individual_internship_details[4].text.encode('utf-8').strip()
			

				''' Get description '''
				internship_description = details_page.find_all('div', {'class':'freetext-container'})

				''' Internship Details'''
				company_details = internship_description[0].text.encode('ascii','ignore').strip()
				internship_details = internship_description[1].text.encode('ascii','ignore').strip()
				
					
				''' Create an array of internships'''			
				data.append(Internships(title, organisation, start_date, duration, stipend, apply_by, company_details, internship_details, details_url))

				'''Print last element added'''
				print data[-1]

	'''Reports page status to std output'''
	print "Page " + str(i) + "done."


''' Convert to JSON'''
json_data = json.dumps(data, indent=4, default=lambda o: o.__dict__)	

'''Writes to file.'''
with open('internshaala.json', 'a') as f:
	f.write(json_data) 
     			
				
