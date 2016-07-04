/**:showChartType( type, containerID )

    Hides div elements inside the container that don't have a class with the given type.
    Requires a container element with ID 'containerID' holding divs with class 'chart'.
    These divs with class 'chart' also have a class that determines type, e.g. 'bar' or 'pie'
    This function is practically used to switch between bar and pie charts. 

    :param string type:
        The class of the HTML element holding the chart to be shown. 
        The HTML element must also have a class of chart.
    :param string containerID:
        The ID of the HTML holding the different charts. 
        Each element holding a chart in the container must have a class of both "chart" 
        and an identifying type e.g. "bar" or "pie". 

*/
function showChartType( type, containerID ){
  $('#'+containerID+' .chart').not('.'+type).addClass('hidden');
  $('#'+containerID+' .'+type).removeClass('hidden');
}

/**:drawBarChart( containerID, data, percent )

    Draws a bar chart in the DOM element with the given containerID using the
    data in the given data object. If percent is set to true, we use percentage rather than numbers.

    :param string containerID:
        The ID of the HTML element to hold the chart.
    :param object data:
        The data object as built by the misc.js function `makeDataObject()`.
    :param boolean percent:
        If true, data will be first converted to percentages, where each datum become the its
        percentage of the total data set: (datum value/total value)*100.
 */
function drawBarChart( containerID, data, percent ){

  console.log( data );

  //We want to work with a clone of the data, not the data itself.
  data = $.extend(true, {}, data);

  //Hack to get plot to size correctly when being drawn into a hidden object.
  //If the object is hidden, set the plot width to the inner width of the parent.
  //Otherwise, leave as undefined as specified in the highcharts api.
  var plotWidth;
  if( $('#'+containerID).hasClass('hidden') ){
    plotWidth = $('#'+containerID).parent().width();
  }

  var tooltip = function(){
    return this.series.name + ': ' + this.point.y;
  };
  var units = 'Number';
  //If percent is set to true, convert data to percentages and store both in the data object.
  //This means both percent and count can be referenced in tooltip.
  if( percent ){

    data.week_val = data.week;
    data.year_val = data.year;
    data.week = calc_percent_dist(data.week);
    data.year = calc_percent_dist(data.year);
    data.week = data.week.map( function (e, i) { return {"y":e, "val": data.week_val[i] }; });
    data.year = data.year.map( function (e, i) { return {"y":e, "val": data.year_val[i] }; });

    units=i18n.gettext('Percent %');
    tooltip = function (){
      return this.series.name + ': <b>' + this.point.y + '%</b> (' + this.point.val + ')';
    };
  }

  $('#'+containerID).highcharts({
    chart: {
      type: 'column',
      width: plotWidth
    },
    title: '',
    tooltip: {
      formatter: tooltip
    },
    xAxis: {
      categories: data.labels,
      title: {
        text: null
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: units,
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },      
    series: [{
      name: i18n.gettext('This Year'),
      data:  data.year
    },{
      name: i18n.gettext('This Week'),
      data:  data.week
    }],
  });

  //Get rid of the highcharts logo.
  $( '#'+containerID+" text:contains('Highcharts.com')" ).remove();

}

/**:drawPieCharts( containerID, data, percent )

    Draws pie charts in the DOM element with the given containerID using the
    data in the given data object. If percent is set to true, we use percentage rather than numbers.
    Two pie charts are drawn, one for the previous week, and one for the cumulative total during the
    current year.

    :param string containerID:
        The ID of the HTML element to hold the chart.
    :param object data:
        The data object as built by the misc.js function `makeDataObject()`.
    :param boolean percent:
        If true, data will first be converted to percentages, where each datum become the its
        percentage of the total data set: (datum value/total value)*100.
 */
function drawPieCharts( containerID, data, percent ){
  
  //We want to work with a clone of the data, not the data itself.
  data = $.extend(true, {}, data);

  //Hack to get plot to size correctly when being drawn into a hidden object.
  //If the object is hidden, set the plot width to the inner width of the parent.
  //Otherwise, leave as undefined (as specified in the highcharts api).
  var plotWidth;
  if( $('#'+containerID).hasClass('hidden') ){
    plotWidth = $('#'+containerID).parent().width();
  }
  var restructured = {};
  var units = 'Number';
  var tooltip = function(){
    return this.series.name + ': ' + this.point.y;
  };
  //If percent is set to true, convert data to percentages and store both in the data object.
  //This means both percent and count can be referenced in tooltip.
  if( percent ){

    data.week_val = data.week;
    data.year_val = data.year;
    data.week = calc_percent_dist(data.week);
    data.year = calc_percent_dist(data.year);

    //Restructure the data object for pie charts.
    restructured.week = data.week.map( function (e, i) { 
      return {name: data.labels[i], y:e, val: data.week_val[i] }; 
    });
    restructured.year = data.year.map( function (e, i) { 
      return {name: data.labels[i], y:e, val: data.year_val[i] }; 
    });

    units=i18n.gettext('Percent %');
    tooltip = function (){
      return this.series.name + ': <b>' + this.point.y + '%</b> (' + this.point.val + ')';
    };

  }else{
    //Restructure the data object for pie charts.
    restructured = {week:[], year:[]};
    for( var i=0; i<data.labels.length; i++ ){
      restructured.week[i] = { name: data.labels[i], y: data.week[i] };
      restructured.year[i] = { name: data.labels[i], y: data.year[i] };
    }
  }

  //Draw the graph.
  $( '#'+containerID ).highcharts({
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'pie',
      width: plotWidth
    },
    title: '',
    tooltip: {
      formatter:tooltip
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: false
        },
        showInLegend: true
      }
    },
    series: [{
      name: i18n.gettext('This Week'),
      center: ['20%','50%'],
      size: "70%",
      colorByPoint: true,
      showInLegend:true,
      title: { text: '<b>Week</b>', verticalAlign: 'top', y: -40 },
      data: restructured.week
    },{
      name: i18n.gettext('This Year'),
      center: ['80%','50%'],
      size: "70%",
      colorByPoint: true,
      showInLegend:false,
      title: { text: '<b>Year</b>', verticalAlign: 'top', y: -40 },
      data: restructured.year
    }]
  });

  //Get rid of the highcharts.com logo.
  $( '#'+containerID+" text:contains('Highcharts.com')" ).remove();

}

