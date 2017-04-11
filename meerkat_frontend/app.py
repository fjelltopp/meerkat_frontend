"""
meerkat_app.py

Sets up the Root Flask app for the Meerkat Frontend, so it can be imported
at the begining of files, without complicated import chains.
"""

from flask import Flask
from flask.ext.babel import Babel
import jinja2
import os
import json
from raven.contrib.flask import Sentry
from werkzeug.contrib.fixers import ProxyFix

# Create the Flask app
app = Flask(__name__)
app.jinja_options['extensions'].append('jinja2.ext.do')
babel = Babel(app)
app.config.from_object('meerkat_frontend.config.Development')
app.config.from_envvar('MEERKAT_FRONTEND_SETTINGS')
app.config.from_envvar('MEERKAT_FRONTEND_API_SETTINGS', silent=True)
app.secret_key = 'some_secret'
app.wsgi_app = ProxyFix(app.wsgi_app)

# Set up sentry error monitoring
if app.config["SENTRY_DNS"]:
    sentry = Sentry(app, dsn=app.config["SENTRY_DNS"])
else:
    sentry = None

if app.config.get('TEMPLATE_FOLDER', None):
    my_loader = jinja2.ChoiceLoader([
        app.jinja_loader,
        jinja2.FileSystemLoader(app.config["TEMPLATE_FOLDER"]),
    ])
    app.jinja_loader = my_loader

# Need to pass auth root down to all pages that might need it.
# Feels a bit hacky, but can't immediately think of a better way.
# Here we feed the env var into the shared config that is sent to all pages.
app.config['SHARED_CONFIG']['auth_root'] = app.config['AUTH_ROOT']

# Set up the config files.
for k, v in app.config['COMPONENT_CONFIGS'].items():
    path = os.path.dirname(os.path.realpath(__file__)) + "/../" + v
    config = json.loads(open(path).read())
    app.config[k] = {**app.config['SHARED_CONFIG'], **config}
