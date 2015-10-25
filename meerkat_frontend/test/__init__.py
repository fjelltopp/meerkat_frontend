#!/usr/bin/env python3
"""
Meerkat Frontend Tests

Unit tests for the Meerkat frontend
"""
import meerkat_frontend
import unittest
try:
    import simplejson as json
except ImportError:
    import json
import urllib.parse


class MeerkatFrontendTestCase(unittest.TestCase):

    def setUp(self):
        """Setup for testing"""
        meerkat_frontend.app.config['TESTING'] = True
        self.app = meerkat_frontend.app.test_client()

    def tearDown(self):
        pass

    def test_index(self):
        """Check the index page loads"""
        rv = self.app.get('/')
        assert '200 OK' in rv.status
        assert b'WHO' in rv.data

    # Test request data
    test_request_data = {}
    enc_request_data = urllib.parse.urlencode(test_request_data)

    def test_api_json(self):
        """Check a standard API request returns valid JSON"""
        pass

if __name__ == '__main__':
    unittest.main()
