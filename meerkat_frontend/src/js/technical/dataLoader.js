var locationsTree = new TreeModel({childrenPropertyName:"nodes"});
var locations;

//This method loads the JSON data for the technical site. 
function loadTabData( initialPageState ){

	//TODO: Get initial page data.

	$.getJSON( api_root+"/locationtree", function( data ){
		locations = locationsTree.parse(data);
		loadPage( initialPageState, true );
	});

	//TODO: Collect other tab data then bind event listener to tab.

}
