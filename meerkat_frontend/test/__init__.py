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


if __name__ == '__main__':
    unittest.main()
