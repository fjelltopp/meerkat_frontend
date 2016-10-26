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
			table+="<td>"+format(sum[j])+"</td>";
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
            sortable: false,
            width : "40%",
        },{
            "field": "week0",
            "title": i18n.gettext('Week') +' '+ weeks[0],
            "align": "center",
            "class": "header",
            "sorter": function commas(a,b){ a = parseInt(a.replace(/,/g, '')); b = parseInt(b.replace(/,/g, '')); if (a < b) return 1; if (a > b) return -1; return 0; },
            sortable: true,
            width : "15%",
        },{
            "field": "week1",
            "title": i18n.gettext('Week') +' '+ weeks[1],
            "align": "center",
            "class": "header",
            "sorter": function commas(a,b){ a = parseInt(a.replace(/,/g, '')); b = parseInt(b.replace(/,/g, '')); if (a < b) return 1; if (a > b) return -1; return 0; },
            sortable: true,
            width : "15%",
        },{
            "field": "week2",
            "title": i18n.gettext('Week') +' '+ weeks[2],
            "align": "center",
            "class": "header",
            "sorter": function commas(a,b){ a = parseInt(a.replace(/,/g, '')); b = parseInt(b.replace(/,/g, '')); if (a < b) return 1; if (a > b) return -1; return 0; },
            sortable: true,
            width : "15%",
        },{
        "field": "year",
        "title": i18n.gettext('This Year'),
        "align": "center",
        "class": "header",
        "visible":"false",
        "sorter": function commas(a,b){ a = parseInt(a.replace(/,/g, '')); b = parseInt(b.replace(/,/g, '')); if (a < b) return 1; if (a > b) return -1; return 0; },
        sortable: true,
        width : "15%"
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
            "week0": week0Label,
            "week1": week1Label,
            "week2": week2Label,
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
            "week0": format(sum[0]),
            "week1": format(sum[1]),
            "week2": format(sum[2]),
            "year": format(sum[3])
        };
        dataPrepared.push(tot);
    }
    //$('#' + containerID ).append('<table class="table"></table>');
    $('#' + containerID + ' table').bootstrapTable('destroy');
    $('#' + containerID + ' table').remove();
    $('#' + containerID ).append('<table class="table"></table>');
	table = $('#' + containerID + ' table').bootstrapTable({
        columns: columns,
        data: dataPrepared,
        classes: 'table-no-bordered table-hover'
    });
	return table;
}


/**:drawAlertsTable(containerID, alerts, variables)

    Draws the table options buttons for tables in the dashboard created using bootstrap tables.
    These options allow you to colour the cells according to their value and to strip empty records.

    :param string tableID:
        The ID attribute of the html element to hold the table assoiated with the buttons.
 */
function drawOptionsButtons(tableID, redrawFunctionName){

    var html = "<div class='table-options'>";
    
    html += "<span class='glyphicon glyphicon-resize-small " + tableID  + "-option pull-right' " + 
        "id='strip-button' onClick='callTableOptionButton(this,\"" + redrawFunctionName + "\");' "+
        "title='" + i18n.gettext('Hide/show empty records')+
        "' table='disease-table' value=false name='strip'></span>";

    html += "<span class='glyphicon glyphicon-pencil " + tableID  + "-option pull-right' " +
            " id='colour-button' onClick='callTableOptionButton(this,\"" + redrawFunctionName + "\");'"+
            " title='" + i18n.gettext('Colour the table') +
            "' table='disease-table' value=false name='colour'></span>";

    html += "</div>";
    
    $('#' + tableID ).attr( "style","padding-top: 28px" );
    $('#' + tableID ).prepend( html );
}

