var locationsTree = new TreeModel({childrenPropertyName:"nodes"});

/**:var locations

    A global variable to store the location tree as built by Tree Model (a component installed
    through NPM) when calling the function `loadLocationTree()`. This location tree is used
    through out the site for drawing the location selector and executing other tasks that require
    navigating through the tree model.
*/
var locationData;
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
        locationData =  $.extend(true, {}, data);
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
function loadLocation( locID){

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
	if( locID != allowed_location ){
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

	loadLocationContent(locID);
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
function loadLocationContent(locID){

	var node = locations.first( {strategy: 'breadth'}, function(x){ return x.model.id===locID; });

	//Get the parents
	var nodePath = node.getPath();

	//Get children
	var childNodes = node.model.nodes;

	//Build the location selector
	var html = '<div class="location-search"><input class= "form-control" type="text" id="myInput" onkeyup="searchLocations(this);" placeholder="' +
               i18n.gettext('Search for location...') + '">';
    html += '<span class="glyphicon glyphicon-search"/><span class="glyphicon glyphicon-remove" onclick="loadLocationContent(history.state.locID);"/></div>';

	if( nodePath.length > 1 ){
		html += "<div class='btn-group-vertical btn-block'>";
		html += "<button type='button' class='btn header'>" + i18n.gettext('Parent Locations') + ":</button>";
		for( var i=0; i<nodePath.length-1; i++ ){
			html += "<button type='button' class='btn btn-default btn-block' onclick='loadLocation(" +
				nodePath[i].model.id + ");'>" + nodePath[i].model.text + "</button>";
		}
		html += "</div>";
	}

	if( childNodes.length > 0){
		html += "<div class='btn-group-vertical btn-block'>";
		html += "<button type='button' class='btn header'>Sub-locations:</button>";

        // Sort locations by name.
        childNodes.sort(function(a, b) {
            var nameA = a.text.toUpperCase(); // ignore upper and lowercase
            var nameB = b.text.toUpperCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

		for( var j=0; j<childNodes.length; j++ ){
			html += "<button type='button' class='btn btn-default' onclick='loadLocation(" +
				childNodes[j].id + ");'>"+childNodes[j].text+"</button>";
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
	//TODO: More apropriate name for drawCharts? Maybe drawLocation? updateContent?
	if( typeof drawCharts === 'function' ) drawCharts( locID );

}

/**:filterLocations( allowedLocations, locID )

    Called  when wishing to filter which locations are available in the location
    selector.  The function strips out all unwanted locations from the locations
    tree stored in the global variables `locations`. If an empty list of
    allowedLocations is provided, then the function resets the locationTree to
    the original complete tree.


    :param list allowedLocations:
        A list of allowed location IDs.
    :param number locID:
        The locId to load with the list filtering.
*/
function filterLocations(allowedLocations, locID){

    // Begin with a valid locID and a fresh complete location tree.
    if(typeof locID === 'undefined') locID = history.state.locID;
    locations = locationsTree.parse($.extend(true, {}, locationData));

    // Only filter if allowed locations has elements, otherwise show complete tree.
    if(allowedLocations.length !== 0){

        //Warn if the locId isn't in the allwoed locations. efault to allowedLocations[0]
        if(allowedLocations.indexOf(locID) == -1){
            console.warn("locID not in allowed locations, defaulting to allowedLocations[0]");
            locID = allowedLocations[0];
        }

        //If more than one allowedLocation, traverse the tree and drop unwanted nodes.
        if(allowedLocations.length>1){
            //Select which nodes should be removed.
            forDeletion = [];
            locations.walk({strategy: 'post'}, function(node){
                if(allowedLocations.indexOf(node.model.id) == -1) forDeletion.push(node);
                if(node.model.id==1) return false;
                else return true;
            });
            // Then delete each node, but without deleting their subtrees.
            // For each node take the children & add them as children to parent.
            for( var n in forDeletion){
                var path = forDeletion[n].getPath();
                var parent = path[path.length-2];
                var children = forDeletion[n].children;
                for( var c in children) parent.addChild(children[c]);
                // Then delete the node
                var dropped = forDeletion[n].drop();
            }

        // If only one allowedLocation, quicker to just select the node using .first()
        }else{
            locations = locations.first(function(node){return node.model.id==allowedLocations[0];});
            locations.model.nodes=[];
        }
    }

    // Now redraw everything and load the specified location.
    loadLocation(locID);
}


function searchLocations(input) {
    // Select the matching nodes from the tree (case insensitive)
    var filter = input.value.toUpperCase();

    var nodes = locations.all(function (node) {
        return node.model.text.toUpperCase().indexOf(filter) > -1;
    });

    // Draw the button group for the matching nodes.
    var html = "<div class='btn-group-vertical btn-block'>";
    html += "<button type='button' class='btn header'>" + i18n.gettext('Matching Locations') + ":</button>";
    for( var i=0; i<nodes.length; i++ ){
        html += "<button type='button' class='btn btn-default btn-block' onclick='loadLocation(" +
            nodes[i].model.id + ");'>" + nodes[i].model.text + "</button>";
    }

    // If no matches, say so
    if(nodes.length === 0) html += "<button type='button' class='btn btn-default btn-block' disabled>" + i18n.gettext('No matches') + "</button>";

    // Tie up and display
    html += "</div>";
    $('.location-selector .btn-group-vertical').remove();
    $('.location-selector').append(html);
}
