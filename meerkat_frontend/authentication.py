from flask import g
from meerkat_libs.auth_client import Authorise as libs_auth
from .app import app
from .messages import messages


# Extend the Authorise object so that we can restrict access to location
class Authorise(libs_auth):
    """
    Extension of the meerkat_libs auth_client Authorise class. We override one
    of its functions so that it works smoothly in meerkat_auth.
    """
    # Override the check_auth method
    def check_auth(self, access, countries, logic='OR'):
        # First check that the user has required access levels.
        libs_auth.check_auth(self, access, countries, logic)

        # Continue by checking if the user has restrcited access to location
        # Cycle through each location restriction level
        # If the restriction level is in the users access, set the allowed loc
        allowed_location = 9999

        for level, loc in app.config.get('LOCATION_AUTH', {}).items():
            access = Authorise.check_access(
                [level],
                [app.config['COUNTRY']],
                g.payload['acc']
            )
            if access and loc < allowed_location:  # Prioritise small loc id
                allowed_location = loc

        # If no restriction set, then default to the whole country.
        if allowed_location is 9999:
            allowed_location = 1

        # Set the allowed location root
        g.allowed_location = allowed_location

        # Apply config overrides for specific access levels.
        if app.config.get('CONFIG_OVERRIDES', {}):
            # Order override priority according to order of users access.
            for level in reversed(g.payload['acc'][app.config['COUNTRY']]):
                if level in app.config.get('CONFIG_OVERRIDES', {}):
                    for k, v in app.config['COMPONENT_CONFIGS'].items():
                        g.config[k] = {
                            **app.config[k],
                            **app.config['CONFIG_OVERRIDES'][level]
                        }

        # Flashing messages depends upon users access, so flash after auth.
        messages.flash()

# The extended authorise object used across this flask app to restrict access
auth = Authorise()