/**:drawTimeCharts( varID, locID, containerID )

    Draws a timeline bar chart showing the number of cases in each epi week this current year.

    :param string varID:
        The ID of the variable to be plotted (taken from Meerkat Abacus).
    :param string locID:
        The ID of the location by which to filter the data.
    :param string containerID:
        The ID of the HTML element to hold the chart.
 */
function drawTimeChart( varID, locID, containerID ){

  $.getJSON( api_root + '/aggregate_year/' + varID + '/'+locID, function(data){

    var labels = [];
    var values = [];

    for( var i = 1; i <= get_epi_week(); i++ ){

      labels.push(i.toString());

      if( typeof(data.weeks[i]) !== 'undefined' ){
        values.push( data.weeks[i] );
      }else{
        values.push( 0 );
      }

    }

    //Hack to get plot to size correctly when being drawn into a hidden object.
    //If the object is hidden, set the plot width to the inner width of the parent.
    //Otherwise, leave as undefined as specified in the highcharts api.
    var plotWidth;
    if( $('#'+containerID).hasClass('hidden') ){
      plotWidth = $('#'+containerID).parent().width();
    }


    $('#'+containerID).highcharts({
    chart: {
      type: 'column',
      width: plotWidth
    },
    title: '',
    xAxis: {
      categories: labels,
      title: {
        text: i18n.gettext('Epidemiological Week')
      }
    },
    legend:{ enabled:false },
    yAxis: {
      min: 0,
      title: {
        text: i18n.gettext('Number of Reported Cases'),
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },      
    series: [{
      name: 'Year',
      data:  values
    }],
    });

    //Get rid of the highcharts logo.
    $( '#'+containerID+" text:contains('Highcharts.com')" ).remove();
  });

}

Highcharts.setOptions({
  colors: ["#0090CA", "#D9692A", "#89B6A5", "#e94f37", "#393e41", "#F1E8B8",
          "#CDEDF6", "#690500", "#77477B", "#40476D","#042A2B" ],
  chart: {
    backgroundColor: null,
    style: {
      fontFamily: 'Helvetica Neue", Helvetica, Arial, sans-serif'
    }
  },
  credits: {
    enabled: false
  },
  exporting: {
    enabled: false
  }

});


