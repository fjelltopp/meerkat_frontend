/**:showChartType( type, containerID )

    Hides div elements inside the container that don't have a class with the given type.
    Requires a container element with ID 'containerID' holding divs with class 'chart'.
    These divs with class 'chart' also have a class that determines type, e.g. 'bar' or 'pie'
    This function is practically used to switch between bar and pie charts.

    :param string type:
        The class of the HTML element holding the chart to be shown.
        The HTML element must also have a class of chart.
    :param string containerID:
        The ID of the HTML holding the different charts.
        Each element holding a chart in the container must have a class of both "chart"
        and an identifying type e.g. "bar" or "pie".

*/
function showChartType(type, containerID) {
    $('#' + containerID + ' .chart').not('.' + type).addClass('hidden');
    $('#' + containerID + ' .' + type).removeClass('hidden');
}

/**:drawBarChart( containerID, data, percent )

    Draws a bar chart in the DOM element with the given containerID using the
    data in the given data object. If percent is set to true, we use percentage rather than numbers.

    :param string containerID:
        The ID of the HTML element to hold the chart.
    :param object data:
        The data object as built by the misc.js function `makeDataObject()`.
    :param boolean chartOptions:
        A data object specifying any further options to determine how the chart
        is drawn.  The following options should be noted:
        * **percent** If true, data will be first converted to percentages,
          where each datum become the its percentage of the total data set:
          (datum value/total value)*100.
        * **week** If false, no week data will be visualised.
        * **year** If false, no year data will be visualised.
        Highcharts options can also be specified in this object, as the object
        is merged with the highcharts options object using $.extend(true) to
        make a recursive merge.
 */
