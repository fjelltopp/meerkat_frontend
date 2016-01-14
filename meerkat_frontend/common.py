"""
common.py

Shared functions for meerkat_frontend.
"""
from datetime import datetime, timedelta
from dateutil.parser import parse

from flask import current_app, abort, send_file
import requests
import json, os
from requests.auth import HTTPBasicAuth


def api(url):
    """Returns JSON data from API request"""
    if( current_app.config['TESTING'] ):
        path = os.path.dirname(os.path.realpath(__file__))+"/apiData"+url
        with open(path+'.json') as data_file:    
            return json.load(data_file)
    else:
        api_request = ''.join([current_app.config['API_ROOT'], url])
        try:
            r = requests.get(
                api_request,
                auth=HTTPBasicAuth(
                    current_app.config['REPORT_LIST']['basic_auth']['username'],
                    current_app.config['REPORT_LIST']['basic_auth']['password']
                ))

        except requests.exceptions.RequestException as e:
            abort(500, e)
        try:
            output = r.json()
        except Exception as e:
            abort(500, r )
        return output

def epi_week_to_date(epi_week, year=datetime.today().year):
    """Converts an epi_week (int) to a datetime object"""
    api_request = "/epi_week_start/{}/{}".format(year, epi_week)
    data = api(api_request)
    return parse(data["start_date"]) + timedelta(days=7)


def date_to_epi_week(day=datetime.today()):
    """Converts a datetime object to an epi_week (int)"""
    api_request = "/epi_week/{}".format(day.isoformat())
    data = api(api_request)
    return data["epi_week"]
