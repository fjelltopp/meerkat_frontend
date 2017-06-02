//Global Variable ...
ovPeriodType = 'weeks'; //  "year or weeks" Read from the config..

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
        window[value.prep_function](value, overviewObj.parentId, locID);
    });

}


function prep_row(contentsObj, parentId, locID) {
    if (IsUserAthorized(contentsObj.access) === true) {

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
}


function prep_row_draw_top(contentsObj, parentId, locID) {
    if (IsUserAthorized(contentsObj.access) === true) {

        //Generate a GUID ...
        var api_element = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });

        //Append the results ...
        var htmlRow = "<div class='divTableRow'>" +
            "<div class='divTableCell'> " + contentsObj.label + "</div>" +
            "</div>" +
            "<div class='divTableRow'>" +
            "<div class = 'container' > <ul  id = '" + api_element + "' > </ul></div >" +
            "</div>";

        //  var htmlRow = "<div class='container'><ul class='list-group' id='"+ api_element +"'></ul></div>";

        $("#" + parentId).append(htmlRow);

        // Get the inner value for the boxes by calling the APIs ...
        var apiUrl = contentsObj.api.replace("<loc_id>", locID);


        $.getJSON(api_root + apiUrl, function(data) {

            //Get the Top 3 ...
            var arrValue = [];
            var arrIndex = [];
            var arrFinal = [];



            //Save the Data into arrays so it will be easy to work with ...
            $.each(data, function(index, value) {
                arrIndex.push(index);
                if (ovPeriodType === "year") {
                    arrValue.push(value[ovPeriodType]);
                } else {
                    if (value[ovPeriodType][week] !== undefined) {
                        arrValue.push(value[ovPeriodType][week]);
                    } else {
                        arrValue.push(0);
                    }
                }

            });

            //I need the top 3 ...
            for (var i = 0; i <= 2; i++) {

                //Save index for the Max value ...
                var maxIndex = arrValue.indexOf(Math.max.apply(Math, arrValue));
                arrFinal.push(arrIndex[maxIndex]);

                //Remove the Max value from both arrays so i can get the next Max Value ...
                arrIndex.splice(maxIndex, 1);
                arrValue.splice(maxIndex, 1);

            }

            //Decide Which Category am working on, CD or NCD to Buidl the variable API...
            arrCategoryType = apiUrl.split('/');
            var detailApiUrl = "/variables/" + arrCategoryType[2];


            //Call Other API to get the details for each value in the arrFInal Array ...
            $.getJSON(api_root + detailApiUrl, function(detailData) {

                $.each(arrFinal, function(index, value) {
                    //  $('#' + parentId + ' .' + api_element).append("<div class='divTableCell'>" + detailData[value].name + "</div>"); <li class='list-group-item'>First item</li>
                    if (detailData[value] !== undefined) {
                        $('#' + api_element).append("<li>" + detailData[value].name + "</li>");
                    }

                });

            });

        });

    }
}



function prep_row_draw_Last3(contentsObj, parentId, locID) {
    if (IsUserAthorized(contentsObj.access) === true) {

        //Generate a GUID ...
        var api_element = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });

        //Append the results ...
        var htmlRow = "<div class='divTableRow'>" +
            "<div class='divTableCell'> " + contentsObj.label + "</div>" +
            "</div>" +
            "<div class='divTableRow'>" +
            "<div class = 'container' > <ul  id = '" + api_element + "' > </ul></div >" +
            "</div>";

        //  var htmlRow = "<div class='container'><ul class='list-group' id='"+ api_element +"'></ul></div>";

        $("#" + parentId).append(htmlRow);

        // Get the inner value for the boxes by calling the APIs ...
        var apiUrl = contentsObj.api.replace("<loc_id>", locID);


        $.getJSON(api_root + apiUrl, function(data) {

            var arrValue = [];
            var arrFinal = [];

            //Save the Data into arrays so it will be easy to work with ...
            $.each(data.alerts, function(index, value) {
                arrValue.push(value.variables.alert_reason);
            });

            //Take the last 3 values so i need to reverse the array ..
            arrValue.reverse();

            //I need only 3 ...
            for (var i = 0; i <= 2; i++) {
                arrFinal.push(arrValue[i]);
            }


            $.each(arrFinal, function(index, value) {
                var detailApiUrl = "/variable/" + value;


                //Call Other API to get the details for each value in the arrFInal Array ...
                $.getJSON(api_root + detailApiUrl, function(detailData) {
                    $('#' + api_element).append("<li>" + detailData.name + "</li>");
                });

            });

        });

    }
}


function IsUserAthorized(accessObj) {
    var userObj = user.acc[config.auth_country];
    var result = $.inArray(accessObj, userObj);
    if (result === -1) {
        return false;
    } else {
        return true;
    }
}
