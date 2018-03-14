================
Meerkat Frontend
================

**Meerkat Frontend** presents the data drawn from **Meerkat API** and **Meerkat Abacus** in a web app.   It has been designed in collaboration with our various stakeholders to meet their speicifc needs (most notably the Jordinian Ministry of Health). The frontend offers the most complete means to explore the data through a large array of tools, including a "dashboard" of tables and charts, auto-generated summary reports, an alerts notification service, and specialist tools for visualisaing and downloading data. 

----------
Components
----------

* :doc:`frontend/homepage`  gives a public brief overview of the specific country's project, and acts as a splash page to the secured technical site. This includes: some text describing the project, a dynamically updated map showing where the data is coming from, and some dynamically updated key indicators for the project.

* :doc:`frontend/technical` displays detailed information and is only accesible with a password. It can display data for any selected location from the country to the individual clinic, and includes pages showing demographics, disease distributions, geographical distributions and epi-curves.

* :doc:`frontend/reports` generates neat detailed summaries of the data in the system that can be shared publicly with other people. Weekly reports can be generated for user's desired time period and location. 

* :doc:`frontend/messaging` (or Notifications service) subscribes users to receive email and sms updates of system alerts and reports. The messages are sent by our purpose built Meerkat Hermes module, controlled through a secured REST API. 

* :doc:`frontend/explore` allows users to draw and export the tables and charts that they want to see, picking which categories to show along each access and filtering/ording the records as they desire. 

* :doc:`frontend/download` provides a means of downloading pre-pared data sets and any raw data that the user desires for their own analysis.

---------
Structure
---------

As a Python flask app, Meerkat Frontend is made up of static assets, Jinja2 templates and Python modules.  Further folders and files exist to manage the app's testing, and to abstract country specifics into configuration files, and bundle it up as a python package.  Files and folders of particular note include:

**runserver.py** - Runs a development/testing server for the app. Note that it is advised to run this inside the development or production environments built in the Meerkat Infrastructure repository. 

**config.py** - Specifies a host of configuration variables used throughout Meerkat Frontend.  Allows you to distinguish between a development,testing and production environment.

