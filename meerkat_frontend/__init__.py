"""
meerkat_frontend.py

Root Flask app for the Meerkat Frontend.

This module runs as the root Flask app and mounts component Flask apps for
different services such as the API and Reports.
"""
import json, os
from slugify import slugify
from flask import Flask, send_file, render_template, request, current_app, abort, flash
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
app.jinja_options['extensions'].append('jinja2.ext.do')
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

# Set up the config files.
for k,v in app.config['COMPONENT_CONFIGS'].items():
    path = os.path.dirname(os.path.realpath(__file__)) + "/../" + v
    config = json.loads( open(path).read() ) 
    app.config[k] = {**app.config['SHARED_CONFIG'], **config}           

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

# Add any extra country specific pages.
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

# ERROR HANDLING
@app.route('/error/<int:error>/')
def error_test(error):
    """Serves requested error page for testing, by calling the ```abort()``` function.

       Args:
           error (int): The error code for the requested error.
    """
    abort(error)

@app.errorhandler(403)
@app.errorhandler(404)
@app.errorhandler(410)
@app.errorhandler(418)
@app.errorhandler(500)
@app.errorhandler(501)
@app.errorhandler(502)
def error500(error):
    """Serves page for generic error.
    
       Args:
           error (int): The error code given by the error handler.
    """
    flash("Sorry, something appears to have gone wrong.", "error")
    return render_template('error.html', error=error, content=current_app.config['TECHNICAL_CONFIG']), error.code

# Main
if __name__ == "__main__":
    app.run(host="localhost", port="8080", debug=True, reloader=True)
