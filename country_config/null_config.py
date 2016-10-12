ROOT_URL = 'https://demo.emro.info'
WEBMASTER_EMAIL = 'webmaster@emro.info'
SITE_TITLE = 'Null Island Public Health Surveillance'
FLAGG_ABR = "null"

AUTH = {
    "technical": [['registered'],['demo']],
    "messaging": [['registered'],['demo']],
    "download": [['registered'],['demo']],
    "explore": [['registered'],['demo']],
    "reports": [['registered'],['demo']],
    "settings": [['personal'],['demo']]
}

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
# Any fields in the above files labelled with the same key path override the fields in this dictionary.
SHARED_CONFIG = {
    "country":"Null Island",
    "auth_country":"demo",
    "titles":{
        "full":"Null Island <br> Public Health Surveillance",
        "nav":"<b>Null Island </b> &middot; Public Health Surveillance",
        "mob_nav":"Health Surveillance"
    },
    "flag":"null.svg",
    "footer":{
        "logos":{
	        "who":"transparent.png",
	        "country_partner":"ni.png",
	        "partners":[]
        },
        "partners":[
            "The Ministry of Health, Null Island"
        ],
        "email":"nullisland@moh.int"
    },
    "main_menu":[{
        "text":"Dashboard",
        "url":"/technical/",
    },{
        "text":"Reports",
        "url":"/reports/",
    },{
        "text":"Notifications",
        "url":"/messaging/",
    },{
        "text":"Explore",
        "url":"/explore/",
    },{
        "text":"Download",
        "url":"/download/",
    }],
    "glossary":{
        "region":"kingdom"
    },
    "api_key": "test-api"
}


