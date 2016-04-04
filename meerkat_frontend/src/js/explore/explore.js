
//Takes two categories and collects data from the api.
//It then turns the data turns it into a two dimensional array.
//Any optional analysis (stripping records/colouring/graphing) can then be applied.
//Details for this analysis are given in the options object.
//Finally the table is drawn.
function createCrossPlot( catx, caty, options, post_function ){

	//These variable will hold all the JSON data from the api, when the AJAX requests are complete.
	var queryData, catxData, catyData;

	//Assemble the main query url according to the given options.
	var main_query_url = api_root + '/query_category/' + caty + '/' + catx;

	if( options.start_date ){
        if( !options.end_date ) options.end_date = new Date().toISOString();
		main_query_url += '/' + options.start_date + '/' + options.end_date;
	}

	main_query_url += '?use_ids=1';

	if( options.location ){
		main_query_url += '&only_loc=' + options.location;
	}

	//Create the deffered objects to be executed simultaneously.
	var deferreds = [
		$.getJSON( main_query_url, function(data) {
			queryData = data;
		}),
		$.getJSON( api_root + "/variables/" + catx, function(data) {
			catxData = data;
		}),
		$.getJSON( api_root + "/variables/" + caty, function(data) {
			catyData = data;
		})
	];

	//Run the AJAX reuqests asynchronously and act when they have all completed.
	$.when.apply( $, deferreds ).then(function() {
		//Sort out the data for the table
		if( $.isEmptyObject(queryData) ){

			console.log("Empty object");
			$('#cross-wrapper').html( 
				"Unfortunately we can't plot that table.  Please try another combination of categories." 
			);

		}else{

			//Store the variable id's for each category.
			var yKeys = Object.keys(queryData);
			var xKeys = Object.keys(queryData[yKeys[0]]);

			var colour = false;
			var strip = false;
			if( options ){
				if( options.strip ){
					strip = true;
				}
				if( options.colour == "true" ){
					colour = true;
				}
			}
			var columns = [
				{
					"field": "state",
					"checkbox": true
				},{
					"field": "cases",
					"title": "#Cases",
					"align": "left",
					"class": "header"
				},
					
			];
			
			var data = [];
            var colTotal = [];
            for( var i=0; i<= xKeys.length; i++ ) colTotal.push( 0 );

			//For each key in the y category, form the row from x category data.
			for( var y in yKeys.sort() ){
				var row ={
					"cases": timelineLink(yKeys[y],catyData[yKeys[y]].name,"y")
				};
				var rowTotal = 0;

				for( var x in xKeys ){

                    //The data point to be added...
                    datum = queryData[yKeys[y]][xKeys[x]];

                    colTotal[ x ] += datum;
					rowTotal += datum;
                    row[xKeys[x]] = datum;
				}
                row.total = rowTotal;
                colTotal[xKeys.length] += rowTotal ;
				data.push( row );		
			}
            
            totalRow = { "cases":"Total" };
            for( var col in xKeys ){
                totalRow[xKeys[col]] = colTotal[col];
            }
            totalRow.total = colTotal[xKeys.length];
            data.push( totalRow );

			// Add the rest of the columns when we know if we are colouring in the cells
			var maxMin = [];
			if(colour){
				maxMin = max_min(data);
			}
			for( var k in xKeys.sort() ){
				var column ={
					"field": xKeys[k],
					"title": timelineLink(xKeys[k],catxData[xKeys[k]].name,"x"),
					"sortable": true
					
				};
				if(colour){
					column.cellStyle= createColourCell(maxMin);
				}
				columns.push(column);
			}
			columns.push(
				{
					"field": "total",
					"title": "Total",
                    "class": "total-col",
					sortable: true
				}
			);
			if(strip){
				var r = stripData(columns, data, options.strip );
				columns = r[0];
				data = r[1];
			}
            if( colTotal[ colTotal.length-1 ] > 0 ){

			    //Draw the table
                var framework = "<div class='table-responsive' >" +
                                "<table id='cross-table' data-toolbar='#toolbar' data-show-export='true'>" + 
                                "</table></div>";

                $("#cross-wrapper").html( framework );
				if(post_function){
					$("#cross-table").on("post-body.bs.table", function (){
						post_function($("#cross-table"));
					});

						//post_function($("#cross-table")));
				}
				
			    $("#cross-table").bootstrapTable({
				    columns: columns,
				    data: data,
				    clickToSelect: true,
					uniqueId: "cases"
			    });
				
            }else{
                console.log("Empty object");
			    $('#cross-wrapper').html( 
				    "Unfortunately the table you requested has no data.  Please request a different table." 
			    );
            }    
		}
	});
}

function createColourCell(maxMin){
	// Returns a function that colours in the cells according to their value
	function cc(value, row, index){
        if(row.cases != "Total"){
		    var perc = (value-maxMin[0])/(maxMin[1]-maxMin[0]);
		    return {css: {"background-color": "rgba(217, 105, 42, " + perc +")"}};
        }
        return {classes: "total-row"};
	}
	return cc;
}

