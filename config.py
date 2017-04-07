"""
config.py

Configuration and settings
"""
import os



class Config(object):
    DEBUG = False
    TESTING = bool(os.getenv("MEERKAT_TESTING", False))
    DEPLOYMENT = os.getenv("DEPLOYMENT", "UNKNOWN")
    INTERNAL_API_ROOT = os.getenv("INTERNAL_API_ROOT", '')
    EXTERNAL_API_ROOT = '/api'

    HERMES_ROOT = os.getenv("HERMES_API_ROOT", "")
    HERMES_API_KEY = os.getenv('HERMES_API_KEY', 'test-hermes')
    MAILING_KEY = os.getenv('MAILING_KEY', 'test-mailing')

    SENTRY_DNS = os.getenv('SENTRY_DNS', '')
    if SENTRY_DNS:
        # Generate javascript sentry_dns
        end = SENTRY_DNS.split("@")[1]
        begining = ":".join(SENTRY_DNS.split(":")[:-1])
        SENTRY_JS_DNS = begining + "@" + end

    USE_BASIC_AUTH = int(os.getenv('USE_BASIC_AUTH', True))
    AUTH = {}
    INTERNAL_AUTH_ROOT = os.getenv(
        'MEERKAT_AUTH_ROOT', 'http://dev_nginx_1/auth'
    )
    AUTH_ROOT = os.getenv('MEERKAT_AUTH_ROOT', '/auth')
    USERNAME = "admin"
    PASSWORD = "secret"

    EXTRA_PAGES = {}
    TEMPLATE_FOLDER = None
    PDFCROWD_API_ACCOUNT = os.getenv('PDFCROWD_API_ACCOUNT', '')
    PDFCROWD_API_KEY = os.getenv('PDFCROWD_API_KEY', '')
    PDFCROWD_USE_EXTERNAL_STATIC_FILES = os.getenv(
        'PDFCROWD_USE_EXTERNAL_STATIC_FILES', '0'
    )
    PDFCROWD_STATIC_FILE_URL = os.getenv('PDFCROWD_STATIC_FILE_URL', '')

    MAPBOX_MAP_ID = os.getenv('MAPBOX_MAP_ID', 'mapbox.dark')
    MAPBOX_API_ACCESS_TOKEN = os.getenv('MAPBOX_API_ACCESS_TOKEN', '')
    MAPBOX_STATIC_MAP_API_URL = os.getenv('MAPBOX_STATIC_MAP_API_URL', '')

    DEFAULT_LANGUAGE = "en"
    SUPPORTED_LANGUAGES = ["en"]
    SUPPORTED_LANGAUGES_FLAGS = ["gb"]

    DROPBOX = {}
    LOGGING_URL = os.getenv("LOGGING_URL", None)
    LOGGING_SOURCE = os.getenv("LOGGING_SOURCE", "frontend")
    LOGGING_SOURCE_TYPE = "frontend"
    LOGGING_IMPLEMENTAION = os.getenv("LOGGING_IMPLEMENTAION", "demo")
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
