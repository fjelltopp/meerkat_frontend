"""
meerkat_frontend.py

Root Flask app for the Meerkat frontend.

This module runs as the root Flask app and mounts component Flask apps for
different services such as the API and Reports.
"""
import json, os
from slugify import slugify
from flask import Flask, send_file, render_template, request
import jinja2
from .views.homepage import homepage
from .views.technical import technical
from .views.reports import reports
from .views.messaging import messaging
from .views.download import download
from .views.explore import explore
from . import common as c

# Create the Flask app
app = Flask(__name__)

app.config.from_object('config.Development')
app.config.from_envvar('MEERKAT_FRONTEND_SETTINGS')
app.config.from_envvar('MEERKAT_FRONTEND_API_SETTINGS', silent=True)
app.secret_key = 'some_secret'
if app.config["TEMPLATE_FOLDER"]:
    my_loader = jinja2.ChoiceLoader([
        app.jinja_loader,
        jinja2.FileSystemLoader(app.config["TEMPLATE_FOLDER"]),
    ])
    app.jinja_loader = my_loader



#Load settings saved in config files.
path = os.path.dirname(os.path.realpath(__file__))+"/../"+app.config['HOMEPAGE_CONFIG']
app.config['HOMEPAGE_CONFIG'] = json.loads( open(path).read())

path = os.path.dirname(os.path.realpath(__file__))+"/../"+app.config['TECHNICAL_CONFIG']
app.config['TECHNICAL_CONFIG'] = json.loads( open(path).read())

path = os.path.dirname(os.path.realpath(__file__))+"/../"+app.config['REPORTS_CONFIG']
app.config['REPORTS_CONFIG'] = json.loads( open(path).read())

path = os.path.dirname(os.path.realpath(__file__))+"/../"+app.config['MESSAGING_CONFIG']
app.config['MESSAGING_CONFIG'] = json.loads( open(path).read())

path = os.path.dirname(os.path.realpath(__file__))+"/../"+app.config['DOWNLOAD_CONFIG']
app.config['DOWNLOAD_CONFIG'] = json.loads( open(path).read())

path = os.path.dirname(os.path.realpath(__file__))+"/../"+app.config['EXPLORE_CONFIG']
app.config['EXPLORE_CONFIG'] = json.loads( open(path).read())

# Register the Blueprint modules
app.register_blueprint(homepage, url_prefix='/')
app.register_blueprint(technical, url_prefix='/technical')
app.register_blueprint(reports, url_prefix='/reports')
app.register_blueprint(messaging, url_prefix='/messaging')
app.register_blueprint(download, url_prefix='/download')
app.register_blueprint(explore, url_prefix='/explore')

# Paths specified in config file
def prepare_function(template, config, authentication=False):
    def function():
        if authentication:
            auth = request.authorization
            if not auth or not c.check_auth(auth.username, auth.password):
                return c.authenticate()
        return render_template(template, content=config, week=c.api('/epi_week'))
    return function

for url, value in app.config["EXTRA_PAGES"].items():
    path = os.path.dirname(os.path.realpath(__file__))+"/../"+value['config']
    if "authenticate" in value and value["authenticate"]:
        authenticate = True
    else:
        authenticate = False
    function = prepare_function(value['template'],
                                json.loads( open(path).read()),
                                authentication=authenticate)
    app.add_url_rule('/{}'.format(url), url, function)
    

@app.template_filter('slugify')
def slug(s):
    """Creates a slugify filter for Jinja templates"""
    return slugify(s)

# Logging to syslog
# if not app.debug:
#     import logging
#     from logging.handlers import SysLogHandler
#     syslog = SysLogHandler(address=app.config['SYSLOG_PATH'])
#     syslog.setLevel(logging.WARNING)
#     syslog.setFormatter(logging.Formatter(
#         '%(asctime)s %(levelname)s: %(message)s '
#         '[in %(pathname)s:%(lineno)d]'
#     ))
#     app.logger.addHandler(syslog)

# Main
if __name__ == "__main__":
    app.run(host="localhost", port="8080", debug=True, reloader=True)
