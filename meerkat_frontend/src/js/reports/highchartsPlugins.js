/**
 * Pie title plugin
 * Author: Torstein Hønsi
 * Original: http://jsfiddle.net/highcharts/tnSRA/
 * Last revision: 2015-08-31
 *
 * It allows us to add individual titles to highcharts that include multiple pie charts.
 * Practically it's used for adding "Year" and "Week" titles to the pie charts.
 */
(function (Highcharts) {
    Highcharts.wrap(Highcharts.seriesTypes.pie.prototype, 'render', function (proceed) {

        var chart = this.chart,
            center = this.center || (this.yAxis && this.yAxis.center), 
            titleOption = this.options.title,
            box;

        proceed.call(this);

        if (center && titleOption) {
            box = {
                x: chart.plotLeft + center[0] - 0.5 * center[2],
                y: chart.plotTop + center[1] - 0.5 * center[2],
                width: center[2],
                height: center[2]
            };
            if (!this.title) {
                this.title = this.chart.renderer.label(titleOption.text)
                    .css(titleOption.style)
                    .add()
                    .align(titleOption, null, box);
            } else {
                this.title.align(titleOption, null, box);
            }
        }
    });

}(Highcharts));
