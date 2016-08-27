from flask import abort, request, make_response, jsonify
from functools import wraps
from jwt import InvalidTokenError
from flask.ext.babel import gettext
import jwt, inspect, logging, os

#Need this module to be importable without the whole of meerkat_auth config.
#Directly load the secret settings file from which to import required variables.
#File must include JWT_COOKIE_NAME, JWT_ALGORITHM and JWT_PUBLIC_KEY variables.
filename = os.environ.get( 'MEERKAT_AUTH_SETTINGS' )
exec( compile(open(filename, "rb").read(), filename, 'exec') )

def check_access(access, countries, acc):
    """
    Compares the access levels specified in the require_jwt decorator with the access
    levels specified in the given jwt. Returns a boolean stating whether there is a match.

    Accepts "" as a wildcard country, meaning any country.

    Args:
        access ([str]) A list of role titles that meet the qauthorisation requirements.
        countries ([str]) An optional list of countries for which each role
            title correspond to. access[0] corresponds to country[0] and so on...
            If the length of countries is smaller than the length of access, then
            the final element of countries is repeated to make the length match. 
            Accepts wildcard value "" for any country.  Default value is [""], meaning
            all specified access levels will be valid for any country if countires is
            not specified.

    Returns:
        bool True if authorised, False if unauthorised.   
    """
    #Set the countries array to match the length of the access array.
    if len(countries) < len(access):
        j = len(countries)
        for i in range(j,len(access)):
            countries.append( countries[j-1] )

    authorised = False
        
    #For each country specified by the decorator...
    for i in range(0,len(countries)):
        country = countries[i]
        #...if that country is specified in the token...
        if country in acc:
            #...and if the corresponding country's role is specified in the token...
            if access[i] in acc[country]:
                #...then authorise.
                authorised = True
                break

        #...Else if the country specified by the decorator is "" (the wildcard)...
        elif country == "":
            #...Look through all countries specified in the jwt...
            for c in acc:
                #...if any access level in jwt matches a level in the decorator...
                if access[i] in acc[c]:
                    #....then authorise.
                    authorised = True
                    break

    return authorised

def check_auth( access, countries=[""] ):
    """
    A function that checks whether the user is authorised to continue with the current
    request. It does this by verifying the jwt stored as a cookie. If the user isn't 
    authorised the request is aborted with an Invalid Token Error.

    Args: 
        access ([str]) A list of role titles that have access to this function.
        countries ([str]) An optional list of countries for which each role
            title correspond to. access[0] corresponds to country[0] and so on...
            If the length of countries is smaller than the length of access, then
            the final element of countries is repeated to make the length match. 
            Accepts wildcard value "" for any country.  Default value is [""], meaning
            all specified access levels will be valid for any country if countires is
            not specified.

            E.g. require_jwt(['manager', 'shared'], countries=['jordan','demo'])
            Would give access to managers in jordan, and shared accounts in demo.
            E.g. require_jwt(['manager', 'shared']) 
            Would give access to managers and shared accounts from any country.
            E.g. require_jwt(['manager','shared'], countries=['jordan'])
            Would give access to managers and shared accounts only from Jordan.

    """

    #Extract the token from the cookies
    token = ""
    token = request.cookies.get(JWT_COOKIE_NAME)

    #If no token is found in the cookies.
    if not token:
        abort( 401, gettext(u"You have not authenticated yet. "
                             "Please login before veiwing this page." ) )

    try:
        #Decode the jwt and check it is structured as expected.
        payload = jwt.decode(
            token,
            JWT_PUBLIC_KEY, 
            algorithms=[JWT_ALGORITHM]
        )

        #Check that the jwt has required access.
        if check_access(access, countries, payload['acc'] ):
            
            g.payload = payload

        #Token is invalid if it doesn't have the required accesss levels.
        else:
            raise InvalidTokenError(
                gettext(u"User doesn't have required access levels for this page.")
            )

    #Return 401 if the jwt isn't valid.   
    except InvalidTokenError as e:
        abort( 401, str(e) ) 
    

def authorise( access, countries=[""] ):
    """
    Returns decorator that wraps a route function with another function that
    requires a valid jwt.

    Args:
        access ([str]) A list of role titles that have access to this function.
        countries ([str]) An optional list of countries for which each role
            title correspond to. access[0] corresponds to country[0] and so on...
            If the length of countries is smaller than the length of access, then
            the final element of countries is repeated to make the length match. 
            Accepts wildcard value "" for any country.  Default value is [""], meaning
            all specified access levels will be valid for any country if countires is
            not specified.

    Returns:
        function: The decorator or abort(401)
    """
    def decorator(f):

        @wraps(f)
        def decorated(*args, **kwargs):

            check_auth( access, countries )
            return f(*args, **kwargs)

        return decorated

    return decorator
