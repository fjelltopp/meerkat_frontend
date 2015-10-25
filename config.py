"""
config.py

Configuration and settings
"""


class Config(object):
    DEBUG = False
    TESTING = False
    reports = {
        'site_title': 'WHO Public Health Profile',
        'site_title_short': 'WHO Public Health Profile',
        'webmaster_email': 'webmaster@emro.info',
        'api_base_url': 'http://localhost/api'
    }
    report_list = {
        'jordan': {
            'default_location': 3,
            'keys': {
                'mailchimp': '389ca9d57e0cab0e93bc277f26b6c003-us6'
            },
            'api_endpoints': {
                'mailchimp_campaign': 'https://us6.api.mailchimp.com/2.0/campaigns/'
            },
            'reports': {
                'public_health': {
                    'title': 'Public Health Profile',
                    'template': 'report_jordan_public_health_profile.html',
                    'template_email_html': 'email_jordan_public_health_profile.html',
                    'template_email_plain': 'email_jordan_public_health_profile.txt',
                    'api_name': 'jor_public_health',
                    'mailchimp_list_id': '25bb6f4a79',
                    'mailchimp_dir_id': '7989',
                    'email_from_name': 'WHO Jordan',
                    'email_from_address': 'notifications@emro.info'
                }
            }
        }
    }


class Production(Config):
    DEBUG = False
    TESTING = False


class Development(Config):
    DEBUG = True
    TESTING = True


class Testing(Config):
    DEBUG = False
    TESTING = True
