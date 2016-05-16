#!/usr/bin/env python3
"""
Meerkat Frontend Tests

Unit tests for the Reports in Meerkat frontend
"""
import meerkat_frontend as mk
from meerkat_frontend.test import check_authentication
import unittest
from datetime import datetime
from werkzeug.datastructures import Headers
import base64


class MeerkatFrontendReportsTestCase(unittest.TestCase):

    def setUp(self):
        """Setup for testing"""
        mk.app.config['TESTING'] = True
        self.app = mk.app.test_client()
        mk.app.config["USERNAME"] = "admin"
        mk.app.config["PASSWORD"] = "secret"
        mk.app.config["AUTH"] = {}
        cred = base64.b64encode(b"admin:secret").decode("utf-8")
        self.header = {"Authorization": "Basic {cred}".format(cred=cred)}
        self.views = ["/", "/technical/", "/reports/",
                      "/download/", "/explore/", "/messaging/"]

        mk.app.config["REPORTS_CONFIG"]["report_list"] = {
            "public_health": {
                "title": "Public Health Profile",
                "template": "reports/report_public_health_profile.html",
                "api_name": "public_health",
                "default_period": "week",
                "map_centre": [0, 0, 7]
            },
            "cd_public_health": {
                "title": "Communicable Disease Profile Report",
                "template": "reports/report_cd_public_health_profile.html",
                "api_name": "cd_public_health",
                "default_period": "week",
                "map_centre": [0, 0, 7]
            },
            "ncd_public_health": {
                "title": "Non-Communicable Disease Profile Report",
                "template": "reports/report_ncd_public_health_profile.html",
                "api_name": "ncd_public_health",
                "default_period": "month",
                "map_centre": [0, 0, 7]
            },
            "communicable_diseases": {
                "title": "Communicable Diseases Report",
                "template": "reports/report_communicable_diseases.html",
                "api_name": "cd_report",
                "default_period": "year",
            },
            "non_communicable_diseases": {
                "title": "Non Communicable Diseases Report",
                "template": "reports/report_non_communicable_diseases.html",
                "api_name": "ncd_report",
                "default_period": "month",
            },
            "pip": {
                "title": "Pandemic Influenza Preparedness (PIP) Profile",
                "template": "reports/report_pip.html",
                "api_name": "pip",
                "default_period": "year",
                "map_centre": [0, 0, 7]
            },
            "refugee_public_health": {
                "title": "North Eastern Border Public Health Profile",
                "template": "reports/report_refugee_public_health_profile.html",
                "api_name": "refugee_public_health",
                "default_period": "week",
                "map_centre": [0, 0, 7]
            },
            "refugee_cd": {
                "title": "North Eastern Border Communicable Disease Report",
                "template": "reports/report_refugee_cd.html",
                "api_name": "refugee_cd",
                "default_period": "year",
            },
            "refugee_detail": {
                "title": "North Eastern Border Detailed Report",
                "template": "reports/report_refugee_detail.html",
                "api_name": "refugee_detail",
                "default_period": "week",
                "landscape":True
            }
        }
        
    def tearDown(self):
        pass

    def test_reports_authentication(self):
        reports = mk.app.config["REPORTS_CONFIG"]["report_list"].keys()
        
        start = datetime(2015, 1, 1).isoformat()
        end = datetime(2015, 6, 1).isoformat()
        for report in reports:
            check_authentication(self, '/reports/public_health/1/{}/{}/'.format(end, start), True)
    
    def test_reports_public_health(self):
        """ Basic test of public health report"""
        start = datetime(2015, 1, 1).isoformat()
        end = datetime(2015, 6, 1).isoformat()
        rv = self.app.get('/reports/public_health/1/{}/{}/'.format(end, start),headers=self.header)
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"5,941 consultations", rv.data)
        self.assertIn(b"Viral infections characterized by skin and mucous membrane lesions", rv.data)

    def test_reports_cd_public_health(self):
        """ Basic test of cd public health report"""
        start = datetime(2015, 1, 1).isoformat()
        end = datetime(2015, 6, 1).isoformat()
        rv = self.app.get('/reports/cd_public_health/1/{}/{}/'.format(end, start),headers=self.header)
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"73 cases", rv.data)
        self.assertIn(b"Viral infections characterized by skin and mucous membrane lesions", rv.data)

    def test_reports_ncd_public_health(self):
        """ Basic test of ncd public health report"""
        start = datetime(2015, 1, 1).isoformat()
        end = datetime(2015, 6, 1).isoformat()
        rv = self.app.get('/reports/ncd_public_health/1/{}/{}/'.format(end, start),headers=self.header)
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"64 cases", rv.data)
        self.assertIn(b"Other disorders of glucose regulation and pancreatic internal secretion", rv.data)
    def test_reports_cd(self):
        """ Basic test of cd report """
        start = datetime(2015, 1, 1).isoformat()
        end = datetime(2015, 6, 1).isoformat()
        rv = self.app.get('/reports/communicable_diseases/1/{}/{}/'.format(end, start),headers=self.header)
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"There were no new confirmed cases and 1 new suspected cases of Bloody diarrhoea this week.", rv.data)

    def test_reports_ncd(self):
        """ Basic test of ncd report """
        start = datetime(2015, 1, 1).isoformat()
        end = datetime(2015, 6, 1).isoformat()
        rv = self.app.get('/reports/non_communicable_diseases/1/{}/{}/'.format(end, start),headers=self.header)
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"Overweight (BMI &gt; 25)", rv.data)

    def test_reports_pip(self):
        """ Basic test of ncd report """
        start = datetime(2015, 1, 1).isoformat()
        end = datetime(2015, 6, 1).isoformat()
        rv = self.app.get('/reports/pip/1/{}/{}/'.format(end, start),headers=self.header)
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"A total of <strong>35 </strong> enrolled patients", rv.data)
        
    def test_reports_refugee_public_health(self):
        """ Basic test of refugee public health report"""
        start = datetime(2015, 1, 1).isoformat()
        end = datetime(2015, 6, 1).isoformat()
        rv = self.app.get('/reports/refugee_public_health/1/{}/{}/'.format(end, start),headers=self.header)
        self.assertIn(rv.status_code, [200])
        self.assertIn(b"A total of <strong>0 consultations</strong>  and <strong>43 cases</strong> reported", rv.data)
    def test_reports_refugee_detail(self):
        """ Basic test of refugee detail report"""
        start = datetime(2015, 1, 1).isoformat()
        end = datetime(2015, 6, 1).isoformat()
        rv = self.app.get('/reports/refugee_detail/1/{}/{}/'.format(end, start),headers=self.header)
        self.assertIn(rv.status_code, [200])

    def test_reports_refugee_cd(self):
        """ Basic test of cd report """
        start = datetime(2015, 1, 1).isoformat()
        end = datetime(2015, 6, 1).isoformat()
        rv = self.app.get('/reports/refugee_cd/1/{}/{}/'.format(end, start),headers=self.header)
        self.assertIn(rv.status_code, [200])

    def test_filters(self):
        """ Test report jinja filters"""
        date = datetime(2015, 6, 7, 23, 7)
        formatted_data = mk.views.reports.format_datetime(date)
        self.assertEqual(formatted_data, "23:07 07-06-2015")

        date_from_json = mk.views.reports.datetime_from_json(date.isoformat())
        self.assertEqual(date_from_json, date)

        self.assertEqual(mk.views.reports.format_thousands(1000),
                         "1,000")
        self.assertEqual(mk.views.reports.format_thousands(3400),
                         "3,400")
        self.assertEqual(mk.views.reports.format_thousands(100),
                         "100")
        self.assertEqual(mk.views.reports.format_thousands(987654321),
                         "987,654,321")
        
