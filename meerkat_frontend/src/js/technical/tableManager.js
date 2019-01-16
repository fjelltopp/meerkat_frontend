/**:drawTable(containerID, data, no_total, linkFunction)

    Creates epi tables with data from: current week, last two weeks and the year.
    Takes the same data object as the chart drawing functions. Rather than loading JSON
    data inside the method, it is passed as arguments to the method so that JSON requests
    can be shared across multiple drawings. This is the most generic table drawing function
    called primarily from the misc.js function `categorySummation()`.

    :param string containerID:
        The ID of the html element to hold the table.
    :param object data:
        The data to be tabulated, built by the misc.js function `buildDataObject()`.
    :param boolean no_total:
        Set to true if no total row should be included.
    :param string linkfunction:
        The function name to be added "onclick" to each table row header.
        The linkfunction is given the row's variable ID as an argument (such as "gender_1").
        e.g. We write a function `uslessAlert( varID ){ alert(varID); }`, and set the
        linkFunction argument to "uselessAlert" to create a link in each row header that flashes
        up the variable ID in a javascript alert dialouge.
*/
function drawTable(containerID, data, no_total, linkFunction) {

    //We want to work with a clone of the data, not the data itself.
    data = $.extend(true, {}, data);

    //Initialise an array to store the summation values for the table.
    var sum = [0, 0, 0, 0];

    var weeks = lastWeeks(get_epi_week(), 3);

    //Table headers.
    table = '<table class="table table-hover table-condensed"><thead><tr>' +
        '<th>' + data.title + '</th><th>' + i18n.gettext('Week') + ' ' + weeks[0] + '</th>' +
        '<th>' + i18n.gettext('Week') + ' ' + weeks[1] + '</th><th>' + i18n.gettext('Week') + ' ' + weeks[2] + '</th>' +
        '<th>' + i18n.gettext('This Year') + '</th></tr></thead><tbody>';

    //For each data category, assemble a html string listing data for the three weeks and the year.
    for (var i = 0; i < data.labels.length; i++) {

        if (typeof linkFunction != 'undefined') {

            table += "<tr><td>" +
                "<a href='' onclick='" + linkFunction + "(\"" + data.ids[i] +
                "\");return false;' >" + data.labels[i] + '</a></td>';
        } else {
            table += '<tr><td>' + i18n.gettext(data.labels[i]) + '</td>';
        }

        if (data.yearPerc) {

            table += "<td>" + format(data.week[i]) + " <div class='table-percent'>(" + (
                    data.weekPerc[i] ? data.weekPerc[i] : "0") + "%)</div></td>" +
                "<td>" + format(data.week1[i]) + " <div class='table-percent'>(" +
                (data.week1Perc[i] ? data.week1Perc[i] : "0") + "%)</div></td>" +
                "<td>" + format(data.week2[i]) + " <div class='table-percent'>(" +
                (data.week2Perc[i] ? data.week2Perc[i] : "0") + "%)</div></td>" +
                "<td>" + format(data.year[i]) + " <div class='table-percent'>(" +
                data.yearPerc[i] + "%)</div></td></tr>";
        } else {

            table += "<td>" + format(data.week[i]) + "</td><td>" +
                format(data.week1[i]) + "</td><td>" +
                format(data.week2[i]) + "</td><td>" +
                format(data.year[i]) + "</td></tr>";
        }

        //Keep track of the sum over the data.
        sum[0] = data.week[i] + sum[0];
        sum[1] = data.week1[i] + sum[1];
        sum[2] = data.week2[i] + sum[2];
        sum[3] = data.year[i] + sum[3];
    }

    if (!no_total) {

        table += '</tr><tr class="info"><td>' + i18n.gettext('Total') + '</td>';

        for (var j = 0; j < sum.length; j++) {
            table += "<td>" + format(sum[j]) + "</td>";
        }
    }

    table += "</tr></tbody></table>";

    //Draw it!
    $('#' + containerID).html(table);

    return table;
}

/**:drawImprovedTable(containerID, data, no_total, linkFunction, tableOptions)

    Creates epi tables with data from: current week, last two weeks and the year.
    Takes the same data object as the chart drawing functions. Rather than loading JSON
    data inside the method, it is passed as arguments to the method so that JSON requests
    can be shared across multiple drawings. This is the most generic table drawing function
    called primarily from the misc.js function `categorySummation()`.

    :param string containerID:
        The ID of the html element to hold the table.
    :param object data:
        The data to be tabulated, built by the misc.js function `buildDataObject()`.
    :param boolean no_total:
        Set to true if no total row should be included.
    :param string linkfunction:
        The function name to be added "onclick" to each table row header.
        The linkfunction is given the row's variable ID as an argument (such as "gender_1").
        e.g. We write a function `uslessAlert( varID ){ alert(varID); }`, and set the
        linkFunction argument to "uselessAlert" to create a link in each row header that flashes
        up the variable ID in a javascript alert dialouge.
    :param array tableOptions:
        Additional options for a table to be created.


*/
function drawImprovedTable(containerID, data, no_total, linkFunction, tableOptions) {

    //We want to work with a clone of the data, not the data itself.
    data = $.extend(true, {}, data);

    //Initialise an array to store the summation values for the table.
    var sum = [0, 0, 0, 0];

    var weeks = lastWeeks(get_epi_week(), 3);


    var columns = [{
        "field": "main",
        "title": data.title,
        "align": "center",
        "class": "header",
        "sorter": function commas(a, b) {
            a = parseInt(a.replace(/,/g, ''));
            b = parseInt(b.replace(/,/g, ''));
            if (a < b) return 1;
            if (a > b) return -1;
            return 0;
        },
        sortable: false,
        width: "40%",
    }, {
        "field": "week0",
        "title": i18n.gettext('Week') + ' ' + weeks[0],
        "align": "center",
        "class": "header",
        "sorter": function commas(a, b) {
            a = parseInt(a.replace(/,/g, ''));
            b = parseInt(b.replace(/,/g, ''));
            if (a < b) return 1;
            if (a > b) return -1;
            return 0;
        },
        sortable: true,
        width: "15%",
    }, {
        "field": "week1",
        "title": i18n.gettext('Week') + ' ' + weeks[1],
        "align": "center",
        "class": "header",
        "sorter": function commas(a, b) {
            a = parseInt(a.replace(/,/g, ''));
            b = parseInt(b.replace(/,/g, ''));
            if (a < b) return 1;
            if (a > b) return -1;
            return 0;
        },
        sortable: true,
        width: "15%",
    }, {
        "field": "week2",
        "title": i18n.gettext('Week') + ' ' + weeks[2],
        "align": "center",
        "class": "header",
        "sorter": function commas(a, b) {
            a = parseInt(a.replace(/,/g, ''));
            b = parseInt(b.replace(/,/g, ''));
            if (a < b) return 1;
            if (a > b) return -1;
            return 0;
        },
        sortable: true,
        width: "15%",
    }, {
        "field": "year",
        "title": i18n.gettext('This Year'),
        "align": "center",
        "class": "header",
        "visible": "false",
        "sorter": function commas(a, b) {
            a = parseInt(a.replace(/,/g, ''));
            b = parseInt(b.replace(/,/g, ''));
            if (a < b) return 1;
            if (a > b) return -1;
            return 0;
        },
        sortable: true,
        width: "15%"
    }];

    //For each data category, assemble a listing bootstrap data variable for the three weeks and the year.
    var dataPrepared = [];
    for (var i = 0; i < data.labels.length; i++) {
        var mainLabel;
        var week0Label, week1Label, week2Label, yearLabel;
        if (typeof linkFunction != 'undefined') {
            mainLabel = "<a href='' onclick='" + linkFunction + "(\"" + data.ids[i] +
                "\");return false;' >" + i18n.gettext(data.labels[i]) + "</a>";
        } else {
            mainLabel = i18n.gettext(data.labels[i]);
        }
        if (data.yearPerc) {
            week0Label = format(data.week[i]) + " <div class='table-percent'>(" +
                (data.weekPerc[i] ? data.weekPerc[i] : 0) + "%)</div>";
            week1Label = format(data.week1[i]) + " <div class='table-percent'>(" +
                (data.week1Perc[i] ? data.week1Perc[i] : 0) + "%)</div>";
            week2Label = format(data.week2[i]) + " <div class='table-percent'>(" +
                (data.week2Perc[i] ? data.week2Perc[i] : 0) + "%)</div>";
            yearLabel = format(data.year[i]) + " <div class='table-percent'>(" +
                data.yearPerc[i] + "%)</div>";
        } else {
            week0Label = format(data.week[i]);
            week1Label = format(data.week1[i]);
            week2Label = format(data.week2[i]);
            yearLabel = format(data.year[i]);
        }
        var datum = {
            "main": mainLabel,
            "week0": week0Label,
            "week1": week1Label,
            "week2": week2Label,
            "year": yearLabel
        };
        dataPrepared.push(datum);
        //Keep track of the sum over the data.
        sum[0] = data.week[i] + sum[0];
        sum[1] = data.week1[i] + sum[1];
        sum[2] = data.week2[i] + sum[2];
        sum[3] = data.year[i] + sum[3];
    }

    if (tableOptions.strip == "true") dataPrepared = stripRows(dataPrepared);

    //if(tableOptions.colour == "true"){
    for (var k = 0; k < columns.length; k++) {
        columns[k].cellStyle = createColourCellTab(tableOptions.colour);
    }
    //}

    //Add totals
    if (!no_total) {
        var tot = {
            "main": i18n.gettext('Total'),
            "week0": format(sum[0]),
            "week1": format(sum[1]),
            "week2": format(sum[2]),
            "year": format(sum[3])
        };
        dataPrepared.push(tot);
    }
    //$('#' + containerID ).append('<table class="table"></table>');
    $('#' + containerID + ' table').bootstrapTable('destroy');
    $('#' + containerID + ' table').remove();
    $('#' + containerID).append('<table class="table"></table>');
    table = $('#' + containerID + ' table').bootstrapTable({
        columns: columns,
        data: dataPrepared,
        classes: 'table-no-bordered table-hover'
    });
    return table;
}


