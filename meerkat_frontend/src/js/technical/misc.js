
/**:get_epi_week()

    Returns the current epi week. This value was initially calulated client-side, but now simply
    returns the value of a global variable that is set by data passed to the Jinja2 template from
    the server. The epi week is served by Meerkat API as it is calulated differently for each country.
    Keeping the function means that any referencing code didn’t have to be re-written.

    :returns:
        (number) The current epi week.

*/
function get_epi_week(){
    return week;
}

/**:get_date()

    Get the current date in text format.

    :returns:
        (string) the current date in text format: "DD Month YYYY".
*/  
function get_date(){

    date=new Date();
    var monthNames = [ i18n.gettext("January"), i18n.gettext("February"), i18n.gettext("March"), i18n.gettext("April"), 
                       i18n.gettext("May"), i18n.gettext("June"), i18n.gettext("July"), i18n.gettext("August"), i18n.gettext("September"), 
                       i18n.gettext("October"), i18n.gettext("November"), i18n.gettext("December") ];

    return date.getDate()+" "+monthNames[date.getMonth()]+" "+date.getFullYear();
}

 
//Format a number with commas separating the thousands.
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

//Returns the value if the key exists in vari, returns zero if it doesn't. 
function if_exists(vari,key){

    if ($.inArray(key,Object.keys(vari)) != -1 || $.inArray(key.toString(),Object.keys(vari)) != -1 ){
        return vari[key];
    }else{
        return 0;
    }

}

//For the sliding location selector...
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

/** idSort(a, b)
   Sorts variable ids on the number

**/
 
