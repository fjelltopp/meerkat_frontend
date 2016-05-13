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
        self.views = ["/", "/technical/", "/reports/",
                      "/download/", "/explore/", "/messaging/"]
    def tearDown(self):
        pass


    def test_authentication(self):
        """ Test that all the views apart from the homepage needs authentication """
        for view in self.views:
            rv = self.app.get(view)
            if view != "/":
                print(view)
                self.assertEqual(rv.status_code, 401)
                rv = self.app.get(view, headers=self.header)
            self.assertEqual(rv.status_code, 200)
    
    def test_multi_basic_auth(self):
        mk.app.config["AUTH"] = {"reports": {"USERNAME": "admin",
                                               "PASSWORD": "secret2"},
                                   "reports/test": {"USERNAME": "admin",
                                               "PASSWORD": "secret3"}
                                   }
        mk.app.config["USE_BASIC_AUTH"] = 1
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

        # #Test Level 2 auth
        # rv = self.app.get('/reports/public_health/', headers=header1)
        # self.assertEqual(rv.status_code, 401)
        # rv = self.app.get('/reports/public_health/', headers=header2)
        # self.assertEqual(rv.status_code, 401)
        # rv = self.app.get('/reports/public_health/', headers=header3)
        # self.assertEqual(rv.status_code, 200)
        
        mk.app.config["AUTH"] = {}

if __name__ == '__main__':
    unittest.main()
