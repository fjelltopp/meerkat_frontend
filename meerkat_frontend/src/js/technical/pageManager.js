/**:loadPage( pageState, logHistory )

    Loads any page summarised by a "Page State" object. Page state objects have three properties:

    * **type** - the type of page being loaded. Different types have different ways of assembling
      the corresponding URL and drawing the page content. The current ypes in use are: 'tab', 
      'alert' or 'disease'. 
    * **dataID** - a string identifying which page of the specified type should be loaded. E.g. for
      the type 'tab' a tab ID such as 'demographics', for the type 'alert' an alert ID such as
      '252627' and for type 'disease' a variable ID from Meerkat Abacus such as 'cmd_1'.
    * **locID** - the location ID (taken from the location tree in *locationManager.js*) used to
      filter data. This is an optional field as not all pages requiring filtering by locations.

    If pageState does not include a type, this functions loads the locID location into the currently
    rendered template by calling `loadLocation()` from the *locationManager.js* file.

    :param object pageState:
        The page state summarising the page to be loaded. See details above for the object specifications.
    :param boolean logHistory:
        If true, the page state will be pushed into the browser history before loading content.
        If false, the page content will be updated appropiately, but the URL and browser history
        won't be updated. 
 */
function loadPage( pageState, logHistory ){

	if( pageState !== null && typeof(pageState.type) != 'undefined'){

        //Each page type should have a `load<type>()` and `load<type>Content()` function.
        //The first sorts out the browser history and URL, the latter the page content.
        //Separating the the two allows us to update the page without logging it in the history.
		switch( pageState.type ){

			case 'tab' :
				if( logHistory ) loadTab( pageState.dataID, pageState.locID ); 
				else loadTabContent( pageState.dataID, pageState.locID ); 
				break;

			case 'alert' :
				if( logHistory ) loadAlert( pageState.dataID ); 
				else loadAlertContent( pageState.dataID ); 
	 			break;

			case 'disease' : 
				if( logHistory ) loadDisease( pageState.dataID, pageState.locID ); 
				else loadDiseaseContent( pageState.dataID, pageState.locID ); 
				break;
		}

	}else{

		if( typeof(pageState.locID) != 'undefined'){
			if( logHistory ) loadLocation( pageState.locID );
			else loadLocationContent( pageState.locID );

		}else{
			console.error( 'No information provided in the pageState' );
		}

	}
}

//Loads the page content for a given a tab and handles the active tab styling.
function loadTabContent( tabID, locID ){

	//locID (the id of the location) is an optional argument.  
	//If it isn't set, look at the current page state locID, if that isn't set, default to 1.
	console.log(history.state.locID);
	if( typeof locID == 'undefined' ){
		if( history.state === null || typeof history.state.locID == 'undefined' ) locID = allowed_location;
		else locID = history.state.locID;
	}

	//Load the page content
	//Only load the location content after the page content has been loaded, because one depends on the other.
	$( '#page-content' ).load( '/static/files/pages/' + $( '#'+tabID ).attr('page'),
										function(){ 
	                           	loadLocationContent(locID); 
	                           });
										

	//Update the active tab styling
	$('.tabs li.active').removeClass('active');
	$( '#'+tabID ).parent().addClass('active');

}

//Load a tab and manage the page history in the process.
function loadTab( tabID, locID ){

	//locID (the id of the location) is an optional argument.  
	//If it isn't set, look at the current page state locID, if that isn't set, default to 1.
	if( typeof locID == 'undefined' ){
		if( history.state === null || typeof history.state.locID == 'undefined' ) locID = allowed_location;
		else locID = history.state.locID;
	}

	//Record the page history.
	currentState = { type: 'tab', dataID: tabID, locID: locID};
	var url = currentState.locID == 2 ? 
	        currentState.dataID : currentState.dataID + '/loc_' + currentState.locID;
	history.pushState( currentState, $( '#'+tabID ).text(), "/" + language +"/technical/" + url );

	loadTabContent( tabID, locID );
}

function loadDiseaseContent( diseaseID, locID ){

	//Disease-specific changes depend on the page content being loaded.
	$( '#page-content' ).load( '/static/files/pages/disease.html',
	                           function(){ 
	                           	drawDiseaseContent( diseaseID, locID );
	                           	loadLocationContent( locID );
	                           }); 
										
}

function loadDisease( diseaseID, locID ){

	//locID (the id of the location) is an optional argument.  
	//If it isn't set, look at the current page state locID, if that isn't set, default to 1.
	if( typeof locID == 'undefined' ){
		if( history.state === null || typeof history.state.locID == 'undefined' ) locID = allowed_location;
		else locID = history.state.locID;
	}

	//Record the page history.
	currentState = { type: 'disease', dataID: diseaseID, locID: locID };
	var url = 'diseases/' + currentState.dataID + '/loc_' + locID;
	history.pushState( currentState, i18n.gettext('Disease #') + diseaseID,  "/" + language +"/technical/" + url);

	loadDiseaseContent( diseaseID, locID );
}

function loadAlertContent( alertID ){
	//Load the page content
	//Alert-specific changes depend on the page content being loaded.
	$( '#page-content' ).load( '/static/files/pages/alert.html',
	                           function(){ 
	                               	//This function is defined in the alert.html page file.
	                               	//It collects data for the alertID and draws the alert page.
	                               	drawAlertContent( alertID );
	                               	glossary(); 
	                           }); 
}

function loadAlert( alertID ){

	//Keep the locID for location persistance across pages.
	//If no locId set, just set back to the root node.
	var locID = allowed_location;
	if( history.state !== null && typeof history.state.locID != 'undefined' ){
		locID = history.state.locID;
	}

	//Record the page history.
	currentState = { type: 'alert', dataID: alertID, locID: locID };
	var url = 'alerts/' + currentState.dataID;
	history.pushState( currentState, i18n.gettext('Alert #') + alertID,  "/" + language +"/technical/" + url);

	loadAlertContent( alertID );
}

/**:glossary()

    This function inserts words from the config file glossary object. 
    It inserts into <span> elements with class "glossary" and attribute "word".
    Practically it is used to allow country specific words for concepts such as
    "Region" (known as "Governorate" in Jordan). 
 
    You can capitalise the word by adding the class "capitalised" to the <span>.
 */
function glossary(){

	var elements = $('.glossary');

	elements.each( function(){

		var word = $(this).attr('word');
		var replacement = config.glossary[word];

		if( $(this).hasClass('capitalised') ) replacement =i18n.gettext(capitalise(replacement));

		$(this).html(replacement);

	});

}