/**:drawOptionsButtons(tableID, redrawFunctionName)

    Draws the table options buttons for tables in the dashboard created using bootstrap tables.
    These options allow you to colour the cells according to their value and to strip empty records.

    :param string tableID:
        The ID attribute of the html element to hold the table assoiated with the buttons.
    :param string redrawFunctionName:
        Name of the local function which redraws the table
 */
function drawOptionsButtons(tableID, redrawFunctionName) {

    var html = "<div class='table-options'>";

    html += "<span class='glyphicon glyphicon-resize-small " + tableID + "-option pull-right' " +
        "id='strip-button' onClick='callTableOptionButton(this,\"" + redrawFunctionName + "\");' " +
        "title='" + i18n.gettext('Hide/show empty records') +
        "' table='disease-table' value=false name='strip'></span>";

    html += "<span class='glyphicon glyphicon-pencil " + tableID + "-option pull-right' " +
        " id='colour-button' onClick='callTableOptionButton(this,\"" + redrawFunctionName + "\");'" +
        " title='" + i18n.gettext('Colour the table') +
        "' table='disease-table' value=false name='colour'></span>";

    html += "</div>";

    $('#' + tableID).attr("style", "padding-top: 28px");
    $('#' + tableID).prepend(html);
}

//Function that updates table option button's values.
function callTableOptionButton(element, redrawFunctionName) {
    var value = $(element).attr("value");
    $(element).attr("value", value == "true" ? "false" : "true");

    //If the option called is strip rows, we want to swap between two glyph icons.
    if ($(element).attr("name") == "strip") {
        $(element).toggleClass("glyphicon-resize-small");
        $(element).toggleClass("glyphicon-resize-full");
    }

    //Check that the redraw function exists, if it does, call it.
    var fn = window[redrawFunctionName];
    if (typeof fn === 'function') {
        fn();
    }
}


/**:drawAlertsTable(containerID, alerts, variables, alerts_table_config)

    Draws the table of alerts used on the Alerts tab. Lists each alert according to date
    and provides links to the individual Alert Investigation reports. Rather than loading JSON
    data inside the method, it is passed as arguments to the method so that JSON requests
    can be shared across multiple drawings.

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param [object] alerts:
        An array of alert objects as returned by Meerkat API `/alerts`.
    :param object variables:
        An object containing details for given variable IDs, as returned by Meerkat API `/variables`.
        Specifically used to print the variable name instead of ID.
    :param object alerts_table_config
        Set of settings to customise the table
 */
function drawAlertsTable(containerID, alerts, variables, alerts_table_config) {

    alerts_table_config = alerts_table_config || {};
    alerts_table_config.district_column = alerts_table_config.district_column || false;


    $.getJSON(api_root + "/locations", function(locations) {

        // Prep the data for display in the table.
        // HACK? Should this be done in the api?

        for (var a in alerts) {
            // Appears to be a bug with bootstrap table search
            // All searchable parameters are required to be in the parent object
            alerts[a].display_alert_id = '<a href="" onclick="loadAlert(\'' +
                alerts[a].variables.alert_id + '\'); return false;">' +
                alerts[a].variables.alert_id + '</a>';
            alerts[a].display_reason = i18n.gettext(variables[alerts[a].variables.alert_reason].name);
            alerts[a].display_type = capitalise(i18n.gettext(alerts[a].variables.alert_type));
            alerts[a].display_region = i18n.gettext(locations[alerts[a].region].name);
            alerts[a].display_district = i18n.gettext(locations[alerts[a].district].name);
            if (alerts[a].clinic) {
                alerts[a].display_clinic = locations[alerts[a].clinic].name || i18n.gettext(alerts[a].type_name);
            } else {
                alerts[a].display_clinic = i18n.gettext(alerts[a].type_name);
            }
            alerts[a].display_date = alerts[a].date.split("T")[0];
            alerts[a].display_date_investigated = "ale_1" in alerts[a].variables ? alerts[a].variables.ale_1.split("T")[0] : "-";
            alerts[a].display_central_review = "cre_1" in alerts[a].variables ? alerts[a].variables.cre_1.split("T")[0] : "-";

            var status = i18n.gettext('Pending');
            if (config.central_review) {
                if ("ale_1" in alerts[a].variables) {
                    if ("ale_2" in alerts[a].variables) status = i18n.gettext("Ongoing");
                    else if ("ale_3" in alerts[a].variables) status = i18n.gettext("Disregarded");
                    else status = i18n.gettext("Ongoing");
                }
                if ("cre_1" in alerts[a].variables) {
                    if ("cre_2" in alerts[a].variables) status = i18n.gettext("Confirmed");
                    else if ("cre_3" in alerts[a].variables) status = i18n.gettext("Disregarded");
                    else status = i18n.gettext("Ongoing");
                }
            } else {
                if ("ale_1" in alerts[a].variables) {
                    if ("ale_2" in alerts[a].variables) status = i18n.gettext("Confirmed");
                    else if ("ale_3" in alerts[a].variables) status = i18n.gettext("Disregarded");
                    else status = i18n.gettext("Ongoing");
                }
            }
            alerts[a].display_status = status;
        }

        var columns = [{
            field: "display_alert_id",
            title: i18n.gettext('Alert ID'),
            align: "center",
            class: "header",
            sortable: true,
            sortName: "variables.alert_id",
        }, {
            field: "display_reason",
            title: i18n.gettext('Alert'),
            align: "center",
            class: "header",
            sortable: true,
        }, {
            field: "display_type",
            title: i18n.gettext('Type'),
            align: "center",
            class: "header",
            sortable: true,
        }, {
            field: "display_region",
            title: i18n.gettext('Region'), // TODO: use glossary.
            align: "center",
            class: "header",
            sortable: true,
        }, {
            field: "display_clinic",
            title: i18n.gettext('Clinic'),
            align: "center",
            class: "header",
            sortable: true
        }, {
            field: "display_date",
            title: i18n.gettext('Date Reported'),
            align: "center",
            class: "header",
            sortable: true
        }, {
            field: 'display_date_investigated',
            title: i18n.gettext('Date Investigated'),
            align: "center",
            class: "header",
            sortable: true
        },{  field: 'display_status',
            title: i18n.gettext('Status'),
            align: "center",
            class: "header",
            sortable: true
        }];

        if(config.central_review){
            var central_review_column = {
                field: 'display_central_review',
                title: i18n.gettext('Central Review'),
                align: "center",
                class: "header",
                sortable: true
            };
            columns.splice(7,0, central_review_column);

        }

        if(alerts_table_config.district_column){
            var dist_column = {
                field: "display_district",
                title: i18n.gettext('District'),
                align: "center",
                class: "header",
                sortable: true,
            };
            columns.splice(4,0,dist_column);
        }

        // Some countries(Jordan) has a central review in addition to alert_investigation
        // If the alert has been investigated (and has a central review) we display that in the table
        // if (!config.central_review) columns.splice(7, 1);

        // First destroyany pre-existing table.
        $('#' + containerID + ' table').bootstrapTable('destroy');
        $('#' + containerID + ' table').remove();
        $('#' + containerID).append('<table class="table"></table>');
        table = $('#' + containerID + ' table').bootstrapTable({
            columns: columns,
            data: alerts,
            search: true,
            classes: 'table table-no-bordered table-hover',
            pagination: true,
            pageSize: 50,
        });
        addPaginationListener('#' + containerID + ' table');

    });
}



/**:drawAlertAggTable(containerID, aggData, variables)

    Draws the table of alert aggregation used on the Alerts tab. Lists the number of
    alerts for each cause (e.g. Viral Meningitis) and provides links that filter the
    alerts table (as specified by drawAlertsTable() ) by cause. Rather than loading JSON
    data inside the method, it is passed as arguments to the method so that JSON requests
    can be shared across multiple drawings.

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param object aggData:
        An alert aggregation data object as returned by Meerkat API `/aggregate_alerts`.
    :param object variables:
        An object containing details for given variable IDs, as returned by Meerkat API `/variables`.
        Specifically used to print the variable name instead of ID.
 */
