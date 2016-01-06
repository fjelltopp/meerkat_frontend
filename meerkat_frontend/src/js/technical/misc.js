
//Get the epi week from the current date.
//The epi week is the week number counted from the begining of Jan 2015.
function get_epi_week(){

    date=new Date();
    ms2=date.getTime();
    date_early= new Date(date.getFullYear(),0,1);
    date_early=date_early.getTime();
    days=Math.floor((ms2-date_early)/(3600*24*1000));

    return Math.floor(days/7)+1;
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
 * sharing the same data, to share the same api calls. */
function makeDataObject( aggregation, variables, week, title ){

	var bins = Object.keys(aggregation);

	//Create an array of everything we have to collate over each data bin.
	//E.g. For gender labels we create a list made up of 'Male' and 'Female'.
	var labelData = [];
	var idData = [];
	var yearData = [];
	var weekData = [];
	var week1Data = [];
	var week2Data = [];

	//Get the last three weeks.
	var weeks = lastWeeks( week, 3 );

	for( var i=0; i<bins.length; i++ ){
		
		var label = bins[i];

		labelData.push( variables[label].name );
		idData.push( label );
		yearData.push( if_exists(aggregation[label], 'year') );
		weekData.push( if_exists(aggregation[label].weeks, weeks[0].toString() ) );
		week1Data.push( if_exists(aggregation[label].weeks, weeks[1].toString() ) );
		week2Data.push( if_exists(aggregation[label].weeks, weeks[2].toString() ) );

	}

	var dataObject = { 	
		title: title,
		labels: labelData, 
		ids: idData, 
		year: yearData , 
		week: weekData,	
		week1: week1Data,	
		week2: week2Data
	};

	return dataObject;

}

/* This function factorises out repeated code when drawing tables and charts for category aggregations.
 * It also helps to share data from AJAX calls where possible, rather than making multiple replicated
 * AJAX calls for the table, the bar chart and the pie chart. The function also handles the turn over
 * of years, by combining data from the previous year into the current year if necessary. In gneral,
 * when aggregating over a category, you should display the results using this function. All the 
 * parameters a specified in a details object. */
function categorySummation( details ){ 

	//Factorise out the data object assembly and drawing.
	function draw( data, variables ){

		var title = details.category.charAt(0).toUpperCase() + details.category.slice(1);
		if( details.title ) title = details.title;
		 
		var dataObject = makeDataObject(data, variables, details.week, title );
		if( details.strip ) dataObject = stripEmptyRecords( dataObject );

		if( details.barID ) drawBarChart( details.barID, dataObject, true);
		if( details.pieID ) drawPieCharts( details.pieID, dataObject, true );
		if( details.tableID ) drawTable( details.tableID, dataObject, 
		                                 details.percent, details.no_total, details.linkFunction );
	}

	//Collect the data and variable information
	$.getJSON( api_root+"/aggregate_category/"+ details.category + "/" + details.locID, function( data ){
		$.getJSON( api_root+"/variables/" + details.category, function( variables ){

			//Check if we are still in one of the first three weeks.
			//If we are then the table should show information from the previous year as well.
			//This requires another API call.
			if( details.week <= 3 ){

				var prevYear = new Date().getFullYear()-1;
				var url = api_root+"/aggregate_category/"+ details.category + "/" + details.locID + "/" + prevYear;

				$.getJSON( url, function( prevData ){
					
					//For each variable, add the data for the final weeks of the previous year to the current year's data. 
					//Then construct the data object.
					for( var variable in data ){
						
						var weekKeys = Object.keys(prevData[variable].weeks);
				
						for( var i=weekKeys.length; i>weekKeys.length-3; i-- ){
							data[variable].weeks[weekKeys[i]] = prevData[variable].weeks[weekKeys[i]];
						}
					}

					//Draw using the current and previous year's data combined into one aggregation object.
					draw( data, variables );

				});

			}else{

				draw( data, variables );

			}
		});
	});

}

function exportTableToCSV(tableID, filename, link) {

	console.log( tableID );
	var rows = $('#'+tableID).find('tr');
	console.log(rows);

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

	console.log(csv);

	// Data URI
	csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

	$(link).attr({ 'download': filename,
	               'href': csvData,
	               'target': '_blank'
	             });
}
