var current_Year = (new Date()).getFullYear();

function gatherTabletData(locID) {

    // First destroyany pre-existing table.
    $('#div_tabletCompletness table').bootstrapTable('destroy');
    $('#div_tabletCompletness table').remove();

    //Clear the arrays
    columnNameArray = [];
    tabletDataArray = [];
    apiObjArray = [];

    //API URLS to get Data
    buildTableStructure();
    var locationAPI = "/locations";
    var week2 = parseInt(week) - 2;
    var week1 = parseInt(week) - 1;
    var week_tot_Api2 = '/devices/submissions/tot_1?location=' + locID + '&filter=epi_year:eq:' + current_Year + '&filter=epi_week:eq:' + week2;

    apiObjArray.push({
        "api": '/devices/submissions/tot_1?location=' + locID + '&filter=epi_year:eq:' + current_Year + '&filter=epi_week:eq:' + week1,
        "minusNum": "1",
        "columnType": "casesInWeek"
    }, {
        "api": '/devices/submissions/tot_1?location=' + locID + '&filter=epi_year:eq:' + current_Year + '&filter=epi_week:eq:' + week,
        "minusNum": "0",
        "columnType": "casesInWeek"
    }, {
        "api": '/devices/submissions/reg_1?location=' + locID + '&filter=epi_year:eq:' + current_Year + '&filter=epi_week:eq:' + week2,
        "minusNum": "2",
        "columnType": "noOfRegistersInWeek"
    }, {
        "api": '/devices/submissions/reg_1?location=' + locID + '&filter=epi_year:eq:' + current_Year + '&filter=epi_week:eq:' + week1,
        "minusNum": "1",
        "columnType": "noOfRegistersInWeek"
    }, {
        "api": '/devices/submissions/reg_1?location=' + locID + '&filter=epi_year:eq:' + current_Year + '&filter=epi_week:eq:' + week,
        "minusNum": "0",
        "columnType": "noOfRegistersInWeek"
    }, {
        "api": '/devices/submissions/tot_1?location=' + locID + '&filter=date:ge:' + date_builder(2, "year", true) + '&filter=date:le:' + date_builder(2, "year", false),
        "minusNum": "2",
        "columnType": "casesInYear"
    }, {
        "api": '/devices/submissions/tot_1?location=' + locID + '&filter=date:ge:' + date_builder(2, "year", true) + '&filter=date:le:' + date_builder(1, "year", false),
        "minusNum": "1",
        "columnType": "casesInYear"
    }, {
        "api": '/devices/submissions/tot_1?location=' + locID + '&filter=date:ge:' + date_builder(2, "year", true) + '&filter=date:le:' + date_builder(0, "year", false),
        "minusNum": "0",
        "columnType": "casesInYear"
    }, {
        "api": '/devices/submissions/tot_1?location=' + locID + '&filter=date:ge:' + date_builder(1, "month", true) + '&filter=date:le:' + date_builder(1, "month", false),
        "minusNum": "1",
        "columnType": "casesInMonthL"
    }, {
        "api": '/devices/submissions/tot_1?location=' + locID + '&filter=date:ge:' + date_builder(1, "month", true) + '&filter=date:le:' + date_builder(0, "month", false),
        "minusNum": "0",
        "columnType": "casesInMonthC"
    });


    var deferreds = [];
    // The first call will generat the most of the table structure
    $.getJSON(api_root + week_tot_Api2, function(data) {
        $.each(data.clinicSubmissions, function(index, value) {
            fillTabletData(value);
        });

        $.each(apiObjArray, function(index, value) {
            deferreds.push(
                $.getJSON(api_root + value.api, function(data) {
                    $.each(data.clinicSubmissions, function(indexData, valueData) {
                        fillAPIResultData(valueData, value.minusNum, value.columnType);
                    });
                })
            );
        });

        deferreds.push(
            $.getJSON(api_root + locationAPI, function(data) {
                $.each(data, function(index, value) {
                    getClinicCaseAndType(value);
                });
            })
        );


        $.when.apply($, deferreds).then(function() {
            //Append the table and the columns ...
            $('#div_tabletCompletness').append('<table  id="tbleTabletSubmission"></table>');
            $('#div_tabletCompletness table').bootstrapTable({
                columns: columnNameArray,
                data: tabletDataArray,
                pagination: true,
                pageSize: 10,
                search: true,
                classes: "table table-no-bordered table-hover table-responsive"
            });
            addPaginationListener('#clinicsTable table');
        });

    });

}