function drawAlertAggTable(containerID, aggData, variables) {

    var table = '<table class="table table-hover table-condensed">' +
        '<tr><th>' + i18n.gettext('Reason') + '</th><th>' + i18n.gettext('Pending') + '</th><th>' + i18n.gettext('Ongoing') +
        '</th><th>' + i18n.gettext('Confirmed') + '</th><th>' + i18n.gettext('Disregarded') + '</th><th>' + i18n.gettext('Total') + '</th></tr>';

    //Get a list of the aggData keys without 'total'
    var reasons = Object.keys(aggData);
    reasons.splice(Object.keys(aggData).indexOf('total'), 1);

    var statusList = ['Pending', 'Ongoing', 'Confirmed', 'Disregarded'];
    var sum = [];
    for (var l in statusList) sum[l] = 0;

    //Run summation and html creation for each row of the table.
    for (var i in reasons) {

        var reason = reasons[i];
        var total = 0;

        table += '<tr><td><a href="" onclick="loadAlertTables(\'' + reason + '\');return false;">' +
            i18n.gettext(variables[reason].name) + '</a></td>';

        for (var j in statusList) {

            var value = if_exists(aggData[reason], statusList[j]);

            sum[j] += value;
            total += value;
            table += '<td>' + value + '</td>';
        }

        table += '<td>' + total + '</td></tr>';
    }

    //Create the total row.
    table += '<tr class="info" ><td><a href="" onclick="loadAlertTables(); return false;" >Total</td>';
    for (var k in sum) table += '<td>' + sum[k] + '</td>';
    table += '<td>' + aggData.total + '</td></tr></table>';

    $('#' + containerID).html(table);

}

/**:drawPipTable(containerID, aggData, variables)

    ??

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param number location_id:
        The ID of the location by which to filer data.
    :param string variable_id:
        ??
    :param string link_def_id_labs:
        ??
    :param string link_def_id_return:
        ??
    :param string links_variable:
        ??
 */


function drawPipTable(containerID, location_id, variable_id, link_def_id_labs, link_def_id_return, link_variable) {

    var pipColumnNameArray = [];
    var pipDataArray = [];

    //This function is responsible for building the table header ...
    function buildBootstrapTableColumn(columnId, columnName, columnClass) {
        pipColumnNameArray.push({
            field: columnId,
            title: i18n.gettext(columnName),
            align: "center",
            sortable: true,
            sortName: columnId,
            valign: "middle",
            class: columnClass
        });
    }

    //Starts loader ...
    $('.spinner').show();

    //Clear array...
    pipColumnNameArray = [];
    pipDataArray = [];

    $.getJSON(api_root + "/locations", function(locations) {
        //Build bootstrap columns ...
        buildBootstrapTableColumn('NAMRUID', 'NAMRU-ID', '');
        buildBootstrapTableColumn('Region', 'Region', '');
        buildBootstrapTableColumn('Clinic', 'Clinic', '');
        buildBootstrapTableColumn('DateReported', 'Date Reported', '');
        buildBootstrapTableColumn('FollowUpCompleted', 'Follow-up completed', '');
        buildBootstrapTableColumn('LaboratoryResults', 'Laboratory Results', '');
        buildBootstrapTableColumn('Status', 'Status', '');

        //Create the table headers, using the central review flag from the cofiguration file.
        //Central review is a third level of alert review requested by the Jordan MOH.
        $.getJSON(api_root + "/records/" + variable_id + "/" + location_id, function(case_dict) {
            var cases = case_dict.records;
            cases.sort(function(a, b) {
                return new Date(b.date).valueOf() - new Date(a.date).valueOf();
            });

            for (var i in cases) {
                c = cases[i];

                var dataObject = {};
                dataObject.NAMRUID = c.variables.pip_1;
                dataObject.Region = i18n.gettext(locations[c.region].name);
                dataObject.Clinic = i18n.gettext(locations[c.clinic].name);
                dataObject.DateReported = c.date.split("T")[0];

                if ("pif_1" in c.variables) {
                    dataObject.FollowUpCompleted = c.variables.pif_2.split("T")[0];
                } else {
                    dataObject.FollowUpCompleted = '-';
                }

                if ("pil_1" in c.variables) {
                    if ("pil_2" in c.variables) {
                        status = i18n.gettext("Positive");
                        if ("pil_4" in c.variables) {
                            type = i18n.gettext("H3");
                        } else if ("pil_5" in c.variables) {
                            type = i18n.gettext("H1N1");
                        } else if ("pil_6" in c.variables) {
                            type = i18n.gettext("B");
                        } else if ("pil_7" in c.variables) {
                            type = i18n.gettext("Mixed");
                        }

                        status = i18n.gettext("Type:") + " <b>" + type + "</b>";
                    } else {
                        status = i18n.gettext("Negative");
                    }
                    dataObject.LaboratoryResults = c.variables.pil_1.split("T")[0];
                    dataObject.Status = status;
                } else {
                    dataObject.LaboratoryResults = '-';
                    dataObject.Status = i18n.gettext('Pending');
                }
                pipDataArray.push(dataObject);
            }

            //Append the table and the columns ...
            $('.spinner').hide();
            $('#' + containerID).append('<table class="table"></table>');
            $('#' + containerID + ' table').bootstrapTable({
                columns: pipColumnNameArray,
                data: pipDataArray,
                pagination: true,
                pageSize: 10,
                search: true,
                classes: "table table-no-bordered table-hover"
            });

            addPaginationListener($('#' + containerID + ' table'));
        });
    });
}

// Hack to fix the pagination dropdown menu bug with bootstrap table.
function addPaginationListener(table) {

    $('.page-list button.dropdown-toggle').click(function() {
        $('.page-list .dropdown-menu').toggle();
    });

    $(table).on('page-change.bs.table', function() {
        $('.page-list button.dropdown-toggle').click(function() {
            $('.page-list .dropdown-menu').toggle();
        });
    });
}

/**:drawContactSummaryTable(containerID, location_id)

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param number location_id:
        The ID of the location by which to filer data.
 */
function drawContactSummaryTable(containerID, location_id) {

    var deferreds = [
        $.getJSON(api_root + "/locations", function(data) {
            locations = data;
        }),
        $.getJSON(api_root + "/aggregate_category_sum/cv_visits_reason/" + location_id, function(data) {
            con_reasons = data;
        }),
        $.getJSON(api_root + "/aggregate_category_sum/cv_visits/" + location_id, function(data) {
            con_visits = data;
        }),
        $.getJSON(api_root + "/aggregate_category/key_indicators/" + location_id, function(data) {
            totals = data;
        }),
        $.getJSON(api_root + "/variables/cv_visits_reason", function(data) {
            con_reasons_names = data;
        })
    ];

    $.when.apply($, deferreds).then(function() {
        var data = [];
        var nowWeek = get_epi_week();

        columns = [{
                field: "name",
                title: i18n.gettext('Indicator')
            },
            {
                field: "value",
                title: i18n.gettext('This year')
            }
        ];
        //total number of contacts
        //number of contacts this week
        data = [{
                name: "New contacts",
                value: totals.con_1.total
            },
            {
                name: "Visits",
                value: con_visits.cv_vis_yes.year
            },
            {
                name: "Missed visits",
                value: con_visits.cv_vis_no.year
            }
        ];
        var m_reasons = Object.keys(con_reasons_names);
        for (var m in m_reasons) {
            var datum = {
                name: con_reasons_names[m_reasons[m]].name,
                value: con_reasons[m_reasons[m]].year
            };
            data.push(datum);
        }


        $('#' + containerID).html("<table> </table>");
        $('#' + containerID + ' table').bootstrapTable({
            columns: columns,
            data: data
        });
    });
}
/**:drawContactTracingTable(containerID, location_id)

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param number location_id:
        The ID of the location by which to filer data.
 */
function drawContactTracingTable(containerID, location_id) {

    columns = [{
            field: "contact_id",
            title: i18n.gettext('Contact ID'),
            'searchable': true
        },
        {
            field: "caid",
            title: i18n.gettext('CA ID'),
            'searchable': true
        },
        {
            field: "region",
            title: i18n.gettext('Region'),
            'searchable': true
        },
        {
            field: "clinic",
            title: i18n.gettext('Centre'),
            'searchable': true
        },
        {
            field: "date",
            title: i18n.gettext('Treatment Date')
        },
        {
            field: "symptoms",
            title: i18n.gettext('Symptoms'),
            'searchable': true
        },
        {
            field: "medication",
            title: i18n.gettext('Medication')
        },
        {
            field: "status",
            title: i18n.gettext('Status'),
            'searchable': true
        }

    ];

    var deferreds = [
        $.getJSON(api_root + "/locations", function(data) {
            locations = data;
        }),
        $.getJSON(api_root + "/variables/contact_med", function(data) {
            med_var = data;
        }),
        $.getJSON(api_root + "/records/con_1/" + location_id, function(data) {
            case_dict = data;
        }),
        $.getJSON(api_root + "/variables/contact_signs", function(data) {
            symptoms_var = data;
        }),
        $.getJSON(api_root + "/variables/contact_final_status", function(data) {
            status_var = data;
        })
    ];



    $.when.apply($, deferreds).then(function() {
        var cases = case_dict.records;
        cases.sort(function(a, b) {
            return new Date(b.date).valueOf() - new Date(a.date).valueOf();
        });

        var data = [];
        for (var i in cases) {
            c = cases[i];
            var meds = "None";
            var final_status = "Active";
            var signs = "";
            if (c.categories.contact_med != undefined) {
                meds = med_var[c.categories.contact_med].name;
            }
            if (c.categories.contact_final_status != undefined) {
                final_status = status_var[c.categories.contact_final_status].name;
            }
            main_sympt_k = Object.keys(symptoms_var);
            var_s_k = Object.keys(c.variables);
            for (var main_sympt in main_sympt_k) {
                for (var var_s in var_s_k) {
                    if (var_s_k[var_s] === main_sympt_k[main_sympt]) {
                        signs += symptoms_var[main_sympt_k[main_sympt]].name + ", ";
                    }
                }
            }
            var datum = {
                contact_id: c.uuid,
                caid: c.variables.con_ca_id,
                region: i18n.gettext(locations[c.region].name),
                clinic: i18n.gettext(locations[c.clinic].name),
                date: c.date.split("T")[0],
                symptoms: signs,
                medication: meds,
                status: final_status
            };

            data.push(datum);
        }
        $('#' + containerID).html("<table> </table>");
        $('#' + containerID + ' table').bootstrapTable({
            columns: columns,
            data: data,
            search: true
        });
    });
}