function drawBarChart(containerID, data, chartOptions) {

    if (typeof(chartOptions) == 'undefined') chartOptions = {};

    //We want to work with a clone of the data, not the data itself.
    data = $.extend(true, {}, data);

    //Hack to get plot to size correctly when being drawn into a hidden object.
    //If the object is hidden, set the plot width to the inner width of the parent.
    //Otherwise, leave as undefined as specified in the highcharts api.
    var plotWidth;
    if ($('#' + containerID).hasClass('hidden')) {
        plotWidth = $('#' + containerID).parent().width();
    }

    var tooltip = function() {
        return this.series.name + ': ' + this.point.y;
    };
    var units = 'Number';

    // If percent is set to true (or not set at all), convert data to percentages
    // and store both in the data object.
    // This means both percent and count can be referenced in tooltip.
    if (typeof(chartOptions.percent) == 'undefined' || chartOptions.percent) {

        data.week_val = data.week;
        data.year_val = data.year;
        data.week = calc_percent_dist(data.week);
        data.year = calc_percent_dist(data.year);
        data.week = data.week.map(function(e, i) {
            return {
                "y": e,
                "val": data.week_val[i]
            };
        });
        data.year = data.year.map(function(e, i) {
            return {
                "y": e,
                "val": data.year_val[i]
            };
        });

        units = i18n.gettext('Percent %');
        tooltip = function() {
            return this.series.name + ': <b>' + this.point.y + '%</b> (' + this.point.val + ')';
        };
        delete chartOptions.percent;
    }

    series = [];
    if (typeof(chartOptions.week) == 'undefined' || chartOptions.week === true) {
        series.push({
            name: i18n.gettext('This Week'),
            data: data.week
        });
        delete chartOptions.week;
    }
    if (typeof(chartOptions.year) == 'undefined' || chartOptions.year === true) {
        series.push({
            name: i18n.gettext('This Year'),
            data: data.year
        });
        delete chartOptions.year;
    }

    highChart = {
        chart: {
            type: 'column',
            width: plotWidth
        },
        title: '',
        tooltip: {
            formatter: tooltip
        },
        xAxis: {
            categories: data.labels,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: units,
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        series: series,
    };

    // Merge in any options specified in chartOptions object.
    if (chartOptions) {
        $.extend(true, highChart, chartOptions);
    }

    $('#' + containerID).highcharts(highChart);

    //Get rid of the highcharts logo.
    $('#' + containerID + " text:contains('Highcharts.com')").remove();

}

/**:drawPieCharts( containerID, data, percent )

    Draws pie charts in the DOM element with the given containerID using the
    data in the given data object. If percent is set to true, we use percentage rather than numbers.
    Two pie charts are drawn, one for the previous week, and one for the cumulative total during the
    current year.

    :param string containerID:
        The ID of the HTML element to hold the chart.
    :param object data:
        The data object as built by the misc.js function `makeDataObject()`.
    :param boolean percent:
        If true, data will first be converted to percentages, where each datum become the its
        percentage of the total data set: (datum value/total value)*100.
 */
function drawPieCharts(containerID, data, percent) {

    //We want to work with a clone of the data, not the data itself.
    data = $.extend(true, {}, data);

    //Hack to get plot to size correctly when being drawn into a hidden object.
    //If the object is hidden, set the plot width to the inner width of the parent.
    //Otherwise, leave as undefined (as specified in the highcharts api).
    var plotWidth;
    if ($('#' + containerID).hasClass('hidden')) {
        plotWidth = $('#' + containerID).parent().width();
    }
    var restructured = {};
    var units = 'Number';
    var tooltip = function() {
        return this.series.name + ': ' + this.point.y;
    };
    //If percent is set to true, convert data to percentages and store both in the data object.
    //This means both percent and count can be referenced in tooltip.
    if (percent) {

        data.week_val = data.week;
        data.year_val = data.year;
        data.week = calc_percent_dist(data.week);
        data.year = calc_percent_dist(data.year);

        //Restructure the data object for pie charts.
        restructured.week = data.week.map(function(e, i) {
            return {
                name: data.labels[i],
                y: e,
                val: data.week_val[i]
            };
        });
        restructured.year = data.year.map(function(e, i) {
            return {
                name: data.labels[i],
                y: e,
                val: data.year_val[i]
            };
        });

        units = i18n.gettext('Percent %');
        tooltip = function() {
            return this.series.name + ': <b>' + this.point.y + '%</b> (' + this.point.val + ')';
        };

    } else {
        //Restructure the data object for pie charts.
        restructured = {
            week: [],
            year: []
        };
        for (var i = 0; i < data.labels.length; i++) {
            restructured.week[i] = {
                name: data.labels[i],
                y: data.week[i]
            };
            restructured.year[i] = {
                name: data.labels[i],
                y: data.year[i]
            };
        }
    }

    //Draw the graph.
    $('#' + containerID).highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie',
            width: plotWidth
        },
        title: '',
        tooltip: {
            formatter: tooltip
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        series: [{
            name: i18n.gettext('This Week'),
            center: ['20%', '50%'],
            size: "70%",
            colorByPoint: true,
            showInLegend: true,
            title: {
                text: '<b>Week</b>',
                verticalAlign: 'top',
                y: -40
            },
            data: restructured.week
        }, {
            name: i18n.gettext('This Year'),
            center: ['80%', '50%'],
            size: "70%",
            colorByPoint: true,
            showInLegend: false,
            title: {
                text: '<b>Year</b>',
                verticalAlign: 'top',
                y: -40
            },
            data: restructured.year
        }]
    });

    //Get rid of the highcharts.com logo.
    $('#' + containerID + " text:contains('Highcharts.com')").remove();

}

function drawLatestTimeChart(varID, identiferID, locID, containerID, alert_week, year, week_offset) {
    url = api_root + '/aggregate_latest_year/' + varID + '/' + identiferID + "/" + locID;
    if (year !== undefined) {
        url += "/" + year;
    }


    $.getJSON(url, function(data) {
        new_data = {
            "weeks": {}
        };
        if (week_offset !== undefined) {
            for (var i = week_offset; i <= 52; i++) {
                if (typeof(data.weeks[i]) !== 'undefined') {
                    new_data.weeks[i - week_offset] = data.weeks[i];
                }
            }
            data = new_data;
        }

        drawTimeChartData(data, containerID, alert_week);
    });

}

