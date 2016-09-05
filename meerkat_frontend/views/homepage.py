"""
homepage.py

A Flask Blueprint module for the homepage.
"""
from flask import Blueprint, render_template, current_app, abort, g, request
from flask.ext.babel import get_translations, gettext

homepage = Blueprint('homepage', __name__,url_prefix='/<language>')

@homepage.route('/')
def index():
    return render_template(
        'homepage/index.html', 
        content=current_app.config['HOMEPAGE_CONFIG'],
    )

@homepage.route('/login')
def login():
    url = request.args.get('url', '/en/technical')
    return render_template(
        'homepage/login.html', 
        content=current_app.config['HOMEPAGE_CONFIG'],
        redirect=url
    )
