#!/usr/bin/env python3
"""
meerkat_frontend.py

Root Flask app for the Meerkat frontend.

This module runs as the root Flask app and mounts component Flask apps for
different services such as the API and Reports.
"""
from flask import Flask
# Create default app
app = Flask(__name__)

# Import modules
#import meerkat_frontend.reports

# Main
if __name__ == "__main__":
    app.run(host="localhost", port="8080", debug=True, reloader=True)