//Function that updates table option button's values.
function callTableOptionButton(element, redrawFunctionName){
    var value = $(element).attr("value");
    $(element).attr("value", value=="true" ? "false" : "true" );

    //If the option called is strip rows, we want to swap between two glyph icons.
    if( $(element).attr("name") == "strip" ){
        $(element).toggleClass("glyphicon-resize-small");
        $(element).toggleClass("glyphicon-resize-full");   
    }  

    //Check that the redraw function exists, if it does, call it.
    var fn = window[redrawFunctionName];
    if(typeof fn === 'function') {
        fn();
    }
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
		            '<th>Clinic</th><th>' + i18n.gettext('Date Reported') + '</th><th>' + i18n.gettext('Type') + '</th><th>'+ i18n.gettext('Date Investigated') + '</th><th>' +i18n.gettext('Status') + '</th>' +
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
			alert = alerts[i];
			table += '<tr><td><a href="" onclick="loadAlert(\'' + alert.variables.alert_id + '\'); return false;">' + 
			         alert.variables.alert_id + '</a></td><td>' + i18n.gettext(variables[ alert.variables.alert_reason ].name) + '</td>' +
			         '<td>' + i18n.gettext(locations[locations[alert.clinic].parent_location].name) + '</td>' +
			    '<td>' + i18n.gettext(locations[alert.clinic].name) + '</td>' +

			'<td>' + alert.date.split("T")[0] + '</td>' + 
				'<td>' + i18n.gettext(alert.variables.alert_type) + '</td>';

			//Some countries(Jordan) has a central review in addition to alert_investigation
			// If the alert has been investigated (and has a central review) we display that in the table
			if(config.central_review){
				if( "ale_1" in alert.variables ){
					if ("ale_2" in alert.variables){
						status = i18n.gettext("Ongoing");
					}else if( "ale_3" in alert.variables){
						status = i18n.gettext("Disregarded");
					} else {
						status = i18n.gettext("Ongoing");
					}
					var central_review_date = "-";
					if ("cre_1" in alert.variables){
						if ("cre_2" in alert.variables){
							status = i18n.gettext("Confirmed");
						}else if( "cre_3" in alert.variables){
							status = i18n.gettext("Disregarded");
						}else {
							status = i18n.gettext("Ongoing");
						}
						central_review_date = alert.variables.cre_1.split("T")[0] ;
					}
					table += '<td>' + alert.variables.ale_1.split("T")[0] + '</td><td>'+ central_review_date +'</td><td>' + status + '</td></tr>';
				}else{
					table += '<td>-</td><td>-</td><td>'+i18n.gettext('Pending') +'</td></tr>';
				}
			
			}else{
				if("ale_1" in  alert.variables ){
					if ("ale_2" in alert.variables){
						status = i18n.gettext("Confirmed");
					}else if("ale_3" in alert.variables){
						status = i18n.gettext("Disregarded");
					} else {
						status = i18n.gettext("Ongoing");
					}
					table += '<td>' + alert.variables.ale_1.split("T")[0] + '</td><td>' + status + '</td></tr>';
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
				var cases = case_dict.records;
				cases.sort( function(a, b){
						return new Date(b.date).valueOf()-new Date(a.date).valueOf();
				});

				for( var i in cases ){
					c = cases[i];
					table += '<tr><td>' + c.variables.pip_1 + '</td>' +
								'<td>' + i18n.gettext(locations[c.region].name) + '</td>' +
								'<td>' + i18n.gettext(locations[c.clinic].name) + '</td>' +
								'<td>' + c.date.split("T")[0] + '</td> ';
					if("pif_1" in c.variables){
						table +=  '<td>' + c.variables.pif_2.split("T")[0] + '</td>';
					}else{
						table += '<td> - </td>';
					}
					if("pil_1" in c.variables){
                        if ("pil_2" in c.variables) {
                           status = i18n.gettext("Positive");
                           if("pil_4" in c.variables) {
                              type = i18n.gettext("H3");
                           } else if ("pil_5" in c.variables){
                                type = i18n.gettext("H1N1");
                           }else if ("pil_6" in c.variables){
                                type = i18n.gettext("B");
                           }else if ("pil_7" in c.variables){
                                type = i18n.gettext("Mixed");
                           }


                          status = i18n.gettext("Type:") + " <b>" + type + "</b>";
                        } else {
                            status = i18n.gettext("Negative");
                        }
                               
						table += '<td>' + c.variables.pil_1.split("T")[0] + '</td>' +
								'<td>' + status + '</td>';
					}else{
							table += '<td> - </td> <td>'+ i18n.gettext('Pending') + '</td>';
					}
                 }
				table+="</table>";
				
			$('#'+containerID).html(table);
		});
	});
}

