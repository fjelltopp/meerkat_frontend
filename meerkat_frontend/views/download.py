"""
download.py

A Flask Blueprint module for the download site.
"""
from flask import Blueprint, render_template, current_app, request, Response
import json
from .. import common as c

download = Blueprint('download', __name__)

@download.route('/')
def index():
    return render_template('download/index.html', 
                           content=current_app.config['DOWNLOAD_CONFIG'],
                           week=c.api('/epi_week'))
