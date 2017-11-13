//Global Variable ...
//ovPeriodType = 'weeks'; //  "year or weeks" Read from the config..

// This will be the main function for the over viewpage...
function build_overview_page(locID) {
    // Get the overview page structure from the frontend configs "x_technical.json"
    var overview_list = config.overview;
    // Remove pre-existing content and draw the new content.
    $('#divOverviewContent .overview-box').remove();
    $.each(overview_list, function(index, value) {
        html_box_builder(value, locID);
    });
}


function html_box_builder(overviewObj, locID) {
    // Allow a different html base to be specified in configs.
    // But default to a DIV table format.
    var html_base = overviewObj.html_base || "<div class='row' id ='" + overviewObj.parentId + "'></div>";

    // Build the box and append it to the page
    var html_builder = "<div  class='col-xs-12 " + overviewObj.html_class + " less-padding-col overview-box'> <div class='chartBox box' >" +
        "<div class = 'chartBox__heading' > <p id = '#box_heading'>" + i18n.gettext(overviewObj.title) + "</p> </div>" +
        "<div class = 'chartBox__content' > " + html_base +
        " </div> </div> </div>";
    $('#divOverviewContent').append(html_builder);

    // The clever bit! Populate the box with data.
    // The config object should specify an api call and a JS function to draw the response.
    // Here we call this "prep_function" and pass it the information it needs to draw data.
    $.each(overviewObj.contents, function(index, value) {
        window[value.prep_function](value, overviewObj.parentId, locID);
    });
}


function prep_row(contentsObj, parentId, locID) {
    if (isUserAthorized(contentsObj.access) === true) {

        var ovPeriodType = "year";
        if (contentsObj.prep_details !== undefined) {
            ovPeriodType = contentsObj.prep_details.ovPeriodType;
        }

        //Generate a GUID ...
        var elementID = generateGUID();

        //Append the results ...
        var htmlRow = "<div class='row'>" +
            "<div class='col-xs-8 row-label'> " + i18n.gettext(contentsObj.label) + "</div>" +
            "<div class='col-xs-4 row-value " + elementID + "'> " + i18n.gettext("Loading") + "...</div>" +
            "</div>";

        $("#" + parentId).append(htmlRow);

        // Get the inner value for the boxes by calling the APIs ...
        var apiUrl = contentsObj.api.replace("<loc_id>", locID);
        $.getJSON(api_root + apiUrl, function(data) {
            if (ovPeriodType == "weeks") {
                $('#' + parentId + ' .' + elementID).html(if_exists(data[ovPeriodType], week));
            } else {
                $('#' + parentId + ' .' + elementID).html(data[ovPeriodType]);
            }

        });

    }
}


function prep_row_draw_top(contentsObj, parentId, locID) {
    if (isUserAthorized(contentsObj.access) === true) {

        // This GUID is used to identify the html DOM element after the API call
        // We draw the element before starting AJAX, and insert the data afterwards.
        var elementID = generateGUID();

        var htmlRow = "<div class='row'>" + "<div class='col-xs-12 row-label'> " +
            i18n.gettext(contentsObj.label) + "</div></div>" +
            "<div class='row'><div id = '" + elementID + "' > </div></div >";

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
                        $('#' + elementID).append(
                            "<div><span class='col-xs-7 col-xs-offset-1'>" +
                            i18n.gettext(detailData[value].name) +
                            "</span><span class='col-xs-4'>" + arrFinalVal[count] +
                            "  Cases </label>" + "</div>");
                        count = count + 1;
                    }
                });
            });
        });
    }
}



