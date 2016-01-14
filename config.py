"""
config.py

Configuration and settings
"""

class Config(object):
    DEBUG = False
    TESTING = False

    # Global stuff
    ROOT_URL = 'https://demo.emro.info'
    WEBMASTER_EMAIL = 'webmaster@emro.info'
    SITE_TITLE = 'Meerkat Health Surveillance'

    # Homepage stuff
    HOMEPAGE_CONFIG = 'null_homepage.json'
    HOMEPAGE_API_ROOT = '/api'

    #Technical Site Stuff
    TECHNICAL_CONFIG = 'null_technical.json'
    TECHNICAL_API_ROOT = '/api'

    # Reports specfic stuff
    API_ROOT = 'http://localhost/api'
    REPORTS_CONFIG = 'null_reports.json'

    REPORT_LIST = {
        'default_location': 1,
        'keys': {
            'mailchimp': ''
        },
        'api_endpoints': {
            'mailchimp_campaign': 'https://us6.api.mailchimp.com/2.0/campaigns/'
        },
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
            'communicable_diseases': {
                'title': 'Communicable Diseases Report',
                'template': 'reports/report_communicable_diseases.html',
                'api_name': 'cd_report',
                'test_json_payload': 'meerkat_frontend/apiData/reports_communicable_diseases.json'
            }
        },
        'basic_auth':{
            'username': '',
            'password': ''
        }
    }
    SYSLOG_PATH = '/dev/log'# On Linux: '/dev/log'; on OS X: '/var/run/syslog'


class Production(Config):
    DEBUG = False
    TESTING = False

class Development(Config):
    DEBUG = True
    TESTING = False

class Testing(Config):
    DEBUG = False
    TESTING = True
