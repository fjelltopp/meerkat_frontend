"""
meerkat_app.py

Sets up the Root Flask app for the Meerkat Frontend, so it can be imported
at the begining of files, without complicated import chains.
"""

from flask import Flask, Blueprint, render_template
from flask.ext.babel import Babel
from . import common as c
import authorise as auth
import jinja2
import os
import json

# Create the Flask app
app = Flask(__name__)
app.jinja_options['extensions'].append('jinja2.ext.do')
babel = Babel(app)
app.config.from_object('config.Development')
app.config.from_envvar('MEERKAT_FRONTEND_SETTINGS')
app.config.from_envvar('MEERKAT_FRONTEND_API_SETTINGS', silent=True)
app.secret_key = 'some_secret'

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


# Paths specified in config file
def prepare_function(template, config, authentication=False):
    def function():
        if authentication:
            auth.check_auth(*authentication)
        return render_template(template, content=config,
                               week=c.api('/epi_week'))
    return function


# Add any extra country specific pages.
extra_pages = Blueprint('extra_pages', __name__, url_prefix='/<language>')
if "EXTRA_PAGES" in app.config:
    for url, value in app.config["EXTRA_PAGES"].items():
        path = os.path.dirname(os.path.realpath(__file__))
        path += "/../" + value['config']
        if "authenticate" in value and value["authenticate"]:
            authenticate = value["authenticate"]
        else:
            authenticate = False
        function = prepare_function(value['template'],
                                    json.loads(open(path).read()),
                                    authentication=authenticate)
        print(url)
        extra_pages.add_url_rule('/{}'.format(url), url, function)
        extra_pages.add_url_rule('/{}/'.format(url), url, function)
