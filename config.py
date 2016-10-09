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
    MAILING_KEY = from_env('MAILING_KEY', 'test-mailing' )
    USE_BASIC_AUTH = int(from_env('USE_BASIC_AUTH', True))
    AUTH = {}
    INTERNAL_AUTH_ROOT = from_env('MEERKAT_AUTH_ROOT', 'http://dev_nginx_1/auth' )
    AUTH_ROOT = from_env('MEERKAT_AUTH_ROOT', '/auth' )
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
    SUPPORTED_LANGUAGES = ["en"]
    SUPPORTED_LANGAUGES_FLAGS = ["gb"]

    #Need this module to be importable without the whole of meerkat_auth config.
    #Directly load the secret settings file from which to import required variables.
    #File must include JWT_COOKIE_NAME, JWT_ALGORITHM and JWT_PUBLIC_KEY variables.
    filename = os.environ.get( 'MEERKAT_AUTH_SETTINGS' )
    exec( compile(open(filename, "rb").read(), filename, 'exec') )


class Production(Config):
    DEBUG = False
    TESTING = False

class Development(Config):
    DEBUG = True
    TESTING = False

class Testing(Config):
    DEBUG = False
    TESTING = True
