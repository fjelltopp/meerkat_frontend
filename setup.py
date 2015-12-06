#!/usr/bin/env python3
from setuptools import setup

setup(
    name='Meerkat Frontend',
    version='0.0.1',
    long_description=__doc__,
    packages=['meerkat_frontend'],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'Flask>=0.10.1',
        'itsdangerous>=0.24',
        'Jinja2>=2.8',
        'MarkupSafe>=0.23',
        'python-dateutil>=2.4.2',
        'requests>=2.8.1',
        'Werkzeug>=0.10.4',
        'python-slugify>1.1.4'
    ],
    test_suite='meerkat_frontend.test'
)
