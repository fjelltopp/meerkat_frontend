
// This will be the main function for the over viewpage...
function build_overview_page(locID) {
    //Read the Overview page structure ...
    var overview_list = config.overview;

    //Create the Html for the boxes ...
    var html_builder = "";

    $.each(overview_list, function(index, value) {
        html_builder = html_builder + html_box_builder(value,locID);
    });

    //Inject the HTML ...
    $('#div_Overview_Content').append(html_builder);
}

function html_box_builder(currentObj, locID) {
    //Build the header for the box ...
    var html_box = "<div class='col-xs-12 " +  currentObj.html_class + " less-padding-col'> <div class='chartBox box' >" +
        "<div class = 'chartBox__heading' > <p id = '#box_heading'>" + currentObj.title + "</p> </div>" +
        "<div class = 'chartBox__content' > " +
        "<div id = 'use-table' class = 'table' >" +
        "<table class = 'table table-hover table-condensed' > <tbody> ";

    //Build the body for the box ...
    $.each(currentObj.contents, function(index, value) {

        // Get the inner value for the boxes by calling the APIs ...
        $.getJSON( api_root + value.api, function(data ){
            var apiValue;
            if(typeof api_result == 'undefined'){
                apiValue = 0;
            } else {
                apiValue = api_result.value;
            }
            //TODO: Prepare and draw html.
            //html_box = html_box + "<tr> <th scope = 'row' colspan = '2' >" + value.label + "</th> </tr>";
            //html_box = html_box + "<tr><td>" + value.label + "</td> <td>" + apiValue + "</td> </tr>";
        })
    });

    //Build the box footer ...
    html_box = html_box + "</tbody> </table> </div> </div> </div> </div>";
    return html_box;
}