/**:drawEbsTable(containerID, aggData, variables)

    ??

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param number location_id:
        The ID of the location by which to filer data.
    :param string variable_id:
        ??
    :param string link_def_id_labs:
        ??
    :param string link_def_id_return:
        ??
    :param string links_variable:
        ??
 */
function drawEbsTable(containerID, location_id) {
    $.getJSON(api_root + "/locations", function(locations) {
        columns = [{
                field: "alert_id",
                title: i18n.gettext('Alert ID'),
                'searchable': true
            },
            {
                field: "region",
                title: '<span class="glossary capitalised" word="region">' + i18n.gettext('Governorate') + '</span>',
                'searchable': true
            },
            {
                field: "clinic",
                title: i18n.gettext('Centre'),
                'searchable': true
            },
            {
                field: "event_date",
                title: i18n.gettext('Event Reported')
            },
            {
                field: "initial_investigation",
                title: i18n.gettext('Initial <br />Investigation')
            },
            {
                field: "last_followup",
                title: i18n.gettext('Last Followup')
            },
            {
                field: "central_review",
                title: i18n.gettext('Central <br /> Review Date')
            },
            {
                field: "outcome",
                title: i18n.gettext('Outcome')
            },
            {
                field: "risk",
                title: i18n.gettext('Risk')
            }

        ];
        $.getJSON(api_root + "/variables/ebs_risk_level", function(variables) {
            $.getJSON(api_root + "/records/ebs_1/" + location_id, function(case_dict) {
                var cases = case_dict.records;
                cases.sort(function(a, b) {
                    return new Date(b.date).valueOf() - new Date(a.date).valueOf();
                });

                var data = [];

                for (var i in cases) {
                    c = cases[i];
                    var datum = {
                        alert_id: '<a href="" onclick="loadAlert(\'' + c.variables.alert_id + '\'); return false;">' + c.variables.alert_id + '</a>',
                        region: i18n.gettext(locations[c.region].name),
                        clinic: i18n.gettext(locations[c.clinic].name),
                        event_date: c.date.split("T")[0],
                        initial_investigation: "-",
                        last_followup: "-",
                        central_review: "-",
                        outcome: "-",
                        risk: "-"
                    };

                    if ("ebs_initial" in c.variables) {
                        datum.initial_investigation = c.variables.ebs_initial.split("T")[0];
                    }
                    if ("ebs_followup" in c.variables) {
                        datum.last_followup = c.variables.ebs_followup.split("T")[0];
                    }
                    if ("ebs_central_review" in c.variables) {
                        datum.central_review = c.variables.ebs_central_review.split("T")[0];
                        outcome = i18n.gettext("Pending");
                        if ("ebs_confirmed" in c.variables) {
                            outcome = i18n.gettext("Confirmed");
                        }
                        if ("ebs_no_confirm" in c.variables) {
                            outcome = i18n.gettext("Disregarded");
                        }
                        datum.outcome = outcome;
                        risk = i18n.gettext("Not Done");
                        if ("ebs_risk_performed" in c.variables || "ebs_risk_level" in c.categories) {
                            risk = variables[c.categories.ebs_risk_level].name;
                        }
                        datum.risk = risk;
                    }

                    data.push(datum);
                }

                $('#' + containerID).html("<table> </table>");
                $('#' + containerID + ' table').bootstrapTable({
                    columns: columns,
                    data: data,
                    search: true
                    //					pagination: true,
                    //					pageSize: 20
                });
            });
        });
    });




}
/**:drawMalariaStockTable(containerID, location_id)

    ??

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param number location_id:
        The ID of the location by which to filer data.

 */
function drawMalariaStockTable(containerID, location_id, stock_variable, variable_prefix, n_records_id) {
    var stocks = {
        "malaria_rdt": i18n.gettext("RDT (Kit)"),
        "malaria_act_age0": i18n.gettext("ACT 02-12 Months"),
        "malaria_act_age1": i18n.gettext("ACT 1-5 Years"),
        "malaria_act_age2": i18n.gettext("ACT 6-13 Years"),
        "malaria_act_age3": i18n.gettext("ACT >14 Years"),
        "malaria_art_inj": i18n.gettext("Artesunate injectable"),
        "malaria_art_supp": i18n.gettext("Artesunate suppositories"),
        "malaria_cp": i18n.gettext("Primaquine"),
        "malaria_sulfadoxine": i18n.gettext("Sulfadoxine Pyriméthamine"),
        "malaria_mid": i18n.gettext("MID de routine")
    };

    $.getJSON(api_root + "/locations", function(locations) {

        //Create the table headers, using the central review flag from the cofiguration file.
        columns = [
            {
                field: "stock",
                title: ""
            },
            {
                field: "start_week",
                title: i18n.gettext("Begining of the week")
            },
            {
                field: "received",
                title: i18n.gettext('Quantity Received'),
                'searchable': true
            },
            {
                field: "used",
                title: i18n.gettext('Quantity Used')
            },
            {
                field: "adjustment",
                title: i18n.gettext('Adjustment')
            },
            {
                field: "end_week",
                title: i18n.gettext('End of the week')
            },{
                field: "cmm",
                title: i18n.gettext('Average Monthly Consumption')
            }
        ];

        $.getJSON(api_root + "/records/" + stock_variable +"/" + location_id + "?only_last_week=1&unique_clinic=last", function(case_dict) {
            var records = case_dict.records;
            var data = [];
            for (var stock in stocks){
                var stock_name = stocks[stock];
                var start = 0;
                var end = 0;
                var used = 0;
                var received = 0;
                var adjustment = 0;
                var cmm = 0;
                if(variable_prefix){
                    stock = variable_prefix + stock;
                }
                console.log(stock);
                for (var record_index in records){
                    record = records[record_index].variables;
                    start += record[stock + "_start"];
                    used += record[stock + "_used"];
                    adjustment += record[stock + "_adjust"];
                    received += record[stock + "_received"];
                    cmm += record[stock + "_cmm"];
                    end += record[stock + "_start"] + record[stock + "_received"] -
                        record[stock + "_used"] +  record[stock + "_adjust"];
                }
                data.push({
                    "stock": stock_name,
                    "start_week": start,
                    "end_week": end,
                    "used": used,
                    "adjustment": adjustment,
                    "cmm": cmm,
                    "received": received
                });
            }
            $('#' + containerID).html("<table> </table>");
            $('#' + containerID + ' table').bootstrapTable({
                columns: columns,
                data: data

            });
        });
    });
}
/**:drawTBTable(containerID, aggData, variables)

    ??

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param number location_id:
        The ID of the location by which to filer data.

 */
function drawTbTable(containerID, location_id) {
    $.getJSON(api_root + "/locations", function(locations) {

        //Create the table headers, using the central review flag from the cofiguration file.



        columns = [{
                field: "sample_id",
                title: i18n.gettext('Sample ID'),
                'searchable': true
            },
            {
                field: "region",
                title: '<span class="glossary capitalised" word="region">' + i18n.gettext('Governorate') + '</span>',
                'searchable': true
            },
            {
                field: "clinic",
                title: i18n.gettext('Centre'),
                'searchable': true
            },
            {
                field: "initial_visit",
                title: i18n.gettext('Centre Visit Date')
            },
            {
                field: "lab",
                title: i18n.gettext('Labratory <br />Results Date')
            },
            {
                field: "cxr",
                title: i18n.gettext('Chest X-Ray')
            },
            {
                field: "hiv",
                title: i18n.gettext('HIV Result')
            },
            {
                field: "hep_b",
                title: i18n.gettext('Hepatitis B <br />Result')
            },
            {
                field: "certificate",
                title: i18n.gettext('Certificate <br /> Received')
            }
        ];

        $.getJSON(api_root + "/records/tub_1/" + location_id, function(case_dict) {
            var cases = case_dict.records;
            cases.sort(function(a, b) {
                return new Date(b.date).valueOf() - new Date(a.date).valueOf();
            });

            var data = [];

            for (var i in cases) {
                c = cases[i];

                var datum = {
                    sample_id: c.variables.tub_2,
                    region: i18n.gettext(locations[c.region].name),
                    clinic: i18n.gettext(locations[c.clinic].name),
                    initial_visit: c.date.split("T")[0],
                    follow_up: "-",
                    cxr: "-",
                    lab: "-",
                    hiv: "-",
                    hep_b: "-"
                };

                if ("tbr_1" in c.variables) {
                    if ("tbr_2" in c.variables) {
                        datum.cxr = i18n.gettext('Positive');
                    } else {
                        datum.cxr = i18n.gettext('Negative');
                    }
                }
                if ("tbl_1" in c.variables) {
                    datum.lab = c.variables.tbl_1.split("T")[0];
                    if ("tbl_2" in c.variables) {
                        datum.hiv = i18n.gettext('Positive');
                    } else {
                        datum.hiv = i18n.gettext('Negative');
                    }
                    if ("tbl_3" in c.variables) {
                        datum.hep_b = i18n.gettext('Positive');
                    } else {
                        datum.hep_b = i18n.gettext('Negative');
                    }
                }
                if ("tb_certificate" in c.variables) {
                    datum.certificate = c.variables.tb_certificate.split("T")[0];
                }
                data.push(datum);
            }
            $('#' + containerID).html("<table> </table>");
            $('#' + containerID + ' table').bootstrapTable({
                columns: columns,
                data: data,
                search: true
                //					pagination: true,
                //					pageSize: 20
            });
        });
    });
}




