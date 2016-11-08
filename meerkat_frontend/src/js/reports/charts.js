// Chart functions and settings

function pieChart(series) {
  var chart = {
    chart: {
      type: 'pie',
      animation: false,
      spacingBottom: 30
    },
    title: {
      text: null
    },
	plotOptions: {
      pie: {
          allowPointSelect: true,
          dataLabels: {
               enabled: false
           },
          showInLegend: true
	  }
	},
    legend: {
      enabled: true,
      verticalAlign: 'bottom',
      align: 'center',
      layout: 'horizontal',
      style: {
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
      }
    },
    series: [{
		colorByPoint: true,
		data: series,
		name: i18n.gettext("Count")
    }]
  };
  return chart;
}

function sitesBarChart(categories, series, labels) {
  var chart = {
    chart: {
      type: 'bar',
      animation: false
    },
	  tooltip: {
		  valueDecimals: 1,
		  valueSuffix: '%'
	  },
    title: {
      text: null
    },
    xAxis: {
      categories: categories,
    },
    yAxis: {
      min: 0,
      title: {
        text: labels.yAxis.text,
        align: 'middle'
      },
      labels: {
        formatter: function() {
			return Math.round(Math.abs(this.value),1) + '%';
        }
      }
    },
    series: series
  };
  return chart;
}

function genderBarChart(categories, series, labels) {
  var chart = {
    chart: {
      type: 'column',
      animation: false
    },
    title: {
      text: null
    },
    legend: {
      enabled: true,
      style: {
        fontFamily: 'Helvetica Neue", Helvetica, Arial, sans-serif'
      }
    },
    xAxis: {
      categories: categories,
      labels: {
        step: 1
      },
      title: {
        text: labels.xAxis.text,
        align: 'middle'
      }
    },
    yAxis: {
      title: {
        text: labels.yAxis.text,
        align: 'middle'
      }
    },
    series: series
  };
  return chart;
}

function communicableDiseasesBarChart(categories, series, labels) {

  var chart = {
    chart: {
      animation: false
    },
    title: {
      text: null
    },
    legend: {
      enabled: true,
      style: {
        fontFamily: 'Helvetica Neue", Helvetica, Arial, sans-serif'
      }
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: false
        }
      }
    },
    xAxis: {
      categories: categories,
      title: {
        text: labels.xAxis.text,
        align: 'middle'
      }
    },
    yAxis: {
      title: {
        text: labels.yAxis.text,
        align: 'middle'
      },
      allowDecimals: false,
      min: 0
    },
    series: [{
      type: 'column',
      name: i18n.gettext('Confirmed'),
      data: series[0]
    },{
      type: 'spline',
      name: i18n.gettext('Suspected'),
      data: series[1],
    }]
  };
	return chart;
}

function PipBarChart(weeks, suspected, confirmed, labels) {

	var series = [];
		series.push({
			type: 'spline',
			name: i18n.gettext('Suspected'),
			data: suspected,
			color: "#365286"
		});
	colors = {"B": '#0F79BD',
			  "H3": "#E8E801",
			  "H1N1": "#D22727",
			  "Mixed": "#8F908E"
			 };
	for(var serie in confirmed){
		series.push( {
			'type': 'column',
			'name': confirmed[serie].title,
			'data': confirmed[serie].values,
			'color': colors[confirmed[serie].title]
		});
	}

  var chart = {
		chart: {
			animation: false
		},
		title: {
			text: null
		},
		legend: {
			enabled: true,
			style: {
				fontFamily: 'Helvetica Neue", Helvetica, Arial, sans-serif'
			}
		},
		plotOptions: {
			spline: {
				marker: {
					enabled: false
				}
			},
			series: {
                stacking: 'normal',
				lineWidth: 5
            },
			 column: {
				 pointPadding: 0,
				 borderWidth: 0,
				 groupPadding: 0,
				 shadow: false
			 }
		},
		xAxis: {
			categories: weeks,
			title: {
				text: labels.xAxis.text,
				align: 'middle'
			}
		},
		yAxis: {
			title: {
				text: labels.yAxis.text,
				align: 'middle'
			},
			allowDecimals: false,
			min: 0
		},
		series: series
	};
	return chart;
}


