var locationsTree = new TreeModel({childrenPropertyName:"nodes"});
var locations;

//This is the first method called when loading the technical site. 
//It loads the location tree data and renders the initial tab page (e.g. Demographics)
function loadLocationTree( initialPageState ){

	$.getJSON( api_root+"/locationtree", function( data ){

		locations = locationsTree.parse(data);
		if( typeof( initialPageState ) != 'undefined' ) loadPage( initialPageState, true );

	});
}

//This method is called when wishing to filter by location.
function loadLocation( nodeID ){

	//We want to work with a clone of the page state, not the pagestate itself.
	if( typeof(history.state) != 'undefined'){
		currentState = $.extend(true, {}, history.state);
	}else{
		currentState = {};	
	}

	//Record the page history.
	currentState.locID = nodeID;

	//Add the location into the URL without depending on the page that is being loaded.
	//This is because the location manager needs to be useable across different parts of the frontend.
	//Start by getting the current URL then remove the host domain name.
	var url = window.location.href;
	url = url.substring( url.indexOf( window.location.host ) + window.location.host.length );

	//Next see if a location is already defined at the end of the URL
	var index = url.indexOf('/loc_');

	//If nodeID = 1 (the whole country) don't both specifying location in URL.
	if( nodeID != 1 ){
		if( index != -1 ){
			//If the location is defined, replace it with the new location.
			url = url.substring(0, index) + '/loc_' + nodeID;
		}else{
			//If the non-location specific url doesn't finish with a slash, add one.
			if( url.slice(-1) != '/' ) url += '/' ;
			//Then add the location string.
			url += 'loc_' + nodeID;
		}
	}

	history.pushState( currentState, "", url );

	loadLocationContent( nodeID );
}

//This method draws the location selector for any given node in the location tree.
//It also updates page content.
function loadLocationContent( nodeID ){

	var node = locations.first( {strategy: 'breadth'}, function(x){ return x.model.id===nodeID; });

	//Get the parents
	var nodePath = node.getPath();

	//Get children
	var childNodes = node.model.nodes; 

	//Build the location selector
	var html = "";

	if( nodePath.length > 1 ){
		html += "<div class='btn-group-vertical btn-block'>";
		html += "<button type='button' class='btn header'>Parent Locations:</button>";
		for( var i=0; i<nodePath.length-1; i++ ){
			html += "<button type='button' class='btn btn-default btn-block' onclick='loadLocation(" +
				          nodePath[i].model.id + ");'>" + nodePath[i].model.text + "</button>";
		}
		html += "</div>";
	}

	if( childNodes.length > 0){
		html += "<div class='btn-group-vertical btn-block'>";
		html += "<button type='button' class='btn header'>Sub-locations:</button>";
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
	//TODO: More approaite name for drawCharts? Maybe drawLocation? updateContent?
	if( typeof drawCharts === 'function' ) drawCharts( nodeID );

}



