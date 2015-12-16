/* This method hides div elements inside the container that don't have a class with the given type.
 * Requires a container element with ID 'containerID' holding divs with class 'chart'.
 * These divs with class 'chart' also have a class that determines type, e.g. 'bar' or 'pie'
 * This method is practically used to switch between bar and pie charts. */
function showChartType( type, containerID ){
	$('#'+containerID+' .chart').not('.'+type).addClass('hidden');
	$('#'+containerID+' .'+type).removeClass('hidden');
}

/* This method draws a bar chart in the DOM element with the given containerID using the
 * data in the given data object. If percent is set to true, we use percentage rather than numbers.
 */
function drawBarChart( containerID, data, percent ){

	//We want to work with a clone of the data, not the data itself.
	data = $.extend(true, {}, data);

	//Hack to get plot to size correctly when being drawn into a hidden object.
	//If the object is hidden, set the plot width to the inner width of the parent.
	//Otherwise, leave as undefined as specified in the highcharts api.
	var plotWidth;
	if( $('#'+containerID).hasClass('hidden') ){
		plotWidth = $('#'+containerID).parent().width();
	}

	var units = 'Number';
	var tooltipSuffix = '';
	//If percent is set to true, first convert data to percentages.
	if( percent ){
		data.week = calc_percent_dist(data.week);
		data.year = calc_percent_dist(data.year);
		units='Percent %';
		tooltipSuffix = '%';
	}

	$('#'+containerID).highcharts({
		chart: {
			type: 'column',
			width: plotWidth
		},
		title: '',
		tooltip: {
			valueSuffix: tooltipSuffix
		},
		xAxis: {
			categories: data.labels,
			title: {
				text: null
			}
		},
		yAxis: {
			min: 0,
			title: {
				text: units,
				align: 'high'
			},
			labels: {
				overflow: 'justify'
			}
		},			
		series: [{
			name: 'Year',
			data:  data.year
		},{
			name: 'Last Week',
			data:  data.week
		}],
	});

console.log(data.labels);
console.log( data.year);

	//Get rid of the highcharts logo.
	$( '#'+containerID+" text:contains('Highcharts.com')" ).remove();

}

/* This method draws two pie charts in the container with the given containerID using the
 * data in the given data object.  One pie chart provides a data sumamry for the last week
 * the other pie chart provides a data summary for the year to date. 
 */
function drawPieCharts( containerID, data, percent ){
	
	//We want to work with a clone of the data, not the data itself.
	data = $.extend(true, {}, data);

	//Hack to get plot to size correctly when being drawn into a hidden object.
	//If the object is hidden, set the plot width to the inner width of the parent.
	//Otherwise, leave as undefined (as specified in the highcharts api).
	var plotWidth;
	if( $('#'+containerID).hasClass('hidden') ){
		plotWidth = $('#'+containerID).parent().width();
	}

	var units = 'Number';
	var tooltipSuffix = '';
	//If percent is set to true, first convert data to percentages.
	if( percent ){
		data.week = calc_percent_dist(data.week);
		data.year = calc_percent_dist(data.year);
		units='Percent %';
		tooltipSuffix = '%';
	}

	//First restructure the data object for pie charts.
	var restructured = {week:[], year:[]};
	for( var i=0; i<data.labels.length; i++ ){
		restructured.week[i] = { name: data.labels[i], y: data.week[i] };
		restructured.year[i] = { name: data.labels[i], y: data.year[i] };
	}

	//Draw the graph.
	$( '#'+containerID ).highcharts({
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: 'pie',
			width: plotWidth
		},
		title: '',
		tooltip: {
			valueSuffix: tooltipSuffix
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: false
				},
				showInLegend: true
			}
		},
		series: [{
			name: 'Week',
			center: ['20%','50%'],
			size: "70%",
			colorByPoint: true,
			showInLegend:true,
			title: { text: '<b>Week</b>', verticalAlign: 'top', y: -40 },
			data: restructured.week
		},{
			name: 'Year',
			center: ['80%','50%'],
			size: "70%",
			colorByPoint: true,
			showInLegend:false,
			title: { text: '<b>Year</b>', verticalAlign: 'top', y: -40 },
			data: restructured.year
		}]
	});

	//Get rid of the highcharts.com logo.
	$( '#'+containerID+" text:contains('Highcharts.com')" ).remove();

}

function drawTimeChart( varID, locID, containerID ){

	$.getJSON( api_root + '/aggregate_year/' + varID + '/'+locID, function(data){

		var labels = [];
		var values = [];

		for( var i = 1; i <= get_epi_week(); i++ ){

			labels.push(i.toString());

			if( typeof(data.weeks[i]) !== 'undefined' ){
				values.push( data.weeks[i] );
			}else{
				values.push( 0 );
			}

		}

		//Hack to get plot to size correctly when being drawn into a hidden object.
		//If the object is hidden, set the plot width to the inner width of the parent.
		//Otherwise, leave as undefined as specified in the highcharts api.
		var plotWidth;
		if( $('#'+containerID).hasClass('hidden') ){
			plotWidth = $('#'+containerID).parent().width();
		}


		$('#'+containerID).highcharts({
		chart: {
			type: 'column',
			width: plotWidth
		},
		title: '',
		xAxis: {
			categories: labels,
			title: {
				text: 'Epidemiological Week'
			}
		},
		legend:{ enabled:false },
		yAxis: {
			min: 0,
			title: {
				text: 'Number of Reported Cases',
				align: 'high'
			},
			labels: {
				overflow: 'justify'
			}
		},			
		series: [{
			name: 'Year',
			data:  values
		}],
		});

		//Get rid of the highcharts logo.
		$( '#'+containerID+" text:contains('Highcharts.com')" ).remove();
	});

}

/* This function strips empty records from a data object.  This is useful if the category
 * you are visualising has many 'bins' (for instance communicable diseases, or ICD-10 ).
 * If you strip the empty records before drawing the table and graphs, the size of the drawings
 * can be significantly smaller and easier to comprhend.
 */
function stripEmptyRecords( dataObject ){

	var dataFields = Object.keys( dataObject );
	var stripped = [];
	var newData = {};

	//Find the indicies of records to be retained. 
	//I.E. NOT THE ONES TO BE STRIPPED, but the ones AFTER stripping.
	for( var i in dataObject.year ){
		if( dataObject.year[i] !== 0 ){
			stripped.push( i );
		}	
	}

	//Clone the data object structure.
	for( var k in dataFields ){

		var field = dataFields[k];

		if( dataObject[field].constructor === Array ){
			newData[field] = [];
		}else{
			newData[field] = dataObject[field];
		}
	}

	//For each index to be retained, push the data object's record to the new data object.
	for( var j in stripped ){

		var index = stripped[j];
		for( var l in dataFields){

			var label = dataFields[l];
			if( dataObject[label].constructor === Array ){
				var value = dataObject[ label ][ index ]; 
				newData[ label ].push( value );
			}
		}
	}

	return newData;
}


Highcharts.setOptions({
	colors: ["#0090CA", "#D9692A", "#89B6A5", "#e94f37", "#393e41", "#F1E8B8",
	         "#CDEDF6", "#690500", "#77477B", "#40476D","#042A2B" ],
	chart: {
		backgroundColor: null,
		style: {
			fontFamily: 'Helvetica Neue", Helvetica, Arial, sans-serif'
		}
	},
	credits: {
		enabled: false
	},
	exporting: {
		enabled: false
	}

});


