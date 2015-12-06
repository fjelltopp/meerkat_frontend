"""
config.py

Configuration and settings
"""

class Config(object):
    DEBUG = False
    TESTING = False
    # Global stuff
    ROOT_URL = 'https://jordan.emro.info'
    WEBMASTER_EMAIL = 'webmaster@emro.info'

    # Homepage stuff
    HOMEPAGE_CONFIG = 'homepage_jordan.json'
    HOMEPAGE_API_ROOT = '/api'

    # Reports specfic stuff
    API_ROOT = 'https://jordan.emro.info/api'
    REPORT_TITLE = 'WHO Public Health Profile'
    REPORT_LIST = {
        'jordan': {
            'default_location': 2,
            'keys': {
                'mailchimp': ''
            },
            'api_endpoints': {
                'mailchimp_campaign': 'https://us6.api.mailchimp.com/2.0/campaigns/'
            },
            'reports': {
                'public_health': {
                    'title': 'Public Health Profile',
                    'template': 'reports/report_jordan_public_health_profile.html',
                    'template_email_html': 'reports/email_jordan_public_health_profile.html',
                    'template_email_plain': 'reports/email_jordan_public_health_profile.txt',
                    'api_name': 'jor_public_health',
                    'mailchimp_list_id': '',
                    'mailchimp_dir_id': '7989',
                    'email_from_name': 'WHO Jordan',
                    'email_from_address': 'notifications@emro.info'
                    'test_json_payload': 'meerkat_frontend/apiData/reports_public_health_jordan.json'
                },
                'communicable_diseases': {
                    'title': 'Communicable Diseases Report',
                    'template': 'reports/report_jordan_communicable_diseases.html',
                    'api_name': 'jor_cd',
                    'test_json_payload': 'meerkat_frontend/apiData/reports_communicable_diseases_jordan.json'
                }
            },
            'basic_auth':{
                'username': '',
                'password': ''
            }
        }
    }
    SYSLOG_PATH = '/dev/log'# On Linux: '/dev/log'; on OS X: '/var/run/syslog'


class Production(Config):
    DEBUG = False
    TESTING = False


class Development(Config):
    DEBUG = True
    TESTING = True

class Testing(Config):
    DEBUG = False
    TESTING = True
