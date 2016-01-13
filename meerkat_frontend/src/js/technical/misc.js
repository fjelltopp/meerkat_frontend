
//Get the epi week from the current date.
//The epi week is the week number counted from the begining of Jan 2015.
function get_epi_week(){
	return week;
}

//Get the current date in text format.
function get_date(){

    date=new Date();
    date=new Date(date.getTime()-3600*24*1000);
    var monthNames = [ "January", "February", "March", "April", 
	                    "May", "June", "July", "August", "September", 
	                    "October", "November", "December" ];

    return date.getDate()+" "+monthNames[date.getMonth()]+" "+date.getFullYear();
}

//Format a number with commas for the thousands.
function format(number){

    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

//Calculate no as a percentage of denom. Returns 0 if denom <= 0.
function calc_percent(no,denom){
	if (denom>0){
		return Math.round(no/denom*100);
	}else{
		return 0;
	}
}

//Given an array of values, calulate what percentage each value is of the total.
function calc_percent_dist( array ){

	var total = 0;	
	var ret = [];

	for( var i=0; i<array.length; i++ ){
		total += array[i];
	}

	for( var j=0; j<array.length; j++ ){
		ret[j] = calc_percent(array[j], total);
	}

	return ret;
}

//Returns the vlue if the key exists in vari, returns zero if it doesn't. 
function if_exists(vari,key){

	if ($.inArray(key,Object.keys(vari)) != -1 || $.inArray(key.toString(),Object.keys(vari)) != -1 ){
		return vari[key];
	}else{
		return 0;
	}

}

//Select the webkit event to listen for when determining when the side bar has transitioned.
function whichTransitionEvent(){

    var t;
    var el = document.getElementById('sidebar-wrapper');
    var transitions = {
      'transition':'transitionend',
      'OTransition':'oTransitionEnd',
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    };

    for(t in transitions){
        if( el.style[t] !== undefined ){
            return transitions[t];
        }
    }
}

//Utility function to capitalise the first character of a string.
function capitalise( string ){
	return string.charAt(0).toUpperCase() + string.slice(1);
}

//Gets the last n week numbers in an array, taking into account the change over between years. 
//The array is formed as such: [week, week-1, week-2, ..., week-n]
function lastWeeks( week, n ){

	var weeks = [];

	for( var i = 0; i<n; i++ ){
		if( week-i <= 0 ) weeks[i] = week-i+52;
		else weeks[i] = week-i;
	}

	return weeks;
}

/* This function takes the response from a category aggregation and turns it into a data object
 * for sending to one of the draw-chart/draw-table functions. It allows multiple charts and tables
 * sharing the same data, to share the same api calls.  */
function makeDataObject( aggregation, variables, week, title, percent ){

	var bins = Object.keys(aggregation);

	//Create an array of everything we have to collate over each data bin.
	//E.g. For gender labels we create a list made up of 'Male' and 'Female'.
	var data = { 	
		title: title,
		labels: [], 
		ids: [], 
		year: [], 
		week: [],	
		week1: [],	
		week2: []
	};

	//If an object of values is given in [percent], instead of a boolean...
	if( typeof percent == 'object' ){
		
		//Prepare arrays for "complicated" calculations (percentages that depend on other variables)
		data.yearPerc = [];
		data.weekPerc = [];
		data.week1Perc = [];
		data.week2Perc = [];
	}

	//Get the last three weeks.
	var weeks = lastWeeks( week, 3 );

	//Group data according to Weeks/Year instead of Variable...
	for( var i=0; i<bins.length; i++ ){
		
		var label = bins[i];

		data.labels.push( variables[label].name );
		data.ids.push( label );
		data.year.push( aggregation[label].year );
		data.week.push( if_exists( aggregation[label].weeks, weeks[0].toString() ) );
		data.week1.push( if_exists( aggregation[label].weeks, weeks[1].toString() ) );
		data.week2.push( if_exists( aggregation[label].weeks, weeks[2].toString() ) );

		if( typeof percent == 'object' ){
			
			//Do the "complicated" percent calulations
			data.yearPerc.push( calc_percent( aggregation[label].year, percent.year ) );
			data.weekPerc.push( calc_percent( aggregation[label].weeks[weeks[0]], percent.weeks[weeks[0]] ) );
			data.week1Perc.push( calc_percent( aggregation[label].weeks[weeks[1]], percent.weeks[weeks[1]] ) );
			data.week2Perc.push( calc_percent( aggregation[label].weeks[weeks[2]], percent.weeks[weeks[2]] ) );
		}
	}

	//If a boolean is given in [percent] then just do the simple percantage calculations.
	if( percent === true ){

		//Do the "simple" calculations (where percentages are just the share of the total).
		data.yearPerc = calc_percent_dist( data.year );
		data.weekPerc = calc_percent_dist( data.week );
		data.week1Perc = calc_percent_dist( data.week1 );
		data.week2Perc = calc_percent_dist( data.week2 );
	}

	return data;

}

/* This function factorises out repeated code when drawing tables and charts for category aggregations.
 * It also helps to share data from AJAX calls where possible, rather than making multiple replicated
 * AJAX calls for tables, bar charts and pie charts. The function also handles the turn over
 * of years, by combining data from the previous year into the current year if necessary. In gneral,
 * when aggregating over a category, you should display the results using this function. All the 
 * parameters are specified in a details object. */
function categorySummation( details ){ 

	//These variable will hold all the JSON data from the api, when the AJAX requests are complete.
	var catData, variables, percentDenom, prevData, prevPercentDenom;

	//Calulate the previous year, so we can load data from the previous year if needed.
	var prevYear = new Date().getFullYear()-1;
	var url;

	//Assemble an array of AJAX calls 
	var deferreds = [
		$.getJSON( api_root + "/aggregate_category/" + details.category + "/" + details.locID, function(data) {
			catData = data;
		}),
		$.getJSON( api_root + "/variables/" + details.category, function(data) {
			variables = data;
		})
	];

	//Get previous year's data if still in the first few weeks of the year.
	if( details.week <= 3 ){
	
		url = api_root+"/aggregate_category/"+ details.category + "/" + details.locID + "/" + prevYear;
		deferreds.push( $.getJSON( url, function(data) {
			prevData = data;
		}));
	}

	//Add data for the percent denominator if calculating percentage values from other data variables.
	if( details.percent && typeof details.percent == 'string' ){

		url = api_root + "/aggregate_year/" + details.percent + "/" + details.locID;
		deferreds.push( $.getJSON( url, function(data) {
			percentDenom = data;
		}));

		//Get previous years percent denominator data if still in the first few weeks of the year.
		if( details.week <= 3 ){
			deferreds.push( $.getJSON( url + "/" + prevYear, function(data) {
				prevPercentDenom = data;
			}));
		}
	}


	//Run the AJAX reuqests asynchronously and act when they have all completed.
	$.when.apply( $, deferreds ).then(function() {
		
		if(catData && variables){

			//Just some variables for counting/iteration that can be shared across this function.
			var variable, i, weekKeys;

			//Add the data for the final weeks of the previous year to the current year's data. 
			if(prevData){
				for( variable in prevData ){
					weekKeys = Object.keys(prevData[variable].weeks);
					for( i=weekKeys.length-1; i>weekKeys.length-5; i-- ){
						if( weekKeys[i] ){
							catData[variable].weeks[weekKeys[i]] = prevData[variable].weeks[weekKeys[i]];
							
						}
					}
				}
			}else if( !prevYear && details.week <= 3){
				//AJAX Failed
				console.error( "Ajax request for previous year's information failed.");
			}

			if( percentDenom ){
			
				//Add the percent denominator data for the final weeks of the previous year to this year's. 
				if( prevPercentDenom ){
					weekKeys = Object.keys(prevPercentDenom.weeks);
					for( i=weekKeys.length-1; i>weekKeys.length-5; i-- ){
						if( weekKeys[i] ) percentDenom.weeks[weekKeys[i]] = prevPercentDenom.weeks[weekKeys[i]];
					}
				}else if( !prevPercentDenom && typeof details.percent == 'string' && details.week <= 3 ){
					//AJAX Failed
					console.error( "Ajax request for the previous year's percent denominator information failed.");
				}
				details.percent = percentDenom;
				
			}else if( !percentDenom && typeof details.percent == 'string'){
				//AJAX Failed
				console.error( "Ajax request for percent denominator information failed.");
			}
			
			//Draw using the current and previous year's data combined into one aggregation object.
			var title = details.category.charAt(0).toUpperCase() + details.category.slice(1);
			if( details.title ) title = details.title;
			 
			var dataObject = makeDataObject(catData, variables, details.week, title, details.percent );
			if( details.strip ) dataObject = stripEmptyRecords( dataObject );

			if( details.barID ) drawBarChart( details.barID, dataObject, true);
			if( details.pieID ) drawPieCharts( details.pieID, dataObject, true );
			if( details.tableID ) drawTable( details.tableID, dataObject, details.no_total, details.linkFunction );

		}else {
			//Failed
			console.error( "Ajax request for the category aggregation and variable information failed.");
		}
	});
}

function exportTableToCSV(tableID, filename, link) {

	var rows = $('#'+tableID).find('tr');

	// Temporary delimiter characters unlikely to be typed by keyboard
	// This is to avoid accidentally splitting the actual contents
	var tmpColDelim = String.fromCharCode(11); // vertical tab character
	var tmpRowDelim = String.fromCharCode(0); // null character

	// actual delimiter characters for CSV format
	var colDelim = '","';
	var rowDelim = '"\r\n"';

	// Grab text from table into CSV formatted string
	var csv = '"' + rows.map( function (i, r) {
		var row = $(r);
		var cols = row.find('td, th');

		return cols.map( function (j, c) {
			var col = $(c);
			var text = col.text();
			text = text.replace(/\u0028.*\u0025\u0029/, ''); //Remove percentages in brackets.
			return text.replace(/"/g, '""'); // escape double quotes

		}).get().join(tmpColDelim);

	}).get().join(tmpRowDelim)
	.split(tmpRowDelim).join(rowDelim)
	.split(tmpColDelim).join(colDelim) + '"';

	// Data URI
	csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

	$(link).attr({ 'download': filename,
	               'href': csvData,
	               'target': '_blank'
	             });
}
