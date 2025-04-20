import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import time  # Import the time module
import os
from dotenv import load_dotenv
import psycopg2

# Load environment variables from .env file
load_dotenv()

def scrape_topstartups_data(base_url, num_pages=2):
    """
    Scrapes data from multiple pages of the TopStartups job listing page,
    with a delay between requests, and inserts the data into a database.

    Args:
        base_url (str): The base URL of the TopStartups job listing page
                        (without the page number).
        num_pages (int, optional): The number of pages to scrape. Defaults to 10.

    Returns:
        None: This function inserts data into a database and does not return a value.
    """
    # Database connection parameters from .env
    user = os.environ.get("DB_USER")
    password = os.environ.get("DB_PASSWORD")
    host = os.environ.get("DB_HOST")
    port = os.environ.get("DB_PORT")
    dbname = os.environ.get("DB_NAME")

    # Check for missing parameters
    if not all([user, password, host, port, dbname]):
        print("Error: Database connection parameters are incomplete. Check your .env file.")
        return

    try:
        # Establish database connection
        conn = psycopg2.connect(
            user=user,
            password=password,
            host=host,
            port=port,
            dbname=dbname,
        )
        cursor = conn.cursor()
        table_name = "jobs_job"  # changed table name
        all_jobs_data = [] # Initialize list to store all job data

        for page_num in range(1, num_pages + 1):
            url = f"{base_url}&page={page_num}"  # Construct the URL for each page
            print(f"Scraping page: {page_num}")

            try:
                response = requests.get(url)
                response.raise_for_status()  # Raise an exception for bad status codes

                soup = BeautifulSoup(response.content, 'html.parser')

                # Find the job listings.
                job_listings = soup.find_all('div', class_='card card-body')

                if not job_listings:
                    print(f"No job listings found on page {page_num}. Skipping.")
                    continue  # Skip to the next page

                page_extracted_data = []
                for job_listing in job_listings:
                    try:
                        # Extract data from each job listing.
                        title_element = job_listing.find('h5', id='job-title')
                        title = title_element.text.strip() if title_element else "N/A"
                        title = title.replace("New", "").strip()  # Remove "New" from title

                        company_elements = job_listing.find_all('a', id='startup-website-link')
                        company = "N/A"
                        apply_link = "N/A"  # default value
                        if company_elements:
                            for i, company_element in enumerate(company_elements):
                                if i % 2 == 0:  # extract from odd a tags
                                    h7_tag = company_element.find('h7')
                                    if h7_tag:
                                        company = h7_tag.text.strip() if h7_tag else "N/A"
                                elif i % 2 != 0:  # extract apply link from even a tags
                                    apply_link = company_element['href']

                        location_element = job_listing.find('i', class_='fas fa-map-marker-alt')
                        location = location_element.parent.text.strip() if location_element else "N/A"

                        description = "N/A"
                        description_element = job_listing.find('b', id='card-header')
                        if description_element:
                            p_tag = description_element.find_parent('p')
                            if p_tag:
                                text_parts = []
                                for child in p_tag.contents:
                                    if child.name == 'span' or child.name == 'b':
                                        continue
                                    if isinstance(child, str):
                                        text_parts.append(child.strip())
                                description = ' '.join(text_parts).strip()

                        tags_elements = job_listing.find_all('span', class_='badge')
                        short_tags = [tag.text.strip() for tag in tags_elements] if tags_elements else []

                        pay_element = job_listing.find('span', class_='salary')
                        pay = pay_element.text.strip() if pay_element else "Not listed"  # changed

                        experience = "N/A"  # default
                        experience_element = job_listing.find('i', class_='fas fa-briefcase')  # changed
                        if experience_element:
                            experience_text = experience_element.parent.text.strip()  # changed to extract from the parent h7 tag
                            experience = experience_text.replace("Experience: ", "").strip()  # Remove "Experience: "

                        # Create a dictionary for the job listing data
                        job_data = {
                            'title': title,
                            'company': company,
                            'location': location,
                            'description': description,
                            'apply_link': apply_link,
                            'tags': json.dumps(short_tags),
                            'pay': pay,
                            'experience': experience,
                            'created_at': datetime.now()
                        }
                        page_extracted_data.append(job_data)
                    except AttributeError as e:
                        print(
                            f"Failed to extract data from a job listing on page {page_num}: {e}. Skipping.")
                        continue  # Skip to the next job listing

                if len(page_extracted_data) > 1:
                    jobs = page_extracted_data[1:-1]  # Remove first and last
                elif len(page_extracted_data) == 1:
                    jobs = []
                else:
                    jobs = page_extracted_data
                
                all_jobs_data.extend(jobs) # Extend the list

                time.sleep(2)  # Wait for 2 seconds before the next request

            except requests.exceptions.RequestException as e:
                print(f"Error fetching page {page_num}: {e}")
                break  # Stop scraping if there's an error fetching a page
            except Exception as e:
                print(f"An unexpected error occurred on page {page_num}: {e}")
                break  # Stop scraping for other errors as well
        
        if all_jobs_data: # Check if there is any data to insert
            columns = ", ".join(all_jobs_data[0].keys())
            values = ", ".join(["%s"] * len(all_jobs_data[0]))
            update_columns = [col for col in all_jobs_data[0].keys() if col != "apply_link"]
            update_clause = ", ".join([f"{col} = EXCLUDED.{col}" for col in update_columns])
            sql = f"INSERT INTO {table_name} ({columns}) VALUES ({values}) ON CONFLICT (apply_link) DO UPDATE SET {update_clause};"
            try:
                cursor.executemany(sql, [list(job.values()) for job in all_jobs_data])
                conn.commit()
                print(f"Successfully inserted {len(all_jobs_data)} jobs into the database.")
            except Exception as e:
                print(f"Error inserting jobs into the database: {e}")
                conn.rollback()

        cursor.close()
        conn.close()
        print("Successfully closed the database connection.")

    except psycopg2.Error as e:
        print(f"Error connecting to the database: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")



if __name__ == "__main__":
    base_url = "https://topstartups.io/jobs/?job_location=India&startup__markets=Artificial+Intelligence&startup__markets=Analytics&startup__markets=Biotech&startup__markets=Crypto&startup__markets=Cybersecurity&startup__markets=Data+Science&startup__markets=E-Commerce&startup__markets=EdTech&startup__markets=Enterprise+Software&startup__markets=FinTech&startup__markets=Hardware&startup__markets=SaaS&startup__company_size=1-10+employees&startup__company_size=11-50+employees&startup__company_size=51-100+employees&startup__company_size=101-200+employees&startup__company_size=201-500+employees"
    scrape_topstartups_data(base_url)
