#!/usr/bin/env python3
"""
Meerkat Frontend Tests

Unit tests for the Meerkat frontend
"""
import meerkat_frontend as mk
import unittest
from datetime import datetime
import json
import werkzeug
from werkzeug.datastructures import Headers
import base64
from unittest import mock
import requests
from urllib.parse import urlparse

class MeerkatFrontendMessagingTestCase(unittest.TestCase):

    @classmethod
    def setup_class(self):
        """Setup for testing"""
        mk.app.config['TESTING'] = True
        self.app = mk.app.test_client()
        mk.app.config["USERNAME"] = "admin"
        mk.app.config["PASSWORD"] = "secret"
        mk.app.config["AUTH"] = {}
        cred = base64.b64encode(b"admin:secret").decode("utf-8")
        self.header = {"Authorization": "Basic {cred}".format(cred=cred)}
    
    @classmethod 
    def teardown_class(self):
        pass
    
    def test_subscribe(self):
        """Test that the subscribe form is correctly shown"""
        rv = self.app.get('/messaging/', headers=self.header)
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"personal details", rv.data)
        self.assertIn(b"Subscribe", rv.data)
        
    @mock.patch('random.random')
    @mock.patch('meerkat_frontend.common.hermes')
    def test_subscribed(self, mock_hermes, mock_random):
        """Test that the subscribed page is correctly shown."""

        #Create the correct mocked responses.
        mock_random.return_value = 0
        mock_hermes.return_value = {
          'subscriber_id':'testSubscriberID'
        }
        
        #Make the test request.
        post_data = {
            'first_name': 'Testy',
            'last_name': 'McTestface', 
            'sms': '+441234567890', 
            'email': 'success@amazonses.simulator.com', 
            'country': 'Null Island', 
            'topics': ['null-public_health', 'null-1-allDis']     
        }
        rv = self.app.post(
            '/messaging/subscribe/subscribed', 
            data=post_data, 
            headers=self.header
        )

        #Assert that the page shows correctly.
        self.assertIn( rv.status_code, [200] )
        self.assertIn( bytes( post_data['first_name'], encoding='UTF-8' ), rv.data )
        self.assertIn( bytes( post_data['email'], encoding='UTF-8' ), rv.data )

        #Assert that Hermes has been called in the right order with roughly the right arguments.
        print( mock_hermes.call_args_list )
        mock_hermes.assert_any_call('/subscribe', 'PUT', post_data)
        mock_hermes.assert_any_call('/verify', 'PUT', {'code': 0, 'subscriber_id': 'testSubscriberID'} )
        self.assertTrue( mock_hermes.call_args_list[1][0][0:2] == ('/email', 'PUT') )
        self.assertTrue( mock_hermes.call_args_list[3][0][0:2] == ('/sms', 'PUT') )

    @mock.patch('meerkat_frontend.common.hermes')
    def test_verify( self, mock_hermes ):
        """Test that the verify step responds correctly."""

        #Check for a redirect when verifying an already verified account
        mock_hermes.return_value = {
            'Item':{'verified':True}
        }
        rv = self.app.get('/messaging/subscribe/verify/testid', headers=self.header)
        self.assertIn(rv.status_code, [302])
        self.assertEqual(urlparse(rv.location).path, '/messaging/subscribe/verified/testid')

        #Check for a redirect when verifying a no-sms account
        mock_hermes.reset()
        mock_hermes.return_value = {
            'Item':{'verified': False}
        }
        rv = self.app.get('/messaging/subscribe/verify/testid', headers=self.header)
        self.assertIn(rv.status_code, [302])
        self.assertEqual(urlparse(rv.location).path, '/messaging/subscribe/verified/testid')

        #Check for the sms verification form when verifying an sms account
        mock_hermes.reset()
        mock_hermes.return_value = {
            'Item':{'verified': False, 'sms':'+441234567890'}
        }
        rv = self.app.get('/messaging/subscribe/verify/testid', headers=self.header)
        self.assertIn(rv.status_code, [200])
        self.assertIn(b'verify your contact details', rv.data)
        self.assertIn(b'+441234567890', rv.data)

