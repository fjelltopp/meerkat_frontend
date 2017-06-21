"""
download.py

A Flask Blueprint module for the download site.
"""
from flask import Blueprint, render_template, current_app, request, abort, g
from meerkat_frontend import common as c
from meerkat_frontend import auth

download = Blueprint('download', __name__, url_prefix="/<language>")


@download.before_request
def requires_auth():
    """
    Checks that the user has authenticated before returning any page from this
    Blueprint.
    """
    # We load the arguments for check_auth function from the config files.
    auth.check_auth(
        *current_app.config['AUTH'].get('download', [['BROKEN'], ['']])
    )


@download.route('/')
def index():
    return render_template('download/index.html',
                           content=g.config['DOWNLOAD_CONFIG'],
                           week=c.api('/epi_week'))


@download.route('/wait')
def wait():
    if "url" in request.args.keys():
        url = request.args["url"]
    else:
        abort(500, "Did not get a url")
    url = url.replace("'", "%27")
    return render_template(
        'download/wait.html',
        content=g.config['DOWNLOAD_CONFIG'],
        api_url=url,
        week=c.api('/epi_week')
    )
