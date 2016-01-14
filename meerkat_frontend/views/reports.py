"""
reports.py

A Flask Blueprint module for reports.
"""
from flask import Blueprint, render_template, abort, redirect, url_for, request, send_file, current_app
from datetime import datetime, date
try:
    import simplejson as json
except ImportError:
    import json
import dateutil.parser
import requests
from .. import common as c

reports = Blueprint('reports', __name__)


# NORMAL ROUTES
@reports.route('/')
@reports.route('/loc_<int:locID>')
def index(locID=1):
    return render_template('reports/index.html',
                           content=current_app.config['REPORTS_CONFIG'],
                           loc=locID,
                           week=c.api('/epi_week', 'jordan' ))

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

        if report == 'public_health':
            # Extra parsing for natural language bullet points
            extras = {
                'patient_status': {
                    item['title'].lower().replace(" ", ""):
                        {
                            'percent': item['percent'],
                            'quantity': item['quantity']
                        } for item in data['data']['patient_status']
                },
                'map_centre': report_list['reports'][report]["map_centre"],
                'map_api_call': (current_app.config['HOMEPAGE_API_ROOT'] +
                                 "/clinics/1") # set to browser api root
                }
        else:
            extras = None
        return render_template(
            report_list['reports'][report]['template'],
            report=data,
            extras=extras
        )
    else:
        abort(501)


@reports.route('/email/<report>/', methods=['POST'])
def send_email_report(report):
    """Sends an email via Mailchimp with the latest report"""
    report_list = current_app.config['REPORT_LIST']
    # Hacky hard-coded value to add some semblance of access control...
    if 'apikey' not in request.json or request.json['apikey'] \
       != 'simbasucksass':
        abort(401)
    if report in report_list['reports']:
        location = report_list['default_location']
        end = c.epi_week_to_date(c.date_to_epi_week() - 1)
        api_request = '/reports/{report}/{loc}/{end}'.format(
            report=report_list['reports'][report]['api_name'],
            loc=location,
            end=end.strftime('%Y-%m-%d')
            )
        data = c.api(api_request)
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
            'MOH Jordan | Public Health Profile Epi Week {} ({})'
            .format(epi_week, epi_date)
        )

        # Send email as Mailchimp campaign
        # First create the campaign
        endpoint = report_list['api_endpoints']['mailchimp_campaign']
        message = {
            "apikey": report_list['keys']['mailchimp'],
            "type": "regular",
            "options": {
                "list_id":
                    report_list['reports'][report]['mailchimp_list_id'],
                "subject": subject,
                "from_email":
                    report_list['reports'][report]['email_from_address'],
                "from_name":
                    report_list['reports'][report]['email_from_name'],
                "folder_id":
                    report_list['reports'][report]['mailchimp_dir_id'],
                "authenticate": True,
                "auto_footer": True,
                "inline_css": True
            },
            "content": {
                "html": html_email_body,
                "text": plain_email_body
            }
            }
        try:
            result = requests.post(
                ''.join([endpoint, 'create.json']),
                json=message
            )
        except requests.exceptions.RequestException:
            abort(500)
        # If we've successfully created the campaign, let's now Send it.
        if result.status_code == 200:
            try:
                campaign = result.json()
            except ValueError:
                abort(500)
            send = {
                "apikey": report_list['keys']['mailchimp'],
                "cid": campaign['id']
                }
            try:
                result = requests.post(
                    ''.join([endpoint, 'send.json']),
                    json=send
                )
                pass
            except requests.exceptions.RequestException:
                abort(500)
        else:
            abort(500)
        return 'OK'
    else:
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

        data = c.api(api_request)
        if report == 'public_health':
            # Extra parsing for natural language bullet points
            extras = {
                'patient_status': {
                    item['title'].lower().replace(" ", ""):
                        {
                            'percent': item['percent'],
                            'quantity': item['quantity']
                        } for item in data['data']['patient_status']
                },
                'map_centre': report_list['reports'][report]["map_centre"],
                'map_api_call': (current_app.config['HOMEPAGE_API_ROOT'] +
                                 "/clinics/{}".format(location)) # set to browser api root
                
            }
        else:
            extras = None
        # Render correct template for the report
        return render_template(
            report_list['reports'][report]['template'],
            report=data,
            extras=extras
        )

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