function buildTableStructure() {
    //Add the first columns
    buildTableColumn("ClinicName", "Clinic Name", "");
    buildTableColumn("DevicesIDs", "Devices IDs", "");
    buildTableColumn("clinicType", "clinic type", "");
    buildTableColumn("caseType", "case type", "");

    for (i = week - 2; i <= week; i++) {
        //Draw the clolumns depend on the week number
        buildTableColumn("casesInWeek" + i, "cases in Week " + i, "");
    }

    for (i = week - 2; i <= week; i++) {
        //Draw the clolumns depend on the week number
        buildTableColumn("noOfRegistersInWeek" + i, "no. of registers in week " + i, "");
    }

    buildTableColumn("casesInMonthC", "cases in month (current)", "");
    buildTableColumn("casesInMonthL", "cases in month (before the current)", "");

    for (i = current_Year - 2; i <= current_Year; i++) {
        //Draw the clolumns depend on the year number ...
        buildTableColumn("casesInYear" + i, "cases in year " + i, "");
    }
}


//This function is responsible for building the table header
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
    var clinicId = clinicObj.clinicId;

    //Add devices data
    $.each(clinicObj.deviceSubmissions, function(index, value) {
        dataObject = {};
        dataObject.ClinicName = clinicId;
        dataObject.DevicesIDs = "DeviceId " + value.deviceId;
        dataObject.clinicType = "";
        dataObject.caseType = "";

        for (i = week - 2; i <= week; i++) {
            if (i == week - 2) {
                dataObject["casesInWeek" + i] = value.submissionsCount;
            } else {
                dataObject["casesInWeek" + i] = "-";
            }
            dataObject["noOfRegistersInWeek" + i] = "-";
        }

        dataObject.casesInMonthC = "-";
        dataObject.casesInMonthL = "-";

        for (i = current_Year - 2; i <= current_Year; i++) {
            dataObject["casesInYear" + i] = "-";
        }
        tabletDataArray.push(dataObject);
    });
}


//this method will handle to fill the data from the apis into the table
function fillAPIResultData(clinicObj, minusNum, colKey) {

    //This section will handle all the data related to week columns "tot and reg"
    if (colKey == "casesInWeek" || colKey == "noOfRegistersInWeek") {
        var weekVal = week - minusNum;
        $.each(clinicObj.deviceSubmissions, function(index, deviceVal) {
            $.each(tabletDataArray, function(index, value) {
                if (value.DevicesIDs === "DeviceId " + deviceVal.deviceId) {
                    var itemName = colKey + weekVal;
                    value[itemName] = deviceVal.submissionsCount;
                }
            });
        });
    } else if (colKey == "casesInYear") {
        //This section will handle all the data related to year columns
        var yearVal = current_Year - minusNum;
        $.each(clinicObj.deviceSubmissions, function(index, deviceVal) {
            $.each(tabletDataArray, function(index, value) {
                if (value.DevicesIDs === "DeviceId " + deviceVal.deviceId) {
                    var itemName = colKey + yearVal;
                    value[itemName] = deviceVal.submissionsCount;
                }
            });
        });
    } else if (colKey == "casesInMonthL" || colKey == "casesInMonthC") {
        //This method will handle all the data related to month columns
        var monthVal = (new Date()).getMonth() + 1 - minusNum; // +1 because this method return index for month jan = 0 & dec =11
        $.each(clinicObj.deviceSubmissions, function(index, deviceVal) {
            $.each(tabletDataArray, function(index, value) {
                if (value.DevicesIDs === "DeviceId " + deviceVal.deviceId) {
                    var itemName = colKey;
                    value[itemName] = deviceVal.submissionsCount;
                }
            });
        });
    }
}



function getClinicCaseAndType(data) {
    $.each(tabletDataArray, function(index, value) {
        if (value.ClinicName === data.id) {
            value.ClinicName = data.name;
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
