"""
config.py

Configuration and settings
"""

class Config(object):
    DEBUG = False
    TESTING = False

    INTERNAL_API_ROOT = 'http://dev_nginx_1/api'
    EXTERNAL_API_ROOT = '/api'


class Production(Config):
    DEBUG = False
    TESTING = False

class Development(Config):
    DEBUG = True
    TESTING = False

class Testing(Config):
    DEBUG = False
    TESTING = True
