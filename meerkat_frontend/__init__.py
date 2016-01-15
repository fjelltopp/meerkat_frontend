"""
meerkat_frontend.py

Root Flask app for the Meerkat frontend.

This module runs as the root Flask app and mounts component Flask apps for
different services such as the API and Reports.
"""
import json, os
from slugify import slugify
from flask import Flask, send_file
from .views.homepage import homepage
from .views.technical import technical
from .views.reports import reports

# Create the Flask app
app = Flask(__name__)
app.config.from_object('config.Development')
app.config.from_envvar('MEERKAT_FRONTEND_SETTINGS')

#Load settings saved in config files.
path = os.path.dirname(os.path.realpath(__file__))+"/../"+app.config['HOMEPAGE_CONFIG']
app.config['HOMEPAGE_CONFIG'] = json.loads( open(path).read())

path = os.path.dirname(os.path.realpath(__file__))+"/../"+app.config['TECHNICAL_CONFIG']
app.config['TECHNICAL_CONFIG'] = json.loads( open(path).read())

path = os.path.dirname(os.path.realpath(__file__))+"/../"+app.config['REPORTS_CONFIG']
app.config['REPORTS_CONFIG'] = json.loads( open(path).read())

# Register the Blueprint modules
app.register_blueprint(homepage, url_prefix='/')
app.register_blueprint(technical, url_prefix='/technical')
app.register_blueprint(reports, url_prefix='/reports')

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
