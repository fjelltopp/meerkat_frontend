describe( "Testing functions in misc.js", function(){

    describe("Get epi week: get_epi_week()", function() {
          it("Returns week value", function() {
                week = 7;
                expect(get_epi_week()).toBe(7);
          });
    });

    describe("Get date: get_date()", function() {
          it("Returns date in required text format", function() {
                date=new Date();
                var monthNames = [
                    i18n.gettext("January"), i18n.gettext("February"),
                    i18n.gettext("March"), i18n.gettext("April"),
                    i18n.gettext("May"), i18n.gettext("June"),
                    i18n.gettext("July"), i18n.gettext("August"),
                    i18n.gettext("September"), i18n.gettext("October"),
                    i18n.gettext("November"), i18n.gettext("December")
                ];
                expected = date.getDate() + " "+monthNames[date.getMonth()] + " " +
                             date.getFullYear();
                expect(get_date()).toBe(expected);
          });
    });

    describe("Integer checker: isInteger()", function() {
          it("Correctly identify the integer 3", function() {
                expect(isInteger(3)).toBe(true);
          });
          it("Correctly identify an integer 3.0", function() {
                expect(isInteger(3.0)).toBe(true);
          });
          it("Correctly reject the string '3.0'", function() {
                expect(isInteger("3.0")).toBe(false);
          });
          it("Correctly reject the float 3.1", function() {
                expect(isInteger(3.1)).toBe(false);
          });
    });

    describe("Number formatter: format()", function() {
          it("Correctly format the 5 digit number: 45321", function() {
                expect(format(45321)).toBe('45,321');
          });
          it("Convert a 3 digit number to string", function() {
                expect(format(453)).toBe('453');
          });
    });

    describe("Calc percent: calc_percent()", function() {
        it("Correctly calculates percent", function() {
            expect(calc_percent(1, 10)).toBe(10);
        });
        it("Correctly calculates percent with rounding", function() {
            expect(calc_percent(1, 7)).toBe(14);
        });
        it("Deal with zero denominator", function() {
            expect(calc_percent(1, 0)).toBe(0);
        });
    });

    describe("Calc percent distribution: calc_percent_dist()", function() {
        it("Correctly calculates distribution for [1,2,1]", function() {
            expect(calc_percent_dist([1,2,1])).toEqual([25,50,25]);
        });
    });

    describe("Round number: round()", function() {
        it("Correctly rounds 5.3457 to 2dp", function() {
            expect(round(5.3467, 2)).toBe(5.35);
        });
    });

    describe("Default values for non-existant keys: if_exists()", function() {
        it("Returns value if key exists", function() {
            expect(if_exists({a:5}, 'a')).toBe(5);
        });
        it("Returns 0 if key doesn't exist", function() {
            expect(if_exists({a:5}, 'b')).toBe(0);
        });
    });

    describe("Sorting alphanumeric ids on just number: idSort()", function() {
        it("Correctly sorts jumbled id list", function() {
            var original = ['blah_13', 'blur_3', 'blub_34', 'blaf_30'];
            original.sort(idSort);
            expect(original).toEqual(['blur_3', 'blah_13', 'blaf_30', 'blub_34']);
        });
    });

    describe("Capitalises strings first character: capitalise()", function() {
        it("Correctly capitalises string 'not capitalised'", function() {
            expect(capitalise('not capitalised')).toEqual('Not capitalised');
        });
        it("Correctly returns string 'Capitalised already'", function() {
            expect(capitalise('Capitalised already')).toEqual(
                'Capitalised already'
            );
        });
    });

    describe("Get the last n weeks in an array: lastWeeks()", function() {
        it("Correctly identify last 2 week numbers from week 10", function() {
            expect(lastWeeks(10, 2)).toEqual([10,9]);
        });
        it("Correctly identify last 3 week numbers from week 2", function() {
            expect(lastWeeks(2, 3)).toEqual([2,1,52]);
        });
    });

    describe("Building data objects: makeDataObject()", function() {

        //Define the input
        var aggregation = {
            "gen_1": {"weeks": {"1": 3, "2": 2, "3": 1}, "year": 6.0},
            "gen_2": {"weeks": {"1": 1, "2": 2, "3": 3}, "year": 6.0}
        };
        var variables = {
            "gen_1": {
                "alert": 0,
                "alert_desc": "",
                "alert_type": "",
                "calculation": "",
                "calculation_group": "gender",
                "case_def": "",
                "category": [
                    "gender"
                ],
                "classification": null,
                "classification_casedef": "",
                "condition": "male",
                "db_column": "pt1./gender",
                "disregard": 0,
                "form": "demo_case",
                "id": "gen_1",
                "labs_diagnostics": "",
                "method": "match",
                "multiple_link": "",
                "name": "Male",
                "risk_factors": "",
                "source": "",
                "source_link": "",
                "symptoms": "",
                "type": "case"
            },
            "gen_2": {
                "alert": 0,
                "alert_desc": "",
                "alert_type": "",
                "calculation": "",
                "calculation_group": "gender",
                "case_def": "",
                "category": [
                    "gender"
                ],
                "classification": null,
                "classification_casedef": "",
                "condition": "female",
                "db_column": "pt1./gender",
                "disregard": 0,
                "form": "demo_case",
                "id": "gen_2",
                "labs_diagnostics": "",
                "method": "match",
                "multiple_link": "",
                "name": "Female",
                "risk_factors": "",
                "source": "",
                "source_link": "",
                "symptoms": "",
                "type": "case"
            }
        };
        var week = 3;
        var title = 'Test';
        var percent = false;

        it("Correctly build a data object", function() {
            //Expected output from the above input.
            var expected = {
                title: 'Test',
                labels: ['Male', 'Female'],
                ids: ['gen_1', 'gen_2'],
                year: [6, 6],
                week: [1, 3],
                week1: [2, 2],
                week2: [3, 1]
            };

            //Checkout input gives expected output
            expect(makeDataObject(aggregation, variables, week, title, percent))
                .toEqual(expected);
        });

        it("Correctly build a data object with percents", function() {
            //Alter input.
            percent = true;
            //Expected output from the above input.
            var expected = {
                title: 'Test',
                labels: ['Male', 'Female'],
                ids: ['gen_1', 'gen_2'],
                year: [6, 6],
                week: [1, 3],
                week1: [2, 2],
                week2: [3, 1],
                yearPerc: [50, 50],
                weekPerc: [25, 75],
                week1Perc: [50, 50],
                week2Perc: [75, 25]
            };

            //Checkout input gives expected output
            expect(makeDataObject(aggregation, variables, week, title, percent))
                .toEqual(expected);
        });

        it("Correctly build a data object with percent denominators", function() {

            percent = {
                'year': 10,
                'weeks': {'1': 100, '2': 10, '3': 5}
            };

            //Expected output from the above input.
            var expected = {
                title: 'Test',
                labels: ['Male', 'Female'],
                ids: ['gen_1', 'gen_2'],
                year: [6, 6],
                week: [1, 3],
                week1: [2, 2],
                week2: [3, 1],
                yearPerc: [60, 60],
                weekPerc: [20, 60],
                week1Perc: [20, 20],
                week2Perc: [3, 1]
            };
            //Checkout input gives expected output
            expect(makeDataObject(aggregation, variables, week, title, percent))
                .toEqual(expected);
        });

        it("Correctly build a data object with missing data", function() {

            week = 1;
            percent = true;

            //Expected output from the above input.
            var expected = {
                title: 'Test',
                labels: ['Male', 'Female'],
                ids: ['gen_1', 'gen_2'],
                year: [6, 6],
                week: [3, 1],
                week1: [0, 0],
                week2: [0, 0],
                yearPerc: [50, 50],
                weekPerc: [75, 25],
                week1Perc: [0, 0],
                week2Perc: [0, 0]
            };
            //Checkout input gives expected output
            expect(makeDataObject(aggregation, variables, week, title, percent))
                .toEqual(expected);
        });
    });

    //TODO: Write tests for category summation
    //TODO: Write tests for exporting to csv

    describe("Get intersect of two arrays: getIntersect()", function() {
        it( "Correctly returns intersect of: [1,2,3] & [2,3,4]", function() {
            expect(getIntersect([1,2,3],[2,3,4])).toEqual([2,3]);
        });
        it("Correctly returns intersect of [1] & [2]", function() {
            expect(getIntersect([1],[2])).toEqual([]);
        });
        it("Correctly returns intersect of [] & []", function() {
            expect(getIntersect([],[])).toEqual([]);
        });
    });

    describe("Subtract arrays: getDifference()", function() {
        it( "Correctly returns [1,2,3] - [2,3,4]", function() {
            expect(getDifference([1,2,3],[2,3,4])).toEqual([1]);
        });
        it("Correctly returns difference of [1] - [2]", function() {
            expect(getDifference([1],[2])).toEqual([1]);
        });
        it("Correctly returns difference of [] & []", function() {
            expect(getDifference([],[])).toEqual([]);
        });
    });

    describe("Remove empty records: stripEmptyRecords()", function() {
        it( "Correctly removes empty records", function() {
            var data = {
                title: 'Test',
                labels: ['Male', 'Prefer not say', 'Female'],
                ids: ['gen_1', 'gen_2', 'gen_3'],
                year: [6, 0, 6],
                week: [1, 0, 3],
                week1: [2, 0, 2],
                week2: [3, 0, 1],
                yearPerc: [50, 0, 50],
                weekPerc: [25, 0, 75],
                week1Perc: [50, 0, 50],
                week2Perc: [75, 0, 25]
            };

            var expected = {
                title: 'Test',
                labels: ['Male', 'Female'],
                ids: ['gen_1', 'gen_3'],
                year: [6, 6],
                week: [1, 3],
                week1: [2, 2],
                week2: [3, 1],
                yearPerc: [50, 50],
                weekPerc: [25, 75],
                week1Perc: [50, 50],
                week2Perc: [75, 25]
            };

            expect(stripEmptyRecords(data)).toEqual(expected);
        });

        it( "Correctly returns an object without empty records", function() {

            var data = {
                title: 'Test',
                labels: ['Male', 'Female'],
                ids: ['gen_1', 'gen_3'],
                year: [6, 6],
                week: [1, 3],
                week1: [2, 2],
                week2: [3, 1],
                yearPerc: [50, 50],
                weekPerc: [25, 75],
                week1Perc: [50, 50],
                week2Perc: [75, 25]
            };

            expect(stripEmptyRecords(data)).toEqual(data);

        });
    });
});

//TODO: Test completeness preparation? (or should it be in e2e tests?)
//TODO: Test timeliness preparation? (or should it be in e2e tests?)
