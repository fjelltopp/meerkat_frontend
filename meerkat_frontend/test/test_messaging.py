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
import calendar
import time
from flask import g
from werkzeug.datastructures import Headers
import base64
from unittest import mock
import requests
from urllib.parse import urlparse

class MeerkatFrontendMessagingTestCase(unittest.TestCase):

    @classmethod
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

    @classmethod
    def tearDown(self):
        self.patcher.stop()

    def test_subscribe(self):
        """Test that the subscribe form is correctly shown"""
        rv = self.app.get('/en/messaging/')
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
            '/en/messaging/subscribe/subscribed',
            data=post_data
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
        rv = self.app.get('/en/messaging/subscribe/verify/testid')
        self.assertIn(rv.status_code, [302])
        self.assertEqual(urlparse(rv.location).path, '/en/messaging/subscribe/verified/testid')

        #Check for a redirect when verifying a no-sms account
        mock_hermes.reset()
        mock_hermes.return_value = {
            'Item':{'verified': False}
        }
        rv = self.app.get('/en/messaging/subscribe/verify/testid')
        self.assertIn(rv.status_code, [302])
        self.assertEqual(urlparse(rv.location).path, '/en/messaging/subscribe/verified/testid')

        #Check for the sms verification form when verifying an sms account
        mock_hermes.reset()
        mock_hermes.return_value = {
            'Item':{'verified': False, 'sms':'+441234567890'}
        }
        rv = self.app.get('/en/messaging/subscribe/verify/testid')
        self.assertIn(rv.status_code, [200])
        self.assertIn(b'verify your contact details', rv.data)
        self.assertIn(b'+441234567890', rv.data)

    @mock.patch('meerkat_frontend.common.hermes')
    def test_verified( self, mock_hermes ):
        """Test that the verified step responds correctly."""

        #Create the correct mocked responses.
        subscriber_id = 'TESTSUBCRIBERID'
        mock_hermes.return_value = {
            'Item':{
                'id': subscriber_id,
                'first_name': 'Testy',
                'last_name': 'McTestface',
                'sms': '+441234567890',
                'email': 'success@amazonses.simulator.com',
                'country': 'Null Island',
                'topics': ['null-public_health', 'null-1-allDis'],
                'verified': True
            }
        }

        #Check the page shows correctly
        rv = self.app.get('/en/messaging/subscribe/verified/' + subscriber_id)
        self.assertIn(rv.status_code, [200])
        self.assertIn(b'successfully verified', rv.data)

        #Check hermes has been called correctly
        mock_hermes.assert_any_call( '/subscribe/' + subscriber_id, 'GET' )
        self.assertTrue( mock_hermes.call_args_list[1][0][0:2] == ('/email', 'PUT') )

        #Check for a redirect if a user tries to access this page for an unverified account.
        mock_hermes.return_value['Item']['verified'] = False
        rv = self.app.get('/en/messaging/subscribe/verified/' + subscriber_id)
        self.assertIn(rv.status_code, [302])
        self.assertEqual(urlparse(rv.location).path, '/en/messaging/subscribe/verify/' + subscriber_id)

    @mock.patch('random.random')
    @mock.patch('meerkat_frontend.common.hermes')
    def test_sms_code( self, mock_hermes, mock_random ):
        """Test that the function that sets and checks sms codes."""

        #Create the correct mocked responses.
        subscriber_id = 'TESTSUBCRIBERID'
        subscribe_get_response = {
            'Item':{
                'id': subscriber_id,
                'first_name': 'Testy',
                'last_name': 'McTestface',
                'sms': '+441234567890',
                'email': 'success@amazonses.simulator.com',
                'country': 'Null Island',
                'topics': ['null-public_health', 'null-1-allDis'],
                'verified': True
            }
        }
        verify_get_response = { "message": "Subscriber verified" }
        verify_post_response_correct = { "matched": True }
        verify_post_response_incorrect = { "matched": False }
        sms_put_response = { "messages": [{"status": 0}] }

        #Test the GET method.
        mock_hermes.side_effect = [subscribe_get_response, {}, sms_put_response ]
        mock_random.return_value = 0
        rv = self.app.get('/en/messaging/subscribe/sms_code/' + subscriber_id)
        self.assertIn(rv.status_code, [302])
        self.assertEqual(urlparse(rv.location).path, '/en/messaging/subscribe/verify/' + subscriber_id)
        mock_hermes.assert_any_call( '/subscribe/' + subscriber_id, 'GET' )
        mock_hermes.assert_any_call( '/verify', 'PUT', { 'subscriber_id':subscriber_id, 'code': 0 } )
        self.assertTrue( mock_hermes.call_args_list[2][0][0:2] == ('/sms', 'PUT') )

        #Test the POST method for the incorrect code.
        mock_hermes.reset_mock()
        mock_hermes.side_effect = [verify_post_response_incorrect]
        rv = self.app.post(
            '/en/messaging/subscribe/sms_code/' + subscriber_id,
            data={'code':0}
        )
        self.assertIn(rv.status_code, [302])
        self.assertEqual(urlparse(rv.location).path, '/en/messaging/subscribe/verify/' + subscriber_id)
        mock_hermes.assert_called_with( '/verify', 'POST', {'subscriber_id': subscriber_id, 'code': '0'} )

        #Test the POST method for the correct code.
        mock_hermes.reset_mock()
        mock_hermes.side_effect = [verify_post_response_correct, verify_get_response]
        rv = self.app.post(
            '/en/messaging/subscribe/sms_code/' + subscriber_id,
            data={'code':0}
        )
        self.assertIn(rv.status_code, [302])
        self.assertEqual(urlparse(rv.location).path, '/en/messaging/subscribe/verified/' + subscriber_id)
        print( mock_hermes.call_args_list )
        self.assertTrue( mock_hermes.call_args_list[0][0] == (
            '/verify', 'POST', {'subscriber_id': subscriber_id, 'code': '0'}
        ))
        self.assertTrue( mock_hermes.call_args_list[1][0] == ('/verify/' + subscriber_id, 'GET'))
