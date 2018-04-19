=====================
The Reports Component
=====================

The reports component **creates HTML and PDF reports summarising the data in the system, and provides a means to distribute the reports via email and in the frontend website**. Most of the work is done server-side in the Python file */views/reports.py*, whilst the Javascript files in the folder */static/js/reports/* are used to draw graphs and maps. The HTML templates are stored in the *templates/reports* folder,  and also include Javascript for rending text, charts and forms correctly.  The file *templates/reports/index.html* is a reports system splash page, made available under "Reports" in the main nav bar. This page provides the user with a form that lets them select any report they wish to view. 

The Configuration File
----------------------

The configuration file is a json file loaded into the flask app in the meerkat_frontend module when the server is started up.  It is passed as a Python dictionary to the Jinja2 template and used to correctly render the homepage for a specific country.  The configuration file should contain all country specifics including text, images, titles and map details. 

**This part of the docs will be updated soon, once the design of the configuration file is finalised.**
 
Dependancies
------------

The reports component uses the Meerkat API to source its data.  For each report there should be a seperate Meerkat API function that returns the necessary data:

* **/reports/<report ID>/<location ID>/<start date>/<end date>** With the dates sepcified in ISO format.

The following third-party software components are also used:

* **High Charts** is installed through Bower for drawing the graphs.  
* **PDFCrowd** is installed through PIP to interact with PDFCrowd's REST API that creates PDF files from HTML rendered with print media.
* **eonasdan-bootsrtap-datetimepicker** is installed through Bower to draw the date pickers.
* **Leaflet** is installed through Bower for drawing maps. The following extensions to leaflet are also used:
	* **Leaflet Markercluster** is installed through Bower for creating cluster maps of the data.
	* **Leaflet Fullscreen** is installed through Bower for enabling the map to be viewed full screen.
* **flag-icon-css** is installed through Bower to render images of the flags in the report headers.
* **Bootstrap** installed through Bower to format the HTMl in a responsive and neat manner.
* **JQuery** is installed through Bower and used to enhance the Javascript across the site.

Python Documentation
--------------------

The complete Python documentation can be found here: :doc:`reportsPython`.




