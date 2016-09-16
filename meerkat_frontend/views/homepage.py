"""
homepage.py

A Flask Blueprint module for the homepage.
"""
from flask import Blueprint, render_template, current_app, abort, g
from flask.ext.babel import get_translations, gettext

homepage = Blueprint('homepage', __name__,url_prefix='/<language>')

@homepage.route('/')
def index():
    return render_template('homepage/index.html', content=current_app.config['HOMEPAGE_CONFIG'])

