"""
messaging.py

A Flask Blueprint module for Meerkat messaging services.
"""
from flask.ext.babel import gettext
from flask import Blueprint, render_template
from flask import redirect, flash, request, current_app, g
import random
from meerkat_frontend import app, auth
import meerkat_libs as libs
from .. import common as c


messaging = Blueprint('messaging', __name__)


@messaging.route('/')
@messaging.route('/loc_<int:locID>')
@auth.authorise(*app.config['AUTH'].get('messaging', [['BROKEN'], ['']]))
def subscribe(locID=None):

    """Subscription Process Stage 1: Render the page with the subscription form.

       Args:
           locID (int): The location ID of a location to be automatically
           loaded into the location selector.
    """
    # Initialise locID to allowed location
    # Can't be done during function declaration because outside app context
    locID = g.allowed_location if not locID else locID

    return render_template('messaging/subscribe.html',
                           content=g.config['MESSAGING_CONFIG'],
                           loc=locID,
                           week=c.api('/epi_week'))


@messaging.route('/subscribe/subscribed', methods=['POST'])
@auth.authorise(*app.config['AUTH'].get('messaging', [['BROKEN'], ['']]))
def subscribed():
    """
    Subscription Process Stage 2: Confirms successful subscription request
    and informs the user of the verification process. This method assembles
    the HTML form data into a strcture that Meerkat Hermes understands and then
    uses the MeerkatHermes "subscribe" resource to create the subscriber. It
    further assembles the email and SMS verification messages and uses the
    Meerkat Hermes to send it out.
    """

    # Convert form immutabledict to dict.
    data = {}
    for key in request.form.keys():
        key_list = request.form.getlist(key)
        if(len(key_list) > 1):
            data[key] = key_list
        else:
            data[key] = key_list[0]

    # Call hermes subscribe method.
    subscribe_response = libs.hermes('/subscribe', 'PUT', data)

    # Assemble and send verification email.
    url = request.url_root + \
        g.get("language") + "/messaging/subscribe/verify/" + \
        subscribe_response['subscriber_id']

    verify_text = gettext(g.config['MESSAGING_CONFIG']['messages'].get(
        'verify_text',
        "Dear {first_name} {last_name} ,\n\n"
        "Thank you for subscribing to receive public health "
        "surveillance notifications from {country}.\n\nPlease "
        "verify your contact details by copying and pasting the "
        "following url into your address bar: {url}\n"
    )).format(
        first_name=data["first_name"],
        last_name=data["last_name"],
        country=current_app.config['MESSAGING_CONFIG']['messages']['country'],
        url=url
    )

    verify_html = gettext(g.config['MESSAGING_CONFIG']['messages'].get(
        'verify_html',
        "<p>Dear {first_name} {last_name},</p>"
        "<p>Thank you for subscribing to receive public health surveillance "
        "notifications from {country}.</p><p>Please verify your contact "
        "details by <a href='{url}' target='_blank'>clicking here</a>."
        "</p>"
    )).format(
        first_name=data["first_name"],
        last_name=data["last_name"],
        country=current_app.config['MESSAGING_CONFIG']['messages']['country'],
        url=url
    )

    libs.hermes('/email', 'PUT', {
        'email': data['email'],
        'subject': gettext('Please verify your contact details'),
        'message': verify_text,
        'html': verify_html,
        'from': current_app.config['MESSAGING_CONFIG']['messages']['from']
    })

    # Set and send sms verification code.
    if 'sms' in data:
        __set_code(subscribe_response['subscriber_id'], data['sms'])

    return render_template('messaging/subscribed.html',
                           content=g.config['MESSAGING_CONFIG'],
                           week=c.api('/epi_week'),
                           data=data)


@messaging.route('/subscribe/verify/<string:subscriber_id>')
def verify(subscriber_id):
    """
    Subscription Process Stage 3: Verfies contact details for the subscriber ID
    specified in the URL. If no SMS number is provided, then just landing on
    this page is enough to verify the users email address (assuming the ID is
    not guessable). In this case we do a redirect to Stage 4. If the user has
    already been verified, then we also redirect to stage four with a flash
    message to remind them that they have already verified. In all other cases
    we show the SMS verification form.

    Args:
        subscriber_id (str):  The UUID that is assigned to the subscriber upon
            creation by Meerkat Hermes.
    """

    # Get the subscriber
    subscriber = libs.hermes('/subscribe/' + subscriber_id, 'GET')

    if subscriber['verified'] is True:
        flash(gettext('You have already verified your account.'))
        return redirect(
            "/" + g.get("language") +
            '/messaging/subscribe/verified/' + subscriber_id,
            code=302
        )

    elif 'sms' not in subscriber:
        current_app.logger.warning(str(subscriber))
        libs.hermes('/verify/' + subscriber_id, 'GET')
        return redirect(
            "/" + g.get("language") +
            '/messaging/subscribe/verified/' + subscriber_id
        )
    else:
        return render_template('messaging/verify.html',
                               content=g.config['MESSAGING_CONFIG'],
                               week=c.api('/epi_week'),
                               data=subscriber)


