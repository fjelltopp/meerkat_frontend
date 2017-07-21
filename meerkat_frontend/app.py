"""
meerkat_app.py

Sets up the Root Flask app for the Meerkat Frontend, so it can be imported
at the begining of files, without complicated import chains.
"""

from flask import Flask, g
from flask.ext.babel import Babel
from raven.contrib.flask import Sentry
from werkzeug.contrib.fixers import ProxyFix
from meerkat_libs.auth_client import Authorise as libs_auth
import jinja2
import os
import json
import copy


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
display_configs = {}

# Set up the config files.
for k, v in app.config['COMPONENT_CONFIGS'].items():
    path = os.path.dirname(os.path.realpath(__file__)) + "/../" + v
    config = json.loads(open(path).read())
    display_configs[k] = {**app.config['SHARED_CONFIG'], **config}
    app.config[k] = display_configs[k]


# Set the default values of the g object
class FlaskG(app.app_ctx_globals_class):
    def __init__(self):
        self.allowed_location = 1
        self.config = copy.deepcopy(display_configs)

app.app_ctx_globals_class = FlaskG


# Extend the Authorise object so that we can restrict access to location
class Authorise(libs_auth):
    """
    Extension of the meerkat_libs auth_client Authorise class. We override one
    of its functions so that it works smoothly in meerkat_auth.
    """
    # Override the check_auth method
    def check_auth(self, access, countries, logic='OR'):
        # First check that the user has required access levels.
        libs_auth.check_auth(self, access, countries, logic)

        # Continue by checking if the user has restrcited access to location
        # Cycle through each location restriction level
        # If the restriction level is in the users access, set the allowed loc
        allowed_location = 9999

        for level, loc in app.config.get('LOCATION_AUTH', {}).items():
            access = Authorise.check_access(
                [level],
                [app.config['COUNTRY']],
                g.payload['acc']
            )
            if access and loc < allowed_location:  # Prioritise small loc id
                allowed_location = loc

        # If no restriction set, then default to the whole country.
        if allowed_location is 9999:
            allowed_location = 1

        # Set the allowed location root
        g.allowed_location = allowed_location

        # Apply config overrides for specific access levels.
        if app.config.get('CONFIG_OVERRIDES', {}):
            # Order override priority according to order of users access.
            for level in reversed(g.payload['acc'][app.config['COUNTRY']]):
                if level in app.config.get('CONFIG_OVERRIDES', {}):
                    for k, v in app.config['COMPONENT_CONFIGS'].items():
                        g.config[k] = {
                            **app.config[k],
                            **app.config['CONFIG_OVERRIDES'][level]
                        }

# The extended authorise object used across this flask app to restrict access
auth = Authorise()
