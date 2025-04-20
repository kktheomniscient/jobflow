import requests
from bs4 import BeautifulSoup
import os
from dotenv import load_dotenv
import psycopg2
import json  # Import the json module
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

def extract_featured_jobs_from_url(url):
    """
    Extracts featured jobs from the given URL.

    Args:
        url (str): The URL of the page to scrape.

    Returns:
        list: A list of dictionaries, where each dictionary represents a job.
              Returns an empty list if no jobs are found or if an error occurs.
    """
    try:
        # Send an HTTP GET request to the URL
        response = requests.get(url)
        response.raise_for_status()

        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')

        jobs = []
        # Find the main container
        main_container = soup.find('div', class_='sc-fa532d7-1')
        if main_container:
            # Find all job elements within the main container
            job_elements = main_container.find_all('div', class_='sc-7c1b58ff-0')
            for job_element in job_elements:
                try:
                    # Extract job details
                    title_element = job_element.find('div', class_='etmRhT')
                    company_element = job_element.find('div', class_='jHwvAU')
                    location_element = job_element.find('div', class_='iuWDyb')
                    description_element = job_element.find('div', class_='prose')
                    apply_element = job_element.find('a', class_='gFhnqg')  # Get the apply link
                    short_tags_elements = job_element.find_all('span', class_='cKTdnH') #find all short tags
                    pay_and_experience_parent_element = job_element.find_all('div', class_='hsLjb') #find parent of pay and experience div


                    title = title_element.text.strip().replace("- lightning job by cutshort ⚡", "").strip() if title_element else "N/A"
                    title = ' '.join(word.capitalize() for word in title.split()) # Capitalize first letter of each word
                    company = company_element.text.strip().replace("at ", "").strip() if company_element else "N/A"
                    location = location_element.text.strip() if location_element else "N/A"
                    # description = description_element.text.strip() if description_element else "N/A" #remove this line
                    apply_link = apply_element['href'] if apply_element else "N/A"  # Extract the href
                    short_tags = [tag.text.strip() for tag in short_tags_elements] if short_tags_elements else []
                    pay_divs = pay_and_experience_parent_element[1].find_all('div')
                    pay = pay_divs[1].text.strip() if pay_divs and len(pay_divs) > 1 else "N/A" #extract pay
                    experience_divs = pay_and_experience_parent_element[0].find_all('div')
                    experience = experience_divs[1].text.strip() if experience_divs and len(experience_divs) > 1 else "N/A"


                    job_data = {
                        'title': title,
                        'company': company,
                        'location': location,
                        'description': str(description_element), # change to this
                        'apply_link': apply_link,
                        'tags': json.dumps(short_tags),  # Convert the list to a JSON string
                        'pay': pay,
                        'experience': experience,
                        'created_at': datetime.now()
                    }
                    jobs.append(job_data)
                except AttributeError as e:
                    print(f"Error extracting data from one job element: {e}. Skipping.")

        return jobs

    except requests.exceptions.RequestException as e:
        print(f"Error fetching the URL: {e}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return []

def main():
    """
    Main function to set the URL, extract the job data, and push it to the database.
    This function is designed to run independently of a Django environment.
    """
    url = "https://cutshort.io/jobs"
    jobs = extract_featured_jobs_from_url(url)

    if jobs:
        print(f"Found {len(jobs)} featured jobs. Now pushing to the database.")

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

        # Establish connection using psycopg2
        try:
            conn = psycopg2.connect(
                user=user,
                password=password,
                host=host,
                port=port,
                dbname=dbname,
            )
            cursor = conn.cursor()

            # Use a more generic table name, assuming it's not Django managed.
            table_name = "jobs_job"

            for job in jobs:
                # Include created_at in the columns and values.
                columns = ", ".join(job.keys())
                values = ", ".join(["%s"] * len(job))
                # Exclude the unique key from updates
                update_columns = [col for col in job.keys() if col != "apply_link"]
                update_clause = ", ".join([f"{col} = EXCLUDED.{col}" for col in update_columns])

                sql = f"INSERT INTO {table_name} ({columns}) VALUES ({values}) ON CONFLICT (apply_link) DO UPDATE SET {update_clause};"
                # sql = f"INSERT INTO {table_name} ({columns}) VALUES ({values}) ON CONFLICT (apply_link) DO NOTHING"
                try:
                    # Pass the entire job dictionary's values.
                    cursor.execute(sql, list(job.values()))
                    conn.commit()
                    print(f"Successfully inserted job: {job['title']}")
                except Exception as e:
                    print(f"Error inserting job: {job['title']}. Error: {e}")
                    conn.rollback()

            cursor.close()
            conn.close()
            print("Successfully closed the database connection.")

        except psycopg2.Error as e:
            print(f"Error connecting to the database: {e}")
    else:
        print("No featured jobs found or an error occurred.")


if __name__ == "__main__":
    main()
