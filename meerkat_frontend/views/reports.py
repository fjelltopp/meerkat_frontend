"""
reports.py

A Flask Blueprint module for reports.
"""
from flask import Blueprint, render_template, abort, redirect, url_for, request, send_file, current_app, Response
from flask.ext.babel import format_datetime, gettext
from datetime import datetime, date, timedelta
try:
    import simplejson as json
except ImportError:
    import json
import dateutil.parser
import requests
from .. import common as c
import string
import pdfcrowd

reports = Blueprint('reports', __name__, url_prefix='/<language>')

@reports.before_request
def requires_auth():
    """Checks that the user has authenticated before returning any page from the technical site."""
    current_app.logger.warning('url: ' + request.base_url )
    if "/email/" not in request.base_url: 
        auth = request.authorization
        if not auth or not c.check_auth(auth.username, auth.password):
            return c.authenticate()


# NORMAL ROUTES
@reports.route('/')
@reports.route('/loc_<int:locID>')
def index(locID=1):
    """Render the reports splash page (index.html).
       The reports splash page provides a form enabling user to select which report to view.

       Args:
           locID (int): The location ID of a location to be automatically loaded into the 
               location selector. 
    """

    return render_template('reports/index.html',
                           content=current_app.config['REPORTS_CONFIG'],
                           loc=locID,
                           week=c.api('/epi_week'))
    

@reports.route('/test/<report>/')
def test(report):
    """Serves a test report page using a static JSON file.
        
       Args:
           report (str): The report ID, from the REPORTS_LIST configuration file parameter.
    """

    report_list = current_app.config["REPORTS_CONFIG"]['report_list']

    if report in report_list:
        try:
            with open(report_list[report]['test_json_payload'])as json_blob:
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
            extras['map_centre'] = report_list[report]["map_centre"]
            extras["map_api_call"] = (current_app.config['EXTERNAL_API_ROOT'] +
                                 "/clinics/1")
        elif report in ["refugee_public_health"]:
            extras = {}
            extras['map_centre'] = report_list[report]["map_centre"]
            extras["map_api_call"] = (current_app.config['EXTERNAL_API_ROOT'] +
                                 "/clinics/1/Refugee")
        elif report in ["pip"]:
            extras = {}
            extras['map_centre'] = report_list[report]["map_centre"]
            extras["map_api_call"] = (current_app.config['EXTERNAL_API_ROOT'] +
                                 "/clinics/1/SARI")
        elif report in ["malaria"]:
            extras = {}
            extras["map_api_call"] = (current_app.config['EXTERNAL_API_ROOT'] +
                                 "/map/epi_1/1")
            extras['map_centre'] = report_list[report]["map_centre"]           
        else:
            extras = None

        return render_template(
            report_list[report]['template'],
            report=data,
            extras=extras,
            address=current_app.config['REPORTS_CONFIG']["address"],
            content=current_app.config['REPORTS_CONFIG']
        )
    else:
        abort(501)

@reports.route('/view_email/<report>/')
@reports.route('/view_email/<report>/<location>/')
@reports.route('/view_email/<report>/<location>/<end_date>/')
@reports.route('/view_email/<report>/<location>/<end_date>/<start_date>/')
@reports.route('/view_email/<report>/<location>/<end_date>/<start_date>/<email_format>')
def view_email_report(report, location=None, end_date=None, start_date=None, email_format = 'html'):
    """Views and email as it would be sent to Hermes API

        Args:
            report (str): The report ID, from the REPORTS_LIST configuration file parameter.
    """

    report_list = current_app.config['REPORTS_CONFIG']['report_list']
    country = current_app.config['MESSAGING_CONFIG']['messages']['country']

    if report in report_list:

        ret = create_report(
            config=current_app.config, 
            report=report, 
            location=location, 
            end_date=end_date, 
            start_date=start_date
        )

        relative_url = url_for('.report',
                                report=report,
                                location=None,
                                end_date=None, 
                                start_date=None)
        report_url = ''.join([current_app.config['ROOT_URL'], relative_url])

        #Use env variable to determine whether to fetch image content from external source or not
        if int(current_app.config['PDFCROWD_USE_EXTERNAL_STATIC_FILES'])==1: 
            content_url = current_app.config['PDFCROWD_STATIC_FILE_URL']
        else:    
            content_url = current_app.config['ROOT_URL']  + '/static/'
            

        if email_format == 'html':
            email_body = render_template(
                ret['template_email_html'],
                report=ret['report'],
                extras=ret['extras'],
                address=ret['address'],
                content=current_app.config['REPORTS_CONFIG'],
                report_url=report_url,
                content_url=content_url
            )
        elif email_format == 'txt':
            email_body = render_template(
                ret['template_email_plain'],
                report=ret['report'],
                extras=ret['extras'],
                address=ret['address'],
                content=current_app.config['REPORTS_CONFIG'],
                report_url=report_url,
                content_url=content_url
            )
        else:
            abort(501)

        return email_body

    else:
        abort(501)

