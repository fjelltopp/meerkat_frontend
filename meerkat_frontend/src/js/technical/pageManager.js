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
										function(){ loadLocationContent(locID); });
										

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
	                           	$('#diseaseID').html(diseaseID);
	                           	loadLocationContent(locID); 
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
	var url = 'diseases/disease_' + currentState.dataID + '/loc_' + locID;
	history.pushState( currentState, 'Disease #' + diseaseID, '/technical/' + url );

	loadDiseaseContent( diseaseID, locID );
}

function loadAlertContent( alertID ){
	//Load the page content
	//Alert-specific changes depend on the page content being loaded.
	$( '#page-content' ).load( '/static/files/technical_pages/alert.html',
	                           function(){ 
	                           	//This function is defined in the alert.html page file.
	                           	//It colelcts data for the alertID and draws the alert page.
	                           	drawAlertContent( alertID );
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
	var url = 'alerts/alert_' + currentState.dataID;
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
 * If logHistory == true, a page state will be pushed into the broswer history before loading content.
 */
function loadPage( pageState, logHistory ){

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
}

//Respond to the user pressing forward or back by loading the correct page content.
window.onpopstate = function(event) {
	loadPage( event.state, false );
};

