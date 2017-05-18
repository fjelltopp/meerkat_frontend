"""
technical.py

A Flask Blueprint module for the technical site.
"""
from flask import Blueprint, render_template, current_app, g
from .. import common as c
from meerkat_frontend import auth
from slugify import slugify
import meerkat_frontend


technical = Blueprint('technical', __name__, url_prefix='/<language>')


@technical.before_request
def requires_auth():
    """
    Checks that the user has authenticated before returning any page from
    this Blueprint.
    """
    # We load the arguments for check_auth function from the config files.
    auth.check_auth(
        *current_app.config['AUTH'].get('technical', [['BROKEN'], ['']])
    )


@technical.route('/')
@technical.route('/<tab>')
@technical.route('/<tab>/loc_<int:locID>')
def index(tab=None, locID=0):
    """
    Serves a tab for the technical dashboard, filtered by the specified
    location.
    """

    # If no tab is provided, load the first tab in the tab list the user
    # has access to.

    if locID == 0:
        locID = g.allowed_location
    if tab is None:
        for t in current_app.config['TECHNICAL_CONFIG']['tabs']:
            country = current_app.config['TECHNICAL_CONFIG']['auth_country']
            tab_access = t.get('access', False)
            in_arr = meerkat_frontend.in_array(
                tab_access,
                g.payload['acc'][country]
            )
            if in_arr or not tab_access:
                tab = slugify(t['name'])
                break

    pageState = ("{ type: 'tab', dataID: '" + tab + "', locID: " +
                 str(locID) + " }")

    return render_template(
        'technical/index.html',
        content=current_app.config['TECHNICAL_CONFIG'],
        page=pageState,
        langauge=g.get("language", current_app.config["DEFAULT_LANGUAGE"]),
        week=c.api('/epi_week'),
        user=g.payload
    )


@technical.route('/alerts/<alertID>')
def alert(alertID=1):
    """
    Serves an individual alert investigation report for the given alert ID.
    """
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
def disease(diseaseID='tot_1', locID=1):
    """
    Serves a disease report page for the given aggregation variable and
    lcoation ID.
    """
    pageState = ("{ type: 'disease', dataID: '" + str(diseaseID) +
                 "', locID: " + str(locID) + " }")
    return render_template(
        'technical/index.html',
        content=current_app.config['TECHNICAL_CONFIG'],
        page=pageState,
        langauge=g.get("language", current_app.config["DEFAULT_LANGUAGE"]),
        week=c.api('/epi_week')
    )
