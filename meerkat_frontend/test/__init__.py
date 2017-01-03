#!/usr/bin/env python3
"""
Meerkat Frontend Tests

Unit tests for the Meerkat frontend
"""
import meerkat_frontend as mk
import base64
import unittest
import calendar
import jwt
import os
import time
from datetime import datetime
from werkzeug.datastructures import Headers
from unittest.mock import MagicMock
from unittest import mock
from flask import g
import authorise as auth
from .. import common as c

# Check if auth requirements have been installed
try:
    # Test by importing package that will only ever be required in auth (touch
    # wood).
    __import__('passlib')
    print("Authentication requirements installed.")
except ImportError:
    print("Authentication requirements not installed.  Installing them now.")
    os.system('pip install -r /var/www/meerkat_auth/requirements.txt')


# Need this module to be importable without the whole of meerkat_auth config.
# Directly load the secret settings file from which to import required variables.
# File must include JWT_COOKIE_NAME, JWT_ALGORITHM and JWT_PUBLIC_KEY
# variables.
filename = os.environ.get('MEERKAT_AUTH_SETTINGS')
exec(compile(open(filename, "rb").read(), filename, 'exec'))


def check_authentication(test_class, url, has_authentication):
    """ Test if url needs authentication

    Args:
        test_class: the class used for testing
        url: the url to check
        has_authentication: if the url is expected to need authentication
    """
    rv = test_class.app.get(url)
    if has_authentication:
        print(url)
        test_class.assertEqual(rv.status_code, 401)
        rv = test_class.app.get(url, headers=test_class.header)
    test_class.assertEqual(rv.status_code, 200)


#from meerkat_frontend.test.test_reports import *
#from meerkat_frontend.test.test_common import *
#from meerkat_frontend.test.test_messaging import *


class MeerkatFrontendTestCase(unittest.TestCase):

    def setUp(self):
        """Setup for testing"""
        mk.app.config['TESTING'] = True
        self.app = mk.app.test_client()
        # When check_auth is called, just allow the authentication and set a
        # permissive payload.
        def side_effect(roles, countries):
            g.payload = {
                u'acc': {
                    u'demo': [u'root', u'admin', u'registered'],
                    u'jordan': [
                        u'root', u'central', u'directorate', u'clinic', u'reports',
                        u'all', u'cd', u'ncd', u'mh', u'admin', u'personal'
                    ],
                    u'madagascar': [u'root', u'admin', u'registered'],
                    u'rms': [u'root', u'admin', u'registered']
                },
                u'data': {u'name': u'Testy McTestface'},
                u'usr': u'testUser',
                # Lasts for 30 seconds
                u'exp': calendar.timegm(time.gmtime()) + 30,
                u'email': u'test@test.org.uk'
            }

        # Mock check_auth method. Authentication should be tested properly else
        # where.
        self.patcher = mock.patch(
            'authorise.check_auth', side_effect=side_effect)
        self.mock_auth = self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    # HOMEPAGE testing
    def test_index(self):
        """Ensure the config file is loading correctly"""
        rv = self.app.get('/en/')
        self.assertIn(b'Null Island', rv.data)

    def test_lang_redirect(self):
        """Check you are redirected to the langauge url."""
        rv = self.app.get('/')
        self.assertEqual(rv.status_code, 302)

    def test_reports(self):
        """Check the Reports page loads"""
        rv = self.app.get('/en/reports/')
        rv2 = self.app.get('en/reports/')
        self.assertEqual(rv2.status_code, 200)

    def test_reports_pub_health(self):
        rv = self.app.get('en/reports/test/public_health/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"5,941 consultations", rv.data)
        self.assertIn(
            b"Viral infections characterized by skin and mucous membrane lesions", rv.data)

    def test_reports_cd_pub_health(self):
        rv = self.app.get('en/reports/test/cd_public_health/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"73 cases", rv.data)
        self.assertIn(
            b"Viral infections characterized by skin and mucous membrane lesions", rv.data)

    def test_reports_ncd_pub_health(self):
        rv = self.app.get('en/reports/test/ncd_public_health/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"64 cases", rv.data)
        self.assertIn(
            b"Other disorders of glucose regulation and pancreatic internal secretion", rv.data)

    def test_reports_cd(self):
        rv = self.app.get('en/reports/test/communicable_diseases/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(
            b"There were 0 new confirmed cases and 1 new suspected cases of Bloody diarrhoea", rv.data)

    def test_reports_ncd(self):
        rv = self.app.get('en/reports/test/non_communicable_diseases/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"with <br> hypertension", rv.data)

    def test_reports_vaccination(self):
        rv = self.app.get('en/reports/test/vaccination/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"Vaccination sessions: 1", rv.data)

    def test_technical(self):
        """Check the Technical page loads"""
        rv = self.app.get('/en/technical/')
        rv2 = self.app.get('/en/technical/')
        self.assertEqual(rv2.status_code, 200)

    @mock.patch('meerkat_frontend.common.requests')
    def test_hermes(self, mock_requests):
        c.hermes("publish", "POST", {"topics": ["test-topic"]})
        headers = {'content-type': 'application/json'}
        mock_requests.request.assert_called_with(
            "POST",
            mk.app.config['HERMES_ROOT'] + "publish",
            json={'api_key': mk.app.config[
                'HERMES_API_KEY'], 'topics': ['test-topic']},
            headers=headers
        )

if __name__ == '__main__':
    unittest.main()