function max_min(data){
	// Returns max and min of all numbers in table
	var list = [];
	for( var r=1; r<data.length; r++ ){
		var row = data[r];
		for(var x in row){
			if( x != "cases" && x != "total" && row.cases != "Total"){
				list.push(Number(row[x]));
			}
		}
	}
	var maximum = Math.max.apply( Math, list );
	var minimum = Math.min.apply( Math, list );
	return [minimum,maximum];
}


function timelineLink(id, name, axis){
	//helper function to create links to activate the timeline
	return '<a href="#" onclick="prepareExploreTimeline(&apos;' + id +
	       '&apos;, &apos;' + axis +'&apos;);" class="cross-table-links">' + name + "</a>";
}

function createTimeline(id, cat, options){

	console.log( "Drawing timeline" );

	//These variable will hold all the JSON data from the api, when the AJAX requests are complete.
	var queryData, category, variable;

	//Assemble the main query url according to the given options.
	var main_query_url = api_root + '/query_variable/' + id + '/' + cat;
	if( options.start_date && options.end_date ){
		main_query_url += '/' + options.start_date + '/' + options.end_date;
	}
	main_query_url += '?use_ids=1';
	if( options.location ){
		main_query_url += '&only_loc=' + options.location;
	}

	//Execute multiple json requests simultaneously.
	var deferreds = [
		$.getJSON( main_query_url, function(data) {
			queryData = data;
		}),
		$.getJSON( api_root + "/variables/" + cat,  function(data) {
			category = data;
		}),
		$.getJSON( api_root + "/variable/" + id, function(data) {
			variable = data;
		})
	];

	//Run the AJAX reuqests asynchronously and act when they have all completed.
	$.when.apply( $, deferreds ).then(function() {

		var yKeys = Object.keys(queryData);
		var xKeys = Object.keys(queryData[yKeys[0]].weeks);

		var colour = false;
		var strip = false;
		if( options ){
			if( options.strip ){
				strip = true;
			}
			if( options.colour == "true" ){

				colour = true;
			}
		}
		var columns = [
            {
				"field": "state",
				"checkbox": true
			},{				
                "field": "cases",
				"title": "#Cases with "+ variable.name,
				"align": "left",
				"class": "header"
			}
		];
		var data = [];
		//For each key in the y category, form the row from x category data.
		for( var y in yKeys.sort() ){

			var datum ={
				"cases": category[yKeys[y]].name
			};
			var total = 0;
			for( var x in xKeys ){
				datum["week_" + xKeys[x]] = queryData[yKeys[y]].weeks[xKeys[x]];
				total += queryData[yKeys[y]].weeks[xKeys[x]];
			}
			datum.total = total;
			data.push( datum );		
		}
		// Sort out options
		// Add remaining columns
		var maxMin = [];
		if(colour){
			maxMin = max_min( data );
		}
		for( var k in xKeys.sort(function(a, b){return a-b;}) ){
			var column ={
				"field": "week_"+ xKeys[k],
				"title": "Week " + xKeys[k],
				"sortable": true
			};
			if(colour){
				column.cellStyle= createColourCell(maxMin);
			}
			columns.push(column);
		}
		columns.push(
			{
				"field": "total",
				"title": "Total",
				sortable: true
			}
		);
		if(strip){
			var r = stripData(columns, data, options.strip );
			columns = r[0];
			data = r[1];
		}
		//Draw!
        var framework = "<div class='table-responsive' >" +
                        "<table id='timeline-table'>" + 
                        "</table></div>";
        $("#timeline-wrapper").html( framework );
		$("#timeline-table").bootstrapTable({
			columns: columns,
			data: data,
            clickToSelect: true
		});
	});	
}



function transpose( jsTable ){
	var newTable = jsTable[0].map(function(col, i) { 
		return jsTable.map(function(row) { 
			return row[i]; 
		});
	});
	return newTable;
}

function stripData( columns, data, axis ){

	function stripRows(data){
		//Store a list of rows to be removed.
		var remove = [];
		//For each row iterate through it's elements to seeif all are empty.
		for( var y=0; y<data.length; y++ ){
			var row = data[y];
			var empty = true;
			for( var x in row ){
				if( x != "cases" && Number(row[x]) !== 0 ) empty = false;
			}
			if( empty ) {
				remove.push(y);
			}
		}
		for( var i = remove.length-1; i>=0; i-- ) data.splice( remove[i], 1 );

		//Remove all empty rows (starting from the last to avoid screwing up indexes).
		return data;
	}
	function stripColumns(columns, data){
		var columns_to_remove = [];
		for(var c in columns){
			remove = true;
			for( var d in data){
				if(c != "cases" && data[d][columns[c].field] !== 0){
					remove = false;
					break;
				}
			}
			if (remove) columns_to_remove.push(c);
		}
		for( var i = columns_to_remove.length-1; i>=0; i-- ) columns.splice( columns_to_remove[i], 1 );

		return columns;
	}

	data = stripRows(data);
	columns = stripColumns(columns, data);
	return [columns, data];

}


