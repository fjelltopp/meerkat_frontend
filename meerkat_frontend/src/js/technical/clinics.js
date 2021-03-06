function gatherClinicsData(locID) {

    // First destroyany pre-existing table.
    $('#clinicsTable table').bootstrapTable('destroy');
    $('#clinicsTable table').remove();

    //Clear the arrays ...
    columnNameArray = [];
    clinicDataArray = [];

    //API URLS to get Clinics Data ...
    var clinicsNewData = '/query_variable/vis_1/locations:clinic?only_loc=' + locID + '&use_ids=True';
    var clinicsReturnData = '/query_variable/vis_2/locations:clinic?only_loc=' + locID + '&use_ids=True';
    var clinicCDData = '/query_variable/reg_10/locations:clinic?only_loc=' + locID + '&use_ids=True';
    var clinicNCDData = '/query_variable/reg_11/locations:clinic?only_loc=' + locID + '&use_ids=True';
    //var completenessData = '/completeness/reg_1/1/6?sublevel=clinic';

    var locationAPI = "/locations";

    buildClinicsTable();

    //Call the first API that return the new visits ..
    $.getJSON(api_root + clinicsNewData, function(data) {
        $.each(data, function(index, value) {
            buildClinicsNewVisits(index, value.weeks);
        });

        //Call the return API after finishing the arrange process for the "new clinic visits" ...
        $.getJSON(api_root + clinicsReturnData, function(data) {
            $.each(data, function(index, value) {
                buildClinicsReturnVisits(index, value.weeks);
            });


            //Get the Clinic CD  data ...
            $.getJSON(api_root + clinicCDData, function(dataCD) {
                $.each(dataCD, function(index, value) {
                    buildClinicsCD(index, value.weeks);
                });

                //Get the Clinic NCD  data ...
                $.getJSON(api_root + clinicNCDData, function(dataNCD) {
                    $.each(dataNCD, function(index, value) {
                        buildClinicsNCD(index, value.weeks);
                    });

                    //Get the reall name for the clinics and replace the numbers with the text ...
                    $.getJSON(api_root + locationAPI, function(dataLocation) {
                        getClinicsNames(dataLocation);

                        //Append the table and the columns ...
                        $('#clinicsTable').append('<table class="table"></table>');
                        $('#clinicsTable table').bootstrapTable({
                            columns: columnNameArray,
                            data: clinicDataArray,
                            locale: get_locale(),
                            pagination: true,
                            pageSize: 10,
                            search: true,
                            classes: "table table-no-bordered table-hover"
                        });

                        addPaginationListener('#clinicsTable table');

                        //Update the table header so there is no need for scroll bar ...
                        changeHeaderCss();
                    });

                });
            });
        });
    });
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

function buildClinicsTable() {

    //Add the first Column ...
    buildTableColumn("clinicName", "Facility Name", "total");

    //Get the current week with the last two weeks, 3 weeks total ......
    var currentWeek = week;
    for (i = week - 2; i <= currentWeek; i++) {

        var columnClass = "";
        var currentText = "";
        if (i === week) {
            columnClass = "total";
            //currentText = " current ";
        }
        //Draw the clolumns depend on the week number ...
        buildTableColumn(i + "N", "Week " + i + currentText + " (new) ", columnClass);
        buildTableColumn(i + "F", "Week " + i + currentText + " (return) ", columnClass);
    }


    //Build CD and NCD Values ..
    for (i = week - 2; i <= currentWeek; i++) {
      var colClass = "";
      if (i === week) {
          colClass = "total";
      }
        buildTableColumn(i + "CD", "Week " + i + " (cd reg.) ", colClass);
        buildTableColumn(i + "NCD", "Week " + i + " (ncd reg.) ", colClass);
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

function buildClinicsNewVisits(clinicName, weeks) {
    var dataObject = {};
    var currentWeek = week;
    //Add Clinic Name ...
    dataObject.clinicName = clinicName;

    for (i = currentWeek - 2; i <= currentWeek; i++) {
        var itemName = i + "N";
        dataObject[itemName] = weeks[i];

        //Add default value to the return visits...
        var itemNameF = i + "F";
        dataObject[itemNameF] = 0;

        //Add default value to the Completeness results...
        var itemNameC = i + "C";
        dataObject[itemNameC] = 0;

    }
    clinicDataArray.push(dataObject);
}

function buildClinicsReturnVisits(clinicName, weeks) {
    var currentWeek = week;
    $.each(clinicDataArray, function(index, value) {
        if (value.clinicName.toString() === clinicName.toString()) {
            for (i = currentWeek - 2; i <= currentWeek; i++) {
                var itemName = i + "F";
                value[itemName] = weeks[i];
            }
        }
    });
}

function buildClinicsCD(clinicName, weeks) {
    var currentWeek = week;
    $.each(clinicDataArray, function(index, value) {
        if (value.clinicName.toString() === clinicName.toString()) {
            for (i = currentWeek - 2; i <= currentWeek; i++) {
                var itemName = i + "CD";
                value[itemName] = weeks[i];
            }
        }
    });
}

function buildClinicsNCD(clinicName, weeks) {
    var currentWeek = week;
    $.each(clinicDataArray, function(index, value) {
        if (value.clinicName.toString() === clinicName.toString()) {
            for (i = currentWeek - 2; i <= currentWeek; i++) {
                var itemName = i + "NCD";
                value[itemName] = weeks[i];
            }
        }
    });
}


//This function will overwrite the clinic number with the name ...
function getClinicsNames(data) {
    $.each(clinicDataArray, function(index, value) {
        value.clinicName = data[value.clinicName].name;
    });
}

//This Method will return the %  percentage ...
function calculateCompleteness(clinicSubmitNum) {
    var result = 100 * (clinicSubmitNum / config.completeness_denominator.all); // "config" is a global variable ...
    if (result > 100) {
        return 100;
    }
    return parseInt(result);
}

//This Function will update the column Style so the text will not be in one line
function changeHeaderCss() {
    $('div.th-inner').each(function() {
        $(this).css({
            'white-space': "normal"
        });
    });
}
