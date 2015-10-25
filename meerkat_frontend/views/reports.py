"""
reports.py

A Flask Blueprint module for reports.
"""
from flask import Blueprint, render_template, abort, redirect, url_for, request, send_file
from datetime import datetime
from datetime import date
from datetime import timedelta
try:
    import simplejson as json
except ImportError:
    import json
import os
import dateutil.parser
import requests
from requests.auth import HTTPBasicAuth

reports = Blueprint('reports', __name__)

PATH = os.path.dirname(__file__)

foo = {}
# SETTINGS
foo['site_title'] = 'WHO Public Health Profile'
foo['site_title_short'] = 'WHO Public Health Profile'
foo['base_url'] = '/reports/'
foo['webmaster_email'] = 'webmaster@emro.info'
static_assets_path = PATH+'/assets'
api_base_url = 'http://localhost/api'

# Load reports.json with config of available reportstry:
try:
    with open(''.join([PATH, '/reports.json'])) as report_config:
        projects = json.load(report_config)
except IOError:
    abort(500, "IOError with JSON reports config.")
except json.JSONDecodeError as e:
    abort(500, "Error parsing reports JSON config file: {0}".format(e.msg))


# NORMAL ROUTES
@reports.route('/')
def index():
    redirect(url_for('/reports/jordan/public_health'))


@reports.route('/test/')
def test():
    """Serves a test report page using a static JSON file."""
    try:
        with open(PATH+'/report.json') as report:
            report_json = json.load(report)
    except IOError:
        abort(500, "IOError with test report JSON file.")
    except json.JSONDecodeError as e:
        abort(500, "Error parsing test report JSON file: {0}".format(e.msg))
    report_week = [
        {
            'epi_week_num': 42,
            'epi_week_date': '20150203T2001+0000'
        }
    ]
    return render_template('reports/report_test.html',
                           report=report_json,
                           report_week=report_week)


@reports.route('/ref/')
def ref():
    """Serves a reference report using hard-coded data"""
    return render_template('reports/report_reference.html')


