//Loads the page content for a given a tab and handles the active tab styling.
function loadTabContent( tabID, locID ){

	//locID (the id of the location) is an optional argument.  
	//If it isn't set, look at the current page state locID, if that isn't set, default to 1.
	if( typeof locID == 'undefined' ){
		if( history.state === null || typeof history.state.locID == 'undefined' ) locID = 1;
		else locID = history.state.locID;
	}

	//Load the page content
	//Only load the location content after the page content has been loaded, because one depends on the other.
	$( '#page-content' ).load( '/static/files/technical_pages/' + $( '#'+tabID ).attr('page'),
										function(){ 
	                           	loadLocationContent(locID); 
	                           });
										

	//Update the active tab styling
	$('.technical-tabs li.active').removeClass('active');
	$( '#'+tabID ).parent().addClass('active');

}

//Load a tab and manage the page history in the process.
function loadTab( tabID, locID ){

	//locID (the id of the location) is an optional argument.  
	//If it isn't set, look at the current page state locID, if that isn't set, default to 1.
	if( typeof locID == 'undefined' ){
		if( history.state === null || typeof history.state.locID == 'undefined' ) locID = 1;
		else locID = history.state.locID;
	}

	//Record the page history.
	currentState = { type: 'tab', dataID: tabID, locID: locID};
	var url = currentState.locID == 1 ? 
	          currentState.dataID : currentState.dataID + '/loc_' + currentState.locID;
	history.pushState( currentState, $( '#'+tabID ).text(), '/technical/' + url );

	loadTabContent( tabID, locID );
}

function loadDiseaseContent( diseaseID, locID ){

	//Disease-specific changes depend on the page content being loaded.
	$( '#page-content' ).load( '/static/files/technical_pages/disease.html',
	                           function(){ 
	                           	loadDiseaseContent( diseaseID, locID );
	                           	loadLocationContent( locID );
	                           }); 
										
}

function loadDisease( diseaseID, locID ){

	//locID (the id of the location) is an optional argument.  
	//If it isn't set, look at the current page state locID, if that isn't set, default to 1.
	if( typeof locID == 'undefined' ){
		if( history.state === null || typeof history.state.locID == 'undefined' ) locID = 1;
		else locID = history.state.locID;
	}

	//Record the page history.
	currentState = { type: 'disease', dataID: diseaseID, locID: locID };
	var url = 'diseases/' + currentState.dataID + '/loc_' + locID;
	history.pushState( currentState, 'Disease #' + diseaseID, '/technical/' + url );

	loadDiseaseContent( diseaseID, locID );
}

function loadAlertContent( alertID ){
	//Load the page content
	//Alert-specific changes depend on the page content being loaded.
	$( '#page-content' ).load( '/static/files/technical_pages/alert.html',
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
	var locID = 1;
	if( history.state !== null && typeof history.state.locID != 'undefined' ){
		locID = history.state.locID;
	}

	//Record the page history.
	currentState = { type: 'alert', dataID: alertID, locID: locID };
	var url = 'alerts/' + currentState.dataID;
	history.pushState( currentState, 'Alert #' + alertID, '/technical/' + url );

	loadAlertContent( alertID );
}

/* Loads any page summarised by the 'State' object.
 *
 * Page state objects include:
 * - 'type' ('tab', 'alert' or 'disease')
 * - 'dataID' (identifying data dependant on type, eg. tab-element ID, disease ID or alert ID)
 * - 'locID' (location ID, not used for all types)
 *
 * If object does not include type, it simply loads the locID location into the currently rendered template.
 * 
 * If logHistory == true, a page state will be pushed into the broswer history before loading content.
 */
function loadPage( pageState, logHistory ){

	if( typeof(pageState.type) != 'undefined'){

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

/* This function inserts words from the config file glossary object. 
 * It inserts into <span> elements with class "glossary" and attribute "word".
 * Practically it is used to allow country specific words for concepts such as
 * "Region" (known as "Governorate" in Jordan). It is called upon loading a location
 * and upon loading an alert investigation report (as these are the only pages that
 * don't depend upon investigation.
 * 
 * You can capitalise the word by adding the class "capitalised" to the <span>.
 */
function glossary(){

	var elements = $('.glossary');

	for( var i in elements ){

		var e = elements[i];
		var word = $(e).attr('word');
		var replacement = config.glossary[word];

		if( $(e).hasClass('capitalised') ) replacement = capitalise(replacement);

		$(e).html(replacement);
	}
}

//Respond to the user pressing forward or back by loading the correct page content.
window.onpopstate = function(event) {
	loadPage( event.state, false );
};