/**:drawPipTable(containerID, aggData, variables)

    ??

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param number location_id:
        The ID of the location by which to filer data.

 */
function drawTbTable(containerID, location_id){
	$.getJSON( api_root+"/locations", function( locations ){

		//Create the table headers, using the central review flag from the cofiguration file.



		columns = [
			{
				field: "sample_id",
				title:  i18n.gettext('Sample ID'),
				'searchable': true
			},
			{
				field: "region",
				title: '<span class="glossary capitalised" word="region">' + i18n.gettext('Governorate') + '</span>',
				'searchable': true
			},
			{
				field: "clinic", 
				title: i18n.gettext('Centre'),
				'searchable': true
			},
			{
				field: "initial_visit",
				title: i18n.gettext('Centre Visit Date')
			},
			{
				field: "lab",
				title: i18n.gettext('Labratory Results Date')
			},
			{
				field: "cxr",
				title: i18n.gettext('Chest X-Ray')
			},
			{
				field: "hiv",
				title: i18n.gettext('HIV Result')
			},
			{
				field: "hep_b",
				title: i18n.gettext('Hepatitis B Result') 
			}
       ];

		$.getJSON( api_root + "/records/tub_1/" + location_id, function( case_dict ){
				var cases = case_dict.records;
				cases.sort( function(a, b){
						return new Date(b.date).valueOf()-new Date(a.date).valueOf();
				});

                var data = [];

				for( var i in cases ){
					c = cases[i];

                    var datum = {
                              sample_id: c.variables.tub_2,
                              region: i18n.gettext(locations[c.region].name),
                              clinic: i18n.gettext(locations[c.clinic].name),
                              initial_visit: c.date.split("T")[0],
                              follow_up: "-",
                              cxr: "-",
                              lab: "-",
                              hiv: "-",
                              hep_b: "-"
                           };

					if("tbr_1" in c.variables){
                        if( "tbr_2" in c.variables){
							datum.cxr = i18n.gettext('Positive');
                        } else {
							datum.cxr = i18n.gettext('Negative');
                        }
					}
					if("tbl_1" in c.variables){
                        datum.lab = c.variables.tbl_1.split("T")[0];
						if( "tbl_2" in c.variables){
							datum.hiv = i18n.gettext('Positive');
                        } else {
							datum.hiv = i18n.gettext('Negative');
                        }
						if( "tbl_3" in c.variables){
							datum.hep_b = i18n.gettext('Positive');
                        } else {
							datum.hep_b = i18n.gettext('Negative');
                        }
					}
					data.push(datum);
               }
            $('#' + containerID).html("<table> </table>");
			$('#' + containerID + ' table').bootstrapTable(
				{
					columns: columns,
					data: data,
					search: true
//					pagination: true,
//					pageSize: 20
				});
		});
	});
}




/**:drawAllClincsCompleteness(containerID, regionID)

 Draws the completeness table, showing the percentage of daily registers submitted
 by clinics in each region over last period (2 weeks)

 :param string containerid:
 the id attribute of the html element to hold the table.
 :param int regionID:
 All clinics in this region (and its subregions) will be included in that table
 the id of the region from w.hich all clinics will 
    :param Object locations:
        List of all locations from API.
    :param Object data:
        Completeness data from API.
 */

