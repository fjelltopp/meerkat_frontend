
//Loads the page content for a given a tab and handles the active tab styling.
function loadTabContent( tabElement ){

	//Load the page content
	$( "#page-content" ).load( "/static/files/technical_pages/" + $( tabElement ).attr("page") );

	//Update the active tab
	$(".technical-tabs li.active").removeClass("active");
	$( tabElement ).parent().addClass("active");

}

//Load a technical tab and manage the page history in the process.
function loadTab( tabElement ){

	//Record the page history.
	currentState = { page: $( tabElement ).attr( "page" ), tabID: $( tabElement ).attr( "id" )};
	history.pushState( currentState, $( tabElement ).text(), currentState.tabID );

	//Load the content
	loadTabContent( tabElement );

}

//Respond to the user pressing forward or back by loading the correct tab content.
window.onpopstate = function(event) {
	//Get which tab was being viewed in the page state.
	loadTabContent( $("#"+event.state.tabID) ); 	
};


