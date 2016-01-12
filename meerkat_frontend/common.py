"""
common.py

Shared functions for meerkat_frontend.
"""
from datetime import datetime, timedelta
from dateutil.parser import parse

from flask import current_app, abort
import requests
from requests.auth import HTTPBasicAuth


def api(url):
    """Returns JSON data from API request"""
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
