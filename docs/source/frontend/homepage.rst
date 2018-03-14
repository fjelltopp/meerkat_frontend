=======================
The Home Page Component
=======================

The Home Page is a Jinja2 template with a significant amount of Javascript.  Only a small amount of core python code is used to render the Jinja2 template using variables from the configuration file.  Much of the javascript is included in the Jinja2 template, rather than served as a static asset, as it depends upon the config variables specified in the configuration file and sent from the server. 

The Configuration File
----------------------

The configuration file is a json file loaded into the flask app in the meerkat_frontend module when the server is started up.  It is passed as a Python dictionary to the Jinja2 template and used to correctly render the homepage for a specific country.  The configuration file should contain all country specifics including text, images, titles and map details.

We recommend taking an already existing config file and editing it to create a new country's homepage. New page sections can be creating by adding a suitable object to the sections array, in the order you wish them to appear:

* **Section Type: HTML** This is the most commonly used type of section. The html string labelled "content" is shown under the heading labelled "title". 
* **Section Type: Slides** This type of section is used for bulleted lists, or sections with lots of subheadings. It is formatted the same as the above, except you can also include an array of slide objects.  Each slide object has a "title" property and a "content" property.  The "content" is hidden until someone clicks on the "title", in which case the "content" *slides* into view. 
* **Section Type: Indicators** This type of section is only used when you wish to show the key indicators slider. The "title" and "content" as in a "html" section, but is then followed by the key indicators slider.
* **Section Type: Acknowledgements** This type section typically comes at the end of the page, and displays the "content" with the partner logos as specified elsewhere in the file.

Dependancies
------------

The homepage requires some other data to be readily available from the Meerkat API (root specified in the main configuration file):

* **/consultation_map** to get the number of consultations for each facility and the facility location.
* **/tot_map** to get the total number of cases for each facility and the facility location.
* **/key_indicators** to get other key indicator fields used in the key indicator section.
* **/num_alerts** to get the number of alerts used in the key indicator section.

Th homepage also requires the regional kml, specifying the area of each region in the country. It should be served as a static asset by the server and its location is specified in the homepage configuration file.

The following third-party software components are also used:

* **Leaflet** is installed through Bower for drawing maps. The following extensions to leaflet are also used:
	* **Leaflet Markercluster** is installed through Bower for creating cluster maps of the data.
	* **Leaflet omnivore** is installed through Bower to enable Leaflet to work with KML data (used to deifne regions).
* **flag-icon-css** is installed through Bower to render images of the country flag in the navbar.
* **Bootstrap** installed through Bower to format the entire site's HTMl in a responsive and neat manner.
* **JQuery** is installed through Bower and used to enhance the Javascript across the site.