@reports.route('/email/<report>/', methods=['POST'])
@reports.route('/email/<report>/<location>/', methods=['POST'])
@reports.route('/email/<report>/<location>/<end_date>/', methods=['POST'])
@reports.route('/email/<report>/<location>/<end_date>/<start_date>/', methods=['POST'])
@reports.route('/email/<report>/<location>/<end_date>/<start_date>/<email_format>', methods=['POST'])
def send_email_report(report, location=None, end_date=None, start_date=None):
    """Sends an email via Hermes with the latest report.

       Args:
           report (str): The report ID, from the REPORTS_LIST configuration file parameter.
    """
    current_app.logger.warning( str(request.data.decode('UTF-8')))
    #Authorise the request.
    key = json.loads(request.data.decode('UTF-8')).get('key', "")
    if not (key == current_app.config["MAILING_KEY"] or current_app.config["MAILING_KEY"] == ""):
        current_app.logger.warning("Unauthorized address trying to use API: {}".format(request.remote_addr) + 
                           "\nwith api key: " + key)
        abort(401)

    report_list = current_app.config['REPORTS_CONFIG']['report_list']
    country = current_app.config['MESSAGING_CONFIG']['messages']['country']

    if report in report_list:

        ret = create_report(
            config=current_app.config, 
            report=report, 
            location=location, 
            end_date=end_date, 
            start_date=start_date
        )

        relative_url = url_for('.report',
                                report=report,
                                location=location,
                                end_date=end_date, 
                                start_date=start_date)

        report_url = ''.join([current_app.config['ROOT_URL'], relative_url])

        #Use env variable to determine whether to fetch image content from external source or not
        #Use env variable to determine whether to fetch image content from external source or not
        if int(current_app.config['PDFCROWD_USE_EXTERNAL_STATIC_FILES'])==1: 
            content_url = current_app.config['PDFCROWD_STATIC_FILE_URL']
        else:    
            content_url = current_app.config['ROOT_URL']  + '/static/'

        html_email_body = render_template(
                ret['template_email_html'],
                report=ret['report'],
                extras=ret['extras'],
                address=ret['address'],
                content=current_app.config['REPORTS_CONFIG'],
                report_url=report_url,
                content_url=content_url
        )
        plain_email_body = render_template(
                ret['template_email_plain'],
                report=ret['report'],
                extras=ret['extras'],
                address=ret['address'],
                content=current_app.config['REPORTS_CONFIG'],
                report_url=report_url,
                content_url=content_url
        )
        
        epi_week = ret['report']['data']['epi_week_num']
        start_date = datetime_from_json(ret['report']['data']['start_date'])
        end_date = datetime_from_json(ret['report']['data']['end_date'])

        title = gettext(report_list[report]['title'])

        subject = '{country} | {title} {epi_week_text} {epi_week} ({start_date} - {end_date})'.format(
            country = gettext(country),
            title = gettext(report_list[report]['title']),
            epi_week_text = gettext('Epi Week'),
            epi_week = epi_week,
            start_date = format_datetime(start_date, 'dd MMMM YYYY'),
            end_date = format_datetime(end_date, 'dd MMMM YYYY')
        )
        #topic = current_app.config['MESSAGING_CONFIG']['subscribe']['topic_prefix'] + report;
        topic = 'test-emails'

        #Assemble the message data in a manner hermes will understand.
        message = {
            "id": topic + "-" + str(epi_week) + "-" + end_date.strftime('%Y') + report,
            "topics": topic,
            "html-message": html_email_body,
            "message": plain_email_body,
            "subject": subject,
            "from": current_app.config['MESSAGING_CONFIG']['messages']['from']
        }

        #Publish the message to hermes
        r = c.hermes( '/publish', 'PUT', message )

        print(r)
        succ=0
        fail=0

        for resp in r:
            try:
                resp['ResponseMetadata']['HTTPStatusCode']
            except KeyError:
                current_app.logger.warning( "Hermes return value error:" + str(resp['message']) ) 
                fail += 1
            except TypeError:
                current_app.logger.warning( "Hermes job error:" + str(r['message']) )
                abort(502)
            else:
                if resp['ResponseMetadata']['HTTPStatusCode'] == 200:
                    succ =+ 1
                else:
                    current_app.logger.warning( "Hermes error while sending message:" + str(resp['message']) ) 
                    fail += 1

        return '\nSending {succ} messages succeeded, {fail} messages failed\n\n'.format(succ=succ, fail=fail)
                
    else:
        current_app.logger.warning( "Aborting. Report doesn't exist." ) 
        abort(501)