@reports.post('/email/<project:re:[A-Za-z0-9-_]+>/<report:re:[A-Za-z0-9-_]+>/')
def send_email_report(project, report):
    """Sends an email via Mailchimp with the latest report"""
    # Hacky hard-coded value to add some semblance of access control...
    if 'apikey' not in request.json or request.json['apikey'] \
       != 'simbasucksass':
        abort(401)
    if project in projects and report in projects[project]['reports']:
        location = projects[project]['default_location']
        end = epi_week_to_date(date_to_epi_week() - 1)
        api_request = '/reports/{report}/{loc}/{end}'.format(
            report=projects[project]['reports'][report]['api_name'],
            loc=location,
            end=end.strftime('%Y-%m-%d')
            )
        data = api(api_request, project)
        epi_week = data['data']['epi_week_num']
        epi_year = format_datetime(
            datetime_from_json(data['data']['epi_week_date']),
            format='%Y')
        epi_date = format_datetime(
            datetime_from_json(data['data']['epi_week_date']),
            format='%-d %B %Y')
        report_url = url_for('report_permalink',
                             project=project,
                             report=report,
                             location=location,
                             year=epi_year,
                             week=epi_week)
        report_url = ''.join([
            'https://',
            request.get_header('host'),
            report_url])
        # Render!

        # Extra parsing for natural language bullet points in email templates
        patient_status = {
            item['title'].lower().replace(" ", ""):
                {'percent': item['percent'],
                 'quantity': item['quantity']}
                for item in data['data']['patient_status']}
        extras = {
            'patient_status': patient_status
            }

        html_template = env.get_template(
            projects[project]['reports'][report]['template_email_html']
        )
        plain_template = env.get_template(
            projects[project]['reports'][report]['template_email_plain']
        )
        html_email_body = html_template.render(
            email=data,
            extras=extras,
            report_url=report_url
        )
        plain_email_body = plain_template.render(
            email=data,
            extras=extras,
            report_url=report_url
        )
        subject = (
            'WHO Jordan | Public Health Profile Epi Week {} ({})'
            .format(epi_week, epi_date)
        )

        # Send email as Mailchimp campaign
        # First create the campaign
        endpoint = projects[project]['api_endpoints']['mailchimp_campaign']
        message = {
            "apikey": projects[project]['keys']['mailchimp'],
            "type": "regular",
            "options": {
                "list_id":
                    projects[project]['reports'][report]['mailchimp_list_id'],
                "subject": subject,
                "from_email":
                    projects[project]['reports'][report]['email_from_address'],
                "from_name":
                    projects[project]['reports'][report]['email_from_name'],
                "folder_id":
                    projects[project]['reports'][report]['mailchimp_dir_id'],
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
                "apikey": projects[project]['keys']['mailchimp'],
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
        return 200
    else:
        abort(501)


@reports.route('/<project:re:[A-Za-z0-9-_]+>/<report:re:[A-Za-z0-9-_]+>/', name='report')
@reports.route('/<project:re:[A-Za-z0-9-_]+>/<report:re:[A-Za-z0-9-_]+>/<location:re:[A-Za-z0-9-_]+>/')
@reports.route('/<project:re:[A-Za-z0-9-_]+>/<report:re:[A-Za-z0-9-_]+>/<location:re:[A-Za-z0-9-_]+>/<year:int>/')
@reports.route('/<project:re:[A-Za-z0-9-_]+>/<report:re:[A-Za-z0-9-_]+>/<location:re:[A-Za-z0-9-_]+>/<year:int>/<week:int>/', name='report_permalink')
def report(project, report=None, location=None, year=None, week=None):
    """Serves dynamic report for a location and date"""
    # Check that the requested project and report are valid
    if project in projects and report in projects[project]['reports']:
        if not location:
            location = projects[project]['default_location']
        if week or year:
            if week:
                end_date = epi_week_to_date(week, year)
            else:
                end_date = epi_week_to_date(1, year)
            api_request = '/reports/{report}/{loc}/{end}'.format(
                report=projects[project]['reports'][report]['api_name'],
                loc=location,
                end=end_date.strftime('%Y-%m-%d')
                )
        else:
            # Return most recent epiweek
            api_request = '/reports/{report}/{loc}/{end}'.format(
                report=projects[project]['reports'][report]['api_name'],
                loc=location,
                end=epi_week_to_date(date_to_epi_week() - 1).strftime('%Y-%m-%d')
                )
        data = api(api_request, project)
        # Extra parsing for natural language bullet points in email templates
        patient_status = {item['title'].lower().replace(" ", ""): {'percent': item['percent'], 'quantity': item['quantity']} for item in data['data']['patient_status']}
        extras = {
            'patient_status': patient_status
            }
        # Load the correct template for the report
        template = env.get_template(
            projects[project]['reports'][report]['template']
        )
        return template.render(report=data, extras=extras)
    else:
        abort(
            501,
            "Sorry, the {} reports for {} at are not fully implemented yet."
            .format(report, project)
        )


@reports.route('/error/<error:int>/')
def error_test(error):
    """Serves requested error page for testing"""
    abort(error, "This is some test content for an HTTP error page.")


# STATIC ROUTES
@reports.route('/assets/<filepath:path>/')
def serve_static(filepath):
    """Serves static assets (js, css, img etc)"""
    return send_file(filepath)


# UTILITY ROUTES
@reports.errorhandler(404)
def error404(error):
    """Serves page for Error 404"""
    error.body += ". We’ve misplaced that page or it doesn’t exist."
    return render_template('reports/error.html', error=error), 404


@reports.errorhandler(500)
@reports.errorhandler(501)
@reports.errorhandler(418)
def error500(error):
    """Serves page for generic error"""
    return render_template('reports/error.html', error=error), error


# FILTERS
def format_datetime(value, format='%H:%M %d-%m-%Y'):
    """Returns formatted timestamp"""
    return value.strftime(format)

foo.filters['datetime'] = format_datetime


def datetime_from_json(value):
    """Returns Python datetime object from JSON timestamp in ISO8601 format"""
    return dateutil.parser.parse(value)

foo.filters['datetime_from_json'] = datetime_from_json


def format_thousands(value):
    """Adds thousands separator to values"""
    return "{:,}".format(int(value))

foo.filters['commas'] = format_thousands


# FUNCTIONS
def list_reports(region,
                 start=date(1970, 1, 1),
                 end=datetime.today()):
    """Returns a list of reports"""


def api(url, project):
    """Returns JSON data from API request"""
    api_request = ''.join([api_base_url, url])
    try:
        if projects[project]['basic_auth']['use_basic_auth']:
            r = requests.get(
                api_request,
                auth=HTTPBasicAuth(
                    projects[project]['basic_auth']['username'],
                    projects[project]['basic_auth']['password']
                )
            )
        else:
            r = requests.get(api_request)
    except requests.exceptions.RequestException:
        abort(500)
    try:
        output = r.json()
    except Exception:
        abort(500)
    return output


def epi_week_to_date(epi_week, year=datetime.today().year):
    """Converts an epi_week (int) to a datetime object"""
    year_epoch = date(year, 1, 1)
    return year_epoch + timedelta(weeks=epi_week)


def date_to_epi_week(day=datetime.today()):
    """Converts a datetime object to an epi_week (int)"""
    year_epoch = datetime(day.year, 1, 1)
    return (day-year_epoch).days/7+1
