"""
technical.py

A Flask Blueprint module for the technical site.
"""
from flask import Blueprint, render_template

technical = Blueprint('technical', __name__)


@technical.route('/')
def index():
    return 'Welcome to the technical site.'
