"""
reports.py

A Flask Blueprint module for reports.
"""
from flask import Blueprint, render_template, abort, g
from flask import url_for, current_app, Response, request
from flask.ext.babel import format_datetime, gettext
from datetime import datetime, date, timedelta
from meerkat_frontend import app
from meerkat_frontend import auth
from meerkat_frontend import common as c
import dateutil.parser
import dateutil.relativedelta
import pdfcrowd
import json
import os
import shutil
from zipfile import ZipFile
import uuid
import requests
from bs4 import BeautifulSoup
reports = Blueprint('reports', __name__, url_prefix='/<language>')


@reports.before_request
def requires_auth():
    """
    Checks that the user has authenticated before returning any page from this
    Blueprint.
    """
    # We load the arguments for check_auth function from the config files.
    auth.check_auth(
        *current_app.config['AUTH'].get('reports', [['BROKEN'], ['']])
    )


# NORMAL ROUTES
@reports.route('/')
@reports.route('/loc_<int:locID>')
def index(locID=1):
    """
    Render the reports splash page (index.html).
    The reports splash page provides a form enabling user to select which
    report to view.

    Args:
        locID (int): The location ID of a location to be automatically loaded
            into the location selector.
    """

    return render_template('reports/index.html',
                           content=current_app.config['REPORTS_CONFIG'],
                           loc=locID,
                           week=c.api('/epi_week'))


@reports.route('/test/<report>/')
def test(report):
    """Serves a test report page using a static JSON file.

       Args:
           report (str): The report ID, from the REPORTS_LIST configuration
           file parameter.
    """

    report_list = current_app.config["REPORTS_CONFIG"]['report_list']

    if report in report_list:
        try:
            with open(report_list[report]['test_json_payload'])as json_blob:
                data = json.load(json_blob)
        except IOError as e:
            current_app.logger.warning("IOError: " + str(e))
            abort(500)
        except json.JSONDecodeError as e:
            current_app.logger.warning("JSONDecodeError: " + str(e))
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
            extras["map_api_call"] = (
                current_app.config['EXTERNAL_API_ROOT'] + "/clinics/1"
            )
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
    """
    Views and email as it would be sent to Hermes API

    Args: report (str): The report ID, from the REPORTS_LIST configuration
        file parameter.
    """
    print("viewing email")

    report_list = current_app.config['REPORTS_CONFIG']['report_list']
    country = current_app.config['MESSAGING_CONFIG']['messages']['country']

    if validate_report_arguments(current_app.config, report, location, end_date, start_date):

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
        report_url = c.add_domain(relative_url)


        #Use env variable to determine whether to fetch image content from external source or not
        if int(current_app.config['PDFCROWD_USE_EXTERNAL_STATIC_FILES'])==1:
            content_url = current_app.config['PDFCROWD_STATIC_FILE_URL']
        else:
            content_url = c.add_domain('/static/')


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

        if report_list[report]['default_period'] == 'month':
            topic = current_app.config['MESSAGING_CONFIG']['subscribe']['topic_prefix'] + report
            start_date = datetime_from_json(ret['report']['data']['start_date'])
            end_date = datetime_from_json(ret['report']['data']['end_date'])
            subject = '{country} | {monthly_email_title} ({start_date} - {end_date})'.format(
                country = gettext(country),
                monthly_email_title = gettext(report_list[report]['monthly_email_title']),
                start_date = format_datetime(start_date, 'dd MMMM YYYY'),
                end_date = format_datetime(end_date, 'dd MMMM YYYY')
            )

            email_id = ( "<topic>" + "-" + end_date.strftime('%b') + "-" +
                         end_date.strftime('%Y') +"-" + report )

        else:
            start_date = datetime_from_json(ret['report']['data']['start_date'])
            end_date = datetime_from_json(ret['report']['data']['end_date'])
            epi_week = ret['report']['data']['epi_week_num']
            subject = '{country} | {title} {epi_week_text} {epi_week} ({start_date} - {end_date})'.format(
                country = gettext(country),
                title = gettext(report_list[report]['title']),
                epi_week_text = gettext('Epi Week'),
                epi_week = epi_week,
                start_date = format_datetime(start_date, 'dd MMMM YYYY'),
                end_date = format_datetime(end_date, 'dd MMMM YYYY')
            )

            email_id = ( "<topic>" + "-" + str(epi_week) + "-" +
                         end_date.strftime('%Y') +"-" + report )

        current_app.logger.debug('Viewing email with id: ' + email_id)
        current_app.logger.debug('Email subject:  ' + subject)

        return email_body

    else:
        abort(501)


