"""
explore.py

A Flask Blueprint module for the explore data page.
"""
from flask import Blueprint, render_template, current_app, request, Response
import json
from .. import common as c


explore = Blueprint('explore', __name__)

@explore.route('/')
def index():
    return render_template('explore/index.html', 
                           content=current_app.config['EXPLORE_CONFIG'],
                           week=c.api('/epi_week'))

