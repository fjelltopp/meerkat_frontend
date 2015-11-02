#!/usr/bin/env python3
from meerkat_frontend import app
app.run(debug=app.config['DEBUG'])
# Replace above with following line for production
# app.run(host='0.0.0.0')