# Need to handle authentication to this url seperately to the rest of the reports system
@app.route('/reports/email/<report>/', methods=['POST'])
@app.route('/reports/email/<report>/<location>/', methods=['POST'])
@app.route('/reports/email/<report>/<location>/<end_date>/', methods=['POST'])
@app.route('/reports/email/<report>/<location>/<end_date>/<start_date>/', methods=['POST'])
@app.route('/reports/email/<report>/<location>/<end_date>/<start_date>/<email_format>', methods=['POST'])
@auth.authorise(*app.config['AUTH'].get('report_emails', [['BROKEN'], ['']]))
def send_email_report(report, location=None, end_date=None, start_date=None):
    """Sends an email via Hermes with the latest report.

       Args:
           report (str): The report ID, from the REPORTS_LIST configuration
                file parameter.
    """

    report_list = current_app.config['REPORTS_CONFIG']['report_list']
    country = current_app.config['MESSAGING_CONFIG']['messages']['country']

    # TESTING
    # If the report requested begins with "test_" then send to the test topic.
    # E.g. test_communicable_diseases would send cd report to "test-emails".
    if report.startswith("test_"):
        topic = "test-emails"
        test_id = "-" + str(datetime.now().time().isoformat())
        report = report[5:]
    else:
        topic = current_app.config['MESSAGING_CONFIG']['subscribe']['topic_prefix'] + report;
        test_id = ""

    if validate_report_arguments(current_app.config, report, location, end_date, start_date):

        ret = create_report(
            config=current_app.config,
            report=report,
            location=location,
            end_date=end_date,
            start_date=start_date
        )

        relative_url = url_for( 'reports.report',
                                report=report,
                                location=location,
                                end_date=end_date,
                                start_date=start_date )

        report_url = c.add_domain(relative_url)

        #Use env variable to determine whether to fetch image content from external source or not
        if int(current_app.config['PDFCROWD_USE_EXTERNAL_STATIC_FILES'])==1:
            content_url = current_app.config['PDFCROWD_STATIC_FILE_URL']
        else:
            content_url = c.add_domain('/static/')

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

        if report_list[report]['default_period'] == 'month':
            subject = '{country} | {title} ({start_date} - {end_date})'.format(
                country = gettext(country),
                title = gettext(report_list[report]['monthly_email_title']),
                start_date = format_datetime(start_date, 'dd MMMM YYYY'),
                end_date = format_datetime(end_date, 'dd MMMM YYYY')
            )
            email_id = ( topic + "-" + end_date.strftime('%m') + "-" +
                         end_date.strftime('%Y') +"-" + report + test_id )
        else:
            subject = '{country} | {title} {epi_week_text} {epi_week} ({start_date} - {end_date})'.format(
                country = gettext(country),
                title = gettext(report_list[report]['title']),
                epi_week_text = gettext('Epi Week'),
                epi_week = epi_week,
                start_date = format_datetime(start_date, 'dd MMMM YYYY'),
                end_date = format_datetime(end_date, 'dd MMMM YYYY')
            )
            email_id = (topic + "-" + str(epi_week) + "-" +
                         end_date.strftime('%Y') + "-" + report + test_id)

        #Assemble the message data in a manner hermes will understand.
        message = {
            "id": email_id,
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
        current_app.logger.warning( "Aborting. Report doesn't exist: " + str(report)  )
        abort(501)


@reports.route('/<report>/')
@reports.route('/<report>/<location>/')
@reports.route('/<report>/<location>/<end_date>/')
@reports.route('/<report>/<location>/<end_date>/<start_date>/')
def report(report=None, location=None, end_date=None, start_date=None):
    """
        Serves dynamic report for a location and date.

        Args:
            report (str): The report ID, from the REPORTS_LIST configuration
                file parameter.
           location (int): The location ID for the location used to filter the
                report's data.
           end_date (str): The end_data used to filter the report's data, in
                ISO format.
           start_date (str): The start_date used to filter the report's data,
                in ISO format.
    """
    # Check that the requested project and report are valid
    report_list = current_app.config['REPORTS_CONFIG']['report_list']

    if validate_report_arguments(current_app.config, report,
                                 location, end_date, start_date):

        ret = create_report(
            config=current_app.config,
            report=report,
            location=location,
            end_date=end_date,
            start_date=start_date
        )

        ret['report']['report_id'] = report

        html = render_template(
            ret['template'],
            report=ret['report'],
            extras=ret['extras'],
            address=ret['address'],
            content=current_app.config['REPORTS_CONFIG']
        )

        return html

    else:
        abort(501)


@reports.route('/<report>.pdf')
@reports.route('/<report>~<location>.pdf')
@reports.route('/<report>~<location>~<end_date>.pdf')
@reports.route('/<report>~<location>~<end_date>~<start_date>.pdf')
def pdf_report(report=None, location=None, end_date=None, start_date=None):
    """
    Serves a PDF report, by printing the HTML report (with @media print CSS) to
    PDF using PDF crowd. Tildes are used because underscores are already used
    in the report ID and hyphens in the ISO dates.

    Args: report (str): The report ID, from the REPORTS_LIST configuration
        file parameter.\n location (int): The location ID for the location used
        to filter the report's data.\n end_date (str): The end_data used to
        filter the report's data, in ISO format.\n start_date (str): The
        start_date used to filter the report's data, in ISO format.
    """
    report_list = current_app.config['REPORTS_CONFIG']['report_list']
    client = pdfcrowd.Client(
        current_app.config['PDFCROWD_API_ACCOUNT'],
        current_app.config['PDFCROWD_API_KEY']
    )
    current_app.logger.warning('Report: ' + report)

    if validate_report_arguments(current_app.config, report,
                                 location, end_date, start_date):
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

        # We want to find all the static assets in html
        # Then we want to combine all these assets into
        # a zip file that we can send to docraptor

        soup = BeautifulSoup(html, 'html.parser')
        files = {}
        # Go through the different types of static assets
        for img in soup.find_all("img"):
            src = img.get("src")
            if "s3_files" in src:
                if src.split("?path=")[-1]:
                    files[src] = "/" + src.split("?path=")[-1]
            else:
                files[src] = src
        for link in soup.find_all("link"):
            href = link.get("href")
            files[href] = href
        for script in soup.find_all("script"):
            src = script.get("src")
            if src:
                files[src] = src
        for span in soup.find_all("span"):
            style = span.get("style")
            if style and "url(" in style:
                img = style.split("url(")[-1].split(")")[0]
                files[img] = img

        tmp_folder = str(uuid.uuid4())
        os.mkdir(tmp_folder)
        os.chdir(tmp_folder)
        # Change paths to work in the zip file
        html = html.replace("/en/s3_files/get?path=", "")
        html = html.replace("/static", "static")
        with open("report.html", "w") as f:
            f.write(html)
        
        current_token = request.cookies
        with ZipFile("report.zip", mode="w") as z:
            z.write("report.html")
            for f in files.keys():
                if "http" not in f:  # Acutally external files
                    url = current_app.config["INTERNAL_ROOT"] + f
                    folder = os.path.dirname(files[f])[1:]
                    if not os.path.exists(folder):
                        os.makedirs(folder)
                    r = requests.get(url, stream=True, cookies=current_token)
                    if r.status_code == 200:
                        with open(files[f][1:], 'wb') as fi:
                            r.raw.decode_content = True
                            shutil.copyfileobj(r.raw, fi)
                    z.write(files[f][1:])

        client.usePrintMedia(True)

        # Allow reports to be set as portrait or landscape in the config files.
        if(report_list[report].get('landscape', False)):
            client.setPageWidth('1697pt')
            client.setPageHeight('1200pt')
        else:
            client.setPageWidth('1200pt')
            client.setPageHeight('1697pt')

        client.setPageMargins('70pt', '40pt', '55pt', '40pt')
        client.setHtmlZoom(400)
        client.setPdfScalingFactor(1.5)

        pdf = client.convertFile("report.zip")

        os.chdir("..")
#        shutil.rmtree(tmp_folder)

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


def validate_report_arguments(config, report,
                              location=None, end_date=None, start_date=None):
    """
    Validates the data type of arguments given to a report. TODO: Add error
    handling to allow API to throw exceptions if e.g. non-existing locations
    are called
    """

    report_list = current_app.config['REPORTS_CONFIG']['report_list']

    # Validate report
    if report:
        if report not in report_list:
            current_app.logger.warning(
                "Report param not valid: " + str(report)
            )
            return False

    # Validate location if given
    if location:
        try:
            int(location)
        except ValueError:
            current_app.logger.warning(
                "Location param not valid: " + str(location)
            )
            return False

    # Validate start date if given
    if start_date:
        try:
            dateutil.parser.parse(start_date)
        except ValueError:
            current_app.logger.warning(
                "Start date param not valid: " + str(start_date)
            )
            return False

    # Validate end date if given
    if end_date:
        try:
            dateutil.parser.parse(end_date)
        except ValueError:
            current_app.logger.warning(
                "End date param not valid: " + str(end_date)
            )
            return False

    # If all checks were successful, return True
    return True


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

    # try:
    report_list = current_app.config['REPORTS_CONFIG']['report_list']
    access = report_list[report].get( 'access', '' )

    # Restrict report access as specified in configs.
    if access and access not in g.payload['acc']:
        auth.check_auth( [access], [current_app.config['SHARED_CONFIG']['auth_country']] )

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
                # Calulation for start date is: month_day - ( week_day-week_offset % 7) - 7
                # The offset is the #days into the current epi week.
                offset = (today.weekday() - epi_week["offset"]) % 7
                # Start date is today minus the offset minus one week.
                start_date = datetime(today.year, today.month, today.day) - timedelta(days=offset + 7)
                # End date is today minus the offset, minus 1 day (because our end date is "inclusive")
                end_date = datetime(today.year, today.month, today.day) - timedelta(days=offset + 1)

            elif period == "month":
                start_date = datetime(today.year, today.month, 1) - dateutil.relativedelta.relativedelta(months=1)
                end_date = datetime(today.year, today.month, 1) - timedelta(days=1)
            elif period == "year":
                start_date = datetime(today.year, 1, 1)
                end_date = datetime(today.year, today.month, today.day)
            if start_date and end_date:
                start_date = start_date.isoformat()
                end_date = end_date.isoformat()  # To include the the end date
    if(end_date is not None):
        api_request += '/' + end_date
    if(start_date is not None):
        api_request += '/' + start_date

    params = None
    if report in ["communicable_diseases"]:
        if "central_review" in config["TECHNICAL_CONFIG"] and config["TECHNICAL_CONFIG"]["central_review"]:
            params = "central_review"
        else:
            params = None

    data = c.api(api_request, api_key=True, params=params)
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
        extras['map_centre'] = report_list[report].get('map_centre', ())
        extras['reg_data'] = c.api("/geo_shapes/region")
    elif report in ['afro', 'plague', 'ctc']:
        extras = {}
        extras['map_centre'] = report_list[report]['map_centre']
        extras['reg_data'] = c.api("/geo_shapes/region")
        extras['dis_data'] = c.api("/geo_shapes/district")
    else:
        extras = None

    # Render correct template for the report
    return {
        'report': data,
        'extras': extras,
        'address': current_app.config["REPORTS_CONFIG"]["address"],
        'template': report_list[report]['template'],
        'template_email_html': report_list[report].get(
            'template_email_html',
            None
        ),
        'template_email_plain': report_list[report].get(
            'template_email_plain',
            None
        )
    }
