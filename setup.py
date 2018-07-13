#!/usr/bin/env python3
import uuid
from setuptools import setup
try:  # for pip >= 10
    from pip._internal.req import parse_requirements
except ImportError:  # for pip <= 9.0.3
    from pip.req import parse_requirements

# parse_requirements() returns generator of pip.req.InstallRequirement objects
install_reqs = parse_requirements("requirements.txt", session=uuid.uuid1())

# reqs is a list of requirement
# e.g. ['django==1.5.1', 'mezzanine==1.4.6']

reqs = [str(ir.req) for ir in install_reqs if ir.req is not None]

setup(
    name='Meerkat Frontend',
    version='0.0.1',
    long_description=__doc__,
    packages=['meerkat_frontend'],
    include_package_data=True,
    zip_safe=False,
    install_requires=reqs,
    test_suite='meerkat_frontend.test'
)
