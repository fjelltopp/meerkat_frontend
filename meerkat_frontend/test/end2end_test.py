#!/usr/bin/env python3
"""
Meerkat Frontend Tests

Unit tests for the Meerkat frontend
"""
import meerkat_frontend
import unittest
import time
from selenium import webdriver
from wsgi_liveserver import LiveServerTestCase
import signal
import logging
from logging import Formatter, FileHandler

class MeerkatFrontendEnd2End(LiveServerTestCase):
    def create_app(self):
        app = meerkat_frontend.app
        app.config['TESTING'] = True
        return app

    def setUp(self):
        self.browser = webdriver.PhantomJS("./node_modules/phantomjs-prebuilt/bin/phantomjs")
        self.browser.implicitly_wait(3)

    def tearDown(self):
        self.browser.close()
        # Work around so that we are not left with a lot of phantomjs process
        self.browser.service.process.send_signal(signal.SIGTERM)
        self.browser.quit()

        
        
    def test_index(self):
        self.browser.get(self.url_base())
        time.sleep(3)
        self.assertIn("Public Health Surveillance", self.browser.title)
if __name__ == '__main__':
    unittest.main()