function refugeeCommunicableDiseasesChart(categories, series, labels) {
  var chart = {
    chart: {
      animation: false
    },
    title: {
      text: null
    },
    legend: {
      enabled: false,
      style: {
        fontFamily: 'Helvetica Neue", Helvetica, Arial, sans-serif'
      }
    },
    plotOptions: {
      spline: {
        marker: {
          enabled: false
        }
      }
    },
    xAxis: {
      categories: categories,
      title: {
        text: labels.xAxis.text,
        align: 'middle'
      }
    },
    yAxis: {
      title: {
        text: labels.yAxis.text,
        align: 'middle'
      },
	  labels: {
        formatter: function () {
          return this.value;
        }
	  },
      allowDecimals: true,
	  min: 0
    },
      series: [
		  {
			  type: 'column',
			  name: i18n.gettext('Suspected'),
			  data: series[0],
			  lineWidth: 5
		  }]
  };
	return chart;
}

//Completeness bar chart for the AFRO Bulletin
function completenessBarChart(categories, series, labels) {
  var chart = {
    chart: {
      type: 'bar',
      animation: false
    },
	  tooltip: {
		  valueDecimals: 1,
		  valueSuffix: '%'
	  },
    title: {
      text: null
    },
    xAxis: {
      min: 0,
      title: {
        text: labels.yAxis.text,
        align: 'middle'
      },
      labels: {
        formatter: function() {
			return Math.round(Math.abs(this.value),1) + '%';
        }
      }
    },
    yAxis: {
      categories: categories,
    },
    series: series
  };
  return chart;
}

//Measles bar chart for the afro bulletin.
function measlesBarChart(categories, series, labels) {
  var chart = {
    chart: {
      type: 'column',
      animation: false
    },
    title: {
      text: null
    },
    legend: {
      enabled: true,
      style: {
        fontFamily: 'Helvetica Neue", Helvetica, Arial, sans-serif'
      }
    },
    xAxis: {
      categories: categories,
      labels: {
        step: 1
      },
      title: {
        text: labels.xAxis.text,
        align: 'middle'
      }
    },
    yAxis: {
      title: {
        text: labels.yAxis.text,
        align: 'middle'
      }
    },
    series: series
  };
  return chart;
}

//Malaria bar chart for the afro bulletin.
function malariaChart(weeks, series, labels) {

  var chart = {
		chart: {
			animation: false,
      type: 'column'
		},
		title: {
			text: null
		},
		legend: {
			enabled: true,
			style: {
				fontFamily: 'Helvetica Neue", Helvetica, Arial, sans-serif'
			}
		},
		plotOptions: {
			spline: {
				marker: {
					enabled: false
				}
			},
			series: {
        stacking: 'normal',
				lineWidth: 5
      },
		},
		xAxis: {
			categories: weeks,
			title: {
				text: labels.xAxis.text,
				align: 'middle'
			}
		},
		yAxis: {
			title: {
				text: labels.yAxis.text,
				align: 'middle'
			},
			allowDecimals: false,
			min: 0
		},
		series: series
	};
	return chart;
}

// Global chart settings
/*$(function() {
      Highcharts.setOptions({
        colors: ["#0098CB", "#EE2631", "#27EE00", "#074EBF", "#F78900", "#ff0066", "#eeaaee",
          "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
        chart: {
          animation: false,
          backgroundColor: null,
          style: {
            fontFamily: 'Helvetica Neue", Helvetica, Arial, sans-serif'
          }
      	},
        credits: {
          enabled: false
        },
        tooltip: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        plotOptions: {
          series: {
            animation: false
          },
          pie: {
            states: {
              hover: {
                enabled: false
              }
            },
            dataLabels: {
              enabled: false
            },
            showInLegend: true,
          }
        }
      });
    }
);*/