function drawTimeChart(varID, locID, containerID, alert_week, year) {
    url = api_root + '/aggregate_year/' + varID + '/' + locID;
    if (year !== undefined) {
        url += "/" + year;
    }


    $.getJSON(url, function(data) {
        //ToDO:
        if (data.year === 0) {
            $("#time-chart-whiteBox").css("display", "none");
            whiteboxCounter = whiteboxCounter + 1;
            if (whiteboxCounter == 3) {
                $('#emtyData-whiteBox').css("display", "block");
            }
        }

        drawTimeChartData(data, containerID, alert_week);
    });

}

/**:drawTimeCharts( varID, locID, containerID )

    Draws a timeline bar chart showing the number of cases in each epi week this current year.

    :param string varID:
        The ID of the variable to be plotted (taken from Meerkat Abacus).
    :param string locID:
        The ID of the location by which to filter the data.
    :param string containerID:
        The ID of the HTML element to hold the chart.




 */
function drawTimeChartData(data, containerID, alert_week) {

    var labels = [];
    var values = [];

    for (var i = 1; i <= 52; i++) {

        labels.push(i.toString());

        if (typeof(data.weeks[i]) !== 'undefined') {
            values.push(data.weeks[i]);
        } else {
            values.push(0);
        }

    }
    //Hack to get plot to size correctly when being drawn into a hidden object.
    //If the object is hidden, set the plot width to the inner width of the parent.
    //Otherwise, leave as undefined as specified in the highcharts api.
    var plotWidth;
    if ($('#' + containerID).hasClass('hidden')) {
        plotWidth = $('#' + containerID).parent().width();
    }

    var series = [];
    if (alert_week) {
        var alert_values = [];
        for (var j = 1; j <= 52; j++) {

            if (j == alert_week) {
                alert_values.push(data.weeks[j]);
            } else {
                alert_values.push(0);
            }

        }
        values[alert_week - 1] = 0;
        series = [{
            name: 'Year',
            data: values,
            grouping: false
        }, {
            name: 'Alert',
            data: alert_values,
            grouping: false
        }];
    } else {
        series = [{
            name: 'Year',
            data: values
        }];

    }

    $('#' + containerID).highcharts({
        chart: {
            type: 'column',
            width: plotWidth
        },
        title: '',
        xAxis: {

            categories: labels,
            title: {
                text: i18n.gettext('Epidemiological Week')
            }
        },
        legend: {
            enabled: false
        },
        yAxis: {
            min: 0,
            title: {
                text: i18n.gettext('Number of Reported Cases'),
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        series: series
    });

    //Get rid of the highcharts logo.
    $('#' + containerID + " text:contains('Highcharts.com')").remove();


}

/**:drawCompletenessGraph( containerID, regionID, locations, data, start_week, graphtypeID, compare_locations)

   Draws a timeline line chart showing the percentage of overall completeness/timeliness and completeness/timeliness for each clinic in each epi week this current year.
   :param string containerID:
   The ID of the HTML element to hold the chart.
   :param string regionID:
   The ID of the location by which to filter the data.
   :param string denomintor:
   number of expected reporting days in a week
   :param Object locations:
   List of all locations from API.
   :param Object data:
   Completeness data from API.
   :param int graphtypeID:
   Type of a graph to be ploted. `0` for completeness, `1` for timeliness
   :param int compare_locations
   Show lines to compare locations for completeness graph
*/

function drawCompletenessGraph(containerID, regionID, denominator, locations, data, start_week, graphtypeID, compare_locations, x_axis_max) {

    var comparevalue = $(compare_locations).attr("value");

    var stringGraphType = 'data';
    var multiplier = 100 / denominator;
    if (graphtypeID === 0) {
        stringGraphType = 'Completeness';
    } else if (graphtypeID === 1) {
        stringGraphType = 'Timeliness';
    }

    //create a data series for each location
    var dataPrepared = [];
    var timeseries = [];
    if (data.timeline === undefined) {

        $('#' + containerID).html("<h3> No " + stringGraphType + " data week for last week </h3>");
        return undefined;
    }
    var scoreKeys = Object.keys(data.timeline);
    var index = 0;
    for (var i = 0; i < scoreKeys.length; i++) {
        index = scoreKeys[scoreKeys.length - i - 1];
        tl = data.timeline[index];
        if ((locations[index].id != regionID) && (comparevalue === "false")) {
            continue;
        }
        var dt = [];
        var dtReady = [];
        var noWeeks = tl.weeks.length;
        //Using week numbers instead of dates in tl.weeks
        var weeks = lastWeeks(get_epi_week(), noWeeks + 1); //last completeness is from previous week

        //dropping the current week (noWeeks) in the data since we can only estimate it's completeness
        for (var j = 0; j < noWeeks; j++) {
            if (start_week) {
                if (weeks[noWeeks - j] >= start_week) {
                    dt = [weeks[noWeeks - j], Number(Number(multiplier * (tl.values[j])).toFixed(0))];
                    dtReady.push(dt);
                }
            } else {
                dt = [weeks[noWeeks - j], Number(Number(multiplier * (tl.values[j])).toFixed(0))];
                dtReady.push(dt);
            }
        }
        var datum = {
            name: locations[index].name,
            data: dtReady,
            color: 'lightgrey'
        };

        if (locations[index].id === regionID) { //parent location
            datum.color = '#0090CA';
            datum.lineWidth = '5';
        }
        timeseries.push(datum);
    }


    //hovering should give all the information about given clinick and sublocation
    $('#' + containerID).highcharts({
        chart: {
            type: 'spline'
        },
        title: {
            text: ''
        },
        legend: {
            enabled: false
        },
        xAxis: {
            title: {
                text: i18n.gettext('Week')
            },
            labels: {
                overflow: 'justify'
            },
            allowDecimals: false,
            max: x_axis_max
        },
        yAxis: {
            max: 100,
            min: 0,
            title: {
                text: i18n.gettext(stringGraphType)
            },
            labels: {
                format: '{value}%'
            },
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null,
            plotBands: [{ //RED
                from: 0,
                to: 50,
                color: 'rgba(255, 0, 0, 0.5)'
            }, { //YELLOW
                from: 50,
                to: 80,
                color: 'rgba(255, 255, 0, 0.5)'
            }, { // GREEN
                from: 80,
                to: 105,
                color: 'rgba(0, 128, 0,0.5)'
            }]
        },
        tooltip: {
            valueSuffix: '%'
        },
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        enabled: true,
                        lineWidth: 5
                    }
                },
                marker: {
                    enabled: false
                },
                pointStart: 0,
                events: {
                    mouseOver: function() {
                        if (this.chart.series[this.index].color === 'lightgrey') {
                            this.chart.series[this.index].update({
                                color: '#D9692A'
                            });
                        }
                    },
                    //http://forum.highcharts.com/highcharts-usage/how-do-i-change-line-colour-when-hovering-t35536/
                    mouseOut: function() {
                        if (this.chart.series[this.index].color === '#D9692A') {
                            this.chart.series[this.index].update({
                                color: "lightgrey"
                            });
                        }
                    }
                }
            }
        },
        series: timeseries,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    }); //highchart
}

