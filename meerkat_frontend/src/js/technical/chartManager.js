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

	//Get rid of the highcharts logo.
	$( '#'+containerID+" text:contains('Highcharts.com')" ).remove();

}

/* Creates epi tables with data from: current week, last two weeks and the year.
 * Takes the same data object as the chart drawing functions.
 * If links is positive we add links to disease overview.
 * If percent is positive we add percentages. 
 * If no_total is positive we do not add total
 */
function drawTable( containerID, data, percent, no_total, links ){

	//We want to work with a clone of the data, not the data itself.
	data = $.extend(true, {}, data);

	//Initialise an object to store the summation values for the table.
	var sum=[0,0,0,0];

	//Table headers.
	table='<table class="table table-hover table-condensed"><tr>' +
			'<th>'+data.title+'</th><th>Week '+(get_epi_week()-1)+'</th>' +
			'<th>Week '+(get_epi_week()-2)+'</th><th>Week '+(get_epi_week()-3)+'</th>' + 
			'<th>This Year</th></tr>';

	//Calculate the percentages, if we're to show percentages.
	if(percent){
		data.yearPerc = calc_percent_dist( data.year );
		data.weekPerc = calc_percent_dist( data.week );
		data.week1Perc = calc_percent_dist( data.week1 );
		data.week2Perc = calc_percent_dist( data.week2 );
	}

	//For each data category, assemble a html string listing data for the three weeks and the year.
	for (var i =0; i< data.labels.length;i++){

		if(links){
			//TODO: Add links
			table+='<tr><td>'+data.labels[i]+'</td>';
		}else{
			table+='<tr><td>'+data.labels[i]+'</td>';
		}

		if(percent){
		
			table += "<td>" + 
						format(data.week[i]) + " <div class='table-percent'>(" + 
														data.weekPerc[i] + "%)</div></td><td>" + 
						format(data.week1[i]) + " <div class='table-percent'>(" + 
														data.week1Perc[i] + "%)</div></td><td>" +  
						format(data.week2[i]) + " <div class='table-percent'>(" + 
														data.week2Perc[i] + "%)</div></td><td>" +  
						format(data.year[i]) + " <div class='table-percent'>(" + 
														data.yearPerc[i] + "%)</div></td></tr>";
		}else{

			table += "<td>" + format(data.week[i]) + "</td><td>" + 
						format(data.week1[i]) + "</td><td>" + 
						format(data.week2[i]) + "</td><td>" + 
						format(data.year[i]) + "</td></tr>";
		}

		//Keep track of the sum over the 
		sum[0]=data.week[i]+sum[0];
		sum[1]=data.week1[i]+sum[1];
		sum[2]=data.week2[i]+sum[2];
		sum[3]=data.year[i]+sum[3];
	}

	if(!no_total){

		table+='</tr><tr class="info"><td>Total</td>';

		for (var j=0; j<sum.length; j++){
			table+="<td>"+sum[j]+"</td>";
		}
	}

	table+="</tr></table>";

	//Draw it!
	$('#'+containerID).html(table);
	
}

/* This function takes the response from a category aggregation and turns it into a data object
 * for sending to one of the above draw-chart functions. */
function makeDataObject( aggregation, variables, week, title ){

	var bins = Object.keys(aggregation);

	//Create an array of everything we have to collate over each data bin.
	//E.g. For gender labels we create a list made up of 'Male' and 'Female'.
	var labelData = [];
	var yearData = [];
	var weekData = [];
	var week1Data = [];
	var week2Data = [];

	for( var i=0; i<bins.length; i++ ){
		
		var label = bins[i];

		labelData.push( variables[label].name );
		yearData.push( if_exists(aggregation[label], 'year') );
		weekData.push( if_exists(aggregation[label].weeks, week ) );
		week1Data.push( if_exists(aggregation[label].weeks, (week-1).toString() ) );
		week2Data.push( if_exists(aggregation[label].weeks, (week-2).toString() ) );
	}

	var dataObject = { 	
		title: title,
		labels: labelData, 
		year: yearData , 
		week: weekData,	
		week1: week1Data,	
		week2: week2Data
	};

	return dataObject;

}



