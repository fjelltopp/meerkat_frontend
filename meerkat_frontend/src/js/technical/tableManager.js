/**:drawTable(containerID, data, no_total, linkFunction)

    Creates epi tables with data from: current week, last two weeks and the year.
    Takes the same data object as the chart drawing functions. Rather than loading JSON
    data inside the method, it is passed as arguments to the method so that JSON requests
    can be shared across multiple drawings. This is the most generic table drawing function
    called primarily from the misc.js function `categorySummation()`.

    :param string containerID: 
        The ID of the html element to hold the table.
    :param object data: 
        The data to be tabulated, built by the misc.js function `buildDataObject()`.
    :param boolean no_total: 
        Set to true if no total row should be included.
    :param string linkfunction: 
        The function name to be added "onclick" to each table row header.
        The linkfunction is given the row's variable ID as an argument (such as "gender_1"). 
        e.g. We write a function `uslessAlert( varID ){ alert(varID); }`, and set the 
        linkFunction argument to "uselessAlert" to create a link in each row header that flashes
        up the variable ID in a javascript alert dialouge.       
*/
function drawTable( containerID, data, no_total, linkFunction ){
	
	//We want to work with a clone of the data, not the data itself.
	data = $.extend(true, {}, data);

	//Initialise an array to store the summation values for the table.
	var sum=[0,0,0,0];

	var weeks = lastWeeks( get_epi_week(), 3 );	
	
	//Table headers.
	table = '<table class="table table-hover table-condensed"><tr>' +
	    '<th>' + data.title + '</th><th>' +i18n.gettext('Week') +' '+ weeks[0] + '</th>' +
	    '<th>' +i18n.gettext('Week') +' '+ weeks[1] + '</th><th>' +i18n.gettext('Week') +' '+ weeks[2] + '</th>' + 
	    '<th>' + i18n.gettext('This Year') +'</th></tr>';

	//For each data category, assemble a html string listing data for the three weeks and the year.
	for (var i =0; i< data.labels.length;i++){

		if(typeof linkFunction != 'undefined'){

			table +=	"<tr><td>"+
			         "<a href='' onclick='" + linkFunction + "(\""+ data.ids[i] +
			         "\");return false;' >" + data.labels[i]+'</a></td>';
		}else{
			table+='<tr><td>'+i18n.gettext(data.labels[i])+'</td>';
		}

		if(data.yearPerc){
		
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

		table+='</tr><tr class="info"><td>'+ i18n.gettext('Total') + '</td>';

		for (var j=0; j<sum.length; j++){
			table+="<td>"+sum[j]+"</td>";
		}
	}

	table+="</tr></table>";

	//Draw it!
	$('#'+containerID).html(table);
	
	return table;
}

/**:drawImprovedTable(containerID, data, no_total, linkFunction, tableOptions)

    Creates epi tables with data from: current week, last two weeks and the year.
    Takes the same data object as the chart drawing functions. Rather than loading JSON
    data inside the method, it is passed as arguments to the method so that JSON requests
    can be shared across multiple drawings. This is the most generic table drawing function
    called primarily from the misc.js function `categorySummation()`.

    :param string containerID: 
        The ID of the html element to hold the table.
    :param object data: 
        The data to be tabulated, built by the misc.js function `buildDataObject()`.
    :param boolean no_total: 
        Set to true if no total row should be included.
    :param string linkfunction: 
        The function name to be added "onclick" to each table row header.
        The linkfunction is given the row's variable ID as an argument (such as "gender_1"). 
        e.g. We write a function `uslessAlert( varID ){ alert(varID); }`, and set the 
        linkFunction argument to "uselessAlert" to create a link in each row header that flashes
        up the variable ID in a javascript alert dialouge.
    :param array tableOptions:
        Additional options for a table to be created.


*/
function drawImprovedTable( containerID, data, no_total, linkFunction, tableOptions){

	//We want to work with a clone of the data, not the data itself.
	data = $.extend(true, {}, data);

	//Initialise an array to store the summation values for the table.
	var sum=[0,0,0,0];

	var weeks = lastWeeks( get_epi_week(), 3 );	
	

    var columns = [
        {
            "field": "main",
            "title": data.title,
            "align": "center",
            "class": "header",
            "sorter": function commas(a,b){ a = parseInt(a.replace(/,/g, '')); b = parseInt(b.replace(/,/g, '')); if (a < b) return 1; if (a > b) return -1; return 0; },
            sortable: true,
            width : "20%",
        },{
            "field": "week0",
            "title": i18n.gettext('Week') +' '+ weeks[0],
            "align": "center",
            "class": "header",
            "sorter": function commas(a,b){ a = parseInt(a.replace(/,/g, '')); b = parseInt(b.replace(/,/g, '')); if (a < b) return 1; if (a > b) return -1; return 0; },
            sortable: true,
            width : "20%",
        },{
            "field": "week1",
            "title": i18n.gettext('Week') +' '+ weeks[1],
            "align": "center",
            "class": "header",
            "sorter": function commas(a,b){ a = parseInt(a.replace(/,/g, '')); b = parseInt(b.replace(/,/g, '')); if (a < b) return 1; if (a > b) return -1; return 0; },
            sortable: true,
            width : "20%",
        },{
            "field": "week2",
            "title": i18n.gettext('Week') +' '+ weeks[2],
            "align": "centre",
            "class": "header",
            "sorter": function commas(a,b){ a = parseInt(a.replace(/,/g, '')); b = parseInt(b.replace(/,/g, '')); if (a < b) return 1; if (a > b) return -1; return 0; },
            sortable: true,
            width : "20%",
        },{
        "field": "year",
        "title": i18n.gettext('This Year'),
        "align": "center",
        "class": "header",
        "visible":"false",
        "sorter": function commas(a,b){ a = parseInt(a.replace(/,/g, '')); b = parseInt(b.replace(/,/g, '')); if (a < b) return 1; if (a > b) return -1; return 0; },
        sortable: true,
        width : "20%"
        }
    ];

    //For each data category, assemble a listing bootstrap data variable for the three weeks and the year.
    var dataPrepared = [];
    for (var i =0; i< data.labels.length;i++){
        var mainLabel;
        var week0Label, week1Label, week2Label, yearLabel;
        if(typeof linkFunction != 'undefined'){
            mainLabel = "<a href='' onclick='" + linkFunction + "(\""+ data.ids[i] +
                "\");return false;' >" + i18n.gettext(data.labels[i])+"</a>";
        }else{
            mainLabel=i18n.gettext(data.labels[i]);
        }
        if(data.yearPerc){
            week0Label = format(data.week[i]) + " <div class='table-percent'>(" +
                data.weekPerc[i] + "%)</div>";
            week1Label = format(data.week1[i]) + " <div class='table-percent'>(" +
                data.week1Perc[i] + "%)</div>";
            week2Label = format(data.week2[i]) + " <div class='table-percent'>(" +
                data.week2Perc[i] + "%)</div>";
            yearLabel = format(data.year[i]) + " <div class='table-percent'>(" +
                data.yearPerc[i] + "%)</div>";
        }else{
            week0Label = format(data.week[i]);
            week1Label = format(data.week1[i]);
            week2Label = format(data.week2[i]);
            yearLabel = format(data.year[i]);
        }
        var datum = {
            "main": mainLabel,
            "week1": week0Label,
            "week2": week1Label,
            "week3": week2Label,
            "year": yearLabel
        };
        dataPrepared.push(datum);
        //Keep track of the sum over the data.
        sum[0]=data.week[i]+sum[0];
        sum[1]=data.week1[i]+sum[1];
        sum[2]=data.week2[i]+sum[2];
        sum[3]=data.year[i]+sum[3];
    }

    if(tableOptions.strip == "true"){
        var r = stripRows(dataPrepared);
        data = r;
    }

    //if(tableOptions.colour == "true"){
        for(var k = 0; k < columns.length; k++){
            columns[k].cellStyle = createColourCellTab(tableOptions.colour);
        }
    //}

    //Add totals
    if(!no_total){
        var tot = {
            "main":i18n.gettext('Total'),
            "week1": format(sum[0]),
            "week2": format(sum[1]),
            "week3": format(sum[2]),
            "year": format(sum[3])
        };
        dataPrepared.push(tot);
	}

    $('#'+containerID).bootstrapTable('destroy');
	  table = $('#'+containerID).bootstrapTable({
			  columns: columns,
			  data: dataPrepared,
        classes: 'table-no-bordered'
		});
	return table;
}

/**:drawAlertsTable(containerID, alerts, variables)

    Draws the table of alerts used on the Alerts tab. Lists each alert according to date
    and provides links to the individual Alert Investigation reports. Rather than loading JSON
    data inside the method, it is passed as arguments to the method so that JSON requests
    can be shared across multiple drawings. 

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param [object] alerts:
        An array of alert objects as returned by Meerkat API `/alerts`.
    :param object variables:
        An object containing details for given variable IDs, as returned by Meerkat API `/variables`.
        Specifically used to print the variable name instead of ID. 
 */
function drawAlertsTable(containerID, alerts, variables){
    
	$.getJSON( api_root+"/locations", function( locations ){

		//Create the table headers, using the central review flag from the cofiguration file.
		//Central review is a third level of alert review requested by the Jordan MOH.
		var table = '<table class="table table-hover table-condensed">' +
		            '<tr><th>' + i18n.gettext('Alert ID') + '</th><th>' + i18n.gettext('Alert') +'</th>' +
		            '<th><span class="glossary capitalised" word="region">' + i18n.gettext('Region') +' </span></th>' + 
		            '<th>Clinic</th><th>' + i18n.gettext('Date Reported') + '</th><th>' + i18n.gettext('Date Investigated') + '</th><th>' +i18n.gettext('Status') + '</th>' +
		            '</tr>';
		if(config.central_review){
			table = '<table class="table table-hover table-condensed">' +
		            '<tr><th>' + i18n.gettext('Alert ID') + '</th><th>' + i18n.gettext('Alert') + '</th>' +
		            '<th><span class="glossary capitalised" word="region">'+ i18n.gettext('Region') + '</span></th>' + 
		            '<th>Clinic</th><th>'+i18n.gettext('Date Reported')+'</th><th>'+ i18n.gettext('Date Investigated') + '</th>' +
                    '<th>'+ i18n.gettext('Central Review')+'</th><th>'+i18n.gettext('Status')+'</th></tr>';

		}
		//For each alert in the given array of alerts create the html for a row of the table.
		for( var i in alerts ){

			var alert = alerts[i].alerts;

			table += '<tr><td><a href="" onclick="loadAlert(\'' + alert.id + '\'); return false;">' + 
			         alert.id + '</a></td><td>' + i18n.gettext(variables[ alert.reason ].name) + '</td>' +
			         '<td>' + i18n.gettext(locations[locations[alert.clinic].parent_location].name) + '</td>' +
			         '<td>' + i18n.gettext(locations[alert.clinic].name) + '</td>' +
			         '<td>' + alert.date.split("T")[0] + '</td>'; 

			//Some countries(Jordan) has a central review in addition to alert_investigation
			// If the alert has been investigated (and has a central review) we display that in the table
			if(config.central_review){
				if( "links" in alerts[i] && "alert_investigation" in alerts[i].links ){
					var investigation = alerts[i].links.alert_investigation;
					var status = investigation.data.status;
					var central_review_date = "-";
					if ("central_review" in alerts[i].links){
						status = alerts[i].links.central_review.data.status;
						central_review_date = alerts[i].links.central_review.to_date.split("T")[0] ;
					}
					table += '<td>' + investigation.to_date.split("T")[0] + '</td><td>'+ central_review_date +'</td><td>' + i18n.gettext(status) + '</td></tr>';
				}else{
					table += '<td>-</td><td>-</td><td>'+i18n.gettext('Pending') +'</td></tr>';
				}
			
			}else{
				if( "links" in alerts[i] && "alert_investigation" in alerts[i].links ){
					var link = alerts[i].links.alert_investigation;
					table += '<td>' + link.to_date.split("T")[0] + '</td><td>' + i18n.gettext(link.data.status) + '</td></tr>';
				}else{
					table += '<td>-</td><td>'+i18n.gettext('Pending')+'</td></tr>';
				}
			}
		}

		table+="</table>";

		$('#'+containerID).html(table);

	});
}

/**:drawAlertAggTable(containerID, aggData, variables)

    Draws the table of alert aggregation used on the Alerts tab. Lists the number of
    alerts for each cause (e.g. Viral Meningitis) and provides links that filter the 
    alerts table (as specified by drawAlertsTable() ) by cause. Rather than loading JSON
    data inside the method, it is passed as arguments to the method so that JSON requests
    can be shared across multiple drawings. 

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param object aggData:
        An alert aggregation data object as returned by Meerkat API `/aggregate_alerts`.
    :param object variables:
        An object containing details for given variable IDs, as returned by Meerkat API `/variables`.
        Specifically used to print the variable name instead of ID. 
 */
function drawAlertAggTable( containerID, aggData, variables ){

	var table = '<table class="table table-hover table-condensed">' +
	            '<tr><th>'+i18n.gettext('Reason') + '</th><th>' + i18n.gettext('Pending') + '</th><th>' + i18n.gettext('Ongoing') +
                '</th><th>'+i18n.gettext('Confirmed') +'</th><th>' + i18n.gettext('Disregarded') + '</th><th>'+ i18n.gettext('Total') + '</th></tr>';

	//Get a list of the aggData keys without 'total'
	var reasons = Object.keys( aggData );
	reasons.splice( Object.keys( aggData ).indexOf('total'), 1 );

	var statusList = ['Pending', 'Ongoing', 'Confirmed', 'Disregarded'];
	var sum = [];
	for( var l in statusList ) sum[l] = 0;

	//Run summation and html creation for each row of the table.
	for( var i in reasons ){

		var reason = reasons[i];
		var total = 0;		
										
		table += '<tr><td><a href="" onclick="loadAlertTables(\'' + reason + '\');return false;">' + 
		         i18n.gettext(variables[reason].name) + '</a></td>';

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

/**:drawPipTable(containerID, aggData, variables)

    ??

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param number location_id:
        The ID of the location by which to filer data.
    :param string variable_id:
        ??
    :param string link_def_id_labs:
        ??
    :param string link_def_id_return:
        ??
    :param string links_variable:
        ??
 */
function drawPipTable(containerID, location_id, variable_id, link_def_id_labs, link_def_id_return, link_variable){
    
    

	$.getJSON( api_root+"/locations", function( locations ){

		//Create the table headers, using the central review flag from the cofiguration file.
		//Central review is a third level of alert review requested by the Jordan MOH.
		var table = '<table class="table table-hover table-condensed">' +
		            '<tr><th>' + i18n.gettext('NAMRU-ID') + '</th>' +
		            '<th><span class="glossary capitalised" word="region">' + i18n.gettext('Region') + '</span></th>' + 
		            '<th>' + i18n.gettext('Clinic') + '</th><th>' +i18n.gettext('Date Reported') +'</th><th>' + i18n.gettext('Follow-up completed') +'</th><th>' + i18n.gettext('Laboratory Results') + '</th><th>' + i18n.gettext('Status') +'</th>' + '</tr>';

		$.getJSON( api_root + "/records/" + variable_id + "/" + location_id, function( case_dict ){
			$.getJSON( api_root + "/links/" + link_def_id_labs, function( links_dict_labs ){
				$.getJSON( api_root + "/links/" + link_def_id_return, function( links_dict_return ){
					var cases = case_dict.records;
					var labs = links_dict_labs.links;
					var return_visits = links_dict_return.links;
                    console.log( labs );
					cases.sort( function(a, b){
						return new Date(b.date).valueOf()-new Date(a.date).valueOf();
					});

					for( var i in cases ){
						c = cases[i];
						if( link_variable in c.variables){
							var link_id = c.variables[link_variable];
							table += '<tr><td>' + link_id + '</td>' +
								'<td>' + i18n.gettext(locations[c.region].name) + '</td>' +
								'<td>' + i18n.gettext(locations[c.clinic].name) + '</td>' +
								'<td>' + c.date.split("T")[0] + '</td> ';
							link_id = link_id.toLowerCase();
							if(link_id in return_visits){
								table +=  '<td>' + return_visits[link_id].to_date.split("T")[0] + '</td>';
							}else{
								table += '<td> - </td>';
							}
							if(link_id in labs){
                                status = i18n.gettext(labs[link_id].data.status);
                                if( labs[link_id].data.status=="Positive" ){
                                    status = i18n.gettext("Type:") + " <b>" + labs[link_id].data.type + "</b>";
                                }
								table += '<td>' + labs[link_id].to_date.split("T")[0] + '</td>' +
									'<td>' + status + '</td>';
							}else{
								table += '<td> - </td> <td>'+ i18n.gettext('Pending') + '</td>';
							}

						}else{
							table += '<tr><td>-</td>' +
								'<td>' + i18n.gettext(locations[c.region].name) + '</td>' +
								'<td>' + i18n.gettext(locations[c.clinic].name) + '</td>' +
								'<td>' + c.date.split("T")[0] + '</td> ' +
								'<td> - </td> <td> - </td><td>' +i18n.gettext('Pending') +'</td>';
						}
						table += "</tr>";

					}
					
					table+="</table>";
					
					$('#'+containerID).html(table);
				});
			});
		});
	});
}

/**:drawCompletenessAggTable(containerID)

    Draws the completeness table, showing the percentage of daily registers submitted
    by clinics in each region over different time periods.

    :param string containerID:
        The ID attribute of the html element to hold the table.
 */
function drawCompletenessAggTable( containerID ){
 
	$.getJSON( api_root+"/completeness/reg_1/4", function( regionData ){
		$.getJSON( api_root+"/locations", function( locations ){	

			regionData = regionData.regions;

			var table = '<table class="table table-hover table-condensed">' +
							'<tr><th>' + i18n.gettext(capitalise(config.glossary.region)) + '</th>' + 
						//	'<th>Daily register for last 24 hours</th>' +
					'<th>'+ i18n.gettext('Daily register for last week') + '</th></tr>' ;
						//	'<th>Daily register for last year</th></tr>';

			var regions = Object.keys(regionData);

			for( var i in regions ){
				var region = regions[i];
				if( region != 1 ){
					table += '<tr><td><a href="" onclick="drawCompletenessTables(' + i18n.gettext(region) + 
								'); return false;">' + i18n.gettext(locations[region].name) + '</a></td>' +
							//	'<td>' + Math.round(regionData[region].last_day) + '%</td>' +
						'<td>' + Math.round(regionData[region].last_week) + '%</td></tr>' ;
							//	'<td>' + Math.round(regionData[region].last_year) + '%</td></tr>'; 
				}
			}
			table += '<tr class="info" ><td><a href="" onclick="drawCompletenessTables(1);' + 
								'return false;">' + i18n.gettext(locations[1].name) + '</a></td>' +
							//	'<td>' + Math.round(regionData[1].last_day) + '%</td>' +
				'<td>' + Math.round(regionData[1].last_week) + '%</td></tr>' ;
							//	'<td>' + Math.round(regionData[1].last_year) + '%</td></tr>';  

			table += '</table>';

			$( '#'+containerID ).html(table);

		});
	});
}

/**:drawCompletenessTable(containerID, regionID)

    Draws the completeness table, showing the number of case reports and daily
    registers submitted by each clinic over different time periods.

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param string regionID:
        The ID of the region by which to filter the completeness data.
 */
function drawCompletenessTable( containerID, regionID ){

	$.getJSON( api_root+"/completeness/reg_1/4", function( registerData ){
		$.getJSON( api_root+"/completeness/tot_1/4", function( caseData ){
			$.getJSON( api_root+"/locations", function( locations ){	

				registerData = registerData.clinics[regionID];
				caseData = caseData.clinics[regionID];

				var clinics = Object.keys(registerData);
				var table = '<table class="table table-hover table-condensed">' +
								'<tr><th> Clinic </th>' + 
			 	            // '<th class="fit" >Case reports<br>for last 24 hours</th>' +
							// 	'<th class="fit">Case reports<br>for last week</th>' +
							// 	'<th class="fit">Case reports<br>for last year</th>' +
						// '<th class="fit">Daily register<br>for last 24 hours</th>' +
						'<th>'+i18n.gettext('Daily registers last week')+'</th></tr>' ;
								// '<th class="fit">Daily register<br>for last year</th></tr>';

				for( var i in clinics ){

					var clinic = clinics[i];
				    if( !(clinic in caseData)){
					caseData[clinic] = {} ; 
					caseData[clinic].day = 0;
					caseData[clinic].week = 0;
					caseData[clinic].year = 0;
				    }
					table += '<tr><td>' + i18n.gettext(locations[clinic].name) + '</td>' +
								// '<td>' + Math.round(caseData[clinic].day) + '</td>' +
								// '<td>' + Math.round(caseData[clinic].week) + '</td>' + 
								// '<td>' + Math.round(caseData[clinic].year) + '</td>' +
           						//'<td>' + Math.round(registerData[clinic].day) + '</td>' +
         						'<td>' + Math.round(registerData[clinic].week) + '</td></tr>' ;
								// '<td>' + Math.round(registerData[clinic].year) + '</td></tr>'; 
		
				}
	
				table += '</table>';

				$( '#'+containerID ).html(table);

			});
		});
	});
}


/**:createColourCellTab()

   A small helper function to define shading of cells realting to value in technical table view.
*/
function createColourCellTab(optionColourTable){
    // Returns a function that colours in the cells according to their value
    function cc2(value, row, index, columns){
        if(row.main == "Total"){
            return {classes: "total-row"};
        }
        if(optionColourTable == "false"){
            return {css: {"background-color": "rgba(217, 105, 42, " + 0 +")"}};
        }else{
            if (typeof value == 'undefined'){
                return {css: {"background-color": "rgba(217, 105, 42, " + 0 +")"}};
            }
            var possibleNum = value.toString().split(' ')[0];
            var check4thousand = possibleNum.split(',');
            if(check4thousand.length == 2){
                possibleNum = check4thousand[0] + check4thousand[1];
            }

            if(isNaN(possibleNum)){
                return {css: {"background-color": "rgba(217, 105, 42, " + 0 +")"}};
            }
            if(possibleNum !== "<a"){
                var numval = value.toString().split( '\%)' )[0].split('(')[1];
                var perc = Number(numval) / 100;
                return {css: {"background-color": "rgba(217, 105, 42, " + perc +")"}};
            }
        }
    }

    return cc2;
}

/**:stripRows(data)

   A small helper function stripping rows from ones with empty records.
*/
function stripRows(data){
		//Store a list of rows to be removed.
		var remove = [];
		//For each row iterate through it's elements to seeif all are empty.
		for( var y=0; y<data.length; y++ ){
			  var row = data[y];
        //console.log("data[y =" + y + "] is " + data[y]);
			  var empty = true;
			  for( var x in row ){
            //    console.log(row[x].split(' ')[0]);
				    if( x != "main" && Number(row[x].split(' ')[0]) !== 0 ) empty = false;
			  }
			  if( empty ) {
				    remove.push(y);
			  }
		}
		for( var i = remove.length-1; i>=0; i-- ) data.splice( remove[i], 1 );

		//Remove all empty rows (starting from the last to avoid screwing up indexes).
		return data;
}
