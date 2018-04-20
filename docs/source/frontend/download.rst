============================
The Download Data Component
============================

The Download Data component provides a means for the user to download both prepared and raw data sets for use in their own alaysis. It's a very simple component that provides a html form to enable interaction with functionality from the API. All the Javascript required for the page is included in the Jinja2 template. 

The Configuration File
--------------------------

The configuration file is a json file loaded into the flask app in the meerkat_frontend module when the server is started up.  It is passed as a Python dictionary to the Jinja2 template and used to correctly render the homepage for a specific country.  The configuration file should contain all country specifics including text, images, titles and map details.

There are two main properties in this configuration file:

* `prepared` - An array holding objects that detail each prepared data set that is made available to the user for download. Each object has the following properties:
	* `title` - A string used in the form's data set selector.
	* `api` - The url of the Meerkat API call that will provide the data set. 
	* `name_category` -
	* `fields` - An array of two element arrays, in which the first element is the raw data coloumn heading and the second element is the replacement string for column header in the downloadable data file.

* `forms` - An object of objects that detail each form whose data can be downloaded.  Each object has the following properties:
	* `name` - A string identifying the form to be downloaded, to be used in the html selector element.
	* `default` - A list of field ID's to be made available to the user by default (their checkboxes are pre-checked) when choosing which data to be downloaded.  Given there's so much data to download, this speeds up the process of making a sensible selection.

Data Dependancies
-----------------

The download data component uses the Meerkat API *export_data.py* resource. 
