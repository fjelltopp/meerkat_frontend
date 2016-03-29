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
      data: series
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
          return Math.abs(this.value) + '%';
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
      name: 'Confirmed',
      data: series[0]
    },{
      type: 'spline',
      name: 'Suspected',
      data: series[1],
    }]
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
      name: 'Suspected',
			  data: series[0],
			  lineWidth: 5
    }]
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

