var locationsTree = new TreeModel({childrenPropertyName:"nodes"});
var locations;

//This method loads the JSON location tree from which it creates a TreeModel.
function loadLocationData( initialNodeID ){
	$.getJSON( api_root+"/location_tree", function( data ){
		locations = locationsTree.parse(data);
		loadLocation( initialNodeID );
	});
}

//This method is called when wishing to filter by location.
function loadLocation( nodeID ){

	var node = locations.first( {strategy: 'breadth'}, function(x){ return x.model.id===nodeID; });

	drawLocationSelector( node );
	$("#location-title").text(node.model.text);
}

//This method draws the location selector for any given node in the location tree.
function drawLocationSelector( node ){

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

	//Draw the location selector.
	$("#location-selector").html(html);

}