function drawAllClinicsCompleteness( containerID, regionID, locations, data ){

        // console.log(locations);
        // console.log(locations[regionID]);
        // if (locations[regionID].level === "clinic")
        //     return 0;//that should happen on data agregation level

        var scoreKeys = Object.keys(data.clinic_score);
        var dataPrepared = [];
        var index = 0;
        for (var i=0; i<scoreKeys.length;i++){
            index = scoreKeys[i];
            var datum = {
                "location": locations[index].name,
                "completeness": Number(data.clinic_score[index]).toFixed(0) + "%"
            };
            dataPrepared.push(datum);
        }


        var columns = [
            {
                "field": "location",
                "title": "Clinic",
                "align": "center",
                "class": "header",
                sortable: true,
                width : "50%"
            },{
                "field": "completeness",
                "title": "Completeness",
                "align": "center",
                "class": "header",
                sortable: true,
                "sorter": function percs(a,b){a = Number(a.split('%')[0]); 
                                              b = Number(b.split('%')[0]);
                                              if(a < b) return 1; if (a>b) return -1; return 0;},
                width : "50%"
            }];

        for(var k = 0; k < columns.length; k++){
            columns[k].cellStyle = createCompletenessCellTab();
        }

        $('#' + containerID + ' table').bootstrapTable('destroy');
        $('#' + containerID + ' table').remove();
        $('#' + containerID ).append('<table class="table"></table>');
	      var table = $('#' + containerID + ' table').bootstrapTable({
            columns: columns,
            data: dataPrepared,
            classes: 'table-no-bordered table-hover',
            sortName: 'completeness',
            sortOrder: 'desc'
        });
	      return table;
}

/**:drawMissingCompletenessTable( containerID, regionID)
 Displays list of clinics in given subregion which haven't reported in the last two weeks. If the specified region is a clinic, then dates when registers are not submitted are listed.

 :param string containerID:
 the id attribute of the html element to hold the table.
 :param int regionID:
  Current region or clinic ID
    :param Object locations:
        List of all locations from API.


 */

function drawMissingCompletenessTable( module_var, containerID, headerID, regionID, locations ){
    // console.log('We are in the region: ' + regionID);
    // console.log(locations[regionID]);

        // console.log("Reading in data from API:");
        // console.log(data);

        // console.log("Score:");
        // console.log(data.score);
        var dataPrepared = [];
        var columns = [];
        var datum = [];
        if(locations[regionID].level != "clinic"){//no information aboout reporting clinic
			$.getJSON( api_root+"/non_reporting/" + module_var + "/" + regionID, function( data ){
				for (var i=0; i<data.clinics.length;i++){
					datum = {
						"location": locations[data.clinics[i]].name
					};
					dataPrepared.push(datum);
				}


				$(headerID).html(i18n.gettext('Clinics not reporting'));
				columns = [
					{
						"field": "location",
						"title": "Location",
						"align": "center",
						"class": "header",
						sortable: true,
						width : "100%"
					}];
				$('#' + containerID + ' table').bootstrapTable('destroy');
				$('#' + containerID + ' table').remove();
				$('#' + containerID ).append('<table class="table"></table>');
				var table = $('#' + containerID + ' table').bootstrapTable({
					columns: columns,
					data: dataPrepared,
					classes: 'table-no-bordered table-hover'
				});
				return table;
				
			});
        }else{
			$.getJSON( api_root+"/completeness/reg_1/" + regionID + "/4", function( data ){
            for (var j=0; j<data.dates_not_reported.length;j++){
                strDat = data.dates_not_reported[j];
                    datum = {
                        "date": strDat.split('T')[0]
                    };
                    dataPrepared.push(datum);
                }
			$(headerID).html(i18n.gettext('Dates not reported'));
            columns = [
                {
                    "field": "date",
                    "align": "center",
                    "class": "header",
                    sortable: true,
                    width : "100%"
                }];
				$('#' + containerID + ' table').bootstrapTable('destroy');
				$('#' + containerID + ' table').remove();
				$('#' + containerID ).append('<table class="table"></table>');
				var table = $('#' + containerID + ' table').bootstrapTable({
					columns: columns,
					data: dataPrepared,
					classes: 'table-no-bordered table-hover'
				});
				return table;

			});
		}




}
/**:drawCompletenessTable(containerID, regionID)

    Draws the completeness table, showing the number of case reports and daily
    registers submitted by each clinic over different time periods.

 :param string containerID:
        The ID attribute of the html element to hold the table.
    :param string regionID:
        The ID of the region by which to filter the completeness data.
    :param Object locations:
        List of all locations from API.
    :param Object data:
        Completeness data from API.
 */

