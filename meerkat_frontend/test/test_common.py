#!/usr/bin/env python3
"""
Meerkat Frontend Tests

Unit tests for the Meerkat frontend
"""
import meerkat_frontend as mk
import unittest
from datetime import datetime
import werkzeug
from unittest import mock
import requests
import calendar
import time
from flask import g


class MeerkatFrontendCommonTestCase(unittest.TestCase):

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
                        u'root', u'central', u'directorate',
                        u'clinic', u'reports', u'all', u'cd',
                        u'ncd', u'mh', u'admin', u'personal'
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
            'meerkat_libs.auth_client.auth.check_auth',
            side_effect=side_effect
        )
        self.mock_auth = self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    @mock.patch("meerkat_frontend.common.requests.get")
    def test_api(self, mock_requests):
        """ Test the api function in common.py"""
        mk.app.config["TESTING"] = False
        mk.app.config["INTERNAL_API_ROOT"] = "http://test/"
        mk.app.config["TECHNICAL_CONFIG"]["api_key"] = "test-api"
        with mk.app.test_request_context("/"):
            data = {"value": 54}
            request_return = mock.MagicMock()

            request_return.json.return_value = data
            mock_requests.return_value = request_return
            ret = mk.common.api("key_indicators")
            self.assertTrue(mock_requests.called)
            mock_requests.assert_called_with("http://test/key_indicators",
                                             params=None)
            self.assertEqual(ret, data)

            mk.common.api(
                "variables/category/category2",
                params={"test": "test2"}
            )
            self.assertTrue(mock_requests.called)
            mock_requests.assert_called_with(
                "http://test/variables/category/category2",
                params={"test": "test2"}
            )
            # Check that abort(500) is called in a request error
            mock_requests.side_effect = requests.exceptions.RequestException()
            with self.assertRaises(werkzeug.exceptions.InternalServerError):
                ret = mk.common.api("key_indicators")

            # Check that abort(500) is called if not a proper return object
            mock_requests.return_value = "not a real return value"
            with self.assertRaises(werkzeug.exceptions.InternalServerError):
                ret = mk.common.api("key_indicators")

    @mock.patch("meerkat_frontend.common.requests.request")
    def test_hermes(self, mock_requests):
        """ Test the Heremes function in common """
        mk.app.config["HERMES_API_KEY"] = "hermes-key"
        mk.app.config["HERMES_ROOT"] = "http://test"
        header = {'content-type': 'application/json'}

        with mk.app.test_request_context("/"):
            data = {"value": 54}
            request_return = mock.MagicMock()

            request_return.json.return_value = data
            mock_requests.return_value = request_return

            return_data = mk.common.hermes(
                "/send",
                "POST",
                data={"test": "test2"}
            )
            self.assertTrue(mock_requests.called)
            mock_requests.assert_called_with(
                "POST",
                "http://test/send",
                json={"test": "test2", "api_key": "hermes-key"},
                headers=header
            )
            self.assertEqual(return_data, data)

            # Check that abort(500) is called in a request error
            mock_requests.side_effect = requests.exceptions.RequestException()
            with self.assertRaises(werkzeug.exceptions.InternalServerError):
                return_data = mk.common.hermes(
                    "/send",
                    "POST",
                    data={"test": "test2"}
                )

            # Check that abort(500) is called if not a proper return object
            mock_requests.return_value = "not a real return value"
            with self.assertRaises(werkzeug.exceptions.InternalServerError):
                return_data = mk.common.hermes(
                    "/send",
                    "POST",
                    data={"test": "test2"}
                )

    @mock.patch("meerkat_frontend.common.requests.get")
    def test_epi_week_to_date(self, mock_requests):
        """ Test the epi_week_to_date function """
        mk.app.config["TESTING"] = False
        mk.app.config["INTERNAL_API_ROOT"] = "http://test/"
        with mk.app.test_request_context("/"):
            data = {"start_date": datetime(2015, 1, 1).isoformat()}
            request_return = mock.MagicMock()
            request_return.json.return_value = data
            mock_requests.return_value = request_return
            date = mk.common.epi_week_to_date(10, 2015)
            self.assertEqual(date, datetime(2015, 1, 8))
            mock_requests.assert_called_with(
                "http://test/epi_week_start/2015/10",
                params=None
            )

    @mock.patch("meerkat_frontend.common.requests.get")
    def test_date_to_epi_week(self, mock_requests):
        """ Test the date to epi week function """
        mk.app.config["TESTING"] = False
        mk.app.config["INTERNAL_API_ROOT"] = "http://test/"
        with mk.app.test_request_context("/"):
            data = {"epi_week": 10}
            request_return = mock.MagicMock()
            request_return.json.return_value = data
            mock_requests.return_value = request_return
            date = datetime(2015, 1, 8)
            epi_week = mk.common.date_to_epi_week(date)
            self.assertEqual(epi_week, 10)
            mock_requests.assert_called_with(
                "http://test/epi_week/{}".format(date.isoformat()),
                params=None
            )
