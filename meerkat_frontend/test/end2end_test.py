#!/usr/bin/env python3
"""
Meerkat Frontend Tests

Unit tests for the Meerkat frontend
"""
import meerkat_frontend
import unittest
import time
from selenium import webdriver
from flask_testing import LiveServerTestCase


class MeerkatFrontendEnd2End(LiveServerTestCase):
    def create_app(self):
        app = meerkat_frontend.app
        app.config['TESTING'] = True
        # Default port is 5000
        app.config['LIVESERVER_PORT'] = 8943
        self.browser = webdriver.PhantomJS("./node_modules/phantomjs-prebuilt/bin/phantomjs")
        return app
        
    def tearDown(self):
        pass

    def test_index(self):
        self.browser.get(self.get_server_url())
        time.sleep(5)
        
        self.assertIn("Public Health Surveillance", self.browser.title)
    

if __name__ == '__main__':
    unittest.main()
