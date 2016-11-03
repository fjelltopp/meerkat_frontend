"""
common.py

Shared functions for meerkat_frontend.
"""
from datetime import datetime, timedelta
from dateutil.parser import parse
import meerkat_frontend
from flask import current_app, abort, send_file, Response, request
import requests, logging
import json, os
from requests.auth import HTTPBasicAuth
import authorise as auth


def check_auth(username, password):
    """This function is called to check if a username / password combination is valid.

       Args:
           username (str): The given username
           password (str): The given password

       Returns:
           bool: True if username/password combination is valid, false otherwise."""

    if not current_app.config["USE_BASIC_AUTH"]:
        return True
    if "~" in request.path:
        request_path = request.path.split("~")[0]
    else:
        request_path = request.path
    
    requested_object = request_path.strip("/").split("/")[1:] # To remove country code
    if len(requested_object) > 1 and "/".join(requested_object[:2]) in current_app.config["AUTH"]:
        logging.info("Found AUTH for level 2")
        auth_object = current_app.config["AUTH"]["/".join(requested_object[:2])]
        return username == auth_object["USERNAME"] and password == auth_object["PASSWORD"]
    elif requested_object[0] in current_app.config["AUTH"]:
        logging.info("Found AUTH for level 1")        
        auth_object = current_app.config["AUTH"][requested_object[0]]
        return username == auth_object["USERNAME"] and password == auth_object["PASSWORD"]
    else:
        return username == current_app.config["USERNAME"] and password == current_app.config["PASSWORD"]

def authenticate():
    """Sends a 401 response that enables basic auth."""
    return Response(
    'Could not verify your access level for that URL.\n'
    'You have to login with proper credentials', 401,
    {'WWW-Authenticate': 'Basic realm="Login Required"'})

def api(url, api_key=False, params=None):
    """Returns JSON data from API request.
       Args:
           url (str): The Meerkat API url from which data is requested
           api_key (optional bool): Whethe or not we should include the api key. Defaults to False.
       Returns:
           dict: A python dictionary formed from the API reponse json string.
    """
    if( current_app.config['TESTING'] ):
        path = os.path.dirname(os.path.realpath(__file__))+"/apiData"+url
        with open(path+'.json') as data_file:    
            return json.load(data_file)
    else:
        api_request = ''.join([current_app.config['INTERNAL_API_ROOT'], url])
        try:
            if api_key:
                r = requests.get(
                    api_request,
                    headers = {'authorization': 'Bearer ' + auth.get_token()},
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
            abort(500, r )
        return output

def refine_hermes_topics(topics):
    """
    We don't want mass emails to be sent from the dev environment, but we do want the ability to test.

    This function takes a list of hermes topics, and if we are in the development/testing 
    environment (determined by HERMES_DEV) this function strips them back to only those topics
    in the config variable HERMES_DEV_TOPICS.

    Args:
        topics ([str]) A list of topic ids that a message is initially intended to be published to.

    Returns:
        [str] A refined list of topic ids containing only those topics from HERMES_DEV_TOPICS, if
        HERMES_DEV == 1. 
    """
    #Do some logging.
    logging.warning( "Topics: " + str( topics ) )
    logging.warning( "Allowed topics: " + str( meerkat_frontend.app.config["HERMES_DEV_TOPICS"] ) )

    #Make topics a list if it isn't already one.
    topics = [topics] if not isinstance( topics, list ) else topics

    #If in development/testing environment, remove topics that aren't pre-specified as allowed.
    if meerkat_frontend.app.config["HERMES_DEV"]:
        for t in range( len(topics)-1, -1, -1 ):
            if topics[t] not in meerkat_frontend.app.config["HERMES_DEV_TOPICS"]:
                del topics[t]

    return topics


def hermes(url, method, data={}):
    """Makes a Hermes API request.
       
       Args:
           url (str): The Meerkat Hermes url for the desired function.
           method (str):  The desired HTML function: GET, POST or PUT.
           data (optional dict): The data to be sent to the url. Defaults to ```{}```.

       Returns:
           dict: a dictionary formed from the json data in the response.
    """
    
    if 'publish' in url: 
        #If we are in the dev envirnoment only allow publishing to specially selected topics. 
        topics = refine_hermes_topics( data.get('topics', []) )
        #Return an error message if we have tried to publish a mass email from the dev envirnoment. 
        if not topics:
            return {"message": "No topics to publish to, perhaps because system is in hermes dev mode."}
        else:
            data['topics'] = topics
    
    #Add the API key and turn into JSON.
    data["api_key"] = meerkat_frontend.app.config['HERMES_API_KEY']

    #Assemble the other request params.
    url = meerkat_frontend.app.config['HERMES_ROOT'] + url 
    headers = {'content-type' : 'application/json'}

    logging.warning( "Sending json data: " + json.dumps(data) +"\nTo url: " + url )
    
    #Make the request and handle the response.
    try:
        r = requests.request( method, url, json=data, headers=headers)
    except requests.exceptions.RequestException as e:
        abort(500, "request")
    return r.json()

def epi_week_to_date(epi_week, year=datetime.today().year):
    """Converts an epi_week to a datetime object.
    
       Args:
           epi_week (int): The epi week to convert.
           year (optional int): The year of the epi-week to convert. Defaults to current year.

       Returns:
           datetime: a datetime object for the given epiweek."""
    api_request = "/epi_week_start/{}/{}".format(year, epi_week)
    data = api(api_request)
    return parse(data["start_date"]) + timedelta(days=7)


def date_to_epi_week(day=datetime.today()):
    """Converts a datetime object to an epi_week.
 
       Args:
           day (optional datetime): The date for which to find the corressponding epi week. 
               Defaults to today.
        
       Returns:
           int: the epi week number for the week that contains the given date.
    """
    api_request = "/epi_week/{}".format(day.isoformat())
    data = api(api_request)
    return data["epi_week"]
