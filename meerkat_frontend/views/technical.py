"""
technical.py

A Flask Blueprint module for the technical site.
"""
from flask import Blueprint, render_template, current_app

technical = Blueprint('technical', __name__)


@technical.route('/')
@technical.route('/<tab>')
def index(tab="demographics.html"):
    return render_template('technical/index.html', content=current_app.config['TECHNICAL_CONFIG'], tab=tab)