@reports.route('/<report>/')
@reports.route('/<report>/<location>/')
@reports.route('/<report>/<location>/<end_date>/')
@reports.route('/<report>/<location>/<end_date>/<start_date>/')
def report(report=None, location=None, end_date=None, start_date=None):
    """Serves dynamic report for a location and date.
   
       Args:
           report (str): The report ID, from the REPORTS_LIST configuration file parameter.
           location (int): The location ID for the location used to filter the report's data.
           end_date (str): The end_data used to filter the report's data, in ISO format.
           start_date (str): The start_date used to filter the report's data, in ISO format.
        
    """
    # Check that the requested project and report are valid
    report_list = current_app.config['REPORTS_CONFIG']['report_list']

    if report in report_list:

        ret = create_report(
            config=current_app.config, 
            report=report, 
            location=location, 
            end_date=end_date, 
            start_date=start_date
        )

        return render_template(
            ret['template'],
            report=ret['report'],
            extras=ret['extras'],
            address=ret['address'],
            content=current_app.config['REPORTS_CONFIG']
        )

    else:
        abort(501)

@reports.route('/<report>.pdf')
@reports.route('/<report>~<location>.pdf')
@reports.route('/<report>~<location>~<end_date>.pdf')
@reports.route('/<report>~<location>~<end_date>~<start_date>.pdf')
def pdf_report(report=None, location=None, end_date=None, start_date=None):
    """Serves a PDF report, by printing the HTML report (with @media print CSS) to PDF using PDF crowd.
       Tildes are used because underscores are already used in the report ID and hyphens in the ISO dates.

       Args:
           report (str): The report ID, from the REPORTS_LIST configuration file parameter.\n
           location (int): The location ID for the location used to filter the report's data.\n
           end_date (str): The end_data used to filter the report's data, in ISO format.\n
           start_date (str): The start_date used to filter the report's data, in ISO format.
    """
    report_list = current_app.config['REPORTS_CONFIG']['report_list']
    client = pdfcrowd.Client(
        current_app.config['PDFCROWD_API_ACCOUNT'],
        current_app.config['PDFCROWD_API_KEY'])
    current_app.logger.warning('Report: ' + report )
    if report in report_list:
        ret = create_report(
            config=current_app.config, 
            report=report, 
            location=location, 
            end_date=end_date, 
            start_date=start_date
        )

        html = render_template(
            ret['template'],
            report=ret['report'],
            extras=ret['extras'],
            address=ret['address'],
            content=current_app.config['REPORTS_CONFIG']
            )
        # Read env flag whether to tell pdfcrowd to read static files from an external source
        if int(current_app.config['PDFCROWD_USE_EXTERNAL_STATIC_FILES'])==1: 
            html=html.replace("/static/", current_app.config['PDFCROWD_STATIC_FILE_URL'])
        else:
            html=html.replace("/static/", '{}{}'.format(
                current_app.config['ROOT_URL'],
                '/static/'))

        client.usePrintMedia(True)
				#Allow reports to be set as portrait or landscape in the config files.
        if( report_list[report].get( 'landscape', False ) ):
            client.setPageWidth('1697pt')
            client.setPageHeight('1200pt')
        else:
            client.setPageWidth('1200pt')
            client.setPageHeight('1697pt')

        client.setPageMargins('90pt','60pt','90pt','60pt')
        client.setHtmlZoom(400)
        client.setPdfScalingFactor(1.5)

        pdf = client.convertHtml(html)
        return Response(pdf, mimetype='application/pdf')

    else:
        abort(501)


