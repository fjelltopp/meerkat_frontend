//Global Variable ...
//ovPeriodType = 'weeks'; //  "year or weeks" Read from the config..

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
        "<div class = 'chartBox__heading' > <p id = '#box_heading'>" + i18n.gettext(overviewObj.title) + "</p> </div>" +
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
    if (isUserAthorized(contentsObj.access) === true) {

		var ovPeriodType = "year";
		if ( contentsObj.prep_details !== undefined){
			ovPeriodType = contentsObj.prep_details.ovPeriodType;
		}
		
        //Generate a GUID ...
        var api_element = generateGUID();

        //Append the results ...
        var htmlRow = "<div class='divTableRow'>" +
            "<div class='divTableCell' style='font-weight: bold;'> " + i18n.gettext(contentsObj.label) + "</div>" +
            "<div class='divTableCell " + api_element + "'> "+ i18n.gettext("Loading") +"..</div>" +
            "</div>";

        $("#" + parentId).append(htmlRow);

        // Get the inner value for the boxes by calling the APIs ...
        var apiUrl = contentsObj.api.replace("<loc_id>", locID);
        $.getJSON(api_root + apiUrl, function(data) {
			if(ovPeriodType == "weeks"){
				$('#' + parentId + ' .' + api_element).html(if_exists(data[ovPeriodType], week));
			}else{
				$('#' + parentId + ' .' + api_element).html(data[ovPeriodType]);
			}

        });

    }
}


function prep_row_draw_top(contentsObj, parentId, locID) {
    if (isUserAthorized(contentsObj.access) === true) {

        //Generate a GUID ...
        var api_element = generateGUID();

        //Append the results ...
        var htmlRow = "<div class='divTableRow'>" +
            "<div class='divTableCell' style='font-weight: bold;'> " + i18n.gettext(contentsObj.label) + "</div>" +
            "</div>" +
            "<div class='divTableRow'>" +
            "<div class = 'container' > <ul  id = '" + api_element + "' > </ul></div >" +
            "</div>";


        $("#" + parentId).append(htmlRow);

        // Get the inner value for the boxes by calling the APIs ...
        var apiUrl = contentsObj.api.replace("<loc_id>", locID);
        var ovPeriodType = contentsObj.prep_details.ovPeriodType;

        $.getJSON(api_root + apiUrl, function(data) {

            //Get the Top 3 ...
            var arrValue = [];
            var arrIndex = [];
            var arrFinal = [];
            var arrFinalVal = [];



            //Save the Data into arrays so it will be easy to work with ...
            $.each(data, function(index, value) {
                arrIndex.push(index);
                if (ovPeriodType === "year") {
                    arrValue.push(value[ovPeriodType]);
                } else {

                    //Check if the value exist using if_exists function from misc.js file ... "week" variable comes from the global variable week ...
                    arrValue.push(if_exists(value[ovPeriodType], week));
                }
            });

            //I need the top 3 ...
            for (var i = 0; i <= 2; i++) {

                //Save index for the Max value ...
                var maxIndex = arrValue.indexOf(Math.max.apply(Math, arrValue));
                arrFinal.push(arrIndex[maxIndex]);
                arrFinalVal.push(arrValue[maxIndex]);

                //Remove the Max value from both arrays so i can get the next Max Value ...
                arrIndex.splice(maxIndex, 1);
                arrValue.splice(maxIndex, 1);

            }

            //Decide Which Category am working on, CD or NCD to Buidl the variable API...
            arrCategoryType = apiUrl.split('/');
            var detailApiUrl = "/variables/" + arrCategoryType[2];


            //Call Other API to get the details for each value in the arrFInal Array ...
            $.getJSON(api_root + detailApiUrl, function(detailData) {
                var count = 0;
                $.each(arrFinal, function(index, value) {

                    if (detailData[value] !== undefined) {
                        //  $('#' + api_element).append("<li>" + detailData[value].name  +"</li>");

                        $('#' + api_element).append("<li>" + "<label style='width: 300px;font-weight: normal !important;'>" + i18n.gettext(detailData[value].name) + "</label>" +
                            "<label style='font-weight: normal !important;' >" + arrFinalVal[count] + "  Cases </label>" + "</li>");

                        count = count + 1;

                    }

                });

            });

        });

    }
}



