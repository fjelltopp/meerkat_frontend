#!/usr/bin/env python3
"""
Meerkat Frontend Tests

Unit tests for the Meerkat frontend
"""
from unittest import mock
from flask import g
from .. import common as c
import meerkat_frontend as mk
import unittest
import calendar
import os
import time

#from meerkat_frontend.test.test_reports import *
#from meerkat_frontend.test.test_common import *
#from meerkat_frontend.test.test_messaging import *

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
# Directly load secret settings file from which to import required variables.
# File must include JWT_COOKIE_NAME, JWT_ALGORITHM and JWT_PUBLIC_KEY
# variables.
filename = os.environ.get('MEERKAT_AUTH_SETTINGS')
exec(compile(open(filename, "rb").read(), filename, 'exec'))


class MeerkatFrontendTestCase(unittest.TestCase):

    def setUp(self):
        """Setup for testing"""
        mk.app.config['TESTING'] = True
        self.app = mk.app.test_client()

        # When check_auth is called, just allow the authentication and set a
        # permissive payload.
        def side_effect(self, roles, countries, logic):
            g.payload = {
                u'acc': {
                    u'demo': [u'root', u'admin', u'registered'],
                    u'jordan': [
                        u'root', u'central', u'directorate', u'clinic',
                        u'reports', u'all', u'cd', u'ncd', u'mh', u'admin',
                        u'personal'
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

        # Mock check_auth method
        # Authentication should be tested properly elsewhere.
        self.patcher = mock.patch(
            'meerkat_libs.auth_client.Authorise.check_auth',
            side_effect=side_effect
        )
        self.mock_auth = self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    # HOMEPAGE testing
    def test_index(self):
        """Ensure the index page is loading correctly"""
        rv = self.app.get('/en/')
        self.assertIn(b'Null Island', rv.data)

    def test_lang_redirect(self):
        """Check you are redirected to the langauge url."""
        rv = self.app.get('/')
        self.assertEqual(rv.status_code, 302)

    def test_technical(self):
        """Check the Technical page loads"""
        rv = self.app.get('/en/technical/')
        self.assertEqual(rv.status_code, 200)

    @mock.patch('meerkat_frontend.common.requests')
    def test_hermes(self, mock_requests):
        c.hermes("publish", "POST", {"topics": ["test-topic"]})
        headers = {
            'content-type': 'application/json',
            'authorization': 'Bearer '
        }
        mock_requests.request.assert_called_with(
            "POST",
            mk.app.config['HERMES_ROOT'] + "publish",
            json={'topics': ['test-topic']},
            headers=headers
        )

if __name__ == '__main__':
    unittest.main()
