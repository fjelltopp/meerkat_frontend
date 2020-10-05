#!/usr/bin/env python3
import uuid
from setuptools import setup
import pathlib
import pkg_resources

with pathlib.Path('requirements.txt').open() as requirements_txt:
    reqs = [
        str(requirement)
        for requirement
        in pkg_resources.parse_requirements(requirements_txt)
    ]

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
