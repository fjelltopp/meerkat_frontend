"""
config.py

Configuration and settings
"""
import os


class Config(object):
    DEBUG = False
    TESTING = bool(os.environ.get("MEERKAT_TESTING", False))
    DEPLOYMENT = os.environ.get("DEPLOYMENT", "UNKNOWN")
    LIVE_URL = os.environ.get("MEERKAT_LIVE_URL", "http://127.0.0.1/")
    INTERNAL_API_ROOT = os.environ.get("INTERNAL_API_ROOT", '')
    EXTERNAL_API_ROOT = '/api'

    HERMES_ROOT = os.environ.get("HERMES_API_ROOT", "")
    HERMES_API_KEY = os.environ.get('HERMES_API_KEY', 'test-hermes')
    MAILING_KEY = os.environ.get('MAILING_KEY', 'test-mailing')

    SENTRY_DNS = os.environ.get('SENTRY_DNS', '')
    if SENTRY_DNS:
        # Generate javascript sentry_dns
        end = SENTRY_DNS.split("@")[1]
        begining = ":".join(SENTRY_DNS.split(":")[:-1])
        SENTRY_JS_DNS = begining + "@" + end

    USE_BASIC_AUTH = int(os.environ.get('USE_BASIC_AUTH', True))
    AUTH = {}
    INTERNAL_AUTH_ROOT = os.environ.get(
        'MEERKAT_AUTH_ROOT', 'http://nginx/auth'
    )
    AUTH_ROOT = os.environ.get('MEERKAT_AUTH_ROOT', '/auth')
    SERVER_AUTH_USERNAME = os.environ.get('SERVER_AUTH_USERNAME', 'root')
    SERVER_AUTH_PASSWORD = os.environ.get('SERVER_AUTH_PASSWORD', 'password')
    INTERNAL_ROOT = os.environ.get("INTERNAL_ROOT", "http://nginx")
    EXTRA_PAGES = {}
    TEMPLATE_FOLDER = None
    PDFCROWD_API_ACCOUNT = os.environ.get('PDFCROWD_API_ACCOUNT', '')
    PDFCROWD_API_KEY = os.environ.get('PDFCROWD_API_KEY', '')
    PDFCROWD_USE_EXTERNAL_STATIC_FILES = os.environ.get(
        'PDFCROWD_USE_EXTERNAL_STATIC_FILES', '0'
    )
    PDFCROWD_STATIC_FILE_URL = os.environ.get('PDFCROWD_STATIC_FILE_URL', '')

    MAPBOX_MAP_ID = os.environ.get('MAPBOX_MAP_ID', 'mapbox.dark')
    MAPBOX_API_ACCESS_TOKEN = os.environ.get('MAPBOX_API_ACCESS_TOKEN', '')
    MAPBOX_STATIC_MAP_API_URL = os.environ.get('MAPBOX_STATIC_MAP_API_URL', '')

    DEFAULT_LANGUAGE = "en"
    SUPPORTED_LANGUAGES = ["en"]
    SUPPORTED_LANGAUGES_FLAGS = ["gb"]

    DROPBOX = {}
    SEND_LOGG_EVENTS = os.getenv("SEND_LOGG_EVENTS", False)
    LOGGING_URL = os.getenv("LOGGING_URL", None)
    LOGGING_SOURCE = os.getenv("LOGGING_SOURCE", "dev")
    LOGGING_SOURCE_TYPE = "frontend"
    LOGGING_IMPLEMENTATION = os.getenv("LOGGING_IMPLEMENTAION", "demo")
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