/**:drawAllClincsCompleteness(containerID, regionID)

   Draws the completeness table, showing the percentage of daily registers submitted
   by clinics in each region over last period (2 weeks)

   :param string containerid:
   the id attribute of the html element to hold the table.
   :param int regionID:
   All clinics in this region (and its subregions) will be included in that table
   the id of the region from w.hich all clinics will
   :param Object locations:
   List of all locations from API.
   :param Object data:
   Completeness data from API.
 */

function drawAllClinicsCompleteness(containerID, regionID, locations, data) {

    if (data.clinic_score === undefined) {
        return undefined;
    }

    var scoreKeys = Object.keys(data.clinic_score);
    var dataPrepared = [];
    var index = 0;
    for (var i = 0; i < scoreKeys.length; i++) {
        index = scoreKeys[i];
        var datum = {
            "id": index,
            "location": locations[index].name,
            "completeness": Number(data.clinic_score[index]).toFixed(0) + "%",
            "yearly": Number(data.clinic_yearly_score[index]).toFixed(0) + "%"
        };
        dataPrepared.push(datum);
    }


    var columns = [{
        "field": "location",
        "title": i18n.gettext("Clinic"),
        "align": "center",
        "class": "header",
        sortable: true,
        width: "34%"
    }, {
        "field": "completeness",
        "title": i18n.gettext("This Week"),
        "align": "center",
        "class": "header",
        sortable: true,
        "sorter": function percs(a, b) {
            a = Number(a.split('%')[0]);
            b = Number(b.split('%')[0]);
            if (a < b) return 1;
            if (a > b) return -1;
            return 0;
        },
        width: "33%"
    }, {
        "field": "yearly",
        "title": i18n.gettext("This Year"),
        "align": "center",
        "class": "header",
        sortable: true,
        "sorter": function percs(a, b) {
            a = Number(a.split('%')[0]);
            b = Number(b.split('%')[0]);
            if (a < b) return 1;
            if (a > b) return -1;
            return 0;
        },
        width: "33%"
    }];

    for (var k = 0; k < columns.length; k++) {
        columns[k].cellStyle = createCompletenessCellTab();
    }

    $('#' + containerID + ' table').bootstrapTable('destroy');
    $('#' + containerID + ' table').remove();
    $('#' + containerID).append('<table class="table"></table>');
    var table = $('#' + containerID + ' table').bootstrapTable({
        columns: columns,
        data: dataPrepared,
        idField: "id",
        classes: 'table-no-bordered table-hover',
        sortName: 'completeness',
        sortOrder: 'desc'
    });
    return table;
}


function drawPlagueTable(containerID, cases, variables) {
  $.getJSON(api_root + "/locations", function(locations) {
    //Create the table headers, using the central review flag from the cofiguration file.

    var columns = [
      {
	field: "alert_id",
	title: i18n.gettext('Alert ID'),
	'searchable': true,
	width: "10%",
	valign: "middle"
      },
      {
        field: "region",
        title: i18n.gettext('Region'),
        width: "10%",
        valign: "middle"
      },
      {
        field: "district",
        title: i18n.gettext('District'),
        width: "10%",
        valign: "middle"
      },
      {
        field: "clinic",
        title: i18n.gettext('Clinic'),
        'searchable': true,
        width: "10%",
        valign: "middle"
      },
      {
        field: "report_date",
        title: i18n.gettext('Date <br /> Reported'),
        width: "10%",
        valign: "middle"
      },
      {
        field: "investigation_date",
        title: i18n.gettext('Date <br /> Investigated'),
        valign: "middle"
      },
      {
        field: "status",
        title: i18n.gettext('Status'),
        valign: "middle"

      },
      {
        field: "age",
        title: i18n.gettext('Age'),
        valign: "middle"

      },
      {
        field: "gender",
        title: i18n.gettext('Gender'),
        valign: "middle"
      },
      {
        field: "profession",
        title: i18n.gettext('Profession'),
        valign: "middle"
      },
      {
        field: "status_2",
        title: i18n.gettext('Status'),
        valign: "middle"

      }
    ];
    var data = [];

    for (var i in cases) {
      c = cases[i];

      var datum = {
        alert_id: c.variables.alert_id,
        region: i18n.gettext(locations[c.region].name),
        district: i18n.gettext(locations[c.district].name),
        report_date: c.date.split("T")[0],

        age: c.variables.agv_1

      };
      if ("ale_1" in c.variables) {
        datum.investigation_date = c.variables.ale_1.split("T")[0];
      }
      if (c.clinic) {
        datum.clinic = i18n.gettext(locations[c.clinic].name);
      } else {
        datum.clinic = i18n.gettext(c.type_name);
      }
      if (c.variables.pla_2) {
        datum.profession = i18n.gettext(c.variables.pla_2);
      } else {
        datum.profession = "";
      }
      var gender = "";

      if ("gen_1" in c.variables) {
        datum.gender = i18n.gettext("Female");
      } else if ("gen_2" in c.variables) {
        datum.gender = i18n.gettext("Male");
      }

      status = i18n.gettext("Pending");
      if ("ale_2" in c.variables) {
        status = i18n.gettext("Confirmed");
      } else if ("ale_3" in c.variables) {
        status = i18n.gettext("Disregarded");
      } else if ("ale_1" in c.variables) {
        status = i18n.gettext("Ongoing");
      }
      datum.status = status;
      status_2 = i18n.gettext("Alive");
      if ("pla_3" in c.variables) {
        status_2 = i18n.gettext("Dead");
      }
      datum.status_2 = status_2;
      data.push(datum);
    }
    $('#' + containerID).html("<table> </table>");
    $('#' + containerID + ' table').bootstrapTable({
      columns: columns,
      width: "100%",
      data: data,
      align: "center",
      classes: "table table-hover",
      pagination: true,
      pageSize: 50
    });
    addPaginationListener('#' + containerID + ' table');
  });
}



/**:drawVHFTable(containerID, cases, variables)

   Draws a table of cases of Viral Heamorragic Fever

*/

function drawVHFTable(containerID, cases, variables) {
  $.getJSON(api_root + "/locations", function(locations) {
    //Create the table headers, using the central review flag from the cofiguration file.

    var columns = [
      {
	field: "alert_id",
	title: i18n.gettext('Alert ID'),
	'searchable': true,
	width: "10%",
	valign: "middle"
      },
      {
        field: "region",
        title: i18n.gettext('Region'),
        width: "10%",
        valign: "middle"
      },
      {
        field: "district",
        title: i18n.gettext('District'),
        width: "10%",
        valign: "middle"
      },
      {
        field: "clinic",
        title: i18n.gettext('Clinic'),
        'searchable': true,
        width: "10%",
        valign: "middle"
      },
      {
        field: "report_date",
        title: i18n.gettext('Date <br /> Reported'),
        width: "10%",
        valign: "middle"
      },
      {
        field: "investigation_date",
        title: i18n.gettext('Date <br /> Investigated'),
        valign: "middle"
      },
      {
        field: "status",
        title: i18n.gettext('Status'),
        valign: "middle"

      },{
        field: "type",
        title: i18n.gettext('Type'),
        valign: "middle"

      },

      {
        field: "age",
        title: i18n.gettext('Age'),
        valign: "middle"

      },
      {
        field: "gender",
        title: i18n.gettext('Gender'),
        valign: "middle"
      },

      {
        field: "status_2",
        title: i18n.gettext('Status'),
        valign: "middle"

      }
    ];
    var data = [];

    for (var i in cases) {
      c = cases[i];

      var datum = {
        alert_id: c.variables.alert_id,
        region: i18n.gettext(locations[c.region].name),
        district: i18n.gettext(locations[c.district].name),
        report_date: c.date.split("T")[0],

        age: c.variables.agv_1

      };
      if ("ale_1" in c.variables) {
        datum.investigation_date = c.variables.ale_1.split("T")[0];
      }
      if (c.clinic) {
        datum.clinic = i18n.gettext(locations[c.clinic].name);
      } else {
        datum.clinic = i18n.gettext(c.type_name);
      }

      var gender = "";

      if ("gen_1" in c.variables) {
        datum.gender = i18n.gettext("Female");
      } else if ("gen_2" in c.variables) {
        datum.gender = i18n.gettext("Male");
      }

      status = i18n.gettext("Pending");
      if ("ale_2" in c.variables) {
        status = i18n.gettext("Confirmed");
      } else if ("ale_3" in c.variables) {
        status = i18n.gettext("Disregarded");
      } else if ("ale_1" in c.variables) {
        status = i18n.gettext("Ongoing");
      }
      datum.status = status;
      status_2 = i18n.gettext("Alive");
      if ("dea_0" in c.variables) {
        status_2 = i18n.gettext("Dead");
      }

      if ("alert_confirmed_ebola" in c.variables){
	datum.type = i18n.gettext("Ebola");
      } else if ("alert_confirmed_marburg" in c.variables){
	datum.type = i18n.gettext("Marburg Virus");
      }


	datum.status_2 = status_2;
      data.push(datum);
    }
    $('#' + containerID).html("<table> </table>");
    $('#' + containerID + ' table').bootstrapTable({
      columns: columns,
      width: "100%",
      data: data,
      align: "center",
      classes: "table table-hover",
      pagination: true,
      pageSize: 50
    });
    addPaginationListener('#' + containerID + ' table');
  });
}


