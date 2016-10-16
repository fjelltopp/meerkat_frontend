#!/usr/bin/env python3
"""
Meerkat Frontend Tests

Unit tests for the Meerkat frontend
"""
import meerkat_frontend as mk
import base64, unittest, calendar, jwt, os, time
from datetime import datetime
from werkzeug.datastructures import Headers
from unittest.mock import MagicMock
from unittest import mock
from flask import g
import authorise as auth

#Check if auth requirements have been installed
try:
    #Test by importing package that will only ever be required in auth (touch wood). 
    __import__('passlib')
    print( "Authentication requirements installed." )
except ImportError:
    print( "Authentication requirements not installed.  Installing them now." )
    os.system('pip install -r /var/www/meerkat_auth/requirements.txt') 
from passlib.hash import pbkdf2_sha256

#Need this module to be importable without the whole of meerkat_auth config.
#Directly load the secret settings file from which to import required variables.
#File must include JWT_COOKIE_NAME, JWT_ALGORITHM and JWT_PUBLIC_KEY variables.
filename = os.environ.get( 'MEERKAT_AUTH_SETTINGS' )
exec( compile(open(filename, "rb").read(), filename, 'exec') )

class MeerkatFrontendTestCase(unittest.TestCase):

    def setUp(self):
        """Setup for testing"""
        mk.app.config['TESTING'] = True
        self.app = mk.app.test_client()

        #When check_auth is called, just allow the authentication and set a permissive payload.
        def side_effect(roles, countries):
            g.payload = {
                u'acc': {
                    u'demo': [u'root',u'admin',u'registered'], 
                    u'jordan': [
                        u'root', u'central',u'directorate',u'clinic',u'reports',
                        u'all',u'cd',u'ncd',u'mh',u'admin',u'personal'
                    ], 
                    u'madagascar':[u'root',u'admin',u'registered'],
                    u'rms':[u'root',u'admin',u'registered']
                }, 
                u'data': {u'name': u'Testy McTestface'}, 
                u'usr': u'testUser', 
                u'exp': calendar.timegm( time.gmtime() ) + 30,  #Lasts for 30 seconds
                u'email': u'test@test.org.uk'
            }

        #Mock check_auth method. Authentication should be tested properly else where. 
        self.patcher = mock.patch('authorise.check_auth', side_effect = side_effect)
        self.mock_auth = self.patcher.start()
        
    def tearDown(self):
        self.patcher.stop()

    def test_index(self):
        """Check the index page loads"""
        rv = self.app.get('/')
        self.assertEqual(rv.status_code, 200)
        self.assertIn(b'WHO', rv.data)

    def test_reports(self):
        """Check the Reports page loads"""
        rv = self.app.get('/en/reports/') 
        rv2 = self.app.get('en/reports/')
        self.assertEqual(rv2.status_code, 200)

    def test_reports_pub_health(self):
        rv = self.app.get('en/reports/test/public_health/' )
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"5,941 consultations", rv.data)
        self.assertIn(b"Viral infections characterized by skin and mucous membrane lesions", rv.data)

    def test_reports_cd_pub_health(self):
        rv = self.app.get('en/reports/test/cd_public_health/' )
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"73 cases", rv.data)
        self.assertIn(b"Viral infections characterized by skin and mucous membrane lesions", rv.data)

    def test_reports_ncd_pub_health(self):
        rv = self.app.get('en/reports/test/ncd_public_health/' )
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"64 cases", rv.data)
        self.assertIn(b"Other disorders of glucose regulation and pancreatic internal secretion", rv.data)

    def test_reports_cd(self):
        rv = self.app.get('en/reports/test/communicable_diseases/' )
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"There were 0 new confirmed cases and 1 new suspected cases of Bloody diarrhoea", rv.data)

    def test_reports_ncd(self):
        rv = self.app.get('en/reports/test/non_communicable_diseases/' )
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"with <br> hypertension", rv.data)

    def test_reports_vaccination(self):
        rv = self.app.get('en/reports/test/vaccination/' )
        self.assertIn(rv.status_code, [200])
        
    def test_technical(self):
        """Check the Technical page loads"""
        rv = self.app.get('/en/technical/')       
        rv2 = self.app.get('/en/technical/')
        self.assertEqual(rv2.status_code, 200)

    #HOMEPAGE testing
    def test_index(self):
        """Ensure the config file is loading correctly"""
        rv = self.app.get('/en/')
        self.assertIn(b'Null Island', rv.data)




if __name__ == '__main__':
    unittest.main()
