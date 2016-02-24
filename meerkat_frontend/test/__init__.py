#!/usr/bin/env python3
"""
Meerkat Frontend Tests

Unit tests for the Meerkat frontend
"""
import meerkat_frontend as mk
import unittest
from datetime import datetime
from werkzeug.datastructures import Headers
import base64


class MeerkatFrontendTestCase(unittest.TestCase):

    def setUp(self):
        """Setup for testing"""
        mk.app.config['TESTING'] = True
        self.app = mk.app.test_client()
        mk.app.config["USERNAME"] = "admin"
        mk.app.config["PASSWORD"] = "secret"
        cred = base64.b64encode(b"admin:secret").decode("utf-8")
        self.header = {"Authorization": "Basic {cred}".format(cred=cred)}


    def tearDown(self):
        pass

    def test_index(self):
        """Check the index page loads"""
        rv = self.app.get('/')
        self.assertEqual(rv.status_code, 200)
        self.assertIn(b'WHO', rv.data)

    def test_reports(self):
        """Check the Reports page loads"""
        rv = self.app.get('/reports/')
        self.assertIn(rv.status_code, [401])
        rv2 = self.app.get('/reports/', headers=self.header)
        self.assertEqual(rv2.status_code, 200)
        

    def test_reports_pub_health(self):
        rv = self.app.get('/reports/test/public_health/',headers=self.header)
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"5,941 consultations", rv.data)
        self.assertIn(b"Viral infections characterized by skin and mucous membrane lesions", rv.data)
    def test_reports_cd(self):
        rv = self.app.get('/reports/test/communicable_diseases/',headers=self.header)
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"There were no new confirmed cases and 1 new suspected cases of Bloody diarrhoea this week.", rv.data)

        
    def test_technical(self):
        """Check the Technical page loads"""
        rv = self.app.get('/technical/')
        #Due to basic auth
        self.assertEqual(rv.status_code, 401)
        rv2 = self.app.get('/technical/', headers=self.header)
        self.assertEqual(rv2.status_code, 200)

    #HOMEPAGE testing
    def test_index(self):
        """Ensure the config file is loading correctly"""
        rv = self.app.get('/')
        self.assertIn(b'Null Island', rv.data)

    def test_index(self):
        """Ensure the API data is successfully picked up and displayed."""
        #TODO Write function that waits for javascript to load api data, and then checks it has loaded.

    def test_multi_basic_auth(self):
        mk.app.config["AUTH"] = {"reports": {"USERNAME": "admin",
                                               "PASSWORD": "secret2"},
                                   "reports/test": {"USERNAME": "admin",
                                               "PASSWORD": "secret3"}
                                   }

        cred1 = base64.b64encode(b"admin:secret").decode("utf-8")
        header1 = {"Authorization": "Basic {cred}".format(cred=cred1)}
        cred2 = base64.b64encode(b"admin:secret2").decode("utf-8")
        header2 = {"Authorization": "Basic {cred}".format(cred=cred2)}
        cred3 = base64.b64encode(b"admin:secret3").decode("utf-8")
        header3 = {"Authorization": "Basic {cred}".format(cred=cred3)}

        #Test standard auth
        rv = self.app.get('/technical/', headers=header1)
        self.assertEqual(rv.status_code, 200)
        rv = self.app.get('/technical/', headers=header2)
        self.assertEqual(rv.status_code, 401)

        #Test Level 1 auth
        rv = self.app.get('/reports/', headers=header1)
        self.assertEqual(rv.status_code, 401)
        rv = self.app.get('/reports/', headers=header2)
        self.assertEqual(rv.status_code, 200)
        rv = self.app.get('/reports/', headers=header3)
        self.assertEqual(rv.status_code, 401)

        #Test Level 2 auth
        rv = self.app.get('/reports/test/public_health/', headers=header1)
        self.assertEqual(rv.status_code, 401)
        rv = self.app.get('/reports/test/public_health/', headers=header2)
        self.assertEqual(rv.status_code, 401)
        rv = self.app.get('/reports/test/public_health/', headers=header3)
        self.assertEqual(rv.status_code, 200)
        
        mk.app.config["AUTH"] = {}

if __name__ == '__main__':
    unittest.main()
