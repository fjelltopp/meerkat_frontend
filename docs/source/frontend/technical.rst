=======================
The Technical Component
=======================

The technical component presents data from the api in a "Dashboard" interface, with tabs and links enabling the user to navigate through a series of tables and graphs that detail the state of health in the given country. **The pages and URLs in this component are managed client-side by the Javascript** (the static assets *pageManager.js* and *locationManager.js*), not server-side by the python. A number of other Javascript files are served as static assets to help draw the many graphs, tables and maps used in this component.

Page Management
---------------

The Javascript *history* object stores an array of *page states* on the client-side, each mapped to a URL and a page title. A page state is a small Javascript object that allows you store data with the URL, and thus render the correct desired page. The browser's forward and backward buttons, can than navigate through this array, rendering a new page for each page state.  This is the basis of our page management system.

The workhorse of our page management system is the `loadPage()` function in the *static/js/technical/pageManager.js* file. Three different types of pages are managed by this method: a tab page, an alert page (detailing a single alert) and a disease page (detailing a single disease/aggregation variable).  Each type of page requires a different URL and page state structure, and is edited differently after initial html template is rendered.  The html templates for these pages are stored in the *static/files/pages* folder. The process involved in loading a page involves the following steps:

1. Assembly of the correct page state.
2. Assembly of the correct URL.
3. Storing of the page state and url in the history object.
4. Rendering of the html template.
5. Updating of any dynamic content in the page, by calling methods such as *loadLocation()*. 
6. Any additional page updates required (such as highlighting a new tab). 

Steps 1-3 and 4-6 are seperated into different methods for each page type, so that the content can be rendered without storing a page state if necessary.

The file *static/js/technical/locationManager.js* includes two methods that perfrom an analagous process for rendering the page using a new location.  The *loadLocation()* method (called after loading a new location-dependant page) performs steps 1-3 of the above process and then the method *loadLocationContent()* draws the new updated location selector and calls the HTML template's *drawCharts()* function.  This function, which is defined in each page's HTML template, re-draws the page's dynamic content using the new location ID. 

Upon loading the technical component's Jinja2 template from the server, the method *loadLocationTree()* from the file *locationManager.js* is called (within the template istelf). This method calls the Meerkat API for the location tree information, stores the tree in a Javascript global variable, and then loads the initial tab to be viewed. *Tree Model* is a Javascript package installed with NPM (not available in Bower) that allows you to create a tree model and navigate through the model in sensible ways (e.g. find children and parents).  It is used to draw and update the location selector. 
 
Chart/Table/Map Management
--------------------------

The charts, tables and maps are drawn by functions in the files *chartManager.js*, *tableManager.js*, and *mapManager.js* in the *static/js/technical* folder.In the majority of cases these functions are accessed through the function *categorySummation()* in the file *static/js/technical/misc.js*. There are a number of cases where tables have to be drawn that can't be easily generalised into this function.  In these cases, specific functions are called from these files to draw tables such as the Alerts Aggregation Table under the Alerts tab, which is drawn by the function *alertsAggTable()* in *tableManager.js*.

The *categorySummation()* function can draw table and charts for aggregations over a complete category of variables as specified in *Meerkat Abacus*. Arguments are passed to this function in a single object called *details*.  Full documentation for this function can be found here. It is recommended that you use this function as it handles the AJAX requests efficiently, sending them off in parallel rather than series. 

Other Javascript
----------------

The file *static/js/technical/misc.js* contains a number of other javascript functions that are used throughout the technical dashboard. For instance

* `get_api_week()` - a function that returns the current epi week. This value was initially calulated in javascript, based upon the date and the year.  As the system developed, we realised different countries would require different ways of calculating the epi week, so this is now served through the API.  This javascript function now returns the value of a global variable that is set by data passed to the Jinja2 template - the api call to caluclate the epi week is made server-side in the python. Keeping the function means that any referencing code didn't have to be re-written.

* `last_weeks(week, n)` - a function that returns the epi week numbers of the `n` weeks before the specified `week`.  This is needed because when the specified `week` is lower than `n` then we will need to return the last weeks of the previous year *e.g.* `last_weeks(2, 3)` will return week 52 (of the previous year) and week 1 and 2 of the current year. It's used in *makeDataObject()* to select the right data from the API responses.

* `makeDataObject( *args*)` - a function that orders all the data given in the arguments into a uniform pattern that can be understood by multiple drawing functions from the files *chartManager.js* and *tableManager.js*. The same data object that this function returns can be used to draw both a table and a chart. These data objects are also used in the *categorySummation()* method.

The code should be well commented. 

The Configuration File
----------------------

The configuration file is a json file loaded into the flask app in the meerkat_frontend module when the server is started up.  It is passed as a Python dictionary to the Jinja2 template and used to correctly render the pages for a specific country.  The configuration file should contain all country specifics including text, images, titles and map details.  Of particular note are the following settings:

* **New Tabs** can be added to the *tabs* array.  Each new tab must have a *name* and a *template*.  The template is the file name for a html template stored in the *static/files/pages* folder e.g. "demographics.html*.  Each country can therefore have it's own selection of tabs to display. 
* **The Footer** follows the same model across all countries, but shows a different list of supporters and logos.  
* **Map** details are stored for the *Map* tab, should it be included in the specified array of tabs. 
* **Central Reviews** are required by Jordan only.  A flag specifying whether they should be included in the technical site is specified here. 

Dependancies
------------
The technical component makes use of a large number of API calls:

* **/aggregate_category/<category ID>/<location ID>/<year>** to draw graphs and tables of the number cases reported in each variable of the given category. Most notably called by the ```categorySummation()``` function. 
* **/aggregate_year/<variable ID>/<location ID>** to aggregate total number of cases for a single variable over a given year. This is used in the ```categorySummation()``` function to caluclate denominators for some percentages (the percentage of total yearly cases anumber might be). 
* **/variables/<category ID>** to get the complete details for each variable in a given category.  
* **/locations** to get a list of locations, with names and IDs.
* **/records/<variable ID>/<location ID>** to get records corresponding to a certain variable and location when drawing the PIP table.
* **/links/<links ID>** to get the details of a given link from one object to another in Abacus. 
* **/completeness/<category ID>/<number per week>** used to calulate the percentage completeness of reporting for a given category ID (primarily used int he Completeness tab).  The specified number per week ,is the expected number per week against which to calulate percentages. 
* **map/<variable ID>/<location>** used to map a given variable's number of cases to their facilities.


The following third-party software components are also used:

* **Leaflet** is installed through Bower for drawing maps.
* **High Charts** is installed through Bower for drawing graphs. 
* **Tree Model** is installed through NPM, for modelling the location tree (taken from Meerkat API) in the Javascript. 
* **flag-icon-css** is installed through Bower to render images of the country flag in the navbar.
* **Bootstrap** installed through Bower to format the entire site's HTMl in a responsive and neat manner.
* **JQuery** is installed through Bower and used to enhance the Javascript across the site.

Javascript Documentation
------------------------

Detailed documention for key javascript functions are available here: :doc:`technicalJS`.

