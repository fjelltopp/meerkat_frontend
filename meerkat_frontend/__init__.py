"""
meerkat_frontend.py

This module runs as the Flask app from app.py and mounts component Flask apps
for different services such as the API and Reports.
"""
from .app import app, babel, sentry
from slugify import slugify
from flask import render_template, request, Blueprint
from flask import current_app, abort, flash, g, redirect
from . import common as c
from .views.homepage import homepage
from .views.technical import technical
from .views.reports import reports
from .views.messaging import messaging
from .views.download import download
from .views.explore import explore
from .views.dropbox_bp import dropbox_bp
import authorise as auth
import os
import json


# App has been imported at the top of this file. We now add crucial services...


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


# Redirect all pages to a language-specified page.
@app.route("/")
def root():
    return redirect("/" + app.config["DEFAULT_LANGUAGE"])


# Internationalisation
@babel.localeselector
def get_locale():
    return g.get("language", app.config["DEFAULT_LANGUAGE"])


# Show the blank template.
@app.route("/template/")
def location():
    return render_template(
        'template.html',
        week=c.api('/epi_week'),
        content=current_app.config['SHARED_CONFIG']
    )


@messaging.url_value_preprocessor
@reports.url_value_preprocessor
@download.url_value_preprocessor
@explore.url_value_preprocessor
@technical.url_value_preprocessor
@homepage.url_value_preprocessor
@extra_pages.url_value_preprocessor
@dropbox_bp.url_value_preprocessor
def pull_lang_code(endpoint, values):
    language = values.pop('language')
    if language not in app.config["SUPPORTED_LANGUAGES"]:
        abort(404, "Language not supported")
    g.language = language


@messaging.url_defaults
@reports.url_defaults
@download.url_defaults
@explore.url_defaults
@homepage.url_defaults
@technical.url_defaults
@extra_pages.url_defaults
@dropbox_bp.url_defaults
def add_language_code(endpoint, values):
    values.setdefault('language', app.config["DEFAULT_LANGUAGE"])


# Register the Blueprint modules
app.register_blueprint(homepage, url_prefix='/<language>')
app.register_blueprint(extra_pages, url_prefix='/<language>')
app.register_blueprint(technical, url_prefix='/<language>/technical')
app.register_blueprint(reports, url_prefix='/<language>/reports')
app.register_blueprint(messaging, url_prefix='/<language>/messaging')
app.register_blueprint(download, url_prefix='/<language>/download')
app.register_blueprint(explore, url_prefix='/<language>/explore')
app.register_blueprint(dropbox_bp, url_prefix='/<language>/files')


@app.template_filter('slugify')
def slug(s):
    """Creates a slugify filter for Jinja templates"""
    return slugify(s)


@app.template_filter('in_array')
def in_array(needles, haystack):
    """
    Returns true if any of the needles are in the haystack.
    Returns false if none of needles is found in the haystack.

    Args:
        needles (array) A list of values to look for. Accepts a single value.
        haystack (array) A list of values to look in.

    Returns:
        True if a needle is found in haystack, false otherwise.
    """
    # For flexibility, allow a single value in place of a list.
    if not isinstance(needles, list):
        needles = [needles]
    if not isinstance(haystack, list):
        haystack = [haystack]

    # Look for all the needles and return true if a needle isfound.
    for needle in needles:
        if needle in haystack:
            return True
    return False


# ERROR HANDLING
@app.route('/error/<int:error>/')
def error_test(error):
    """
    Serves requested error page for testing, by calling the ```abort()```
    function.

       Args:
           error (int): The error code for the requested error.
    """
    abort(error)


@app.errorhandler(404)
@app.errorhandler(401)
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
    if sentry:
        sentry.captureException()
    flash("Sorry, something appears to have gone wrong.", "error")
    return render_template(
        'error.html',
        error=error,
        content=current_app.config['TECHNICAL_CONFIG']
    ), error.code


@app.errorhandler(403)
@app.errorhandler(401)
def error401(error):
    """Show the login page if the user hasn't authenticated."""
    flash(error.description, "error")
    app.logger.warning("Error handler: " + str(error.description))
    return redirect("/" + g.language+"/login?url=" + str(request.path))

# Main
if __name__ == "__main__":
    app.run(
        host="localhost",
        port="8080",
        debug=True,
        reloader=True
    )