function prep_row_draw_Last3(contentsObj, parentId, locID) {
    if (isUserAthorized(contentsObj.access) === true) {

        // This GUID is used to identify the html DOM element after the API call
        // We draw the element before starting AJAX, and insert the data afterwards.
        var elementID = generateGUID();

        var htmlRow = "<div class='row'>" +
            "<div class='col-xs-12 row-label'> " + i18n.gettext(contentsObj.label) + "</div>" +
            "</div>" +
            "<div class='row'><div id = '" + elementID + "' > </div></div >";

        $("#" + parentId).append(htmlRow);

        // Get the inner value for the boxes by calling the APIs ...
        var apiUrl = contentsObj.api.replace("<loc_id>", locID);


        $.getJSON(api_root + apiUrl, function(data) {

            var arrAlerts = [];
            var arrFinal = [];
            var arrFinalDate = [];


            //Save the Data into arrays so it will be easy to work with ...
            $.each(data.alerts, function(index, value) {
                var newObj = {
                    val: value.variables.alert_reason,
                    date: value.date
                };
                arrAlerts.push(newObj);
            });

            //Sort the array by date Desc ...
            arrAlerts.sort(function(a, b) {
                return new Date(b.date) - new Date(a.date);
            });

            //I need only 3 ...
            for (var i = 0; i <= 2; i++) {
                arrFinal.push(arrAlerts[i].val);
                arrFinalDate.push(arrAlerts[i].date);
            }

            var alertCounter = 0;
            $.each(arrFinal, function(index, value) {
                var detailApiUrl = "/variable/" + value;

                //Call Other API to get the details for each value in the arrFInal Array ...
                $.getJSON(api_root + detailApiUrl, function(detailData) {

                    $('#' + elementID).append(
                        "<div><span class='col-xs-7 col-xs-offset-1'>" +
                        i18n.gettext(detailData.name) +
                        "</span><span class='col-xs-4'>" +
                        ovDateFormate(arrFinalDate[alertCounter]) +
                        "</label></div>");

                    alertCounter = alertCounter + 1;

                });

            });

        });

    }
}

/* This function writes details about an indicator into a three columned table.
   Details about the indicator should be specified in the contentsObj which is
   taken from the overview config object found in <country>_technical.json
   frontend config file.  This function helps build the overview page and is
   called from the end of the html box_builder function.  */
