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
    SITE_TITLE = 'Meerkat Health Surveillance'

    # Homepage stuff
    HOMEPAGE_CONFIG = 'null_homepage.json'
    HOMEPAGE_API_ROOT = '/api'

    #Technical Site Stuff
    TECHNICAL_CONFIG = 'null_technical.json'
    TECHNICAL_API_ROOT = '/api'

    # Reports specfic stuff
    API_ROOT = '/api'
    REPORTS_CONFIG = 'null_reports.json'

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
                    'email_subject': 'MOH Jordan | Public Health Profile Epi Week {epi_week} ({epi_date})',
                    'email_from_name': 'MOH Jordan',
                    'email_from_address': 'notifications@moh.gov.jo',
                    'test_json_payload': 'meerkat_frontend/apiData/reports_public_health_jordan.json'
                },
                'communicable_diseases': {
                    'title': 'Communicable Diseases Report',
                    'template': 'reports/report_jordan_communicable_diseases.html',
                    'template_email_html': 'reports/email_jordan_cd_report.html',
                    'template_email_plain': 'reports/email_jordan_cd_report.txt',
                    'api_name': 'jor_cd',
                    'mailchimp_list_id': '',
                    'mailchimp_dir_id': '7989',
                    'email_subject': 'MOH Jordan | Communicable Diseases Report Epi Week {epi_week} ({epi_date})',
                    'email_from_name': 'MOH Jordan',
                    'email_from_address': 'notifications@moh.gov.jo',
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
    TESTING = False

class Testing(Config):
    DEBUG = False
    TESTING = True