Highcharts.setOptions({
    colors: ["#0090CA", "#D9692A", "#89B6A5", "#e94f37", "#393e41", "#F1E8B8",
        "#CDEDF6", "#690500", "#77477B", "#40476D", "#042A2B"
    ],
    chart: {
        backgroundColor: null,
        style: {
            fontFamily: 'Helvetica Neue", Helvetica, Arial, sans-serif'
        }
    },
    credits: {
        enabled: false
    },
    exporting: {
        enabled: false
    }

});

/**:drawChartOptionsButtons(tableID, redrawFunctionName)

    Draws the table options buttons for tables in the dashboard created using bootstrap tables.
    These options allow you to colour the cells according to their value and to strip empty records.

    :param string objectID:
        The ID attribute of the html element to hold the table assoiated with the buttons.
    :param string redrawFunctionName:
        Name of the local function which redraws the table
 */
function drawChartOptionsButtons(objectID, redrawFunctionName, default_on) {
    if (default_on === undefined) {
        default_on = "false";
    }
    var html = "<div class='chart-options'>";
    html += "<span class='glyphicon glyphicon-random " + objectID + "-option pull-right' " +
        "id='compare_button' onClick='callChartOptionButton(this,\"" + redrawFunctionName + "\");' " +
        "title='" + i18n.gettext('Compare sublocations') +
        "' chart='completeness-graph' value=" + default_on + " false name='compare'></span>";
    html += "</div>";

    $('#' + objectID).prepend(html);
}

