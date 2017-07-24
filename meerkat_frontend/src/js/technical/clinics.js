//Global Variable ...

var columnNameArray = [];
var clinicDataArray = [];


// This will be the main function for the Clinics Page...
function build_clinics_page(locID) {
    var clinicsData = GatherClinicsData(locID);
}



function GatherClinicsData(locID) {
    //Clear the arrays ...
    columnNameArray = [];
    clinicDataArray = [];


    //API URLS to get Clinisc Data ...
    var clinicsNewData = '/query_variable/vis_1/locations:clinic?only_loc=' + locID + '&use_ids=True';
    var clinicsReturnData = '/query_variable/vis_2/locations:clinic?only_loc=' + locID + '&use_ids=True';
    var completenessData = '/completeness/reg_1/1/6?sublevel=clinic';
    var locationAPI = "/locations";


    BuildClinicTable();

    //Call the first API that return the new visits ..
    $.getJSON(api_root + clinicsNewData, function(data) {
        $.each(data, function(index, value) {
            BuildClinicNewVisits(index, value.weeks);
        });


        //Call the return API after finishing the arrange process for the "new clinic visits" ...
        $.getJSON(api_root + clinicsReturnData, function(data) {
            $.each(data, function(index, value) {
                BuildClinicReturnVisits(index, value.weeks);
            });


            //Get the completeness data ...
            $.getJSON(api_root + completenessData, function(dataCom) {
                $.each(dataCom.timeline, function(index, value) {
                    BuildClinicCompleteness(index, value.values);
                });

                //Get the reall name for the clinics and replace the numbers with the text ...
                $.getJSON(api_root + locationAPI, function(dataLocation) {
                    GetClinicsNames(dataLocation);

                    //Append the table and the columns ...
                    var bHtml = "<table id='clinicsTable' data-toggle='Table'  data-export='true' data-search='true'  class='table table-hover table-condense' style='background-color:white;'></table>";

                    $('#divClinicContent').append(bHtml);
                    $('#clinicsTable').bootstrapTable({
                        columns: columnNameArray,
                        data: clinicDataArray,
                        pagination: true,
                        pageSize: 10,
                        classes: "table table-no-bordered table-hover"
                    });

                    //Update the table header so there is no need for scroll bar ...
                    ChangeHeaderCss();
                });
            });
        });
    });
}



function BuildClinicTable() {
    //Add the first Column ...
    BuildTableColumn("clinicName", "Facility Name", "black");

    //Get the current week with the last two weeks, 3 weeks total ......
    var currentWeek = week;
    for (i = week - 2; i <= currentWeek; i++) {

        var columnRedStyle = "black";
        var currentText = "";
        if (i === week) {
            columnRedStyle = "red";
            //currentText = " current ";
        }
        //Draw the clolumns depend on the week number ...
        BuildTableColumn(i + "N", "Week " + i + currentText + " (new) ", columnRedStyle);
        BuildTableColumn(i + "F", "Week " + i + currentText + " (return) ", columnRedStyle);
    }

    //Now after adding the new and return columns i will add the Completeness column ...
    for (i = week - 2; i < currentWeek; i++) {
        var columnColor = "black";
        var currentTxt = "";
        if (i === week) {
            columnColor = "red";
          //  currentTxt = " current ";
        }
        BuildTableColumn(i + "C", "Week " + i + currentTxt + " (comp.) ", columnColor);
    }
}


//This function is responsible for building the table header ...
function BuildTableColumn(columnId, columnName, columnColor) {
    columnNameArray.push({
        field: columnId,
        title: i18n.gettext(columnName),
        align: "center",
        sortable: true,
        sortName: columnId,
        valign: "middle",
        cellStyle: function cellStyle(value, row, index) {
            return {
                css: {
                    "color": columnColor
                }
            };
        }
    });
}



function BuildClinicNewVisits(clinicName, weeks) {
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



function BuildClinicReturnVisits(clinicName, weeks) {
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


//This function will get the completness value and put it in the right position in the array ...
function BuildClinicCompleteness(clinicName, weeks) {
    var currentWeek = week;
    var counter = 2; // i need the last 3 values only which represent the last 3 weeks ...
    $.each(clinicDataArray, function(index, value) {
        if (value.clinicName.toString() === clinicName.toString()) {
            for (i = currentWeek - 2; i < currentWeek; i++) {
                var itemName = i + "C";
                value[itemName] = CalculateCompleteness(weeks[weeks.length - counter]) + ' % ';
                counter = counter - 1;
            }
        }
    });
}



//This function will overwrite the clinic number with the name ...
function GetClinicsNames(data) {
    $.each(clinicDataArray, function(index, value) {
        value.clinicName = data[value.clinicName].name;
    });
}



//This Method will return the %  percentage ...
function CalculateCompleteness(clinicSubmitNum) {
    var result = 100 * (clinicSubmitNum / config.completeness_denominator.all); // "config" is a global variable ...
    if (result > 100) {
        return 100;
    }
    return parseInt(result);
}



//This Function will update the column Style so the text will not be in one line
function ChangeHeaderCss() {
    $('div.th-inner').each(function() {
        $(this).css({
            'white-space': "normal"
        });
    });
}
