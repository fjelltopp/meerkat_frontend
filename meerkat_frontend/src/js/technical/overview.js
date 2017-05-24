// This will be the main function for the over viewpage...
function build_overview_page(locID) {
    //Read the Overview page structure ...
    var overview_list = config.overview;

    $.each(overview_list, function(index, value) {
        html_box_builder(value, locID);
    });
}


function html_box_builder(overviewObj, locID) {

    //Build the box header...
    var html_builder = "<div  class='col-xs-12 " + overviewObj.html_class + " less-padding-col'> <div class='chartBox box' >" +
        "<div class = 'chartBox__heading' > <p id = '#box_heading'>" + overviewObj.title + "</p> </div>" +
        "<div class = 'chartBox__content' > " +
        "<div class='divTable'><div id ='" + overviewObj.parentId + "'  class='divTableBody' >";

    //Build the box footer ...
    html_builder = html_builder + "</div> </div> </div> </div> </div>";

    // Append the firstbox in the Overview page...
    $('#divOverviewContent').append(html_builder);

    $.each(overviewObj.contents, function(index, value) {
        //Build the content...
        //if ()
        window[value.prep_function](value, overviewObj.parentId, locID);
    });

}



function prep_row(contentsObj, parentId, locID) {

    //Generate a GUID ...
    var api_element = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });

    //Append the results ...
    var htmlRow = "<div class='divTableRow'>" +
        "<div class='divTableCell'> " + contentsObj.label + "</div>" +
        "<div class='divTableCell " + api_element + "'>Loading..</div>" +
        "</div>";

    $("#" + parentId).append(htmlRow);

    // Get the inner value for the boxes by calling the APIs ...
    var apiUrl = contentsObj.api.replace("<loc_id>", locID);
    $.getJSON(api_root + apiUrl, function(data) {

        $('#' + parentId + ' .' + api_element).html(data.value);

    });

}
