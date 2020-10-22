"""
homepage.py

A Flask Blueprint module for the homepage.
"""
from flask import Blueprint, render_template, current_app, g
from flask import request, make_response, redirect, flash, abort
from flask_babel import gettext
from meerkat_frontend import app, auth
from meerkat_frontend import common as c
from meerkat_frontend.messages import messages
from meerkat_libs import hermes
import requests
import logging
import datetime

# Register the homepage blueprint.
homepage = Blueprint('homepage', __name__, url_prefix='/<language>')
homepage_route = app.config.get("HOMEPAGE_ROUTE", "")


@homepage.route('/' + homepage_route)
def index():
    # Messages to be flashed to the user from the system admins
    messages.flash()
    return render_template(
        'homepage/index.html',
        content=g.config['HOMEPAGE_CONFIG'],
    )


@homepage.route('/login')
def login():
    # Enable url get args.
    url = request.args.get('url', '/en/technical')
    error = request.args.get('error', '')
    # If a mesage is specified show it.
    if error:
        flash(error, "error")
    # Return the login page.
    return render_template(
        'homepage/login.html',
        content=g.config['HOMEPAGE_CONFIG'],
        redirect=url
    )


@homepage.route('/login_request', methods=['POST'])
def login_request():
    """
    Make a login request to the authentication module.
    Can't do this directly from browser because of the "same-origin policy".
    Browser scripts can't make cross domain POST requests.
    """
    url = current_app.config['INTERNAL_AUTH_ROOT'] + "/api/login"
    r = requests.post(url, json=request.json)
    return (r.text, r.status_code, r.headers.items())


@homepage.route('/logout')
def logout():
    """
    Logs a user out. This involves delete the current jwt stored in a cookie
    and redirecting to the specified page.  We delete a cookie by changing it's
    expiration date to immediately. Set the page to be redirected to using url
    params, eg. /logout?url=https://www.google.com

    Get Args:
        url (str) The url of the page to redirect to after logging out.

    Returns:
        A redirect response object that also sets the cookie's expiration time
        to 0.
    """
    url = request.args.get('url', '/')
    response = make_response(redirect(url))
    response.set_cookie(
        current_app.config["JWT_COOKIE_NAME"],
        value="",
        expires=0
    )
    g.payload = {}
    return response


@homepage.route('/account_settings', methods=['GET', 'POST'])
@auth.authorise(*app.config['AUTH'].get('settings', [['BROKEN'], ['']]))
def account_settings():
    """
    Shows the account settings page.
    """
    if request.method == 'GET':
        current_app.logger.warning("GET called")
        return render_template(
            'homepage/account_settings.html',
            content=g.config['TECHNICAL_CONFIG'],
            week=c.api('/epi_week')
        )

    elif request.method == 'POST':
        url = current_app.config['INTERNAL_AUTH_ROOT'] + "/api/update_user"
        r = requests.post(url, json=request.json)
        return (r.text, r.status_code, r.headers.items())


@homepage.route('/fault', methods=['GET', 'POST'])
@auth.authorise(*app.config['AUTH'].get('fault-report', [['BROKEN'], ['']]))
def report_fault():
    """
    Enables users to directly report faults to the developer. This page
    displays a fault report form and generates a fault report email from the
    data it posts to the server.
    """
    # If a post request is made to the url, process the form's data.
    if request.method == 'POST':

        # Get the data from the POST request and initialise variables.
        data = request.form
        now = datetime.datetime.now().strftime("%I:%M%p on %B %d, %Y")
        deployment = current_app.config['DEPLOYMENT']

        # Create a simple string that displays the submitted data
        details = "<b>"
        for key, value in data.items():
            details = ''.join([
                details, key.capitalize(), ':</b> ', value, '<br/><br/><b>'
            ])

        # Send an email
        # TODO: Direct github issue creation if from a personal account.
        try:
            hermes('/email', 'PUT', data={
                'email': 'meerkatrequest@gmail.com',
                'subject': gettext('Fault Report') + ' | {} | {}'.format(
                    deployment,
                    data['url']
                ),
                'message': gettext('There was a fault reported at {} in the '
                                   '{} deployment. Here are the details...'
                                   '\n\n{}').format(now, deployment, details)
            })
        except Exception as e:
            logging.warning("Error sending email through hermes...")
            logging.warning(e)
            flash(gettext(
                'Could not notify developers. Please contact them directly.'
            ), 'error')
            abort(502)

        return render_template(
            'homepage/fault_report_response.html',
            content=g.config['TECHNICAL_CONFIG'],
            details=details.replace('\n', '<br/>')
        )

    # If a get request is made to the url, display the form
    elif request.method == 'GET':
        url = request.args.get('url', '')
        return render_template(
             'homepage/fault_report_form.html',
             content=g.config['TECHNICAL_CONFIG'],
             url=url
        )
