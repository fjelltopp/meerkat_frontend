/* Creates epi tables with data from: current week, last two weeks and the year.
 * Takes the same data object as the chart drawing functions.
 * If linkFunction is defined we add the given function "onclick" to each table row.
 * If percent is positive we add percentages. 
 * If no_total is positive we do not add total
 */
function drawTable( containerID, data, percent, no_total, linkFunction ){

	//We want to work with a clone of the data, not the data itself.
	data = $.extend(true, {}, data);

	//Initialise an array to store the summation values for the table.
	var sum=[0,0,0,0];

	//Table headers.
	table = '<table class="table table-hover table-condensed"><tr>' +
	        '<th>' + data.title + '</th><th>Week ' + (get_epi_week()-1) + '</th>' +
	        '<th>Week ' + (get_epi_week()-2) + '</th><th>Week ' + (get_epi_week()-3) + '</th>' + 
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

		if(typeof linkFunction != 'undefined'){

			table +=	"<tr><td>"+
			         "<a href='' onclick='" + linkFunction + "("+ data.ids[i] +
			         ");return false;' >" + data.labels[i]+'</a></td>';
		}else{
			table+='<tr><td>'+data.labels[i]+'</td>';
		}

		if(percent){
		
			table += "<td>" + format(data.week[i]) + " <div class='table-percent'>(" + 
			                                             data.weekPerc[i] + "%)</div></td>" + 
			         "<td>" + format(data.week1[i]) + " <div class='table-percent'>(" + 
			                                             data.week1Perc[i] + "%)</div></td>" + 
			         "<td>" + format(data.week2[i]) + " <div class='table-percent'>(" + 
			                                             data.week2Perc[i] + "%)</div></td>" + 
			         "<td>" + format(data.year[i]) + " <div class='table-percent'>(" + 
			                                             data.yearPerc[i] + "%)</div></td></tr>";
		}else{

			table += "<td>" + format(data.week[i]) + "</td><td>" + 
			         format(data.week1[i]) + "</td><td>" + 
			         format(data.week2[i]) + "</td><td>" + 
			         format(data.year[i]) + "</td></tr>";
		}

		//Keep track of the sum over the data.
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
	
	return table;
}

function drawAlertsTable(containerID, alerts, variables){

	$.getJSON( api_root+"/locations", function( locations ){

		//Create the table headers, using the central review flag from the cofiguration file.
		//Central review is a third level of alert review requested by the Jordan MOH.
		var table = '<table class="table table-hover table-condensed">' +
			         '<tr><th>Alert ID</th><th>Alert</th><th>Region</th><th>Clinic</th>' + 
			         '<th>Date Reported</th><th>Date Investigated</th><th>Status</th></tr>';

		//For each alert in the given array of alerts create the html for a row of the table.
		for( var i in alerts ){

			var alert = alerts[i].alerts;

			table += '<tr><td>' + alert.id + '</td><td>' + variables[ alert.reason ].name + '</td>' +
				      '<td>' + locations[locations[alert.clinic].parent_location].name + '</td>' +
						'<td>' + locations[alert.clinic].name + '</td>' +
						'<td>' + alert.date.split("T")[0] + '</td>'; 

			//For some alerts we have no linked follow up report - so check that links is defined.
			if( typeof alerts[i].links != 'undefined' ){
				var link = alerts[i].links;
				table += '<td><a href="" onclick="loadAlert(\'' + alert.id + '\'); return false;">' + 
				link.to_date.split("T")[0] + '</a></td><td>' + link.data.status + '</td></tr>';
			}else{
				table += '<td>-</td><td>Pending</td></tr>';
			}					
		}

		table+="</table>";

		$('#'+containerID).html(table);

	});
}

function drawAlertAggTable( containerID, aggData, variables ){

	var table = '<table class="table table-hover table-condensed">' +
	            '<tr><th>Reason</th><th>Pending</th><th>Ongoing</th><th>Confirmed</th>' + 
	            '<th>Disregarded</th><th>Total</th></tr>';

	//Get a list of the aggData keys without 'total'
	var reasons = Object.keys( aggData );
	reasons.splice( Object.keys( aggData ).indexOf('total'), 1 );

	var sum = [];
	var statusList = ['Pending', 'Ongoing', 'Confirmed', 'Disregarded'];
	for( var l in statusList ) sum[l] = 0;

	//Run summation and html creation for each row of the table.
	for( var i in reasons ){

		var reason = reasons[i];
		var statuses = Object.keys( aggData[reason] );
		var total = 0;		
										
		table += '<tr><td><a href="" onclick="loadAlertTables(' + 
		            reason + ');return false;">' +
						variables[reason].name + '</a></td>';

		for( var j in statusList ){

			var value = if_exists( aggData[reason], statusList[j] );
			sum[j] += value;
			total += value;
			table += '<td>' + value + '</td>';
		} 

		table += '<td>' + total + '</td></tr>';			
	}

	//Create the total row.
	table += '<tr class="info" ><td><a href="" onclick="loadAlertTables(); return false;" >Total</td>';
	for( var k in sum ) table +=  '<td>' + sum[k] + '</td>';
	table += '<td>' + aggData.total + '</td></tr></table>';

	$( '#'+containerID ).html(table);

}


