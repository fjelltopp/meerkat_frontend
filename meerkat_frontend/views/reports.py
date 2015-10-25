"""
reports.py

A Flask Blueprint module for reports.
"""
from flask import Blueprint, render_template

reports = Blueprint('reports', __name__)


@reports.route('/')
def index():
    return 'Foobar!'
