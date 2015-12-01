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
        self.assertIn(rv.status_code, [200, 302])

    def test_technical(self):
        """Check the Technical page loads"""
        rv = self.app.get('/technical/')
        #Due to basic auth
        self.assertEqual(rv.status_code, 401)
        cred = base64.b64encode(b"admin:secret").decode("utf-8")
        header= {"Authorization": "Basic {cred}".format(cred=cred)}
        rv2 = self.app.get('/technical/', headers=header)
        self.assertEqual(rv2.status_code, 200)
    # Utility FUNCTIONS
    def test_epi_week_to_date(self):
        """Ensure epi_week_to_date is sane"""
        self.assertEqual(
            mk.common.epi_week_to_date(42, year=2015),
            datetime(2015, 10, 22)
        )
        self.assertEqual(
            mk.common.epi_week_to_date(12, year=2023),
            datetime(2023, 3, 26)
        )
        self.assertEqual(
            mk.common.epi_week_to_date(4, year=2008),
            datetime(2008, 1, 29)
        )

    def test_date_to_epi_week(self):
        """Ensure date_to_epi_week is sane"""
        self.assertEqual(
            mk.common.date_to_epi_week(datetime(2008, 1, 27)),
            4
        )
        self.assertEqual(
            mk.common.date_to_epi_week(datetime(2023, 3, 25)),
            12
        )
        self.assertEqual(
            mk.common.date_to_epi_week(datetime(2015, 10, 26)),
            43
        )

    #HOMEPAGE testing
    def test_index(self):
        """Ensure the config file is loading correctly"""
        rv = self.app.get('/')
        self.assertIn(b'Null Island', rv.data)

    def test_index(self):
        """Ensure the API data is successfully picked up and displayed."""
        #TODO Write function that waits for javascript to load api data, and then checks it has loaded.

if __name__ == '__main__':
    unittest.main()
