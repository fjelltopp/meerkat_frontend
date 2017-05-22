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

    //Build the content...
    prep_row(overviewObj.contents, overviewObj.parentId, locID);

}



function prep_row(contentsObj, parentId, locID) {

    $.each(contentsObj, function(index, value) {

        // Get the inner value for the boxes by calling the APIs ...
        var apiUrl = value.api.replace("<loc_id>", locID);
        $.getJSON(api_root + apiUrl, function(data) {

            var apiValue;
            if (typeof data == 'undefined') {
                apiValue = 0;
            } else {
                apiValue = data.value;
            }

            //Append the results ...
            var htmlRow = "<div class='divTableRow'>" +
                "<div class='divTableCell'> " + value.label + "</div>" +
                "<div class='divTableCell'> " + apiValue + "</div>" +
                "</div>";

            $("#" + parentId).append(htmlRow);

        });
    });
}





//
// function html_box_builder(currentObj, locID) {
//     var overview_api_result = [];
//     var overview_api_counter = 0;
//     var html_builder = "";
//
//     //Build the header for the box ...
//     html_builder = html_builder + "<div class='col-xs-12 " + currentObj.html_class + " less-padding-col'> <div class='chartBox box' >" +
//         "<div class = 'chartBox__heading' > <p id = '#box_heading'>" + currentObj.title + "</p> </div>" +
//         "<div class = 'chartBox__content' > " +
//         "<div id = 'use-table' class = 'table' >" +
//         "<table class = 'table table-hover table-condensed'> <tbody> ";
//
//     //Build the body for the box ...
//     $.each(currentObj.contents, function(index, value) {
//         overview_api_counter = overview_api_counter + 1;
//
//         html_builder = html_builder + "<tr><td>" + value.label + "</td> <td> " + value.api + " </td> </tr>";
//
//         // Get the inner value for the boxes by calling the APIs ...
//         var apiUrl = value.api.replace("<loc_id>", locID);
//         $.getJSON(api_root + apiUrl, function(data) {
//
//             var apiValue;
//             if (typeof data == 'undefined') {
//                 apiValue = 0;
//             } else {
//                 apiValue = data.value;
//             }
//
//             //fill the array ...
//             overview_api_result.push({
//                 api_url: value.api,
//                 api_data: apiValue
//             });
//
//             //Check if the Json is ready and the data are Pushed ...
//             if (overview_api_result.length === currentObj.contents.length) {
//                 $.each(overview_api_result, function(index, value) {
//                     html_builder = html_builder.replace(value.api_url, value.api_data);
//                 });
//                 $('#div_Overview_Content').append(html_builder);
//             }
//         });
//     });
//
//     //Build the box footer ...
//     html_builder = html_builder + "</tbody> </table> </div> </div> </div> </div>";
// }
