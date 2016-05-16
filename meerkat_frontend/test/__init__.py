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
        mk.app.config["AUTH"] = {}
        for view in self.views:
            check_authentication(self, view, view != "/")
            
    def test_technical_endpoints(self):
        """ Testing that all technical endpoints work and are properly authentication """
        mk.app.config["AUTH"] = {}        
        technical_endpoints = ["/technical/", "/technical/demographics",
                               "/technical/demographics/loc_2","/technical/alerts/aaaaaa",
                               "/technical/diseases/cmd_1/", "/technical/diseases/cmd_1/loc_2"]
        for url in technical_endpoints:
            check_authentication(self, url, True)
        
    
    def test_multi_basic_auth(self):
        """ Test multi basic auth """
        mk.app.config["AUTH"] = {"technical": {"USERNAME": "admin",
                                               "PASSWORD": "secret2"},
                                 "technical/demographics": {"USERNAME": "admin",
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
        rv = self.app.get('/reports/', headers=header1)
        self.assertEqual(rv.status_code, 200)
        rv = self.app.get('/reports/', headers=header2)
        self.assertEqual(rv.status_code, 401)

        #Test Level 1 auth
        rv = self.app.get('/technical/', headers=header1)
        self.assertEqual(rv.status_code, 401)
        rv = self.app.get('/technical/', headers=header2)
        self.assertEqual(rv.status_code, 200)
        rv = self.app.get('/technical/', headers=header3)
        self.assertEqual(rv.status_code, 401)

        # #Test Level 2 auth
        rv = self.app.get('/technical/demographics', headers=header1)
        self.assertEqual(rv.status_code, 401)
        rv = self.app.get('/technical/demographics', headers=header2)
        self.assertEqual(rv.status_code, 401)
        rv = self.app.get('/technical/demographics', headers=header3)
        self.assertEqual(rv.status_code, 200)
        
        mk.app.config["AUTH"] = {}

if __name__ == '__main__':
    unittest.main()