function prep_row_indicator(contentsObj, parentId, locID) {

    if (isUserAthorized(contentsObj.access) === true) {
        var apiUrl = contentsObj.api.replace("<loc_id>", locID);
        var unique_id = generateGUID();

        // Draw where the indicator data should be.
        // Drawing before AJAX forces the indicator order to match the config.
        var html = '<tr style="cursor:pointer" onClick="showIndicatorChart(\'' +
            apiUrl.toString() + "~" + contentsObj.label + '\')" id="' +
            unique_id + '" >' + "<th> " + contentsObj.label + "</th>" +
            "<td class='value'></td>" + "<td class='sparkline' " +
            "onClick=showIndicatorChart(\'" + apiUrl.toString() + "~" +
            contentsObj.label + '\')" /> </tr>';

        $("#" + parentId).append(html);

        // Get the indicator data and insert into the html.
        $.getJSON(api_root + apiUrl, function(data) {
            // Create an ordered list of values from JSON object timeline.
            var timeline = Object.keys(data.timeline).sort().map(function(time){
                return data.timeline[time];
            });
            $("#" + unique_id + ' .value').append(
                data.current.toFixed(2) + "% <br/> (" +
                data.cummulative.toFixed(2) + "% year )"
            );
            $("#" + unique_id + ' .sparkline').attr(
                'data-sparkline',
                timeline.join(", ")
            );
            drawIndicatorChart();
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
    } else if (val === 0) {
        return "glyphicon glyphicon-minus";
    } else {
        return "glyphicon glyphicon-arrow-down";
    }
}


function drawIndicatorChart() {
    /**
     * Create a constructor for sparklines that takes some sensible defaults and merges in the individual
     * chart options. This function is also available from the jQuery plugin as $(element).highcharts('SparkLine').
     */
    Highcharts.SparkLine = function(a, b, c) {
        var hasRenderToArg = typeof a === 'string' || a.nodeName,
            options = arguments[hasRenderToArg ? 1 : 0],
            defaultOptions = {
                chart: {
                    renderTo: (options.chart && options.chart.renderTo) || this,
                    backgroundColor: null,
                    borderWidth: 0,
                    type: 'area',
                    margin: [2, 0, 2, 0],
                    width: 120,
                    height: 20,
                    style: {
                        overflow: 'visible'
                    },

                    // small optimalization, saves 1-2 ms each sparkline
                    skipClone: true
                },
                title: {
                    text: ''
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    startOnTick: false,
                    endOnTick: false,
                    tickPositions: []
                },
                yAxis: {
                    endOnTick: false,
                    startOnTick: false,
                    labels: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    tickPositions: [0]
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    backgroundColor: null,
                    borderWidth: 0,
                    shadow: false,
                    useHTML: true,
                    hideDelay: 0,
                    shared: true,
                    padding: 0,
                    enabled: false, // Make it true to view the tooltip
                    positioner: function(w, h, point) {
                        return {
                            x: point.plotX - w / 2,
                            y: point.plotY - h
                        };
                    },
                },
                plotOptions: {
                    series: {
                        animation: false,
                        lineWidth: 1,
                        shadow: false,
                        states: {
                            hover: {
                                lineWidth: 1
                            }
                        },
                        marker: {
                            radius: 1,
                            enabled: false,
                            states: {
                                hover: {
                                    radius: 2
                                }
                            }
                        },
                        fillOpacity: 0.25
                    },
                    column: {
                        negativeColor: '#910000',
                        borderColor: 'silver'
                    }
                }
            };

        options = Highcharts.merge(defaultOptions, options);

        return hasRenderToArg ?
            new Highcharts.Chart(a, options, c) :
            new Highcharts.Chart(options, b);
    };

    var start = +new Date(),
        $tds = $('td[data-sparkline]'),
        fullLen = $tds.length,
        n = 0;

    doChunk();
    // Creating 153 sparkline charts is quite fast in modern browsers, but IE8 and mobile
    // can take some seconds, so we split the input into chunks and apply them in timeouts
    // in order avoid locking up the browser process and allow interaction.
    function doChunk() {
        var time = +new Date(),
            i,
            len = $tds.length,
            $td,
            stringdata,
            arr,
            data,
            chart;

        for (i = 0; i < len; i += 1) {
            $td = $($tds[i]);
            stringdata = $td.data('sparkline');
            arr = stringdata.split('; ');
            data = $.map(arr[0].split(', '), parseFloat);
            chart = {};

            if (arr[1]) {
                chart.type = arr[1];
            }
            $td.highcharts('SparkLine', {
                series: [{
                    data: data,
                    pointStart: 1
                }],
                tooltip: {
                    headerFormat: '<span style="font-size: 10px">' + $td.parent().find('th').html() + ', Q{point.x}:</span><br/>',
                    pointFormat: '<b>{point.y}.000</b>'
                },
                chart: chart
            });

            n += 1;

            // If the process takes too much time, run a timeout to allow interaction with the browser
            if (new Date() - time > 500) {
                $tds.splice(0, i + 1);
                setTimeout(doChunk, 0);
                break;
            }
        }
    }
}

//This Methos will take the needed inforemation to build the chart and view it in Model ...
function showIndicatorChart(chartInfo) {

    chartInfo = chartInfo.split("~");
    var indicatorChartDate = [];
    var indicatorChartValues = [];

    $.getJSON(api_root + chartInfo[0], function(result) {
        var indicatorChartValues = [];

        $.each(result.timeline, function(index, value) {
            //indicatorChartDate.push(ovDateFormate(index));
            indicatorChartDate.push(ovReturnWeekNumber(index));
            indicatorChartValues.push(value);
        });

        Highcharts.chart('Ov_Indicator_chart', {
            chart: {
                type: 'area'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: indicatorChartDate,
                tickmarkPlacement: 'on',
                title: {
                    enabled: false
                }
            },
            yAxis: {
                title: {
                    text: ''
                },
                labels: {
                    formatter: function() {
                        return this.value; // 1000;
                    }
                }
            },
            tooltip: {
                //split: true,
                //valueSuffix: ' ',
                formatter: function() {
                    return Math.round(this.y * 10) / 10;
                }
            },
            plotOptions: {
                area: {
                    stacking: 'normal',
                    lineColor: '#666666',
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1,
                        lineColor: '#666666'
                    }
                }
            },
            series: [{
                name: chartInfo[1],
                data: indicatorChartValues
            }]
        });

        //This part for the Modal to view the selected Indicator Chart ...
        var $modal = $('#indicatorChartlightbox');
        $modal.modal('show');

    });
}


//This function will Receive date and return the week number ...
function ovReturnWeekNumber(date) {
    Date.prototype.getWeek = function() {
        var onejan = new Date(this.getFullYear(), 0, 1);
        var today = new Date(this.getFullYear(), this.getMonth(), this.getDate());
        var dayOfYear = ((today - onejan + 1) / 86400000);
        return Math.ceil(dayOfYear / 7);
    };

    var currentDate = new Date(date);
    return currentDate.getWeek();
}
