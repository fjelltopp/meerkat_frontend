var locationsTree = new TreeModel({childrenPropertyName:"nodes"});

/**:var locations

    A global variable to store the location tree as built by Tree Model (a component installed
    through NPM) when calling the function `loadLocationTree()`. This location tree is used 
    through out the site for drawing the location selector and executing other tasks that require
    navigating through the tree model.
*/
var locations;

/**:loadLocationTree( initialPageState )

    This is the first function when loading the technical site (directly from the Jinja2 template).
    It loads the location tree and renders the initial tab page (e.g. Demographics)

    :param object initialPageState:
        The page state for the initial tab to be loaded. The page state is an object that summarises
        completely a page in the technical dashboard.  It does so in three properties: type, dataID
        and locID, as specified in the docs for the pageManager.js function `loadPage()`.
*/
function loadLocationTree( initialPageState ){

	$.getJSON( api_root+"/locationtree", function( data ){

		locations = locationsTree.parse(data);
		if( typeof( initialPageState ) != 'undefined' ) loadPage( initialPageState, true );

	});
}

/**:loadLocation( locID )

    Called when wishing to filter a page's contents by location. This function assembles the new correct
    URL and updates the page state in the history object.  Finally, it calls the `loadLocationContent()`
    function that actually updates the page HTML content to reflect the new location. 

    :param number locID:
        The location ID for the desired location.
*/
function loadLocation( locID ){

	//We want to work with a clone of the page state, not the pagestate itself.
	if( typeof(history.state) != 'undefined'){
		currentState = $.extend(true, {}, history.state);
	}else{
		currentState = {};	
	}

	//Record the page history.
	currentState.locID = locID;

	//Add the location into the URL without depending on the page that is being loaded.
	//This is because the location manager needs to be useable across different parts of the frontend.
	//Start by getting the current URL then remove the host domain name.
	var url = window.location.href;
	url = url.substring( url.indexOf( window.location.host ) + window.location.host.length );
	//Next see if a location is already defined at the end of the URL
	var index = url.indexOf('/loc_');

	//If locID = 1 (the whole country) don't specify location in URL.
	if( locID != 1 ){
		if( index != -1 ){
			//If the location is defined, replace it with the new location.
			url = url.substring(0, index) + '/loc_' + locID;
		}else{
			//If the non-location specific url doesn't finish with a slash, add one.
			if( url.slice(-1) != '/' ) url += '/' ;
			//Then add the location string.
			url += 'loc_' + locID;
		}
	}

	history.pushState( currentState, "", url );

	loadLocationContent( locID );
}


/**:loadLocationContent( locID )

    Called  when wishing to filter a page's contents by location (usually in-directly through
    the function `loadLocation()`). This function draws the location selector for any given node
    in the location tree. **NOTE:** doesn't handle updating the page state or URL 
    (see function `loadLocation()`).

    This function looks specifically for HTML elements with the class "location-selector", into
    which it will draw the location selector, and "location-title" into which it will load the 
    currently selected location title. It then further calls the function `drawCharts()` that
    updates any specific page content that is location dependant.  This function should specified
    in the HTML file for each page that is dependant on location.

    :param number locID:
        The location ID for the desired location.
*/
function loadLocationContent( locID ){

	var node = locations.first( {strategy: 'breadth'}, function(x){ return x.model.id===locID; });

	//Get the parents
	var nodePath = node.getPath();

	//Get children
	var childNodes = node.model.nodes; 

	//Build the location selector
	var html = "";

	if( nodePath.length > 1 ){
		html += "<div class='btn-group-vertical btn-block'>";
		html += "<button type='button' class='btn header'>" + i18n.gettext('Parent Locations') + ":</button>";
		for( var i=0; i<nodePath.length-1; i++ ){
			html += "<button type='button' class='btn btn-default btn-block' onclick='loadLocation(" +
				nodePath[i].model.id + ");'>" + i18n.gettext(nodePath[i].model.text) + "</button>";
		}
		html += "</div>";
	}

	if( childNodes.length > 0){
		html += "<div class='btn-group-vertical btn-block'>";
		html += "<button type='button' class='btn header'>Sub-locations:</button>";
		for( var j=0; j<childNodes.length; j++ ){
			html += "<button type='button' class='btn btn-default' onclick='loadLocation(" +
				childNodes[j].id + ");'>"+i18n.gettext(childNodes[j].text)+"</button>";
		}
		html += "</div>";
	}

	//Draw the location selector and update the location title.
	$(".location-selector").html( html );
	$(".location-title").text( node.model.text );

	//Update any country specific phrasing in the page.
	glossary();

	//Call the tab's draw charts function.
	//EVERY TAB SHOULD HAVE A DRAW CHARTS FUNCTION.
	//TODO: More approaite name for drawCharts? Maybe drawLocation? updateContent?
	if( typeof drawCharts === 'function' ) drawCharts( locID );

}



