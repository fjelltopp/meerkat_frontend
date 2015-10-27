"""
homepage.py

A Flask Blueprint module for the homepage.
"""
from flask import Blueprint, render_template

homepage = Blueprint('homepage', __name__)


@homepage.route('/')
def index():
    return 'WHO hello world! Test'
