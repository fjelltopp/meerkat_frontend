ROOT_URL = 'https://demo.emro.info'
WEBMASTER_EMAIL = 'webmaster@emro.info'
SITE_TITLE = 'Null Island Public Health Surveillance'
FLAGG_ABR = "null"

AUTH = {
    "technical": [['registered'], ['demo']],
    "messaging": [['registered'], ['demo']],
    "download": [['registered'], ['demo']],
    "explore": [['registered'], ['demo']],
    "reports": [['registered'], ['demo']],
    "settings": [['personal'], ['demo']],
    "report_emails": [['emails'], ['demo']],
    "fault-report": [['registered'], ['demo']],
    "admin": [['admin'], ['demo']],
}


DEFAULT_LANGUAGE = "en"

SUPPORTED_LANGUAGES = ["en", "fr"]
# Configuration fields that are specific to each frontend component.
COMPONENT_CONFIGS = {
    'HOMEPAGE_CONFIG': 'country_config/null_homepage.json',
    'TECHNICAL_CONFIG': 'country_config/null_technical.json',
    'REPORTS_CONFIG': 'country_config/null_reports.json',
    'MESSAGING_CONFIG': 'country_config/null_messaging.json',
    'DOWNLOAD_CONFIG': 'country_config/null_download.json',
    'EXPLORE_CONFIG': 'country_config/null_explore.json'
}

# Configuration fields that are shared across all the above components.
# Fields in the above files with same key path override the fields here.
SHARED_CONFIG = {
    "country": "Null Island",
    "application": "default",
    "auth_country": "demo",
    "titles": {
        "full": "Null Island <br> Public Health Surveillance",
        "nav": "<b>Null Island </b> &middot; Public Health Surveillance",
        "mob_nav": "Health Surveillance"
    },
    "flag": "null.svg",
    "footer": {
        "logos": {
            "who": "transparent.png",
            "country_partner": "ni.png",
            "partners": []
        },
        "partners": [
            "The Ministry of Health, Null Island"
        ],
        "email": "nullisland@moh.int"
    },
    "main_menu": [{
        "text": "Epidemiology",
        "url": "/technical/",
    }, {
        "text": "Reports",
        "url": "/reports/",
    }, {
        "text": "Notifications",
        "url": "/messaging/",
    }, {
        "text": "Tables",
        "url": "/explore/",
    }, {
        "text": "Download",
        "url": "/download/",
    }],
    "glossary": {
        "region": "kingdom"
    },
}