/**:drawMissingCompletenessTable( containerID, regionID)
   Displays list of clinics in given subregion which haven't reported in the last two weeks. If the specified region is a clinic, then dates when registers are not submitted are listed.

   :param string containerID:
   the id attribute of the html element to hold the table.
   :param int regionID:
   Current region or clinic ID
   :param Object locations:
   List of all locations from API.


 */

function drawMissingCompletenessTable(module_var, containerID, headerID, regionID, locations, completessData, filter_string) {
    var dataPrepared = [];
    var columns = [];
    var datum = [];
    if (locations[regionID].level != "clinic") { //no information aboout reporting clinic
        url = api_root + "/non_reporting/" + module_var + "/" + regionID;

        if (filter_string) url += filter_string;

        $.getJSON(url, function(data) {
            for (var i = 0; i < data.clinics.length; i++) {
                datum = {
                    "location": locations[data.clinics[i]].name
                };
                dataPrepared.push(datum);
            }


            $(headerID).html(i18n.gettext('Reporting sites never reported'));
            columns = [{
                "field": "location",
                "title": i18n.gettext("Location"),
                "align": "center",
                "class": "header",
                sortable: true,
                width: "100%"
            }];
            $('#' + containerID + ' table').bootstrapTable('destroy');
            $('#' + containerID + ' table').remove();
            $('#' + containerID).append('<table class="table"></table>');
            var table = $('#' + containerID + ' table').bootstrapTable({
                columns: columns,
                data: dataPrepared,
                classes: 'table-no-bordered table-hover'
            });
            return table;

        });
    } else {
        //$.getJSON( api_root+"/completeness/"+ module_var +"/" + regionID + "/4", function( data ){
        data = completessData;
        for (var j = 0; j < data.dates_not_reported.length; j++) {
            strDat = data.dates_not_reported[j];
            datum = {
                "date": strDat.split('T')[0]
            };
            dataPrepared.push(datum);
        }
        $(headerID).html(i18n.gettext('Dates not reported'));
        columns = [{
            "field": "date",
            "align": "center",
            "class": "header",
            sortable: true,
            width: "100%"
        }];
        $('#' + containerID + ' table').bootstrapTable('destroy');
        $('#' + containerID + ' table').remove();
        $('#' + containerID).append('<table class="table"></table>');
        var table = $('#' + containerID + ' table').bootstrapTable({
            columns: columns,
            data: dataPrepared,
            classes: 'table-no-bordered table-hover'
        });
        return table;


    }
}

/**:drawCompletenessMatrix(containerID, regionID, locations, data)

   Draws the completeness matrix, showing the number of case reports and daily
   registers submitted in each district over the course of the last year.

   :param string containerID:
   The ID attribute of the html element to hold the table.
   :param string regionID:
   The ID of the region by which to filter the completeness data.
   :param Object locations:
   List of all locations from API.
   :param Object data:
   Completeness data from API.
*/

function drawCompletenessMatrix(containerID, regionID, denominator, locations, data, dataCompTab, start_week, graphtypeID) {

    var stringGraphType = 'data';
    var multiplier = 100 / denominator;
    var noWeeks;
    var weeks;
    if (graphtypeID === 0) {
        stringGraphType = 'Completeness';
    } else if (graphtypeID === 1) {
        stringGraphType = 'Timeliness';
    }

    var scoreKeys = Object.keys(data.timeline);
    var index = 0;
    //Using week numbers instead of dates
    //If a clinic started reporting mid-year there will be missing data for some weeks. Because of that we ought to assume that if data is incomplete, it is only relevant for most recent weeks.
    var table_data = [];
    var table_datum = [];
    var noOfEntries = scoreKeys.length;
    for (var i = 0; i < noOfEntries; i++) {
        index = scoreKeys[scoreKeys.length - i - 1];
        whole_loc_timeline = data.timeline[index];
        if(locations[index].id !== regionID){
            parent_loc_id = locations[index].parent_location;
            year_reg_val = dataCompTab.yearly_score[parent_loc_id];
        }else{
            year_reg_val = data.yearly_score[index];
        }
        year_loc_val = data.yearly_score[index];
        var loc_record = []; //whole data for location
        var loc_entry = []; //entry for one week
        //dropping the current week (noWeeks) in the data since we can only estimate it's completeness
        noWeeks = whole_loc_timeline.weeks.length;
        weeks = lastWeeks(get_epi_week(), noWeeks + 1); //last completeness is from previous week
      for (var j = 0; j < noWeeks; j++) {
        if (start_week) {
          if (weeks[noWeeks - j] >= start_week) {
            loc_entry = [weeks[noWeeks - j], Number(Number(multiplier * (whole_loc_timeline.values[j])).toFixed(0))];
            loc_record.push(loc_entry);
          }
        } else {
          loc_entry = [weeks[noWeeks - j], Number(Number(multiplier * (whole_loc_timeline.values[j])).toFixed(0))];
          loc_record.push(loc_entry);
        }
      }
      if (locations[index].id !== regionID) { //Total
        table_datum = {
          "id": index,
          "name": locations[index].name,
          "region": locations[locations[index].parent_location].name,
          "year": Number(year_loc_val).toFixed(0),
          "year_reg": Number(year_reg_val).toFixed(0)
        };
      } else {
        table_datum = {
          "id": index,
          "name": Number(noOfEntries - 1),
          "region": "-Total-",
          "year": Number(year_loc_val).toFixed(0),
          "year_reg": Number(year_reg_val).toFixed(0)
        };
      }

      //push every week separately now to the datum
      for (var l = 1; l < loc_record.length + 1; l++) {
        table_datum["week" + loc_record[l - 1][0]] = loc_record[l - 1][1];
      }
      table_data.push(table_datum);
    }

  var columns = [{
    "field": "region",
    "title": "Region",
    "align": "center",
    "class": "header"
  }, {
    "field": "name",
    "title": "District",
    "align": "center",
    "class": "header"
  }];
  //Add column for every previous week:
  for (var k = 1; k <= noWeeks; k++) {
        if (start_week) {
            if (k >= start_week) {
                columns.push({
                    "field": "week" + weeks[noWeeks - (k+1)],
                    "title": i18n.gettext("W") + weeks[noWeeks - (k+1)],
                    "align": "center",
                    "class": "value",
                    "cellStyle": createCompletenessMatrixCellTab()
                });
            }
        } else {
            columns.push({
                "field": "week" + weeks[noWeeks - (k+1)],
                "title": i18n.gettext("W") + weeks[noWeeks - (k+1)],
                "align": "center",
                "class": "value",
                "cellStyle": createCompletenessMatrixCellTab()
            });
        }
    }
    columns.push({
        "field": "year",
        "title": "Year",
        "align": "center",
        "class": "value",
        "cellStyle": createCompletenessMatrixCellTab()
    });

    columns.push({
        "field": "year_reg",
        "title": "Yearly Regional",
        "align": "center",
        "class": "value",
        "cellStyle": createCompletenessMatrixCellTab()
    });

    $('#' + containerID + ' table').bootstrapTable('destroy');
    $('#' + containerID + ' table').remove();
    $('#' + containerID).append('<table class="table"></table>');

    var table = $('#' + containerID + ' table').bootstrapTable({
        columns: columns,
        data: table_data,
        idField: "id",
        classes: 'table-responsive table-bordered ',
        sortName: 'region',
        sortOrder: 'asc'
    });

    var rowLength = table[0].rows.length;
    var count = 0;
    var row = table[0].rows[1].cells[0].innerHTML;
    var saveIndex = 0;


    for (i = 1; i < rowLength; i++) {
        if (row === table[0].rows[i].cells[0].innerHTML) {
            count++;

            if (i == rowLength - 1) {
                mergeRows('#' + containerID + ' table', saveIndex, count);
            }

        } else {
            mergeRows('#' + containerID + ' table', saveIndex, count);

            row = table[0].rows[i].cells[0].innerHTML;
            saveIndex = i - 1;
            count = 1;

            /*
             */
        }
    }




    return table;

}
/**:drawCompletenessTable(containerID, regionID)

    Draws the completeness table, showing the number of case reports and daily
    registers submitted by each clinic over different time periods.

 :param string containerID:
        The ID attribute of the html element to hold the table.
    :param string regionID:
        The ID of the region by which to filter the completeness data.
    :param Object locations:
        List of all locations from API.
    :param Object data:
        Completeness data from API.
 */

