#!/usr/bin/env python3
"""
Meerkat Frontend Tests

Unit tests for the Reports in Meerkat frontend
"""
import meerkat_frontend as mk
import unittest
from datetime import datetime
import calendar
import time
from flask import g
from unittest import mock


class MeerkatFrontendReportsTestCase(unittest.TestCase):

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

        # Mock check_auth method. Authentication should be tested properly else
        # where.
        self.patcher = mock.patch(
            'authorise.check_auth', side_effect=side_effect)
        self.mock_auth = self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def test_reports(self):
        """Check the Reports page loads"""
        rv = self.app.get('en/reports/')
        self.assertEqual(rv.status_code, 200)

    def test_reports_pub_health(self):
        rv = self.app.get('en/reports/test/public_health/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"15,369 consultations", rv.data)
        self.assertIn(
            b"Viral infections characterized by " +
            b"skin and mucous membrane lesions",
            rv.data
        )

    def test_reports_cd_pub_health(self):
        rv = self.app.get('en/reports/test/cd_public_health/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"191 cases", rv.data)
        self.assertIn(
            b"Viral infections characterized by skin " +
            b"and mucous membrane lesions",
            rv.data
        )

    def test_reports_ncd_pub_health(self):
        rv = self.app.get('en/reports/test/ncd_public_health/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"4,434 cases", rv.data)
        self.assertIn(
            b"Chronic Obstructive Pulmonary Disease (COPD)",
            rv.data
        )

    def test_reports_cd(self):
        rv = self.app.get('en/reports/test/communicable_diseases/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(
            b"There were 0 new confirmed cases and 1 new suspected " +
            b"cases of Bacterial meningitis",
            rv.data
        )

    def test_reports_ncd(self):
        rv = self.app.get('en/reports/test/non_communicable_diseases/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"with <br> hypertension", rv.data)

    def test_reports_vaccination(self):
        rv = self.app.get('en/reports/test/vaccination/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"Vaccination sessions: 1", rv.data)

    def test_reports_pip(self):
        """ Basic test of pip report """
        rv = self.app.get('en/reports/test/pip/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(
            b"A total of <strong>70 </strong> enrolled patients",
            rv.data
        )

    def test_reports_refugee_public_health(self):
        """ Basic test of refugee public health report"""
        rv = self.app.get('en/reports/test/refugee_public_health/')
        self.assertIn(rv.status_code, [200])
        self.assertIn(
            b"A total of <strong>0 consultations</strong>  " +
            b"and <strong>43 cases</strong> reported",
            rv.data
        )

    def test_reports_refugee_detail(self):
        """ Basic test of refugee detail report"""
        rv = self.app.get('en/reports/test/refugee_detail/')
        self.assertIn(rv.status_code, [200])

    def test_reports_refugee_cd(self):
        """ Basic test of cd report """
        rv = self.app.get('en/reports/test/refugee_cd/')
        self.assertIn(rv.status_code, [200])

    def test_filters(self):
        """ Test report jinja filters"""
        date = datetime(2015, 6, 7, 23, 7)
        # TODO: Can't get this to work!
        # with mk.app.app_context():
        #     g.language = 'en'
        #     formatted_data = mk.views.reports.format_datetime_with_lang(date)
        #     self.assertEqual(formatted_data, "23:07 07-06-2015")
        date_from_json = mk.views.reports.datetime_from_json(date.isoformat())
        self.assertEqual(date_from_json, date)
        self.assertEqual(
            mk.views.reports.format_thousands(1000),
            "1,000"
        )
        self.assertEqual(
            mk.views.reports.format_thousands(3400),
            "3,400"
        )
        self.assertEqual(
            mk.views.reports.format_thousands(100),
            "100"
        )
        self.assertEqual(
            mk.views.reports.format_thousands(987654321),
            "987,654,321"
        )
