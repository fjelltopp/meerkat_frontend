"""
technical.py

A Flask Blueprint module for the technical site.
"""
from flask import Blueprint, render_template, current_app, request, Response
import json
from .. import common as c

technical = Blueprint('technical', __name__)

def check_auth(username, password):
    """This function is called to check if a username / password combination is valid."""
    return username == 'admin' and password == 'secret'

def authenticate():
    """Sends a 401 response that enables basic auth."""
    return Response(
    'Could not verify your access level for that URL.\n'
    'You have to login with proper credentials', 401,
    {'WWW-Authenticate': 'Basic realm="Login Required"'})

@technical.before_request
def requires_auth():
    """Checks that the user has authenticated before returning any page from the technical site."""
    auth = request.authorization
    if not auth or not check_auth(auth.username, auth.password):
        return authenticate()

@technical.route('/')
@technical.route('/<tab>')
@technical.route('/<tab>/loc_<int:locID>')
def index(tab="demographics", locID=1):
    """Serves a tab for the technical dashboard, filtered by the specified location."""
    pageState = "{ type: 'tab', dataID: '" + tab + "', locID: " + str(locID) + " }"
    return render_template('technical/index.html', 
                           content=current_app.config['TECHNICAL_CONFIG'], 
                           page=pageState,
                           week=c.api('/epi_week'))

@technical.route('/alerts/<alertID>')
def alert( alertID=1 ):
    """Serves an individual alert investigation report for the given alert ID."""
    pageState = "{ type: 'alert', dataID: '" + alertID + "' }"
    return render_template('technical/index.html', 
                           content=current_app.config['TECHNICAL_CONFIG'], 
                           page=pageState,
                           week=c.api('/epi_week'))

@technical.route('/diseases/<diseaseID>/')
@technical.route('/diseases/<diseaseID>/loc_<int:locID>')
def disease( diseaseID='tot_1', locID=1 ):
    """Serves a disease report page for the given aggregation variable and lcoation ID."""
    pageState = "{ type: 'disease', dataID: '" + str(diseaseID) + "', locID: " + str(locID) + " }"
    return render_template('technical/index.html', 
                           content=current_app.config['TECHNICAL_CONFIG'], 
                           page=pageState,
                           week=c.api('/epi_week'))
