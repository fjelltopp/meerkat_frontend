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
    TESTING = bool(from_env("MEERKAT_TESTING", False))
    DEPLOYMENT = from_env("DEPLOYMENT", "UNKNOWN")
    INTERNAL_API_ROOT = from_env("INTERNAL_API_ROOT", '')
    EXTERNAL_API_ROOT = '/api'

    HERMES_ROOT = from_env("HERMES_API_ROOT", "")
    HERMES_API_KEY = from_env('HERMES_API_KEY', 'test-hermes')
    MAILING_KEY = from_env('MAILING_KEY', 'test-mailing')

    SENTRY_DNS = from_env('SENTRY_DNS', '')
    if SENTRY_DNS:
        # Generate javascript sentry_dns
        end = SENTRY_DNS.split("@")[1]
        begining = ":".join(SENTRY_DNS.split(":")[:-1])
        SENTRY_JS_DNS = begining + "@" + end

    USE_BASIC_AUTH = int(from_env('USE_BASIC_AUTH', True))
    AUTH = {}
    INTERNAL_AUTH_ROOT = from_env(
        'MEERKAT_AUTH_ROOT', 'http://dev_nginx_1/auth'
    )
    AUTH_ROOT = from_env('MEERKAT_AUTH_ROOT', '/auth')
    USERNAME = "admin"
    PASSWORD = "secret"
    INTERNAL_ROOT = from_env("INTENAL_ROOT", "http://nginx")
    EXTRA_PAGES = {}
    TEMPLATE_FOLDER = None
    PDFCROWD_API_ACCOUNT = from_env('PDFCROWD_API_ACCOUNT', '')
    PDFCROWD_API_KEY = from_env('PDFCROWD_API_KEY', '')
    PDFCROWD_USE_EXTERNAL_STATIC_FILES = from_env(
        'PDFCROWD_USE_EXTERNAL_STATIC_FILES', '0'
    )
    PDFCROWD_STATIC_FILE_URL = from_env('PDFCROWD_STATIC_FILE_URL', '')

    MAPBOX_MAP_ID = from_env('MAPBOX_MAP_ID', 'mapbox.dark')
    MAPBOX_API_ACCESS_TOKEN = from_env('MAPBOX_API_ACCESS_TOKEN', '')
    MAPBOX_STATIC_MAP_API_URL = from_env('MAPBOX_STATIC_MAP_API_URL', '')

    DEFAULT_LANGUAGE = "en"
    SUPPORTED_LANGUAGES = ["en"]
    SUPPORTED_LANGAUGES_FLAGS = ["gb"]

    DROPBOX = {}
    
    # Auth secret settings file from which to import required config.
    # File must define JWT_COOKIE_NAME, JWT_ALGORITHM and JWT_PUBLIC_KEY.
    filename = os.environ.get('MEERKAT_AUTH_SETTINGS')
    exec(compile(open(filename, "rb").read(), filename, 'exec'))


class Production(Config):
    DEBUG = False
    TESTING = False


class Development(Config):
    DEBUG = True
    TESTING = False


class Testing(Config):
    DEBUG = False
    TESTING = True
