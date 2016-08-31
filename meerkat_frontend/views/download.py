"""
download.py

A Flask Blueprint module for the download site.
"""
from flask import Blueprint, render_template, current_app, request, Response
import json
from .. import common as c
import authorise as auth

download = Blueprint('download', __name__, url_prefix="/<language>")

@download.before_request
def requires_auth():
    """Checks that the user has authenticated before returning any page from this Blueprint."""
    auth.check_auth( ['registered'] )

@download.route('/')
def index():
    return render_template('download/index.html', 
                           content=current_app.config['DOWNLOAD_CONFIG'],
                           week=c.api('/epi_week'))
