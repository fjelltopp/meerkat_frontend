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

    INTERNAL_API_ROOT = from_env("INTERNAL_API_ROOT", 'http://dev_nginx_1/api')
    EXTERNAL_API_ROOT = '/api'
    HERMES_ROOT = 'https://hermes.aws.emro.info'
    HERMES_API_KEY = from_env('HERMES_API_KEY', 'test-hermes' )
    USE_BASIC_AUTH = int(from_env('USE_BASIC_AUTH', True))
    AUTH = {}
    USERNAME = "admin"
    PASSWORD = "secret"
    EXTRA_PAGES = {}
    TEMPLATE_FOLDER = None
    PDFCROWD_API_ACCOUNT = from_env('PDFCROWD_API_ACCOUNT','')
    PDFCROWD_API_KEY = from_env('PDFCROWD_API_KEY','')
    PDFCROWD_USE_EXTERNAL_STATIC_FILES = from_env('PDFCROWD_USE_EXTERNAL_STATIC_FILES','0')
    PDFCROWD_STATIC_FILE_URL = from_env('PDFCROWD_STATIC_FILE_URL','')
    MAPBOX_MAP_ID = from_env('MAPBOX_MAP_ID','mapbox.dark')
    MAPBOX_API_ACCESS_TOKEN = from_env('MAPBOX_API_ACCESS_TOKEN','')
    MAPBOX_STATIC_MAP_API_URL = from_env('MAPBOX_STATIC_MAP_API_URL','')
    
    DEFAULT_LANGUAGE = "en"
    SUPPORTED_LANGUAGES = ["en", "fr"]


class Production(Config):
    DEBUG = False
    TESTING = False

class Development(Config):
    DEBUG = True
    TESTING = False

class Testing(Config):
    DEBUG = False
    TESTING = True
