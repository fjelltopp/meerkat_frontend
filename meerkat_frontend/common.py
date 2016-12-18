"""
common.py

Shared functions for meerkat_frontend.
"""
from datetime import datetime, timedelta
from dateutil.parser import parse
from flask import abort
from meerkat_frontend import app
import authorise as auth
import requests
import logging
import json
import os


def api(url, api_key=False, params=None):
    """
    Returns JSON data from API request.
    Args:
        url (str): The Meerkat API url from which data is requested
        api_key (optional bool): Whethe or not we should include the api
        key. Defaults to False.
    Returns:
        dict: A python dictionary formed from the API reponse json string.
    """
    if(app.config['TESTING']):
        path = os.path.dirname(os.path.realpath(__file__))+"/apiData"+url
        with open(path+'.json') as data_file:
            return json.load(data_file)
    else:
        api_request = ''.join([app.config['INTERNAL_API_ROOT'], url])
        try:
            if api_key:
                r = requests.get(
                    api_request,
                    headers={'authorization': 'Bearer ' + auth.get_token()},
                    params={"other": params}
                )
            else:
                r = requests.get(
                    api_request,
                    params={"other": params}
                )
        except requests.exceptions.RequestException as e:
            abort(500, e)
        try:
            output = r.json()
        except Exception as e:
            abort(500, r)
        return output


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

    # Add the API key and turn into JSON.
    data["api_key"] = app.config['HERMES_API_KEY']

    # Assemble the other request params.
    url = app.config['HERMES_ROOT'] + url
    headers = {'content-type': 'application/json'}

    logging.warning("Sending json: " + json.dumps(data) + "\nTo url: " + url)

    # Make the request and handle the response.
    try:
        r = requests.request(method, url, json=data, headers=headers)
        logging.warning(r)
    except requests.exceptions.RequestException:
        abort(500, "request")
    return r.json()


def epi_week_to_date(epi_week, year=datetime.today().year):
    """Converts an epi_week to a datetime object.

       Args:
           epi_week (int): The epi week to convert.
           year (optional int): The year of the epi-week to convert. Defaults
           to current year.

       Returns:
           datetime: a datetime object for the given epiweek."""
    api_request = "/epi_week_start/{}/{}".format(year, epi_week)
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
    api_request = "/epi_week/{}".format(day.isoformat())
    data = api(api_request)
    return data["epi_week"]
