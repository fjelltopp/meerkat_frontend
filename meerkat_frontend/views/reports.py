"""
reports.py

A Flask Blueprint module for reports.
"""
from flask import Blueprint, render_template, abort, redirect, url_for, request, send_file, current_app, Response
from datetime import datetime, date
try:
    import simplejson as json
except ImportError:
    import json
import dateutil.parser
import requests
from .. import common as c

import pdfcrowd
from flask_weasyprint import HTML, render_pdf

reports = Blueprint('reports', __name__)

@reports.before_request
def requires_auth():
    """Checks that the user has authenticated before returning any page from the technical site."""
    auth = request.authorization
    if not auth or not c.check_auth(auth.username, auth.password):
        return c.authenticate()


# NORMAL ROUTES
@reports.route('/')
@reports.route('/loc_<int:locID>')
def index(locID=1):
    return render_template('reports/index.html',
                           content=current_app.config['REPORTS_CONFIG'],
                           loc=locID,
                           week=c.api('/epi_week'))
    

@reports.route('/test/<report>/')
def test(report):
    """Serves a test report page using a static JSON file."""
    report_list = current_app.config['REPORT_LIST']
    if report in report_list['reports']:
        try:
            with open(report_list['reports'][report]['test_json_payload'])as json_blob:
                data = json.load(json_blob)
        except IOError:
            abort(500)
        except json.JSONDecodeError:
            abort(500)
        data["flag"] = current_app.config["FLAGG_ABR"]
        if report in ['public_health', 'cd_public_health', "ncd_public_health"]:
            # Extra parsing for natural language bullet points
            extras = {"patient_status": {}}
            for item in data['data']['patient_status']:
                title = item['title'].lower().replace(" ", "")
                if title not in ["refugee", "other"]:
                    title = "national"
                extras["patient_status"][title] = {
                    'percent': item['percent'],
                    'quantity': item['quantity']
                }
            extras['map_centre'] = report_list['reports'][report]["map_centre"]
            extras["map_api_call"] = (current_app.config['EXTERNAL_API_ROOT'] +
                                 "/clinics/1")
        elif report in ["refugee_public_health"]:
            extras = {}
            extras['map_centre'] = report_list['reports'][report]["map_centre"]
            extras["map_api_call"] = (current_app.config['EXTERNAL_API_ROOT'] +
                                 "/clinics/1/Refugee")
        else:
            extras = None
        return render_template(
            report_list['reports'][report]['template'],
            report=data,
            extras=extras,
            address=report_list["address"]
        )
    else:
        abort(501)


@reports.route('/email/<report>/', methods=['POST'])
def send_email_report(report):
    """Sends an email via Hermes with the latest report"""

    report_list = current_app.config['REPORT_LIST']
    country = current_app.config['MESSAGING_CONFIG']['messages']['country']

    if report in report_list['reports']:

        location = report_list['default_location']
        end = c.epi_week_to_date(c.date_to_epi_week() - 1)
        api_request = '/reports/{report}/{loc}/{end}'.format(
            report=report_list['reports'][report]['api_name'],
            loc=location,
            end=end.strftime('%Y-%m-%d')
            )
        data = c.api(api_request, api_key=True)
        epi_week = data['data']['epi_week_num']
        epi_year = format_datetime(
            datetime_from_json(data['data']['epi_week_date']),
            format='%Y')
        epi_date = format_datetime(
            datetime_from_json(data['data']['epi_week_date']),
            format='%-d %B %Y')
        relative_url = url_for('.report',
                               report=report,
                               location=location,
                               year=epi_year,
                               week=epi_week)
        report_url = ''.join([current_app.config['ROOT_URL'], relative_url])

        # RENDER!
        # Extra parsing for natural language bullet points in email templates
        patient_status = {
            item['title'].lower().replace(" ", ""):
                {'percent': item['percent'],
                 'quantity': item['quantity']}
                for item in data['data']['patient_status']}
        extras = {
            'patient_status': patient_status
            }

        html_email_body = render_template(
            report_list['reports'][report]['template_email_html'],
            email=data,
            extras=extras,
            report_url=report_url
        )
        plain_email_body = render_template(
            report_list['reports'][report]['template_email_plain'],
            email=data,
            extras=extras,
            report_url=report_url
        )
        subject = (
            '{} | {} Epi Week {} ({})'
            .format(country, report_list['reports'][report]['title'], epi_week, epi_date)
        )
        topic = current_app.config['MESSAGING_CONFIG']['subscribe']['topic_prefix'] + report;
        
        #Assemble the message data in a manner hermes will understand.
        message = {
            "id": topic + "-" + str(epi_week) + "-" + str(epi_year),
            "topics": topic,
            "html-message": html_email_body,
            "message": plain_email_body,
            "subject": subject,
            "from": current_app.config['MESSAGING_CONFIG']['messages']['from']
        }

        #Publish the message to hermes
        r = c.hermes( '/publish', 'PUT', message )

        if r.status_code == 200:
            return 'OK'
        else:
            current_app.logger.warning( "Aborting. Hermes error:" + str(r.json()) ) 
            abort( 502 )
    else:
        current_app.logger.warning( "Aborting. Report doesn't exist." ) 
        abort(501)