function drawCompletenessTable(containerID, regionID, locations, data) {
    var dataPrepared = [];
    if (data.score === undefined) {
        return undefined;
    }
    var scoreKeys = Object.keys(data.score);
    var parentLocation = regionID; //locations[scoreKeys[0]].name; //string containg parentLocation name
    var index = 0;

    for (var i = 0; i < scoreKeys.length; i++) {
        index = scoreKeys[i];
        var loc;
        // loc = "<a href='' onclick='loadLocationContent(" + index +
        //     ");return false;' >" + i18n.gettext(locations[index].name)+"</a>";
        loc = locations[index].name;
        var datum = {
            "id": index,
            "location": loc,
            "completeness": Number(data.score[index]).toFixed(0) + "%",
            "yearly": Number(data.yearly_score[index]).toFixed(0) + "%"
        };
        dataPrepared.push(datum);
    }

    var columns = [{
        "field": "location",
        "title": i18n.gettext("Location"),
        "align": "center",
        "class": "header",
        sortable: true,
        width: "50%"
    }, {
        "field": "completeness",
        "title": i18n.gettext("Week"),
        "align": "center",
        "class": "header",
        sortable: true,
        "sorter": function percs(a, b) {
            a = Number(a.split('%')[0]);
            b = Number(b.split('%')[0]);
            if (a < b) return 1;
            if (a > b) return -1;
            return 0;
        },
        width: "25%"
    }, {
        "field": "yearly",
        "title": i18n.gettext("Year"),
        "align": "center",
        "class": "header",
        sortable: true,
        "sorter": function percs(a, b) {
            a = Number(a.split('%')[0]);
            b = Number(b.split('%')[0]);
            if (a < b) return 1;
            if (a > b) return -1;
            return 0;
        },
        width: "25%"
    }];

    for (var k = 0; k < columns.length; k++) {
        columns[k].cellStyle = createCompletenessCellTab(parentLocation);
    }

    $('#' + containerID + ' table').bootstrapTable('destroy');
    $('#' + containerID + ' table').remove();
    $('#' + containerID).append('<table class="table"></table>');
    var table = $('#' + containerID + ' table').bootstrapTable({
        columns: columns,
        data: dataPrepared,
        idField: "id",
        classes: 'table-no-bordered table-hover',
        sortName: 'completeness',
        sortOrder: 'desc'
    });
    return table;

}

function consultationsCellStyle() {
    // Returns a function that colours in the cells according to their value
    function cc3(value, row, index, columns) {
        if (row.level == 'main') {
            return {
                css: {
                    "font-weight": "bold"
                }
            };
        } else {
            return {
                css: {}
            };
        }
    }
    return cc3;
}

function createCompletenessCellTab(parentLocationRowID) {
    // Returns a function that colours in the cells according to their value
    function cc2(value, row, index, columns) {
        var valueStripped = value.split('%')[0];
        var par = false;
        if (typeof valueStripped == 'undefined') {
            return {
                css: {
                    "color": "rgba(0, 0, 0, 1)"
                }
            };
        }
        if (row.id == parentLocationRowID) {
            par = true;
        }
        if (typeof parentLocationRowID == 'undefined') {
            par = false;
        }
        if (isNaN(valueStripped)) {
            if (par) {
                return {
                    css: {
                        "font-weight": "bold",
                        "background-color": "rgba(0, 144, 202, 0.6)"
                    }
                };
            }
            return {
                css: {
                    "color": "rgba(0, 0, 0, 1)"
                }
            };
        }
        if (valueStripped < 50) { //red
            if (par) {
                return {
                    css: {
                        "color": "rgba(255, 0, 0, 1)",
                        "font-weight": "bold",
                        "background-color": "rgba(0, 144, 202, 0.6)"
                    }
                };
            }
            return {
                css: {
                    "color": "rgba(255, 0, 0, 1)",
                    "font-weight": "bold"
                }
            };
        }
        if (valueStripped < 80) { //yellow
            if (par) {
                return {
                    css: {
                        "color": "rgba(128, 128, 0, 1)",
                        "font-weight": "bold",
                        "background-color": "rgba(0, 144, 202, 0.6)"
                    }
                };
            }
            return {
                css: {
                    "color": "rgba(128, 128, 0, 1)",
                    "font-weight": "bold"
                }
            };
        }
        if (par) {
            return {
                css: {
                    "color": "rgba(0, 128, 0, 1)",
                    "font-weight": "bold",
                    "background-color": "rgba(0, 144, 202, 0.6)"
                }
            };
        }
        return {
            css: {
                "color": "rgba(0, 128, 0, 1)",
                "font-weight": "bold"
            }
        };
    }

    return cc2;
}

/**:createColourCellTab()

   A small helper function to define shading of cells realting to value in technical table view.
*/
function createColourCellTab(optionColourTable) {
    // Returns a function that colours in the cells according to their value
    function cc2(value, row, index, columns) {
        if (row.main == "Total") {
            return {
                classes: "info"
            };
        }
        if (optionColourTable == "true") {
            if (typeof value == 'undefined') {
                return {
                    css: {
                        "background-color": "rgba(217, 105, 42, " + 0 + ")"
                    }
                };
            }
            var possibleNum = value.toString().split(' ')[0];
            var check4thousand = possibleNum.split(',');
            if (check4thousand.length == 2) {
                possibleNum = check4thousand[0] + check4thousand[1];
            }

            if (isNaN(possibleNum)) {
                return {
                    css: {
                        "background-color": "rgba(217, 105, 42, " + 0 + ")"
                    }
                };
            }
            if (possibleNum !== "<a") {
                var numval = value.toString().split('\%)')[0].split('(')[1];
                var perc = Number(numval) / 100;
                return {
                    css: {
                        "background-color": "rgba(217, 105, 42, " + perc + ")"
                    }
                };
            }
        } else {
            return {
                css: {
                    "background-color": "rgba(217, 105, 42, " + 0 + ")"
                }
            };
        }
    }

    return cc2;
}

/**:stripRows(data)

   A small helper function stripping rows from ones with empty records.
*/
function stripRows(data) {
    //Store a list of rows to be removed.
    var remove = [];
    //For each row iterate through it's elements to seeif all are empty.
    for (var y = 0; y < data.length; y++) {
        var row = data[y];
        var empty = true;
        for (var x in row) {
            if (x != "main" && Number(row[x].split(' ')[0]) !== 0) empty = false;
        }
        if (empty) {
            remove.push(y);
        }
    }
    for (var i = remove.length - 1; i >= 0; i--) data.splice(remove[i], 1);

    //Remove all empty rows (starting from the last to avoid screwing up indexes).
    return data;
}

//Prepare table-option to store a value for choosing an indicator
function drawIndicatorsOptions(tableID) {
    var html = "<div class='table-options' id='choose-ind-id' value=0>";
    html += "</div>";
    $('#' + tableID).prepend(html);
}

//Callback function for changing displayed indicator timeline
function chooseIndicator(i) {
    $('#choose-ind-id').attr("value", i);
    var indKey = $('#choose-ind-id').attr("value");
    reDraw();
}

function drawIndicatorsTable(containerID, locID, data) {

    var changeUp = "&#8679;";
    var changeDown = "&#8681;";
    var noChange = "--";

    //Create a data entry for all indKeys
    listOfIndKeys = Object.keys(data);
    var dataPrepared = [];
    var indDataCurrent;
    var indDataName;
    var changeVal;
    var change;
    for (i = 0; i < listOfIndKeys.length; i++) {
        var datum = {};
        indDataCurrent = data[i].current;
        changeVal = indDataCurrent - data[i].previous;
        if (changeVal > 0) {
            change = changeUp;
        } else if (changeVal < 0) {
            change = changeDown;
        } else {
            change = noChange;
        }
        indDataName = data[i].name;
        datum.name = "<a href='' onclick='chooseIndicator(\"" + i + "\");return false;' >" + i18n.gettext(indDataName) + "</a>";
        datum.value = Number(indDataCurrent).toFixed(0);
        datum.change = change;
        dataPrepared.push(datum);
    }

    var columns = [{
        "field": "name",
        "title": "Indicator",
        "align": "center",
        "class": "header",
        sortable: true,
        width: "60%"
    }, {
        "field": "value",
        "title": "Value",
        "align": "center",
        "class": "header",
        sortable: true,
        width: "25%"
    }, {
        "field": "change",
        "title": "Change",
        "align": "center",
        "class": "header",
        sortable: true,
        width: "15%"
    }];

    $('#' + containerID + ' table').bootstrapTable('destroy');
    $('#' + containerID + ' table').remove();
    $('#' + containerID).append('<table class="table"></table>');
    var table = $('#' + containerID + ' table').bootstrapTable({
        columns: columns,
        data: dataPrepared,
        classes: 'table-no-bordered table-hover'
    });
    return table;
}

function createCompletenessMatrixCellTab() {
    // Returns a function that colours in the cells according to their value
    function ccmct(value, row, index) {
        if (isNaN(value)) {
            return {
                css: {
                    "background-color": "rgba(128, 128, 128, 1)"
                }
            };
        }
        if (value < 50) { //red
            return {
                css: {
                    "background-color": "rgba(255, 0, 0, 0.5)",
                    "font-weight": "bold"
                }
            };
        }
        if (value < 80) { //yellow
            return {
                css: {
                    "background-color": "rgba(255, 255, 0, 0.5)",
                    "font-weight": "bold"
                }
            };
        }
        return {
            css: {
                "background-color": "rgba(0, 128, 0, 0.5)",
                "font-weight": "bold"
            }
        };
    }

    return ccmct;
}

