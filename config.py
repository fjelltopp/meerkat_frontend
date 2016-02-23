"""
config.py

Configuration and settings
"""
import os

def from_env(env_var, default):
    """ Gets value from envrionment variable or uses default

    Args: 
        env_var: name of envrionment variable
        default: the default value
    """
    new = os.environ.get(env_var)
    if new:
        return new
    else:
        return default


class Config(object):
    DEBUG = False
    TESTING = False

    INTERNAL_API_ROOT = 'http://dev_nginx_1/api'
    EXTERNAL_API_ROOT = '/api'
    HERMES_ROOT = 'https://hermes.aws.emro.info'
    HERMES_API_KEY = from_env( 'HERMES_API_KEY', 'test-hermes' )
    USERNAME = "admin"
    PASSWORD = "secret"

    

class Production(Config):
    DEBUG = False
    TESTING = False

class Development(Config):
    DEBUG = True
    TESTING = False

class Testing(Config):
    DEBUG = False
    TESTING = True