//Function that updates chart option button's values.
function callChartOptionButton(element, redrawFunctionName) {
    var value = $(element).attr("value");
    $(element).attr("value", value == "true" ? "false" : "true");
    //Check that the redraw function exists, if it does, call it.
    var fn = window[redrawFunctionName];
    if (typeof fn === 'function') {
        fn();
    }
}

function drawIndicatorsGraph(containerID, locID, data) {


    var indKey = $('#choose-ind-id').attr("value");
    if (indKey === undefined) {
        indKey = 0;
    }

    indDataTimeline = data[indKey].timeline;
    indDataTimelineKeys = Object.keys(indDataTimeline);
    indDataName = data[indKey].name;

    var noWeeks = indDataTimelineKeys.length;
    var weeks = lastWeeks(get_epi_week(), noWeeks + 1);
    var timeseries = [];
    var datapoint = [];

    for (var i = 0; i < indDataTimelineKeys.length; i++) {
        //Using week numbers instead of dates
        //dropping the current week (noWeeks)
        datapoint = [weeks[noWeeks - i], Number(indDataTimeline[indDataTimelineKeys[i]])];
        timeseries.push(datapoint);
    }

    $('#' + containerID).highcharts({
        title: {
            text: indDataName
        },
        xAxis: {
            title: {
                text: 'week',
            },
            tickInterval: 1
        },
        yAxis: {
            title: {
                text: 'values'
            }
        },
        legend: {
            enabled: false
        },

        series: [{
            type: 'area',
            name: indDataName,
            data: timeseries
        }]
    });
}

function drawConsultationsGraph(containerID, data, loc_id, loc_level, locations, prev_week_no) {

    var dataPrepared = [];
    var timeseries = [];
    var consultationsData = data[loc_level];
    var scoreKeys = Object.keys(consultationsData);
    var index = 0;
    var noWeeks = prev_week_no;

    for (var i = 0; i < scoreKeys.length; i++) {
        index = scoreKeys[i];
        var dt = [];
        var dtReady = [];
        for (var j = 1; j <= noWeeks; j++) {
            var val_j = consultationsData[index].weeks[j];
            if (typeof(val_j) == 'undefined') {
                dt = [j, 0];
            } else {
                dt = [j, Number(consultationsData[index].weeks[j])];
            }
            dtReady.push(dt);
        }
        var datum = {
            name: locations[index].name,
            data: dtReady,
            color: 'grey'
        };

        timeseries.push(datum);
    }

    //hovering should give all the information about given clinick and sublocation
    $('#' + containerID).highcharts({
        chart: {
            type: 'spline'
        },
        title: {
            text: ''
        },
        legend: {
            enabled: false
        },
        xAxis: {
            title: {
                text: i18n.gettext('Week')
            },
            labels: {
                overflow: 'justify'
            },
            allowDecimals: false
        },
        yAxis: {
            min: 0,
            title: {
                text: i18n.gettext("Consulations")
            },
            labels: {
                format: '{value}'
            },
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
        plotOptions: {
            spline: {
                lineWidth: 3,
                states: {
                    hover: {
                        enabled: true,
                        lineWidth: 5
                    }
                },
                marker: {
                    enabled: false
                },
                pointStart: 0,
                events: {
                    mouseOver: function() {
                        if (this.chart.series[this.index].color === 'lightgrey') {
                            this.chart.series[this.index].update({
                                color: '#D9692A'
                            });
                        }
                    },
                    //http://forum.highcharts.com/highcharts-usage/how-do-i-change-line-colour-when-hovering-t35536/
                    mouseOut: function() {
                        if (this.chart.series[this.index].color === '#D9692A') {
                            this.chart.series[this.index].update({
                                color: "lightgrey"
                            });
                        }
                    }
                }
            }
        },
        series: timeseries,
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    }); //highchart
}