function mergeRows(contener, index, rowspan) {
    $(contener).bootstrapTable('mergeCells', {
        index: index,
        field: 'region',
        rowspan: rowspan
    });
}


/**:drawClinicPrescriptionTable(containerID)

    Draws the table of alerts used on the Alerts tab. Lists each alert according to date
    and provides links to the individual Alert Investigation reports. Rather than loading JSON
    data inside the method, it is passed as arguments to the method so that JSON requests
    can be shared across multiple drawings.

    :param string containerID:
        The ID attribute of the html element to hold the table.
    :param [object] alerts:
        An array of alert objects as returned by Meerkat API `/alerts`.
    :param object variables:
        An object containing details for given variable IDs, as returned by Meerkat API `/variables`.
        Specifically used to print the variable name instead of ID.
 */
function drawClinicPrescriptionTable(containerID, locID) {

    $.getJSON(api_root + "/prescriptions/" + locID, function(data) {

        //for(var a in data.clinic_table){

        var columns = [{
            field: "clinic_name",
            title: i18n.gettext('Clinic'),
            align: "center",
            class: "header",
            sortable: true
        }, {
            field: "medicine_name",
            title: i18n.gettext('Medicine'), // TODO: use glossary.
            align: "center",
            class: "header",
            sortable: true
        }, {
            field: "min_date",
            title: i18n.gettext('First Prescription'),
            align: "center",
            class: "header",
            sortable: true
        }, {
            field: "max_date",
            title: i18n.gettext('Latest Prescription'),
            align: "center",
            class: "header",
            sortable: true
        },
         {
            field: "total_prescriptions",
            title: i18n.gettext('Total doses prescribed'),
            align: "center",
            class: "header",
            sortable: true
        }];

        if(config.show_remaining_stock){

	  columns.push({
            field: "str_stock",
            title: i18n.gettext('Remaining Stock'),
            align: "center",
            class: "header",
            sortable: true
	  });
	}
        // First destroy any pre-existing table.
        $('#' + containerID + ' table').bootstrapTable('destroy');
        $('#' + containerID + ' table').remove();
        $('#' + containerID).append('<table class="table"></table>');
        var table = $('#' + containerID + " table").bootstrapTable({
            columns: columns,
            data: data.medicine_table,
            search: true,
            classes: 'table table-no-bordered table-hover',
            pagination: true,
            pageSize: 50,
            sortName: 'str_stock',
            sortOrder: 'desc'
        });
        addPaginationListener('#' + containerID + ' table');
        return table;

    });
}



function drawConsultationsTable(containerID, consultationsData, loc_id, loc_level, locations, prev_week_no) {

    var is_searchable = (loc_level == "clinic") ? true : false;
    var is_clinics = (loc_level == "clinic") ? true : false;

    var columns = [{
        "field": "location",
        "title": i18n.gettext("Location"),
        "align": "center",
        "class": "header",
        sortable: true,
        searchable: is_searchable,
        width: "34%",
        cellStyle: consultationsCellStyle()
    }, {
        "field": "prev_week",
        "title": i18n.gettext("Week") + " " + Number(prev_week_no),
        "align": "center",
        "class": "header",
        sortable: true,
        width: "34%",
        cellStyle: consultationsCellStyle()
    }, {
        "field": "total",
        "title": i18n.gettext("Year"),
        "align": "center",
        "class": "header",
        sortable: true,
        width: "34%",
        cellStyle: consultationsCellStyle()
    }];

    var sub_locations = Object.keys(consultationsData[loc_level]);
    var dataPrepared = [];

    var prev_week_val = consultationsData.weeks[prev_week_no];
    var total_val = consultationsData.year;
    var datum = {};
    if (!is_clinics) { // Don't repeat main location data in clinics list
        prev_week_val = (typeof(prev_week_val) == "undefined") ? 0 : prev_week_val;
        total_val = (typeof(total_val) == "undefined") ? 0 : total_val;

        datum = {
            "level": "main",
            "location": locations[loc_id].name,
            "prev_week": prev_week_val,
            "total": total_val
        };

        dataPrepared.push(datum);
    }
    var sloc_id = -99;
    for (var sub_loc_index = 0; sub_loc_index < sub_locations.length; sub_loc_index++) {
        sloc_id = sub_locations[sub_loc_index];
        prev_week_val = consultationsData[loc_level][sloc_id].weeks[prev_week_no];
        total_val = consultationsData[loc_level][sloc_id].year;
        prev_week_val = (typeof(prev_week_val) == "undefined") ? 0 : prev_week_val;
        total_val = (typeof(total_val) == "undefined") ? 0 : total_val;

        datum = {
            "level": "sub",
            "location": locations[sloc_id].name,
            "prev_week": prev_week_val,
            "total": total_val
        };

        dataPrepared.push(datum);
    }


    $('#' + containerID + ' table').bootstrapTable('destroy');
    $('#' + containerID + ' table').remove();
    $('#' + containerID).append('<table class="table"></table>');

    var table = $('#' + containerID + ' table').bootstrapTable({
        columns: columns,
        data: dataPrepared,
        classes: 'table-no-bordered table-hover',
        search: is_searchable
    });
}

/** drawConsultationsMatrix(containerID, data, loc_id, loc_level, locations, prev_week_no)

   Draws the consultations matrix, similar to completeness matrix showing the number of consultations registered in the area using daily register.

   :param string containerID:
   The ID attribute of the html element to hold the table.
   :param Object locations:
   List of all locations from API.
   :param Object data:
   Consulatations data from API.
*/

function drawConsultationsMatrix(containerID, data, loc_id, loc_level, locations, prev_week_no) {

    //This Matrix is not design to show on level lower than region
    // if(( loc_level === "clinic" ) || ( loc_level === "district" )){
    //     return -1;
    // }

    var consultationsData = data[loc_level];
    var scoreKeys = Object.keys(consultationsData);
    var index = 0;
    // var noWeeks = scoreKeys.length; //==prev_week_no???
    var noWeeks = prev_week_no; //==prev_week_no???
    var current_val;
    var current_region;

    //prepare column names:
    var loc_headings = {
        "district": {"region": i18n.gettext("Region"), "subregion": i18n.gettext("District")},
        "clinic": {"region": i18n.gettext("District"), "subregion": i18n.gettext("Clinic")}
    };
        loc_heading = loc_headings[loc_level];


    var table_data = [];
    var table_datum = [];
    for (var i = 0; i < scoreKeys.length; i++) {
        index = scoreKeys[i];
        whole_loc_timeline = consultationsData[index].weeks;
        year_loc_val = consultationsData[index].year;
        var loc_record = []; //whole data for location
        var loc_entry = []; //entry for one week

        for (var j = 1; j <= prev_week_no; j++) {
            current_val = Number(whole_loc_timeline[j]).toFixed(0);
            if (isNaN(current_val)) {
                current_val = "-";
            }
            loc_entry = [j, current_val];
            loc_record.push(loc_entry);
        }

        current_val = Number(year_loc_val).toFixed(0);
        if (isNaN(current_val)) {
            current_val = "-";
        }


        if (locations[index].id !== loc_id) { //Total
            current_region = locations[locations[index].parent_location].name;
        } else {
            current_region = "-Total-";
        }

        table_datum = {
            "name": locations[index].name,
            "region": current_region,
            "year": current_val
        };

        //push every week separately now to the datum
        for (var l = 1; l < loc_record.length + 1; l++) {
            table_datum["week" + loc_record[l - 1][0]] = loc_record[l - 1][1];
        }
        table_data.push(table_datum);
    }

    var columns = [{
        "field": "region",
        "title": loc_heading.region,
        "align": "center",
        "class": "header"
    }, {
        "field": "name",
        "title": loc_heading.subregion,
        "align": "center",
        "class": "header"
    }];

    //Add column for every previous week:
    for (var k = 1; k <= noWeeks; k++) {
        columns.push({
            "field": "week" + k,
            "title": i18n.gettext("W") + k,
            "align": "center",
            "class": "value"
        });
    }
    columns.push({
        "field": "year",
        "title": "Year",
        "align": "center",
        "class": "value"
    });

    $('#' + containerID + ' table').bootstrapTable('destroy');
    $('#' + containerID + ' table').remove();
    $('#' + containerID).append('<table class="table"></table>');

    var table = $('#' + containerID + ' table').bootstrapTable({
        columns: columns,
        data: table_data,
        classes: 'table-responsive table-bordered ',
        sortName: 'region',
        sortOrder: 'asc'
    });

    var rowLength = table[0].rows.length;
    var count = 0;
    var row = table[0].rows[1].cells[0].innerHTML;
    var saveIndex = 0;


    for (i = 1; i < rowLength; i++) {
        if (row === table[0].rows[i].cells[0].innerHTML) {
            count++;

            if (i == rowLength - 1) {
                mergeRows('#' + containerID + ' table', saveIndex, count);
            }

        } else {
            mergeRows('#' + containerID + ' table', saveIndex, count);

            row = table[0].rows[i].cells[0].innerHTML;
            saveIndex = i - 1;
            count = 1;
        }
    }
    return table;
}
