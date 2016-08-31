"""
homepage.py

A Flask Blueprint module for the homepage.
"""
from flask import Blueprint, render_template, current_app, abort, g, request
from flask.ext.babel import get_translations, gettext
import requests

homepage = Blueprint('homepage', __name__,url_prefix='/<language>')

@homepage.route('/')
def index():
    return render_template('homepage/index.html', content=current_app.config['HOMEPAGE_CONFIG'])

@homepage.route('/login')
def login():
    url = request.args.get('url', '/en/technical')
    return render_template(
        'homepage/login.html', 
        content=current_app.config['HOMEPAGE_CONFIG'],
        redirect=url
    )

@homepage.route('/login_request', methods=['POST'])
def login_request():
    """
    Make a login request to the authentication module.
    Can't do this directly from the browser because of the "same-origin policy".
    Browser scripts can't make cross domain POST requests.
    """
    url = current_app.config['INTERNAL_AUTH_ROOT'] + "/api/login"
    current_app.logger.warning(url)
    current_app.logger.warning( request.json )
    r = requests.post( url, json = request.json ) 
    current_app.logger.warning(r)
    return (r.text, r.status_code, r.headers.items())