@messaging.route('/subscribe/verified/<string:subscriber_id>')
def verified(subscriber_id):
    """
    Subscription Process Stage 4: Confirms that the users details has been
    verified, and sends out a confirmation email as well.

    Args:
        subscriber_id (str):  The UUID that is assigned to the subscriber
            upon creation by Meerkat Hermes.
    """

    # Get the subscriber
    subscriber = libs.hermes('/subscribe/' + subscriber_id, 'GET')

    # If the subscriber isn't verified redirect to the verify stage.
    if not subscriber['verified']:
        return redirect(
            '/' + g.get("language") +
            '/messaging/subscribe/verify/' + subscriber_id,
            code=302
        )

    country = current_app.config['MESSAGING_CONFIG']['messages']['country']

    # Send a confirmation e-mail with the unsubscribe link.
    confirmation_text = gettext(g.config['MESSAGING_CONFIG']['messages'].get(
        'confirmation_text',
        "Dear {first_name} {last_name},\n\n"
        "Thank you for subscribing to receive public health surveillance "
        "notifications from {country}.  We can confirm that your contact "
        "details have been successfully verified.\n\nYou can unsubscribe at "
        "any time by clicking on the relevant link in your e-mails.\n\n If "
        "you wish to unsubscribe now copy and paste the following url into "
        "your address bar:\n{url}/unsubscribe/{subscriber_id}"
    )).format(
        first_name=subscriber["first_name"],
        last_name=subscriber["last_name"],
        country=country,
        url=current_app.config["HERMES_ROOT"],
        subscriber_id=subscriber_id
    )

    confirmation_html = gettext(g.config['MESSAGING_CONFIG']['messages'].get(
        'confirmation_html',
        "<p>Dear {first_name} {last_name},</p>"
        "<p>Thank you for subscribing to receive public health surveillance "
        "notifications from {country}.  We can confirm that your contact "
        "details have been successfully verified.</p><p>You can unsubscribe "
        "at any time by clicking on the relevant link in your e-mails.</p><p> "
        "If you wish to unsubscribe now "
        "<a href='{url}/unsubscribe/{subscriber_id}'>click here.</a></p>"
    )).format(
        first_name=subscriber["first_name"],
        last_name=subscriber["last_name"],
        country=country,
        url=current_app.config["HERMES_ROOT"],
        subscriber_id=subscriber_id
    )

    email = {
        'email': subscriber['email'],
        'subject': gettext("Your subscription has been successful"),
        'message':  confirmation_text,
        'html': confirmation_html,
        'from': current_app.config['MESSAGING_CONFIG']['messages']['from']
    }

    email_response = libs.hermes('/email', 'PUT', email)
    current_app.logger.warning('Response is: ' + str(email_response))

    return render_template('messaging/verified.html',
                           content=g.config['MESSAGING_CONFIG'],
                           week=c.api('/epi_week'))


@messaging.route('/subscribe/sms_code/<string:subscriber_id>',
                 methods=['get', 'post'])
def sms_code(subscriber_id):
    """
    Chooses, sets and checks SMS verification codes for the subscriber
    corresponding to the ID given in the URL. If a POST request is made to this
    URL it checks whether the code supplied in the POST request form data
    matches the code sent to the phone. If it does, it rediects to Stage 4, if
    it doesn't it redirects to stage 3 again with a flash informing the user
    they got the wrong code. If a GET request is made to this URL, the function
    selects a new code and sends the code out to the phone. It then redirects
    to Stage 3 with a flash message informing the user whether the new code has
    been succesffully sent.

    Args:
        subscriber_id (str):  The UUID that is assigned to the subscriber upon
            creation by Meerkat Hermes.
    """

    # If a POST request is made we check the given verification code.
    if request.method == 'POST':
        if __check_code(subscriber_id, request.form['code']):
            libs.hermes('/verify/' + subscriber_id, 'GET')
            return redirect(
                "/" + g.get("language") +
                "/messaging/subscribe/verified/" + subscriber_id,
                code=302
            )
        else:
            flash('You submitted the wrong code.', 'error')
            return redirect(
                "/" + g.get("language") +
                "/messaging/subscribe/verify/" + subscriber_id,
                code=302
            )

    # If a GET request is made we send a new code.
    else:
        subscriber = libs.hermes('/subscribe/' + subscriber_id, 'GET')

        try:
            __set_code(subscriber_id, subscriber['sms'])
            flash(gettext('A new code has been sent to your phone.'))
            return redirect(
                "/" + g.get("language") +
                "/messaging/subscribe/verify/" + subscriber_id,
                code=302
            )
        except Exception as e:
            current_app.logger.error(
                "Request to send SMS failed. Response:\n{}".format(e)
            )
            flash(
                gettext('Error: Try again later, or contact administrator.'),
                'error'
            )
            return redirect(
                "/" + g.get("language") +
                "/messaging/subscribe/verify/" + subscriber_id,
                code=302
            )


def __check_code(subscriber_id, code):
    """
    Checks if the given code for the given subscriber ID is the correct SMS
    verification code.

    Args:
        subscriber_id (str):  The UUID that is assigned to the subscriber upon
            creation by Meerkat Hermes.
        code (str): The code to be checked.

    Returns:
        bool: True if there is a match, False otherwise.

    """
    response = libs.hermes('/verify', 'POST',
                           {'subscriber_id': subscriber_id, 'code': code})
    current_app.logger.warning(str(response))
    return bool(response['matched'])


def __set_code(subscriber_id, sms):
    """
    Sets a new sms verification code for the given subscriber ID.

    Args:
        subscriber_id (str):  The UUID that is assigned to the subscriber
            upon creation by Meerkat Hermes.
        sms (int): The SMS number to which the new code should be sent.

    Returns:
        The Meerkat Hermes response object.

    """
    code = round(random.random()*9999)
    message = gettext(
        'Your verification code for {country} public health'
        'surveillance notifications is: {code}. Please follow instructions'
        ' in the email to verify your contact details.'
    ).format(
        country=current_app.config['MESSAGING_CONFIG']['messages']['country'],
        code=code
    )
    data = {'sms': sms, 'message': message}
    response = libs.hermes('/verify', 'PUT',
                           {'subscriber_id': subscriber_id, 'code': code})
    response = libs.hermes('/sms', 'PUT', data)

    return response