function idSort(a,b){
            return parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]); 
}
//Capitalises the first character of a string.
function capitalise( string ){
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**:lastWeeks( week, n )
    
    Gets the last n week numbers in an array, taking into account the change over between years. 

    :param number week:
        The week from which to calulate previous weeks.
    :param number n:
        The number of previous week numbers to get, including the specified week number.

    :returns:
        An array of week numbers formed as such: [week, week-1, week-2, ..., week-n]
*/
function lastWeeks( week, n ){

    var weeks = [];

    for( var i = 0; i<n; i++ ){
        if( week-i <= 0 ) weeks[i] = week-i+52;
        else weeks[i] = week-i;
    }

    return weeks;
}

/**:makeDataObject( aggregation, variables, week, title, percent )
    
    This function takes data structure churned out by Meerkat API and turns it into a structure
    that is recognised by multiple chart drawing and table drawing functions in the technical component
    Javascript. It allows multiple charts and tables that share the same data, to share the same api calls. 

    :param object aggregation:
        The aggregation data returned by Meerkat API upon calling `/aggregate_category`.
    :param object variables:
        The variables object returned by Meerkat API upon calling `/variables` Used to get details for
        variable IDs used in the aggregation object.
    :param number week:
        The week for which the data object should be made.  Data is stored in the data object for this
        given week and the previous two weeks as well as the current yearly total. 
    :param string title:
        The title that should be given to the data.  Used when constructing tables and charts. 
    :param object percent:
        An object giving the denominators to be used in calculating the percentages. The object should 
        include the following properties:

        * **year** - the denominator used to calulate the percentage for the year total.
        * **weeks** - an array specifying the denominators to be used for calulating each week's percentage.
          The 0th element is the current week and the 2nd element is the previous-but-one week. 

        **Can also be boolean:** if true, percentages are auto- calculated from the category distribution. 

    :returns:
        The structured data object with the following properties:

        * **title** (string) - The title given to the data.
        * **labels** ([string]) - An array of the "names" or "labels" associated with each variable ID.
        * **ids** ([string]) - An array of the variable IDs.
        * **year** ([number]) - An array of yearly totals for each variable.
        * **week** ([number]) - An array of the totals for each variable during the specified week.
        * **week1** ([number]) - An array of the totals for each variable during the previous week.
        * **week2** ([number]) - An array of the totals for each variable during the previous-but-one week.
        
        And optionally:

        * **percYear** ([number]) - An array of yearly percentages for each variable. 
        * **percWeek** ([number]) - An array of percentages for each variable during the specified week.
        * **percWeek1** ([number]) - An array of percentages for each variable during the previous week.
        * **percWeek2** ([number]) - An array of percentages for each variable during the previous-but-one week.
 */
function makeDataObject( aggregation, variables, week, title, percent ){

    var bins = Object.keys(aggregation);
    bins = bins.sort(idSort);
    //Create an array of everything we have to collate over each data bin.
    //E.g. For gender labels we create a list made up of 'Male' and 'Female'.
    var data = {     
        title: i18n.gettext(title),
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

        data.labels.push( i18n.gettext(variables[label].name) );
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

/**:categorySummation( details )

    This function factorises out repeated code when drawing tables and charts for category aggregations.
    It also helps to share data from AJAX calls where possible, rather than making multiple replicated
    AJAX calls for tables, bar charts and pie charts. The function manages the turn over
    of years, by combining data from the previous year into the current year if necessary. In general,
    when aggregating over a category, you should display the results using this function. All the 
    parameters are specified in a details object. 

    :param object details:
        The details object can have the following properties:
        
        * **category** - (String) The ID (from Meerkat Abacus) of the category to be summarised.
        * **locID** - (String) The ID of the location by which to filter the day.
        * **week** - (number) The epi week for which the summary should take place.
        * **percent** - (boolean OR string) If true, percentages are shown in the chart and table.
          If this is a string, each datum percentage will represent the percentage of a yearly 
          total, rather than the category total.  The denominator used to calulate the percentage
          will be taken as the yearly total of the variable specified by the string.  
        * **strip** - (boolean) If true, remove all empty records from the summary (i.e. all rows
          that have just 0 for each column). 
        * **title** - (string) The title for the table/chart.
        * **barID** - (string) The ID for the HTML element that will hold the bar chart.  If empty, 
          no bar chart is drawn.
        * **pieID** - (string) The ID for the HTML element that will hold the pie charts.  If empty, 
          no pie charts are drawn.
        * **tableID** - (string) The ID for the HTML element that will hold the table. If empty, 
          no table will be drawn.  
        * **no_total** - (boolean) If true, no total row will be drawn in the table.
        * **link_function** - The function name to be added "onclick" to each table row header. See 
          the docs for `drawTable()` from the file *tableManager.js* for more information. 
        * **table_options** - (json) An options object for drawing a bootstrap table, if this isn't
          supplied then a standard table is drawn. 
        * **limit_to** - (string) An optional argument to limit results to a specific category: 'ncd', 'cd'. 

*/
function categorySummation( details ){ 

    //These variable will hold all the JSON data from the api, when the AJAX requests are complete.
    var catData, variables, percentDenom, prevData, prevPercentDenom;

    //Calulate the previous year, so we can load data from the previous year if needed.
    var prevYear = new Date().getFullYear()-1;
    var currYear = new Date().getFullYear();
    var url;

    //Optional filtering of the aggregation result by limiting to an additional category
    var limit_to_postfix = "";
	
    if(details.limit_to){
        limit_to_postfix = "/" + details.limit_to;
	}
    //Assemble an array of AJAX calls 
    var deferreds = [
        $.getJSON( api_root + "/aggregate_category/" + details.category + "/" + details.locID + "/" + currYear + limit_to_postfix, function(data) {
            catData = data;
        }),
        $.getJSON( api_root + "/variables/" + details.category, function(data) {
            variables = data;
        })
    ];

    //Get previous year's data if still in the first few weeks of the year.
    if( details.week <= 3 ){
    
        url = api_root+"/aggregate_category/"+ details.category + "/" + details.locID + "/" + prevYear + limit_to_postfix;
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
            if( details.tableID && !details.table_options ){ 
                drawTable( details.tableID, dataObject, details.no_total, details.linkFunction );
            }
            if( details.tableID && details.table_options ){
                drawImprovedTable( details.tableID, 
                                   dataObject, 
                                   details.no_total, 
                                   details.linkFunction, 
                                   details.table_options );
            }
        }else {
            //Failed
            console.error( "Ajax request for the category aggregation and variable information failed.");
        }
    });
}

/**:htmlDecode(input)

    Converts a string with html unicode substrings to a fromat that
    can be displayed in javascript and svg tags.  Used when printing 
    api results directly to a svg tag, to ensure names display properly.
    NOTE: Hacky? Is there a better way of doing this?

    :param string input:
        The string that may contain html UTF-8 codes. 

    :returns:
        The reformatted string with out HTML UTF-8 codes.  
*/
function htmlDecode(input){
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.childNodes[0].nodeValue;
}

/**:exportTableToCSV(tableID, filename, link)

    Exports a html table to CSV format.  Used to create the download table buttons in the
    technical dashboard. 

    :param string tableID:
        The ID of the HTML table element to be exported.
    :param string filename:
        The file name of the CSV file to be downloaded.
    :param string link:
        The HTML link element which, upon a click, should make the table available to download.
        This function is usually called from within the HTML link element using "onclick=" so 
        "this" will usually suffice here. 
*/
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

//Function to get the intersect of two arrays.
function getIntersect( arr1, arr2 ){

    var r = [], o = {}, l = arr2.length, i, v;

    for (i = 0; i < l; i++) {
        o[arr2[i]] = true;
    }

    l = arr1.length;

    for (i = 0; i < l; i++) {

        v = arr1[i];

        if (v in o) {
            r.push(v);
        }
    }
    return r;
}

function getDifference( arr1, arr2 ){
    return arr1.filter( function(x) { 
        return arr2.indexOf(x) < 0; 
    });
}
  

/**:stripEmptyRecords( dataObject )

    Strips records from a data object that are empy - i.e. rows that are zero in all columns.
    
    :param object dataObject:
        A data object as built by the **misc.js** function `makeDataObject()`.

    :returns:
        The dataObject stripped of its empty records.
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


/**:completnessPreparation( details )

   This function factorises out repeated code when drawing tables and charts for completness.
   It also helps to share data from AJAX calls where possible, rather than making multiple replicated
   AJAX calls for tables and charts.

   Arguments:
   :param string locID:
   The ID of the location for which completeness shall be calculated.
   :param string reg_id:
   type of a non reporting registers. Can be `reg_10` for CD, `reg_11`  for NCD.
   :param string graphID:
   The ID for the HTML element that will hold the line chart.  If empty, no chart is drawn.
   :param string tableID:
   The ID for the HTML element that will hold the main completeness table.  If empty, no table is drawn.
   :param string nonreportingtableID:
   The ID for the HTML element that will hold the line table of non-reporting clinics.  If empty, this table isn't drawn.
   :param string nonreportingTitle:
   The ID for the HTML element containg title of the non-reporting clinics table.
   :param string allclinisctableID:
   The ID for the HTML element that will hold the table for all clnics completeness information.  If empty, this table isn't drawn.
   */
function completenessPreparation( locID, reg_id, graphID, tableID, nonreportingtableID, nonreportingTitle, allclinisctableID, start_week){
    var completenessLocations;
    var completenessData; 
    var deferreds = [
        $.getJSON( api_root+"/locations", function( data ){
            completenessLocations = data;
        }),
        $.getJSON( api_root+"/completeness/" +reg_id +"/" + locID + "/4", function( data ){
            completenessData = data;
        })
    ];

    $.when.apply( $, deferreds ).then(function() {


        drawCompletenessGraph( graphID, locID, completenessLocations, completenessData, start_week, 0 );
        drawCompletenessTable( tableID, locID, completenessLocations, completenessData );
        drawMissingCompletenessTable( reg_id, nonreportingtableID,nonreportingTitle, locID, completenessLocations); //this call makes one additional AJAX call
        drawAllClinicsCompleteness( allclinisctableID, locID, completenessLocations, completenessData);
    } );
}

/**:timelinessPreparation( details )

   This function factorises out repeated code when drawing tables and charts for reporting timeliness.
   It also helps to share data from AJAX calls where possible, rather than making multiple replicated
   AJAX calls for tables and charts.

   Arguments:
   :param string locID:
   The ID of the location for which timeliness shall be calculated.
   :param string reg_id:
   type of a non reporting registers. It should be `reg_5` for general timeliness
   :param string graphID:
   The ID for the HTML element that will hold the line chart.  If empty, no chart is drawn.
   :param string tableID:
   The ID for the HTML element that will hold the main timeliness table.  If empty, no table is drawn.
   :param string allclinisctableID:
   The ID for the HTML element that will hold the table for all clnics timeliness information.  If empty, this table isn't drawn.
   */
function timelinessPreparation( locID, reg_id, graphID, tableID, allclinisctableID, start_week){
    var timelinessLocations;
    var timelinessData; 
    var deferreds = [
        $.getJSON( api_root+"/locations", function( data ){
            timelinessLocations = data;
        }),
        $.getJSON( api_root+"/completeness/" +reg_id +"/" + locID + "/5", function( data ){
            timelinessData = data;
        })
    ];

    if(reg_id === "reg_5"){

    $.when.apply( $, deferreds ).then(function() {

        drawCompletenessGraph( graphID, locID, timelinessLocations, timelinessData, start_week, 1 );
        drawCompletenessTable( tableID, locID, timelinessLocations, timelinessData );
        drawAllClinicsCompleteness( allclinisctableID, locID, timelinessLocations, timelinessData);
    } );
    }else{
        console.log("Invalid call to timeliness. Varabile \"reg_5\" expected, provided \"" + reg_id + "\"" );
    }
}
