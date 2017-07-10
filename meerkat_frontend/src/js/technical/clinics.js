//Global Variable ...
var globalArray = [];
var weeksArray = [];

// This will be the main function for the Clinics Page...
function build_clinics_page(locID) {
    var clinicsData = GatherClinicsData(locID);
}



function GatherClinicsData(locID) {
    //API URLS to get Clinisc Data ...
    var clinicsNewDate = '/query_variable/vis_1/locations:clinic?only_loc=' + locID;
    var clinicsReturnDate = '/query_variable/vis_2/locations:clinic?only_loc=' + locID;

    //Call the first API that return the new visits ..
    $.getJSON(api_root + clinicsNewDate, function(data) {
        $.each(data, function(index, value) {
            //Add clinics name ..
            globalArray.push(index);
            //Arrange the data into one global Objects ...
            BuildClinicNewVisitsDS(index, value.weeks);
        });


        //Call the return API after finishing the arrange process for the "new clinic visits" ...
        $.getJSON(api_root + clinicsReturnDate, function(data) {
            $.each(data, function(index, value) {
                //Arrange the data into one global Objects ...
                BuildClinicReturnVisitsDS(index, value.weeks);
            });

            //Build The HTML Content ...
            BuildClinicHTMLContent();

        });
    });



}

//This method will arrange the data into one global object to make it easy to draw into table and rows ...
function BuildClinicNewVisitsDS(clinicName, weeks) {
    var counter = 0;
    for (var week in weeks) {
        var weekName = week;

        //Save the week number into a weeksArray so i can know all the weeks from the new & return visit + i can easly arrange them ...
        //If the week number not exist then i will add it so i will have only unique numbers ...
        var wResult = $.inArray(weekName, weeksArray);
        if (wResult === -1) {
            weeksArray.push(weekName);
        }

        //Add the week Number into the first index ...
        weekName = [weekName];
        //Add the Week new Value into the second index ...
        weekName.push(weeks[week]);


        if (counter === 0) {
            globalArray[clinicName] = [];
            globalArray[clinicName].push(weekName);
        } else {
            globalArray[clinicName].push(weekName);
        }
        counter = counter + 1;

    }
}

function BuildClinicReturnVisitsDS(clinicName, weeks) {
    var newVisit = globalArray[clinicName];
    $.each(newVisit, function(index, newVisitArray) {
        //get the week number ...
        var weekName = newVisitArray[0];
        //Check if the week number from NewVists exist in the returnVist then add the value else add 0 ...
        if (weeks.weekName === undefined) {
            newVisitArray.push(0);

            //Check if the weeks obj contains data ...
            if (Object.keys(weeks).length > 0) {
                //Save the week number into a weeksArray so i can know all the weeks from the new & return visit + i can easly arrange them ...
                //If the week number not exist then i will add it so i will have only unique numbers ...
                var wResult = $.inArray(weeks.weekName, weeksArray);
                if (wResult === -1) {
                    //Its mean this is a new week number that doesnt exist in the new vist ...
                    weeksArray.push(weekName);
                }
            }
        } else {
            newVisitArray.push(weeks.weekName);
        }

    });
}

function BuildClinicHTMLContent() {
    //Sort the weeks array Ascending ...
    SortClinicsWeeks(weeksArray);

    //Build the Title for the Table ..
    var html_builder = "<div  class='col-xs-12 col-md-12 less-padding-col'> <div class='chartBox box' >" +
        "<div class = 'chartBox__heading' > <p id = '#box_heading'>" + "Clinics Entries" + "</p> </div>" +
        "<div class = 'chartBox__content' > " +
        "<div class='divTable'><div  class='divTableBody' >";

    //Build the header ex: Name of facility - Week 1 (new) - week 1 (folow up) ...
    html_builder = html_builder + "<div class='divTableRow'>" + "<div class='divTableCell' style='font-weight: bold;'> " + "Name Of Facility" + "</div>";
    $.each(weeksArray, function(index, value) {

        //No need to redundant the code just add variables and fill it if its the current week ...
        var columnRedStyle = "";
        var currentText = "";
        if (value === week.toString()) {
            columnRedStyle = "color: red;";
            currentText = " current ";
        }

        html_builder = html_builder + "<div class='divTableCell' style='font-weight: bold;" + columnRedStyle + "'> " + "Week " + value + currentText + " (new) " + "</div>";
        html_builder = html_builder + "<div class='divTableCell' style='font-weight: bold;" + columnRedStyle + "'> " + "Week " + value + currentText + " (follow up) " + "</div>";
        //  html_builder = html_builder + "<div class='divTableCell' style='font-weight: bold;" + columnRedStyle + "'> " + "Week " + value + " ( completeness ) " + "</div>";
    });
    html_builder = html_builder + "</div>";


    // Draw the Values ..
    $.each(globalArray, function(ind, clinicName) {
        //Draw Clinic Name ...
        html_builder = html_builder + "<div class='divTableRow'>" + "<div class='divTableCell' style='font-weight: bold;'> " + clinicName + "</div>";

        //I will move into the weeks column to  make check if the week exist in the current clinic , yes draw values , No draw "0" ...
        $.each(weeksArray, function(i, weekNumber) {
            var foundWeek = 0;

            $.each(globalArray[clinicName], function(i, week) {

                if (week[0] === weekNumber) {
                    foundWeek = 1;
                    html_builder = html_builder + "<div class='divTableCell' style='font-weight: bold;'> " + week[1] + "</div>";
                    html_builder = html_builder + "<div class='divTableCell' style='font-weight: bold;'> " + week[2] + "</div>";
                } else {
                    if (i + 1 === globalArray[clinicName].length && foundWeek === 0) {
                        html_builder = html_builder + "<div class='divTableCell' style='font-weight: bold;'> " + "0" + "</div>";
                        html_builder = html_builder + "<div class='divTableCell' style='font-weight: bold;'> " + "0" + "</div>";
                    }
                }

            });

        });

        html_builder = html_builder + "</div>";
    });


    //Build the box footer ...
    html_builder = html_builder + "</div> </div> </div> </div> </div>";


    //Add the HTML into the Clinic.html ...
    $('#divClinicContent').append(html_builder);

}

function SortClinicsWeeks(arr) {
    arr.sort(function(a, b) {
        if (isNaN(a) || isNaN(b)) {
            return a > b ? 1 : -1;
        }
        return a - b;
    });
}