@reports.route('/<report>/')
@reports.route('/<report>/<location>/')
@reports.route('/<report>/<location>/<int:year>/')
@reports.route('/<report>/<location>/<int:year>/<int:week>/')
def report(report=None, location=None, year=None, week=None):
    """Serves dynamic report for a location and date"""
    # Check that the requested project and report are valid
    report_list = current_app.config['REPORT_LIST']

    if report in report_list['reports']:
        ret = create_report(config=current_app.config, report=report, location=location, year=year, week=week)
        return render_template(
            ret['template'],
            report=ret['report'],
            extras=ret['extras'],
            address=ret['address']
            )

    else:
        abort(501)

@reports.route('/<report>.pdf')
@reports.route('/<report>_<location>.pdf')
@reports.route('/<report>_<location>_<int:year>.pdf')
@reports.route('/<report>_<location>_<int:year>_<int:week>.pdf')
def pdf_report(report=None, location=None, year=None, week=None):

    report_list = current_app.config['REPORT_LIST']
    client = pdfcrowd.Client("jsoppela", "632073174ee4b5c4b0055905be7c73c4") # TODO: fetch credentials from config file
    
    if report in report_list['reports']:
        ret = create_report(config=current_app.config, report=report, location=location, year=year, week=week)

        html = render_template(
            ret['template'],
            report=ret['report'],
            extras=ret['extras'],
            address=ret['address']
            )
        # TODO: add check whether running on localhost, in which case fetch static files from s3
        if 1==1: 
            html=html.replace("/static/", "https://s3-eu-west-1.amazonaws.com/test-meerkat/pdfcrowd-files/static/")

        client.usePrintMedia(True)
        client.setPageWidth('1200pt')
        client.setPageHeight('1697pt')
        client.setPageMargins('90pt','60pt','90pt','60pt')
        client.setHtmlZoom(400)

        pdf = client.convertHtml(html)
        return Response(pdf, mimetype='application/pdf')

    else:
        abort(501)

@reports.route('/error/<int:error>/')
def error_test(error):
    """Serves requested error page for testing"""
    abort(error)


# STATIC ROUTES
@reports.route('/assets/<path:filepath>/')
def serve_static(filepath):
    """Serves static assets (js, css, img etc)"""
    return send_file(filepath)


# UTILITY ROUTES
@reports.errorhandler(404)
def error404(error):
    """Serves page for Error 404"""
    error.body += ". We’ve misplaced that page or it doesn’t exist."
    return render_template('reports/error.html', error=error), 404


# @reports.errorhandler(500)
@reports.errorhandler(501)
@reports.errorhandler(418)
def error500(error):
    """Serves page for generic error"""
    return render_template('reports/error.html', error=error), error


# FILTERS
@reports.app_template_filter('datetime')
def format_datetime(value, format='%H:%M %d-%m-%Y'):
    """Returns formatted timestamp"""
    return value.strftime(format)


@reports.app_template_filter('datetime_from_json')
def datetime_from_json(value):
    """Returns Python datetime object from JSON timestamp in ISO8601 format"""
    return dateutil.parser.parse(value)


@reports.app_template_filter('commas')
def format_thousands(value):
    """Adds thousands separator to values"""
    return "{:,}".format(int(value))


# FUNCTIONS
def list_reports(region,
                 start=date(1970, 1, 1),
                 end=datetime.today()):
    """Returns a list of reports"""


def create_report(config, report=None, location=None, year=None, week=None):
    """Dynamically creates report"""
    
    try:
        report_list = config['REPORT_LIST']
        if not location:
            location = report_list['default_location']
        if week or year:
            if week:
                end_date = c.epi_week_to_date(week, year)
            else:
                end_date = c.epi_week_to_date(1, year)
            api_request = '/reports/{report}/{loc}/{end}'.format(
                report=report_list['reports'][report]['api_name'],
                loc=location,
                end=end_date.strftime('%Y-%m-%d')
            )
        else:
            # Return most recent epiweek
            api_request = '/reports/{report}/{loc}/{end}'.format(
                report=report_list['reports'][report]['api_name'],
                loc=location,
                end=c.epi_week_to_date(
                    c.date_to_epi_week() - 1
                ).strftime('%Y-%m-%d')
            )

        data = c.api(api_request, api_key=True)
        data["flag"] = config["FLAGG_ABR"]
        if report in ['public_health', 'cd_public_health', "ncd_public_health"]:
            # Extra parsing for natural language bullet points
            extras = {"patient_status": {}}
            for item in data['data']['patient_status']:
                title = item['title'].lower().replace(" ", "")
                if title not in ["refugee", "other"]:
                    title = "national"
                extras["patient_status"][title] = {
                    'percent': item['percent'],
                    'quantity': item['quantity']
                }
            extras['map_centre'] = report_list['reports'][report]["map_centre"]
            extras["map_api_call"] = (config['EXTERNAL_API_ROOT'] +
                                 "/clinics/1")
        elif report in ["refugee_public_health"]:
            extras = {}
            extras['map_centre'] = report_list['reports'][report]["map_centre"]
            extras["map_api_call"] = (config['EXTERNAL_API_ROOT'] +
                                 "/clinics/1/Refugee")

        else:
            extras = None
        # Render correct template for the report

        return {
            'template':report_list['reports'][report]['template'],
            'report':data,
            'extras':extras,
            'address':report_list["address"]
            }
    except Exception as e:
        return 'Error while creating report: ' + e
