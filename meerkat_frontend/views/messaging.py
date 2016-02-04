"""
messaging.py

A Flask Blueprint module for Meerkat messaging services.
"""
from flask import Blueprint, render_template, abort, redirect, url_for, request, send_file, current_app
from datetime import datetime, date
try:
    import simplejson as json
except ImportError:
    import json
import dateutil.parser
import requests
from .. import common as c

messaging = Blueprint('messaging', __name__)

# THE SUBSCRIBING PROCESS
# Stage 1: Fill out a subscription form.
@messaging.route('/subscribe')
def subscribe():
    return render_template('messaging/subscribe.html',
                           content=current_app.config['REPORTS_CONFIG'],
                           week=c.api('/epi_week'))

# Stage 2: Confirm subscription request and inform user of verification process.
@messaging.route('/subscribed', methods=['POST'])
def subscribed():
    #TODO: Form validation.
    #TODO: Call hermes subscribe method.
    #TODO: Send verification email/sms.
    return render_template('messaging/subscribed.html',
                           content=current_app.config['REPORTS_CONFIG'],
                           week=c.api('/epi_week'))

# Stage 3: Verify contact details.
@messaging.route('/subscribe/verify/<string:subscriber_id>')
def verify(subscriber_id):
    return render_template('messaging/verify.html',
                           content=current_app.config['REPORTS_CONFIG'],
                           week=c.api('/epi_week'))

# Stage 4: Confirm details have been verified.
@messaging.route('/subscribe/verified')
def verified(subscriber_id):
    #TODO: Check verification details.
    return render_template('messaging/verified.html',
                           content=current_app.config['REPORTS_CONFIG'],
                           week=c.api('/epi_week'))