# STATIC ROUTES
# @reports.route('/assets/<path:filepath>/')
# def serve_static(filepath):
#     """Serves static assets (js, css, img etc).

#        Args:
#            filepath (str): The file path of the desired asset. 
#     """
#     return send_file(filepath)


# FILTERS
@reports.app_template_filter('datetime')
def format_datetime_with_lang(value, format='%H:%M %d-%m-%Y'):
    """Returns formatted timestamp.
    
       Args:
           value (date): the date to be converted to a string.
           format (optional str): the format of the new string. Defaults to '%H:%M %d-%m-%Y'. 

       Returns:
           The formatted timestamp string.
    """
    return format_datetime(value, format)



@reports.app_template_filter('datetime_from_json')
def datetime_from_json(value):
    """Returns Python datetime object from JSON timestamp in ISO8601 format."""
    return dateutil.parser.parse(value)


@reports.app_template_filter('commas')
def format_thousands(value):
    """Adds thousands separator to value."""
    return "{:,}".format(int(value))


# FUNCTIONS
def list_reports(region,
                 start=date(1970, 1, 1),
                 end=datetime.today()):
    """Returns a list of reports"""


def create_report(config, report=None, location=None, end_date=None, start_date=None):
    """Dynamically creates report, that can then be served either in HTML or PDF format.

       Args:
           config (dict): The current app config object. 
           report (str): The report ID, from the REPORTS_LIST configuration file parameter.
           location (int): The location ID for the location used to filter the report's data.
           end_date (str): The end_data used to filter the report's data, in ISO format.
           start_date (str): The start_date used to filter the report's data, in ISO format.

       Returns:
           dict: The report details
           ::
               {
                   'template' (str): the template file specified in the REPORTS_LIST config property,
                   'report' (dict): the data collected form the Meerkat API,
                   'extras' (dict): any extra data calulated from API data needed to create the report,
                   'address' (str): the contact address to be printed in the report
               }
    """

    #try:
    report_list = current_app.config['REPORTS_CONFIG']['report_list']

    if not location:
        location = current_app.config['REPORTS_CONFIG']['default_location']

    api_request = '/reports'
    api_request += '/' + report_list[report]['api_name'] 
    if( location != None ): api_request += '/' + str(location)
    if start_date is None and end_date is None:
        if "default_period" in report_list[report].keys():
            period = report_list[report]["default_period"]

            today = datetime.today()
            if period == "week":
                epi_week = c.api('/epi_week')
                offset = today.weekday() + 1 + (7 - epi_week["offset"])
                start_date = datetime(today.year, today.month, today.day) - timedelta(days=offset + 6)
                end_date = datetime(today.year, today.month, today.day) - timedelta(days=offset)
            elif period == "month":
                start_date = datetime(today.year, today.month - 1, 1)
                end_date = datetime(today.year, today.month, 1) - timedelta(days=1)
            elif period == "year":
                start_date = datetime(today.year, 1, 1)
                end_date = datetime(today.year, today.month, today.day)
            if start_date and end_date:
                start_date = start_date.isoformat()
                end_date = end_date.isoformat() # To include the the end date
    if( end_date != None ): api_request += '/' + end_date
    if( start_date != None ): api_request += '/' + start_date

    data = c.api(api_request, api_key=True)
    
    data["flag"] = config["FLAGG_ABR"]

    if report in ['public_health', 'cd_public_health', "ncd_public_health", "cerf"]:
        # Extra parsing for natural language bullet points
        extras = {"patient_status": {}}
        extras["patient_status"]["national"] = {
                'percent': 0,
                'quantity': 0
            }
        extras["patient_status"]["refugee"] = {
                'percent': 0,
                'quantity': 0
            }

        for item in data['data']['patient_status']:
            title = item['title'].lower().replace(" ", "")
            if title not in ["refugee", "other"]:
                title = "national"
            extras["patient_status"][title] = {
                'percent': item['percent'],
                'quantity': item['quantity']
            }

        extras['map_centre'] = report_list[report]["map_centre"]
        extras["map_api_call"] = (config['EXTERNAL_API_ROOT'] +
                             "/clinics/1")
        extras['static_map_url'] = '{}{}/{},{},{}/1000x1000.png?access_token={}'.format(
                            current_app.config['MAPBOX_STATIC_MAP_API_URL'],
                            current_app.config['MAPBOX_MAP_ID'],
                            extras['map_centre'][1],
                            extras['map_centre'][0],
                            extras['map_centre'][2],
                            current_app.config['MAPBOX_API_ACCESS_TOKEN'])

    elif report in ["refugee_public_health"]:
        extras = {}
        extras['map_centre'] = report_list[report]["map_centre"]
        extras["map_api_call"] = (config['EXTERNAL_API_ROOT'] +
                             "/clinics/1/Refugee")
        extras['static_map_url'] = '{}{}/{},{},{}/1000x1000.png?access_token={}'.format(
                current_app.config['MAPBOX_STATIC_MAP_API_URL'],
                current_app.config['MAPBOX_MAP_ID'],
                extras['map_centre'][1],
                extras['map_centre'][0],
                extras['map_centre'][2],
                current_app.config['MAPBOX_API_ACCESS_TOKEN'])
    elif report in ["pip"]:
        extras = {}
        extras['map_centre'] = report_list[report]["map_centre"]
        extras["map_api_call"] = (current_app.config['EXTERNAL_API_ROOT'] +
                                  "/clinics/1/SARI")
        extras['static_map_url'] = '{}{}/{},{},{}/1000x1000.png?access_token={}'.format(
            current_app.config['MAPBOX_STATIC_MAP_API_URL'],
            current_app.config['MAPBOX_MAP_ID'],
            extras['map_centre'][1],
            extras['map_centre'][0],
            extras['map_centre'][2],
            current_app.config['MAPBOX_API_ACCESS_TOKEN'])
    elif report in ['malaria']:
        extras = {} 
        extras['map_centre'] = report_list[report]['map_centre']
        extras["map_api_call"] = (
            current_app.config['EXTERNAL_API_ROOT'] + "/map/{}/{}/{}/{}".format(
               data['map_variable'],
               data['data']['project_region_id'],
               data['data']['end_date'],
               data['data']['start_date']
            )            
        )
        extras['static_map_url'] = '{}{}/{},{},{}/1000x1000.png?access_token={}'.format(
            current_app.config['MAPBOX_STATIC_MAP_API_URL'],
            current_app.config['MAPBOX_MAP_ID'],
            extras['map_centre'][1],
            extras['map_centre'][0],
            extras['map_centre'][2],
            current_app.config['MAPBOX_API_ACCESS_TOKEN'])

    else:
        extras = None

    # Render correct template for the report
    return {
        'template':report_list[report]['template'],
        'template_email_html':report_list[report].get('template_email_html', None),
        'template_email_plain':report_list[report].get('template_email_plain', None),
        'report':data,
        'extras':extras,
        'address':current_app.config["REPORTS_CONFIG"]["address"]
        }


