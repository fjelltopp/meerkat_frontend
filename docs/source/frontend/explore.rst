=====================
The Explore Component
=====================

The Explore Component is a tool written in Javascript that enables the user to "explore the data" by drawing and editing their own tables. This is very different to the prescribed tables and charts made available in the technical component. Python is only used to render the basic template, all further functionality is written in Javascript in the file *static/js/explore/explore.js* and the template *templates/explore/index.html*. 

Plots
-----

At the time of writing there are two plots that can be drawn by the user: a **cross-plot** and a **timeline-plot**.  A cross-plot takes two categories of variables from Meerkat Abacus and cross tabulates the number of cases in each variable. A timeline-plot cross tabulates the number of cases reported each week in a single variable against a category of variables. The timeline-plot can be created from a cross-plot by clicking on a variable, which is then plotted against the opposing axis category. Each plot then has it's own set of options that can edited by the user, such as whether the chart is coloured, or empty records are hidden from view. 

The Chart Drawing Process
-------------------------

The state of the table shown should always be entirely stored in the HTML.  Every HTML element that can change the state of a table has a class that identifies it as such e.g. for the cross plot, all links/buttons/input fields that can change the state of the table have a class "cross-option". Every "option" element should have a "name" and a "value" attribute. Upon clicking an option link or button, a Javascript function is often called that handles the updating of the option's value attribute (e.g. ```callStrip()```), before calling the ```redraw()``` function.  When the ```redraw()``` function is called, an options object is created by looping through all option elements and using the "name" attribute as the key and the "value" attribute as the value. This options object that summaries the complete state of the desired table, is then passed to the ```createCrossPlot()``` (or other ```createXxxPlot()``` function) to draw the new table. These functions that create the plot are found in the static asset file. 

The Configuration File
----------------------

The configuration file is a json file loaded into the flask app in the meerkat_frontend module when the server is started up.  It is passed as a Python dictionary to the Jinja2 template and used to correctly render the homepage for a specific country.  The configuration file should contain all country specifics including text, images, titles and map details. Aside from key-value pairs that are shared with most of the other component configuration files, the explore component requires just one other property:

* **categories** An array of catgeories that can be plotted against each other in a cross-plot. Each category is represented by a two element array where each index contains:

	0. The Category ID taken from Meerkat Abacus.
	1. A name string for use in the category selector element. 

Dependancies
------------

The Explore Component requires a number of Meerkat API calls to be available:

* **/query_category/<category id>/<category id>/<start date>/<end date>?<options>** to draw the cross-plot.
* **/query_variable/<variable id>/<category id>/<start date>/<end date>?<options>** to draw the timeline-plot.
* **/variables/<category>** to get the variable details for a category.
* **/variable/<variable ID>** to get the variable details for a given variable ID

It also depends upon the following 3rd party components:

* **Bootstrap Tables** is installed through Bower to draw the tables. 
* **eonasdan-bootsrtap-datetimepicker** is installed through Bower to draw the date pickers.
* **flag-icon-css** is installed through Bower to render images of the flags in the report headers.
* **Bootstrap** installed through Bower to format the HTMl in a responsive and neat manner.
* **JQuery** is installed through Bower and used to enhance the Javascript across the site.

Javascript Documentation
------------------------
Detailed documention for key javascript functions are available here: :doc:`exploreJS`.

