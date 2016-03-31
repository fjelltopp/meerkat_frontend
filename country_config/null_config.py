ROOT_URL = 'https://demo.emro.info'
WEBMASTER_EMAIL = 'webmaster@emro.info'
SITE_TITLE = 'Null Island Public Health Surveillance'

# Homepage stuff
HOMEPAGE_CONFIG = 'country_config/null_homepage.json'

#Technical Site Stuff
TECHNICAL_CONFIG = 'country_config/null_technical.json'

# Reports specfic stuff
REPORTS_CONFIG = 'country_config/null_reports.json'

# Messaging specfic stuff
MESSAGING_CONFIG = 'country_config/null_messaging.json'

# Download Data specfic stuff
DOWNLOAD_CONFIG = 'country_config/null_download.json'

# Explore Data specfic stuff
EXPLORE_CONFIG = 'country_config/null_explore.json'

FLAGG_ABR = "no"

AUTHENTICATION = {
    'basic_auth':{
        'username': '',
        'password': ''
    }
}

REPORT_LIST = {
    'default_location': 1,
    'keys': {
        'mailchimp': ''
    },
    'api_endpoints': {
        'mailchimp_campaign': 'https://us6.api.mailchimp.com/2.0/campaigns/'
    },
    "address": """
    <strong>Ministry of Health</strong><br>
    Null Island Street 3<br>
    Null Island City 433<br>
    Null Island<br>
    <abbr title="Website">W:</abbr> <a href="https://demo.aws.emro.info">https://demo.aws.emro.info</a>
    """,
    'reports': {
        'public_health': {
            'title': 'Public Health Profile',
            'template': 'reports/report_public_health_profile.html',
            'template_email_html': 'reports/email_public_health_profile.html',
            'template_email_plain': 'reports/email_public_health_profile.txt',
            'api_name': 'public_health',
            'mailchimp_list_id': '',
            'mailchimp_dir_id': '7989',
            'email_from_name': 'MOH Demo',
            'email_from_address': 'demo@emro.info',
            'map_centre': [0, 0, 7],
            'test_json_payload': 'meerkat_frontend/apiData/reports_public_health.json',
        },
        'cd_public_health': {
            'title': 'Communicable Disease Profile Report',
            'template': 'reports/report_cd_public_health_profile.html',
            'api_name': 'cd_public_health',
            'map_centre': [0, 0, 7],
            'test_json_payload': 'meerkat_frontend/apiData/reports_cd_public_health.json',
        },
       'ncd_public_health': {
            'title': 'Non-Communicable Disease Profile Report',
            'template': 'reports/report_ncd_public_health_profile.html',
            'api_name': 'ncd_public_health',
            'map_centre': [0, 0, 7],
            'test_json_payload': 'meerkat_frontend/apiData/reports_ncd_public_health.json',
        },
        'communicable_diseases': {
            'title': 'Communicable Diseases Report',
            'template': 'reports/report_communicable_diseases.html',
            'api_name': 'cd_report',
            'test_json_payload': 'meerkat_frontend/apiData/reports_communicable_diseases.json'
        },
        'non_communicable_diseases': {
            'title': 'Non Communicable Diseases Report',
            'template': 'reports/report_non_communicable_diseases.html',
            'api_name': 'ncd_report',
            'test_json_payload': 'meerkat_frontend/apiData/reports_non_communicable_diseases.json'
        }
    }
}

