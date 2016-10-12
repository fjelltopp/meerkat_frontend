"""
homepage.py

A Flask Blueprint module for the homepage.
"""
from flask import Blueprint, render_template, current_app, abort, g, request, make_response, redirect, flash
from flask.ext.babel import get_translations, gettext
from meerkat_frontend import app
from .. import common as c
import requests
import authorise as auth


homepage = Blueprint('homepage', __name__,url_prefix='/<language>')

@homepage.route('/')
def index():
    return render_template(
        'homepage/index.html', 
        content=current_app.config['HOMEPAGE_CONFIG'],
    )

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
    r = requests.post( url, json = request.json ) 
    return (r.text, r.status_code, r.headers.items())

@homepage.route('/logout')
def logout():
    """
    Logs a user out. This involves delete the current jwt stored in a cookie and 
    redirecting to the specified page.  We delete a cookie by changing it's
    expiration date to immediately. Set the page to be redirected to using url
    params, eg. /logout?url=https://www.google.com

    Get Args:
        url (str) The url of the page to redirect to after logging out.

    Returns:
        A redirect response object that also sets the cookie's expiration time to 0.
    """
    url = request.args.get('url', '/')
    response = make_response( redirect(url) )
    response.set_cookie( current_app.config["JWT_COOKIE_NAME"], value="", expires=0 )
    g.payload = {}
    return response

@homepage.route('/account_settings', methods=['GET', 'POST'])
@auth.authorise( *app.config['AUTH'].get('settings', [['BROKEN'],['']]) )
def account_settings():
    """
    Shows the account settings page.
    """
    if request.method == 'GET':
        current_app.logger.warning("GET called")
        return render_template(
            'homepage/account_settings.html', 
            content=current_app.config['TECHNICAL_CONFIG'],
            week=c.api('/epi_week')
        )

    elif request.method == 'POST':
        url = current_app.config['INTERNAL_AUTH_ROOT'] + "/api/update_user"
        r = requests.post( url, json = request.json )
        return (r.text, r.status_code, r.headers.items())
