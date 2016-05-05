"""
explore.py

A Flask Blueprint module for the explore data page.
"""
from flask import Blueprint, render_template, current_app, request, Response
import json
from .. import common as c


explore = Blueprint('explore', __name__)

@explore.before_request
def requires_auth():
    """Checks that the user has authenticated before returning any page from the technical site."""
    auth = request.authorization
    if not auth or not c.check_auth(auth.username, auth.password):
        return c.authenticate()


@explore.route('/')
@explore.route('/loc_<int:locID>')
def index(locID=1):
    return render_template('explore/index.html', 
                           content=current_app.config['EXPLORE_CONFIG'],
                           loc=locID,
                           week=c.api('/epi_week'))
