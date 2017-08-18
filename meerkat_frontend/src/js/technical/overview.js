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
        if (contentsObj.prep_details !== undefined) {
            ovPeriodType = contentsObj.prep_details.ovPeriodType;
        }

        //Generate a GUID ...
        var api_element = generateGUID();

        //Append the results ...
        var htmlRow = "<div class='divTableRow'>" +
            "<div class='divTableCell' style='font-weight: bold;'> " + i18n.gettext(contentsObj.label) + "</div>" +
            "<div class='divTableCell " + api_element + "'> " + i18n.gettext("Loading") + "..</div>" +
            "</div>";

        $("#" + parentId).append(htmlRow);

        // Get the inner value for the boxes by calling the APIs ...
        var apiUrl = contentsObj.api.replace("<loc_id>", locID);
        $.getJSON(api_root + apiUrl, function(data) {
            if (ovPeriodType == "weeks") {
                $('#' + parentId + ' .' + api_element).html(if_exists(data[ovPeriodType], week));
            } else {
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


var indicatorCounter = 0;
//Generate a GUID ...
var api_element_ind = generateGUID();

function prep_row_indicator(contentsObj, parentId, locID) {
    if (isUserAthorized(contentsObj.access) === true) {

        var htmlContetn = "";
        //Add the table structure for the first time ...
        if (indicatorCounter === 0) {
            htmlContetn = "<table id='table-sparkline' style='width:100%'><thead><tr><th>Indicator name</th><th>cumulative</th><th>Indicator chart</th></tr></thead>" +
                "<tbody id='tbody-sparkline' name=" + api_element_ind + ">" + "</tbody></table>";
            indicatorCounter = 1;
            $("#" + parentId).append(htmlContetn);
        }


        // Get the inner value for the boxes by calling the APIs ...
        var apiUrl = contentsObj.api.replace("<loc_id>", locID);
        $.getJSON(api_root + apiUrl, function(data) {

            var indicatorColumn = "";
            var indicatorChartValues = [];


            $.each(data.timeline, function(index, value) {
                indicatorChartValues.push(value);
            });

            indicatorColumn = "<tr><th> " + contentsObj.label + "</th>" + "<td>" + data.current + "% (" + data.cummulative + "% year )" + "</td>" +
                "<td data-sparkline = '" + indicatorChartValues.join(", ") + "'" +
                'onClick="showIndicatorChart(\'' + apiUrl.toString() + "~" + contentsObj.label + '\')" /> </tr>';
            //    "' onClick=showIndicatorChart('" + apiUrl.toString() + "'); /> </tr>";



            $("tbody[name='" + api_element_ind + "']").append(indicatorColumn);
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
                    positioner: function(w, h, point) {
                        return {
                            x: point.plotX - w / 2,
                            y: point.plotY - h
                        };
                    }
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

            // Print a feedback on the performance
            // if (n === fullLen) {
            //     $('#result').html('Generated ' + fullLen + ' sparklines in ' + (new Date() - start) + ' ms');
            // }
        }
    }
}


function showIndicatorChart(chartInfo) {

    chartInfo = chartInfo.split("~");
    var indicatorChartDate = [];
    var indicatorChartValues = [];

    $.getJSON(api_root + chartInfo[0], function(result) {
        var indicatorChartValues = [];

        $.each(result.timeline, function(index, value) {
            indicatorChartDate.push(ovDateFormate(index));
            indicatorChartValues.push(value);
        });

        Highcharts.chart('indicatorChartlightbox', {
            chart: {
                type: 'area'
            },
            title: {
                text: 'Indicators'
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
                        return this.value / 1000;
                    }
                }
            },
            tooltip: {
                split: true,
                valueSuffix: ' '
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


        //after create the charts , get the html result and inject it into the featherlight popup ...
        var indicatorChartHTMLContainer = $('#indicatorChartlightbox').html();
        $.featherlight(indicatorChartHTMLContainer, {
            variant: 'indicatorChartHTMLContainer'
        });
    });
}
