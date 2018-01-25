var clinicCounter = 0;
var clinicDefaultColumnType = "";

function gatherClinicsData(locID) {

    // First destroyany pre-existing table.
    $('#clinicsTable table').bootstrapTable('destroy');
    $('#clinicsTable table').remove();


    //Clear the arrays ...
    columnNameArray = [];
    clinicDataArray = [];
    clinicColumnsConfig = [];

    var locationAPI = "/locations";

    // this variable will contain the clinic columns details
    clinicColumnsConfig.push({
        "columnName": "new",
        "api": '/query_variable/vis_1/locations:clinic?only_loc=' + locID + '&use_ids=True',
        "type": "N",
        "suffix": " (new)"
    }, {
        "columnName": "return",
        "api": '/query_variable/vis_2/locations:clinic?only_loc=' + locID + '&use_ids=True',
        "type": "F",
        "suffix": " (return)"
    }, {
        "columnName": "cd",
        "api": '/query_variable/reg_10/locations:clinic?only_loc=' + locID + '&use_ids=True',
        "type": "CD",
        "suffix": " (cd reg.)"
    }, {
        "columnName": "ncd",
        "api": '/query_variable/reg_11/locations:clinic?only_loc=' + locID + '&use_ids=True',
        "type": "NCD",
        "suffix": " (ncd reg.)"
    });


    buildClinicsTable();

    var deferreds = [];
    $.each(clinicColumnsConfig, function(index, value) {
        if ($.inArray(value.columnName, config.clinicsTableColumns) != -1) {

            deferreds.push(
                $.getJSON(api_root + value.api, function(data) {
                    $.each(data, function(index, weekValue) {
                        FillClinicTable(index, weekValue.weeks, value.type);
                    });
                })
            );
        }
    });
    deferreds.push(
        //Get the reall name for the clinics and replace the numbers with the text
        $.getJSON(api_root + locationAPI, function(dataLocation) {
            getClinicsNames(dataLocation);
        })
    );

    $.when.apply($, deferreds).then(function() {
        //Append the table and the columns ...
        $('#clinicsTable').append('<table class="table"></table>');
        $('#clinicsTable table').bootstrapTable({
            columns: columnNameArray,
            data: clinicDataArray,
            pagination: true,
            pageSize: 10,
            search: true,
            classes: "table table-no-bordered table-hover"
        });

        addPaginationListener('#clinicsTable table');

        //Update the table header so there is no need for scroll bar
        changeHeaderCss();
    });

}


function buildClinicsTable() {

    //Add the first Column ...
    buildTableColumn("clinicName", "Facility Name", "total");

    //Get the current week with the last two weeks, 3 weeks total
    var currentWeek = week;

    //build the clinic columns based on the clinicColumnsConfig
    $.each(clinicColumnsConfig, function(index, value) {
        for (i = week - 2; i <= currentWeek; i++) {

            var columnClass = "";
            var currentText = "";
            if (i === week) {
                columnClass = "total";
            }

            //Draw the clolumns depend on the week number
            if ($.inArray(value.columnName, config.clinicsTableColumns) != -1) {
                buildTableColumn(i + value.type, "Week " + i + currentText + value.suffix, columnClass);
            }
        }
    });
}

//building table header
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


function FillClinicTable(clinicName, weeks, type) {
    var currentWeek = week;

    if (clinicCounter == 0) {
        clinicDefaultColumnType = type;
    }
    clinicCounter = clinicCounter + 1;


    if (clinicDefaultColumnType == type) {
        var dataObject = {};

        //Add Clinic Name ...
        dataObject.clinicName = clinicName;

        for (i = currentWeek - 2; i <= currentWeek; i++) {
            var itemName = i + type;
            dataObject[itemName] = weeks[i];
        }

        clinicDataArray.push(dataObject);

    } else {
        $.each(clinicDataArray, function(index, value) {
            if (value.clinicName.toString() === clinicName.toString()) {
                for (i = currentWeek - 2; i <= currentWeek; i++) {
                    var itemName = i + type;
                    value[itemName] = weeks[i];
                }
            }
        });
    }
}


//overwrite the clinic number with the name
function getClinicsNames(data) {
    $.each(clinicDataArray, function(index, value) {
        value.clinicName = data[value.clinicName].name;
    });
}

//return the %  percentage ...
function calculateCompleteness(clinicSubmitNum) {
    var result = 100 * (clinicSubmitNum / config.completeness_denominator.all); // "config" is a global variable
    if (result > 100) {
        return 100;
    }
    return parseInt(result);
}

//update the column style so the text will not be in one line
function changeHeaderCss() {
    $('div.th-inner').each(function() {
        $(this).css({
            'white-space': "normal"
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
