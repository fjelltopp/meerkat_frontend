var current_Year = (new Date()).getFullYear();

function gatherTabletData(locID) {

    // First destroyany pre-existing table.
    $('#div_tabletCompletness table').bootstrapTable('destroy');
    $('#div_tabletCompletness table').remove();

    //Clear the arrays ...
    columnNameArray = [];
    tabletDataArray = [];

    //API URLS to get Clinics Data ...
    buildTableStructure();
    var locationAPI = "/locations";
    var week2 = parseInt(week) - 2;
    var week1 = parseInt(week) - 1;

    var main_week_tot = '/devices/submissions/tot_1?location=' + locID + '&filter=epi_year:eq:' + current_Year + '&filter=epi_week:eq:';
    var week_tot_Api2 = main_week_tot + week2;
    var week_tot_Api1 = main_week_tot + week1;
    var week_tot_Api = main_week_tot + week;

    var main_week_reg = '/devices/submissions/reg_1?location=' + locID + '&filter=epi_year:eq:' + current_Year + '&filter=epi_week:eq:';
    var week_reg_Api2 = main_week_reg + week2;
    var week_reg_Api1 = main_week_reg + week1;
    var week_reg_Api = main_week_reg + week;

    var year_Api_2 = '/devices/submissions/tot_1?location=' + locID + '&filter=date:ge:' + date_builder(2, "year", true) + '&filter=date:le:' + date_builder(2, "year", false);
    var year_Api_1 = '/devices/submissions/tot_1?location=' + locID + '&filter=date:ge:' + date_builder(1, "year", true) + '&filter=date:le:' + date_builder(1, "year", false);
    var year_Api = '/devices/submissions/tot_1?location=' + locID + '&filter=date:ge:' + date_builder(0, "year", true) + '&filter=date:le:' + date_builder(0, "year", false);

    var month_Api1 = '/devices/submissions/tot_1?location=' + locID + '&filter=date:ge:' + date_builder(1, "month", true) + '&filter=date:le:' + date_builder(1, "month", false);
    var month_Api = '/devices/submissions/tot_1?location=' + locID + '&filter=date:ge:' + date_builder(0, "month", true) + '&filter=date:le:' + date_builder(0, "month", false);



    //Call the first API that return the new visits ..
    //Start week tot data
    $.getJSON(api_root + week_tot_Api2, function(data) {
        $.each(data.clinicSubmissions, function(index, value) {
            fillTabletData(value);
        });
        $.getJSON(api_root + week_tot_Api1, function(data) {
            $.each(data.clinicSubmissions, function(index, value) {
                buildWeekData(value, 1, 'casesInWeek');
            });
            $.getJSON(api_root + week_tot_Api, function(data) {
                $.each(data.clinicSubmissions, function(index, value) {
                    buildWeekData(value, 0, 'casesInWeek');
                });
                //Start week reg data
                $.getJSON(api_root + week_reg_Api2, function(data) {
                    $.each(data.clinicSubmissions, function(index, value) {
                        buildWeekData(value, 2, 'noOfRegistersInWeek');
                    });

                    $.getJSON(api_root + week_reg_Api1, function(data) {
                        $.each(data.clinicSubmissions, function(index, value) {
                            buildWeekData(value, 1, 'noOfRegistersInWeek');
                        });
                        $.getJSON(api_root + week_reg_Api, function(data) {
                            $.each(data.clinicSubmissions, function(index, value) {
                                buildWeekData(value, 0, 'noOfRegistersInWeek');
                            });

                            $.getJSON(api_root + year_Api_2, function(data) {
                                $.each(data.clinicSubmissions, function(index, value) {
                                    buildYearData(value, 2, 'casesInYear');
                                });
                                $.getJSON(api_root + year_Api_1, function(data) {
                                    $.each(data.clinicSubmissions, function(index, value) {
                                        buildYearData(value, 1, 'casesInYear');
                                    });
                                    $.getJSON(api_root + year_Api, function(data) {
                                        $.each(data.clinicSubmissions, function(index, value) {
                                            buildYearData(value, 0, 'casesInYear');
                                        });
                                        $.getJSON(api_root + month_Api1, function(data) {
                                            $.each(data.clinicSubmissions, function(index, value) {
                                                buildMonthData(value, 1, 'casesInMonthL');
                                            });
                                            $.getJSON(api_root + month_Api, function(data) {
                                                $.each(data.clinicSubmissions, function(index, value) {
                                                    buildMonthData(value, 0, 'casesInMonthC');
                                                });
                                                $.getJSON(api_root + locationAPI, function(data) {
                                                    $.each(data, function(index, value) {
                                                        getClinicCaseAndType(value);
                                                    });
                                                    //Append the table and the columns ...
                                                    $('#div_tabletCompletness').append('<table class="table table-hover table-condensed table-responsive" id="tbleTabletSubmission"></table>');
                                                    $('#div_tabletCompletness table').bootstrapTable({
                                                        columns: columnNameArray,
                                                        data: tabletDataArray,
                                                        pagination: true,
                                                        pageSize: 10,
                                                        search: true,
                                                        classes: "table table-no-bordered table-hover"
                                                    });
                                                    addPaginationListener('#clinicsTable table');
                                                    colorClinicsRow();
                                                });

                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });



}

function buildTableStructure() {
    //Add the first Column ...
    buildTableColumn("DevicesIDs", "Devices IDs", "");
    buildTableColumn("clinicType", "clinic type", "");
    buildTableColumn("caseType", "case type", "");

    //Get the current year with the last two year, 3 years total ......
    var current_Year = (new Date()).getFullYear();

    for (i = week - 2; i <= week; i++) {
        //Draw the clolumns depend on the week number ...
        buildTableColumn("casesInWeek" + i, "cases in Week " + i, "");
    }

    for (i = week - 2; i <= week; i++) {
        //Draw the clolumns depend on the week number ...
        buildTableColumn("noOfRegistersInWeek" + i, "no. of registers in week " + i, "");
    }

    buildTableColumn("casesInMonthC", "cases in month (current)", "");
    buildTableColumn("casesInMonthL", "cases in month (before the current)", "");

    for (i = current_Year - 2; i <= current_Year; i++) {
        //Draw the clolumns depend on the week number ...
        buildTableColumn("casesInYear" + i, "cases in year " + i, "");
    }
}


//This function is responsible for building the table header ...
function buildTableColumn(columnId, columnName, columnClass) {
    columnNameArray.push({
        field: columnId,
        title: i18n.gettext(columnName),
        align: "center",
        sortable: true,
        sortName: columnId,
        valign: "middle",
        class: columnClass
    });
}


//Fill the table for the fisrt time and add defualt data
function fillTabletData(clinicObj) {
    var dataObject = {};

    //Add Clinic data
    dataObject.DevicesIDs =  clinicObj.clinicId;
    dataObject.clinicType = " - ";
    dataObject.caseType = " - ";

    for (i = week - 2; i <= week; i++) {
        //Draw the clolumns depend on the week number ...
        dataObject["casesInWeek" + i] = "-";
    }

    for (i = week - 2; i <= week; i++) {
        //Draw the clolumns depend on the week number ...
        dataObject["noOfRegistersInWeek" + i] = "-";
    }

    dataObject.casesInMonthC = "-";
    dataObject.casesInMonthL = "-";

    for (i = current_Year - 2; i <= current_Year; i++) {
        //Draw the clolumns depend on the week number ...
        dataObject["casesInYear" + i] = "-";
    }
    tabletDataArray.push(dataObject);


    //Add Devices data
    $.each(clinicObj.deviceSubmissions, function(index, value) {
        dataObject = {};
        dataObject.DevicesIDs = "- DeviceId  " + value.deviceId;
        dataObject.clinicType = " - ";
        dataObject.caseType = " - ";

        for (i = week - 2; i <= week; i++) {
            //Draw the clolumns depend on the week number ...
            if (i == week - 2) {
                dataObject["casesInWeek" + i] = value.submissionsCount;
            } else {
                dataObject["casesInWeek" + i] = "-";
            }

        }

        for (i = week - 2; i <= week; i++) {
            //Draw the clolumns depend on the week number ...
            dataObject["noOfRegistersInWeek" + i] = "-";
        }

        dataObject.casesInMonthC = "-";
        dataObject.casesInMonthL = "-";

        for (i = current_Year - 2; i <= current_Year; i++) {
            //Draw the clolumns depend on the week number ...
            dataObject["casesInYear" + i] = "-";
        }
        tabletDataArray.push(dataObject);
    });
}

//This method will handle all the data related to week columns "tot and reg"
function buildWeekData(clinicObj, minuWeek, colKey) {
    var weekVal = week - minuWeek;
    $.each(clinicObj.deviceSubmissions, function(index, deviceVal) {
        $.each(tabletDataArray, function(index, value) {
            if (value.DevicesIDs === "- DeviceId  " + deviceVal.deviceId) {
                var itemName = colKey + weekVal;
                value[itemName] = deviceVal.submissionsCount;
            }
        });
    });
}


//This method will handle all the data related to year columns
function buildYearData(clinicObj, minuYear, colKey) {
    var yearVal = current_Year - minuYear;
    $.each(clinicObj.deviceSubmissions, function(index, deviceVal) {
        $.each(tabletDataArray, function(index, value) {
            if (value.DevicesIDs === "- DeviceId  " + deviceVal.deviceId) {
                var itemName = colKey + yearVal;
                value[itemName] = deviceVal.submissionsCount;
            }
        });
    });
}


//This method will handle all the data related to year columns
function buildMonthData(clinicObj, minuMonth, colKey) {
    var monthVal = (new Date()).getMonth() + 1 - minuMonth; // +1 because this method return index for month jan = 0 & dec =11
    $.each(clinicObj.deviceSubmissions, function(index, deviceVal) {
        $.each(tabletDataArray, function(index, value) {
            if (value.DevicesIDs === "- DeviceId  " + deviceVal.deviceId) {
                var itemName = colKey;
                value[itemName] = deviceVal.submissionsCount;
            }
        });
    });
}

function getClinicCaseAndType(data) {
    $.each(tabletDataArray, function(index, value) {
        if (value.DevicesIDs ===  data.id) {
            value.DevicesIDs = data.name;
            value.clinicType = data.clinic_type;
            var caseType = "";
            $.each(data.case_type, function(ind, val) {
                caseType = caseType + val + "-";
            });
            value.caseType = caseType.slice(0, -1);
        }
    });
}


function date_builder(minusNum, key, is_from) {
    if (key == "year") {
        var year = current_Year - minusNum;
        if (is_from == true) {
            return (year + "-" + 01 + "-" + 01);
        } else {
            return (year + "-" + 12 + "-" + 30);
        }
    } else {
        var _year = current_Year;
        var month = (new Date()).getMonth() - minusNum;
        if (month == 0) {
            month = 12;
            _year = _year - 1;
        }
        if (is_from == true) {
            return (_year + "-" + month + "-" + 01);
        } else {
            return (_year + "-" + month + "-" + 30);
        }
    }
}


// Hack to fix the pagination dropdown menu bug with bootstrap table.
function addPaginationListener(table) {
    console.log(table);

    $('.page-list button.dropdown-toggle').click(function() {
        console.log('click');
        $('.page-list .dropdown-menu').toggle();
    });

    $(table).on('page-change.bs.table', function() {
        $('.page-list button.dropdown-toggle').click(function() {
            console.log('click');
            $('.page-list .dropdown-menu').toggle();
        });
    });
}

//Hack the design and make each clinic row with bg gray color
function colorClinicsRow() {
    //for each column
    $('#tbleTabletSubmission > tbody  > tr > td').each(function() {
        //search if the column val contains the clinic word
        if ($(this)[0].textContent.toLowerCase().indexOf("clinic") >= 0) {
            $(this).closest('tr').addClass('active');
        }
    });

}
