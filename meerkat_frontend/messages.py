from datetime import datetime
from .app import app
from meerkat_libs.auth_client import Authorise
from flask import flash, g, request
from dateutil import parser
import boto3
import re


class FlashMessages():
    """
    A FlashMessages object shows messages using the Flask "flash" system. The
    messages are loaded from the FLASH_MESSAGES_TABLE specified in the config
    that should be available from the DYNAMODB_URL endpoint specified in the
    config. These messages are reloaded when the config's FLASH_RELOAD_INTERVAL
    passes, or when the developer specifies a truthy "flash_reload" GET arg in
    the URL. The following conditions can be placed upon a message:

        published: Message is hidden if set to 'false' or 'no'.
        start_date: A timestamp from which to start showing the message.
        end_date: A timestamp up to which the message should be shown.
        access: An access level required to see the message.
        page: A URL regex determining which pages the message is shown upon.

    A condition is specified by adding a 'column' in the dynamodb table.  All
    conditions must be met for the message to be displayed. An example message
    to insert into the dynamodb table might look like this:
        ```
            {
                'country': 'demo',
                'id': 'example-message',
                'en': 'This is the english translation',
                'fr': 'This is the french translation',
                'published': 'False',  # Hidden for now
                'page': '(.*)download(.*)',  # Only show on download page
                'start_date': '2018/2/1'  # Start to show from 1st Feb 2018
            }
        ```
    """

    def __init__(self):
        try:
            self.db = boto3.resource(
                'dynamodb',
                endpoint_url=app.config['DYNAMODB_URL'],
                region_name='eu-west-1'
            )
        except Exception:
            app.logger.error(
                'Failed to connect to flash messages DB.',
                exc_info=True
            )
        self.get_messages()

    def __repr__(self):
        """Creates a detailed string representation of this object."""
        return "FlashMessages Object ({})\n{}".format(
            self.last_update,
            self.messages
        )

    def get_messages(self):
        """
        Get all messages for the website's country from the dynamodb table.
        There should be a table "frontend_messages" accessible from the
        dynamodb endpoint url specified in the config.
        """
        # If can't connect to DB don't bother getting messages.
        if not self.db:
            self.messages = []
            return
        # Get messages from DB but don't kill system if can't find the messages
        country = app.config["SHARED_CONFIG"]["auth_country"]
        try:
            table = self.db.Table(app.config['FLASH_MESSAGES_TABLE'])
            self.messages = table.query(
                KeyConditions={
                    'country': {
                        'AttributeValueList': [country],
                        'ComparisonOperator': 'EQ'
                    }
                }
            ).get("Items", [])
        except Exception:
            app.logger.error(
                'Failed to get flash messages.',
                exc_info=True
            )
            self.messages = []
        # We get messages based on a time interval, so record the current time.
        self.last_update = datetime.now()
        app.logger.info("Updated " + repr(self))

    def flash(self, force_reload=False):
        """
        Show the messages specified by the sys admin.  This function should be
        called before each important request in the frontend.  The timing of
        the call is important, as this function depends upon the auth process.
        It has to happen before rendering the template, but after processing
        the auth.

        A GET arg can be specified in the URL "flash_reload", which will reload
        the flash messages if it equates to True.  This way the developer
        does not need to wait for the interval to pass to check their message
        is good.

        Arguments:
            force_reload(bool): Force the reload of the flash messages.  Can
                also wait for the FLASH_RELOAD_INTERVAL to pass, or include
                "?flash_reload=true" GET arg in the URL.
        """
        # Get messages if requested to, or if the interval has passed.
        # i.e. Don't need to get messages from dynamoDB during every request.
        interval = (datetime.now()-self.last_update).seconds
        flash_reload = interval > app.config['FLASH_RELOAD_INTERVAL']
        flash_reload = flash_reload or request.args.get('flash_reload')
        if flash_reload or force_reload:
            self.get_messages()
        # Show the messages, which should be labelled by lang code.
        for message in self.messages:
            content = message.get(
                g.language,
                message.get(app.config['DEFAULT_LANGUAGE'])
            )
            if content and self.meets_conditions(message):
                flash(content, message.get('category', 'info'))

    def meets_conditions(self, message):
        """
        Check if a message should be shown to the user.  Does this by checking
        each parameter of the message and seeing if there is a corresponding
        condition function defined in this instance of FlashMessages.  All
        valid conditions must be met for the message to show.

        Arguments:
            message(dict): The message under consideration, which is a record
                loaded from the dynamodb table.

        Returns:
            bool stating whether all valid conditions have been met or not.
        """
        results = []
        for key, value in message.items():
            try:
                condition = getattr(FlashMessages, "_{}_condition".format(key))
                results += [condition(value)]
            except AttributeError:
                pass
        return all(results)

    def _published_condition(published):
        """Condition: Is the message published?"""
        return published not in ["false", "False", "no", "No"]

    def _start_date_condition(date):
        """Condition: Publish message from a time stamp"""
        return datetime.now() >= parser.parse(date)

    def _end_date_condition(date):
        """Condition: Publish message until a timestamp"""
        return datetime.now() < parser.parse(date)

    def _access_condition(levels):
        """Condition: Only publish for users with specified access."""
        levels = [levels] if type(levels) is not list else levels
        if hasattr(g, 'payload'):
            return Authorise.check_access(
                levels,
                [app.config["SHARED_CONFIG"]['auth_country']],
                g.payload['acc'],
                logic='AND'
            )
        return False

    def _page_condition(regex):
        """Condition: Only publish on pages with URLs that match the regex."""
        return bool(re.compile(regex).match(request.path))

# There is only really need for one instansiation of this object.
messages = FlashMessages()