function drawCompletenessTable( containerID, regionID, locations, data ){
        var dataPrepared = [];
        var scoreKeys = Object.keys(data.score);
        var parentLocation  = regionID; //locations[scoreKeys[0]].name; //string containg parentLocation name
        var index = 0;
        for (var i=0; i<scoreKeys.length;i++){
            index = scoreKeys[i];
            var loc;
                // loc = "<a href='' onclick='loadLocationContent(" + index +
            //     ");return false;' >" + i18n.gettext(locations[index].name)+"</a>";
            loc = locations[index].name;
            var datum = {
				"id": index,
                "location": loc,
                "completeness": Number(data.score[index]).toFixed(0) + "%"
            };
            dataPrepared.push(datum);
        }

        var columns = [
            {
                "field": "location",
                "title": "Location",
                "align": "center",
                "class": "header",
                sortable: true,
                width : "70%"
            },{
                "field": "completeness",
                "title": "Completeness",
                "align": "center",
                "class": "header",
                sortable: true,
                "sorter": function percs(a,b){a = Number(a.split('%')[0]); 
                                              b = Number(b.split('%')[0]);
                                              if(a < b) return 1; if (a>b) return -1; return 0;},
                width : "30%"
            }];

        for(var k = 0; k < columns.length; k++){
            columns[k].cellStyle = createCompletenessCellTab(parentLocation);
        }

        $('#' + containerID + ' table').bootstrapTable('destroy');
        $('#' + containerID + ' table').remove();
        $('#' + containerID ).append('<table class="table"></table>');
	      var table = $('#' + containerID + ' table').bootstrapTable({
            columns: columns,
              data: dataPrepared,
			  idField: "id",
              classes: 'table-no-bordered table-hover',
              sortName: 'completeness',
              sortOrder: 'desc'
          });
	      return table;

}

function createCompletenessCellTab(parentLocationRowID){
    // Returns a function that colours in the cells according to their value
    function cc2(value, row, index, columns){
        var valueStripped = value.split('%')[0];
        var par = false;
        if (typeof valueStripped == 'undefined'){
            return {css: {"color": "rgba(0, 0, 0, 1)"}};
        }
        if (row.id == parentLocationRowID){
            par = true;
        }
        if (typeof parentLocationRowID == 'undefined'){
            par = false;
        }
        if(isNaN(valueStripped)){
            if(par){
                return {css: {"font-weight": "bold","background-color": "rgba(0, 144, 202, 0.6)"}};
            }
            return {css: {"color": "rgba(0, 0, 0, 1)"}};
        }
        if(valueStripped < 50){//red
            if(par){
                return {css: {"color": "rgba(255, 0, 0, 1)", "font-weight": "bold","background-color":"rgba(0, 144, 202, 0.6)"}};
            }
            return {css: {"color": "rgba(255, 0, 0, 1)", "font-weight": "bold"}};
        }
        if(valueStripped < 80){//yellow
            if(par){
                return {css: {"color": "rgba(128, 128, 0, 1)", "font-weight": "bold","background-color":"rgba(0, 144, 202, 0.6)"}};
            }
            return {css: {"color": "rgba(128, 128, 0, 1)", "font-weight": "bold"}};
        }
        if(par){
            return {css: {"color": "rgba(0, 128, 0, 1)", "font-weight": "bold","background-color":"rgba(0, 144, 202, 0.6)"}};
        }
        return {css: {"color": "rgba(0, 128, 0, 1)", "font-weight": "bold"}};
    }

    return cc2;
}

/**:createColourCellTab()

   A small helper function to define shading of cells realting to value in technical table view.
*/
function createColourCellTab(optionColourTable){
    // Returns a function that colours in the cells according to their value
    function cc2(value, row, index, columns){
        if(row.main == "Total"){
            return {classes: "info"};
        }
        if(optionColourTable == "true"){
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
        }else{
            return {css: {"background-color": "rgba(217, 105, 42, " + 0 +")"}};
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