**meerkat_frontend/**

   **common.py** - A file containing a number of python methods that could be useful across all components.

   **apiData/**  A folder containing data for a static API, used for testing and development instead of the live API.

   **src/** A folder containing source files for building the static assets (images, Javascript, CSS etc...). These files are built by by **Gulp** and placed in the **/static** folder. You should never need to edit documents in the **/static** folder. Read "Getting Started" below for more information.

   **test/** A folder containing our testing harness for Meerkat_Frontend

   **views/** A folder containing the python flask view modules. There is a different view for each component.  This is where much of the server-side work happens.

   **templates/** A folder containing Jinja2 templates that are rendered in the Python view files.  There is a seperate folder of templates for each component.  

      **base.html** A file containing the base template that is extended by other templates in each component. Jinja2 templates are hereditary, reducing the need to re-write the same bits of template multiple times. This base tamplate includes the header, footer, navigation bar and other core fragments of layout etc...

      **includes/** A folder containing recurring fragments of templates.

---------------
Getting Started
---------------

Meerkat Frontend depends upon three package management systems: Python's PIP, Javascript's Node Package Manager (NPM) and the client-side package manager Bower.  The packages required from each package manager are stored in the files **setup.py**, **package.json** and **bower.json** respectively. After pulling the repository from **GitHub**, the following commands need to be run from the package's root folder to install the necessary dependancies, ``python setup.py install``, ``npm install``, and ``bower install``. 

One of the packages installed by NPM is the build tool **Gulp**. Gulp performs a number of build-related processes specified in the file **gulp.js**. Among other things Gulp optimises images, builds the SASS files into CSS files, runs **JSHint** on the Javascript, draws all the Javascript and CSS files together into large single files (reducing the number of requests to load a web page), cleans out our static assets folder, and then re-assembles the updated static assets ready to be used. 

***NOTE:*** static assets are assembled from the **meerkat_frontend/src** folder, **bower_components** folder and **node_modules** folder, and then placed in the **meerkat_frontend/static** folder; *there is no need to directly edit anything in the static assets folder*.  In order to run Gulp, you must first clean the static assets using the **clean** task specified in gulp.js, we therefore suggest using the following shell command to build the project ``gulp clean && gulp``. 

------------------
Translation
------------------
Meerkat Frontend can be deployed in multiple languages. The current language is displayed in the url after the root url as a two-letter language code. 
Text on the site comes from two different sources, the general text from Meerkat Frontend and the implmementation specific text from the country configuration. In the frontend all text that will be visible to the user has to be marked for translation. We use **flask-babel** for python and Jinja2 files and **jed** for javascript files.

In Jinja2 all text should be included in _(). This needs to be inside the {{}} Jinja2 tags.

In python files text needs to be fed through the gettext function.

For javascript files we use i18n.gettext(). I18n is javascript jed object that contains all the translations and is included on every page.

**Translation of text from config files (translation.csv)**

For the implementation specifc text a csv file has to be prepared in the country repositiry called translation.csv. It has at least to columns, one called **source** and one called **text**. It can also include any number of columns with a two letter language code. The **source** column gives the source of the text, the **text** column the english text and all other columns can be used to optionally specify translations in the given langauge. All text from the country configs that will be displayed on the website needs to be in this file. It has to be copied from the config files and the codes file (_the file is not generated automatically!_). Translations for this text can either be added in the csv file or later in the .po file.

**Translation workflow**

The workflow for translation is as follows:
 1. Extract all text to be translated into .pot filed
 2. Update(or create new) existing .po files with the translations from the .pot file
 3. Translate the .po files
 4. Combine the two separate sources of translations into one
 5. Compile the .po files into .mo files and json-files.

The **translate.py** file in the frontend repository provides some simple functionality to help with this. The structure of the translation files is as follows:

- `country_repository/translation.csv`
- `country_repository/translations/` (`*.po` files wit translations from above `csv`)
- `meerkat_frontend/translations/` (`*.po` files with translations of general text)
- `meerkat_frontend/meerkat_frontend/translations` (never edit)

The translation.csv file we described above. The country_repository/translations will contain .po files generated from the translation.csv file. The files in meerkat_frontend/translations are the .po files from the general text. The files in meerkat_frontend/meerkat_fronted/translations are automatically generated and should never be edited. We will have one .po file for each language we use(except for english).

**Preparing files for translation by a human translator and adding changes**

To extract english text from **both** the meerkat frontend code and the translation.csv file run the following command:

``python translate.py update-po``

This will extract all the text and update the two sets of .po files (one in country_repository/translations and one in meerkat_frontend/translations).

These .po files will now need to be translated. The previous command will update all .po files for multiple languages if they exist. The .po file from meerkat_frontend should just be sent to the translator. The .po files from country_repository can be automatically translated if the correct language exists in the translation.csv file. Do add this translation use the following command:

``python translate.py -l lang-code insert-translations``

, where lang-code is the two letter language code for the translation you want to update. Once both sets of .po files are updated (the country one either automatically or manually by sending it to a translator). They can be combined and compiled by the following command:

``python translate.py compile``

This will combine all the .po files and transfer them to meerkat_frontend/meerkat_frontend/translations and compile this combined .po file to a .mo file. The last step is then to compile the .po file to JSON for **jed**. This is done by gulp, so just running gulp after the compile command should do it.

If preparing this for deployment the last step of compiling is not nescessary as the deploy script will also do this. 


------------------
Code Documentation
------------------

The following specific code documentation is available here:

.. toctree::
   :maxdepth: 4

   frontend/sharedPython
   frontend/messagingPython
   frontend/reportsPython
   frontend/technicalJS
   frontend/exploreJS