function prep_row_draw_Last3(contentsObj, parentId, locID) {
    if (isUserAthorized(contentsObj.access) === true) {

        //Generate a GUID ...
        var api_element = generateGUID();

        //Append the results ...
        var htmlRow = "<div class='divTableRow'>" +
            "<div class='divTableCell' style='font-weight: bold;'> " + i18n.gettext(contentsObj.label) + "</div>" +
            "</div>" +
            "<div class='divTableRow'>" +
            "<div class = 'container' > <ul  id = '" + api_element + "' > </ul></div >" +
            "</div>";

        $("#" + parentId).append(htmlRow);

        // Get the inner value for the boxes by calling the APIs ...
        var apiUrl = contentsObj.api.replace("<loc_id>", locID);


        $.getJSON(api_root + apiUrl, function(data) {

            var arrValue = [];
            var arrDate = [];
            var arrFinal = [];
            var arrFinalDate = [];

            //Save the Data into arrays so it will be easy to work with ...
            $.each(data.alerts, function(index, value) {
                arrValue.push(value.variables.alert_reason);
                arrDate.push(value.date);
            });

            //Take the last 3 values so i need to reverse the array ..
            arrValue.reverse();
            arrDate.reverse();

            //I need only 3 ...
            for (var i = 0; i <= 2; i++) {
                arrFinal.push(arrValue[i]);
                arrFinalDate.push(arrDate[i]);
            }

            var alertCounter = 0;
            $.each(arrFinal, function(index, value) {
                var detailApiUrl = "/variable/" + value;


                //Call Other API to get the details for each value in the arrFInal Array ...
                $.getJSON(api_root + detailApiUrl, function(detailData) {

                    $('#' + api_element).append("<li>" + "<label style='width: 300px;font-weight: normal !important;'>" + i18n.gettext(detailData.name) + "</label>" +
                        "<label style='font-weight: normal !important;' >" + ovDateFormate(arrFinalDate[alertCounter]) + " </label>" + "</li>");

                    alertCounter = alertCounter + 1;

                });

            });

        });

    }
}


function prep_row_indicator(contentsObj, parentId, locID) {
    if (isUserAthorized(contentsObj.access) === true) {

        //Generate a GUID ...
        var api_element = generateGUID();

        //Append the results ...
        var htmlRow = "<div class='divTableRow'>" +
            "<div class='divTableCell' style='font-weight: bold;'> " + contentsObj.label + "</div>" +
            "<div class='divTableCell " + api_element + "'>Loading..</div>" +
            "</div>";

        $("#" + parentId).append(htmlRow);

        // Get the inner value for the boxes by calling the APIs ...
        var apiUrl = contentsObj.api.replace("<loc_id>", locID);
        $.getJSON(api_root + apiUrl, function(data) {

            $('#' + parentId + ' .' + api_element).html(round(data.current, 1) + "<span style='padding-left:30px;' class='" + getIndicatorArrow (data.current - data.previous) + "'></span> ");

        });

    }
}



function isUserAthorized(accessObj) {
    var userObj = user.acc[config.auth_country];
    var result = $.inArray(accessObj, userObj);
    if (result === -1) {
        return false;
    } else {
        return true;
    }
}


function generateGUID() {
    var newGuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
    });
    return newGuid;
}

//Return Date formated ...
function ovDateFormate(dateStr) {
    date = new Date(dateStr);
    var monthNames = [
        i18n.gettext("January"), i18n.gettext("February"),
        i18n.gettext("March"), i18n.gettext("April"),
        i18n.gettext("May"), i18n.gettext("June"),
        i18n.gettext("July"), i18n.gettext("August"),
        i18n.gettext("September"), i18n.gettext("October"),
        i18n.gettext("November"), i18n.gettext("December")
    ];

    return date.getDate() + " " + monthNames[date.getMonth()] + " " + date.getFullYear();
}

//Return The bootstrap Arrow if its UP or DOWN ..
function getIndicatorArrow(val) {
    if (val > 0) {
        return "glyphicon glyphicon-arrow-up";
    }else if( val === 0){
		return "glyphicon glyphicon-minus";
	}else {
        return "glyphicon glyphicon-arrow-down";
    }
}
