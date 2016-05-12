#!/usr/bin/env python3
"""
Meerkat Frontend Tests

Unit tests for the Meerkat frontend
"""
import unittest
import time
from selenium import webdriver


class MeerkatFrontendEnd2End(unittest.TestCase):

    def setUp(self):
        """Setup for testing"""
        self.host = "http://dev_nginx_1"
        self.browser = webdriver.PhantomJS("./node_modules/phantomjs-prebuilt/bin/phantomjs")


    def tearDown(self):
        pass

    def test_index(self):
        self.browser.get(self.host)
        time.sleep(5)
        
        self.assertIn("Public Health Surveillance", self.browser.title)
    

if __name__ == '__main__':
    unittest.main()
