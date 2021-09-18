from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import pandas as pd
import os

def standings_scraper():
    # Instantiate an Options object
    # and add the "--headless" argument
    opts = Options()
    opts.add_argument(" --headless")

    # # If necessary set the path to you browser’s location
    # opts.binary_location= os.getcwd() +'\\GoogleChromePortable\GoogleChromePortable.exe'

    # Set the location of the webdriver
    chrome_driver = os.getcwd() +"\\chromedriver.exe"
    # Instantiate a webdriver
    driver = webdriver.Chrome(options=opts, executable_path=chrome_driver)

    # To scrape a url rather than a local file 
    # just do something like this
    driver.get("https://www.mlssoccer.com/standings/2021/supporters-shield")

    # Put the page source into a variable and create a BS object from it
    soup_file = driver.page_source
    soup = BeautifulSoup(soup_file, features = "lxml")

    driver.quit()

    table = soup.find('table')
    table_rows = table.find_all('tr')

    # Load and print the title and the text of the <div>
    l = []

    for tr in table_rows:
        td = tr.find_all('td')
        for tr in td:
            print(tr)
        row = [tr.text for tr in td]
        l.append(row)

    df = pd.DataFrame(l, columns=["rank","club","points","PPG","GP","W","L","T","GF","GA","GD","Home","Away"])

    return df


def main():
    standings = standings_scraper()

if __name__ == "__main__":
    main()
