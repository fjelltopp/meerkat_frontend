"""
common.py

Shared functions for meerkat_frontend.
"""
from datetime import datetime, timedelta
from dateutil.parser import parse
from flask import abort, request
from meerkat_frontend import app, auth
import requests
import logging
import json
import os


def api(url, params=None):
    """
    Returns JSON data from API request.
    Args:
        url (str): The Meerkat API url from which data is requested
    Returns:
        dict: A python dictionary formed from the API reponse json string.
    """
    if(app.config['TESTING']):
        path = os.path.dirname(os.path.realpath(__file__))+"/apiData"+url
        with open(path+'.json') as data_file:
            return json.load(data_file)
    else:
        api_uri = add_domain(''.join([app.config['INTERNAL_API_ROOT'], url]))

        try:
            headers = {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + auth.get_token()
            }
            r = requests.get(api_uri, headers=headers, params=params)
            if r.status_code == 502:
                abort(500, "Can not access the api at " + api_uri)
        except requests.exceptions.RequestException as e:
            logging.error("Failed to access the API.")
            logging.error(e)
            abort(500, "Failed to access the API.")
        try:
            output = r.json()
        except Exception as e:
            logging.error("Failed to convert API response to JSON.")
            logging.error(e)
            abort(500, "Failed to convert API response to JSON.")
        return output


def authenticate(username=app.config['SERVER_AUTH_USERNAME'],
                 password=app.config['SERVER_AUTH_PASSWORD']):
    """
    Makes an authentication request to meerkat_auth using the specified
    username and password, or the server username and password by default by
    default.

    Returns:
        str The JWT token.
    """
    # Assemble auth request params
    url = app.config['AUTH_ROOT'] + '/api/login'
    data = {'username': username, 'password': password}
    headers = {'content-type': 'application/json'}

    # Make the auth request and log the result
    try:
        r = requests.request('POST', url, json=data, headers=headers)
        logging.warning("Received authentication response: " + str(r))
    except requests.exceptions.RequestException as e:
        logging.error("Failed to access Auth.")
        logging.error(e)
        abort(500, "Problem accessing the Auth api.")

    # Log an error if authentication fails, and return an empty token
    if r.status_code != 200:
        logging.error('Authentication as {} failed'.format(username))
        return ''

    # Return the token
    return r.cookies.get('meerkat_jwt', '')


def hermes(url, method, data={}):
    """
    Makes a Hermes API request.
    Args:
       url (str): The Meerkat Hermes url for the desired function.
       method (str):  The desired HTML function: GET, POST or PUT.
       data (optional dict): The data to be sent to the url. Defaults
       to ```{}```.
    Returns:
       dict: a dictionary formed from the json data in the response.
    """
    # Assemble the request params.
    url = app.config['HERMES_ROOT'] + url
    headers = {'content-type': 'application/json',
               'authorization': 'Bearer {}'.format(authenticate())}

    # Log the request
    logging.info("Sending json: {}\nTo url: {}\nWith headers: {}".format(
                  json.dumps(data), url, headers))

    # Make the request and handle the response.
    try:
        r = requests.request(method, url, json=data, headers=headers)
    except requests.exceptions.RequestException as e:
        logging.error("Failed to access Hermes.")
        logging.error(e)
        abort(500, "Problem accessing the Hermes api.")

    try:
        return r.json()
    except Exception as e:
        logging.error('Failed to convert Hermes response to json.')
        logging.error(e)
        abort(500, 'Hermes API response could not be converted to json.')


def epi_week_to_date(epi_week, year=datetime.today().year):
    """Converts an epi_week to a datetime object.

       Args:
           epi_week (int): The epi week to convert.
           year (optional int): The year of the epi-week to convert. Defaults
           to current year.

       Returns:
           datetime: a datetime object for the end of the given epiweek."""
    api_request = "epi_week_start/{}/{}".format(year, epi_week)
    data = api(api_request)
    return parse(data["start_date"]) + timedelta(days=7)


def date_to_epi_week(day=datetime.today()):
    """Converts a datetime object to an epi_week.

       Args:
           day (optional datetime): The date for which to find the
                corressponding epi week. Defaults to today.

       Returns:
           int: the epi week number for the week that contains the given date.
    """
    api_request = "epi_week/{}".format(day.isoformat())
    data = api(api_request)
    return data["epi_week"]


def add_domain(path):
    """
    Add's the domain from the request to the begining of the specified path.
    Path shuld begin with a forward slash e.g. /index.html would become
    jordan.emro.info/index.html for the jordan site.

    Args:
        path (str): The path of the url that you want to prefix with
            the request's domain.
    Returns:
        string: The path prefixed with the request's domain.
    """
    url = path
    domain = '/'.join(request.url_root.split('/')[0:3])
    if path[0] == '/':
        url = domain + path
    return url
