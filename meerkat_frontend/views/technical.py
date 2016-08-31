"""
technical.py

A Flask Blueprint module for the technical site.
"""
from flask import Blueprint, render_template, current_app, request, Response, g
import json
from .. import common as c
import authorise as auth

technical = Blueprint('technical', __name__,url_prefix='/<language>')

@technical.before_request
def requires_auth():
    """Checks that the user has authenticated before returning any page from this Blueprint."""
    auth.check_auth( ['registered'] )

@technical.route('/')
@technical.route('/<tab>')
@technical.route('/<tab>/loc_<int:locID>')
def index(tab="demographics", locID=1):
    """Serves a tab for the technical dashboard, filtered by the specified location."""
    pageState = "{ type: 'tab', dataID: '" + tab + "', locID: " + str(locID) + " }"

    return render_template(
        'technical/index.html', 
        content=current_app.config['TECHNICAL_CONFIG'], 
        page=pageState,
        langauge=g.get( "language", current_app.config["DEFAULT_LANGUAGE"] ),
        week=c.api('/epi_week'),
        user=g.payload
    )

@technical.route('/alerts/<alertID>')
def alert( alertID=1 ):
    """Serves an individual alert investigation report for the given alert ID."""
    pageState = "{ type: 'alert', dataID: '" + alertID + "' }"
    return render_template(
        'technical/index.html', 
        content=current_app.config['TECHNICAL_CONFIG'], 
        page=pageState,
        langauge=g.get("language", current_app.config["DEFAULT_LANGUAGE"]),
        week=c.api('/epi_week')
    )

@technical.route('/diseases/<diseaseID>/')
@technical.route('/diseases/<diseaseID>/loc_<int:locID>')
def disease( diseaseID='tot_1', locID=1 ):
    """Serves a disease report page for the given aggregation variable and lcoation ID."""
    pageState = ( "{ type: 'disease', dataID: '" + str(diseaseID) + 
                  "', locID: " + str(locID) + " }" )
    return render_template(
        'technical/index.html', 
        content=current_app.config['TECHNICAL_CONFIG'], 
        page=pageState,
        langauge=g.get("language", current_app.config["DEFAULT_LANGUAGE"]),
        week=c.api('/epi_week')
    )


