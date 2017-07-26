"""
explore.py

A Flask Blueprint module for the explore data page.
"""
from flask import Blueprint, render_template, current_app, g
from .. import common as c
from meerkat_frontend import auth

explore = Blueprint('explore', __name__, url_prefix="/<language>")


@explore.before_request
def requires_auth():
    """
    Checks that the user has authenticated before returning any page from this
    Blueprint.
    """
    # We load the arguments for check_auth function from the config files.
    auth.check_auth(
        *current_app.config['AUTH'].get('explore', [['BROKEN'], ['']])
    )


@explore.route('/')
@explore.route('/loc_<int:locID>')
def index(locID=None):
    """
    Returns the explore page.
    """
    # Initialise locID to allowed location
    # Can't be done during function declaration because outside app context
    locID = g.allowed_location if not locID else locID

    return render_template(
        'explore/index.html',
        content=g.config['EXPLORE_CONFIG'],
        loc=locID,
        week=c.api('/epi_week')
    )
