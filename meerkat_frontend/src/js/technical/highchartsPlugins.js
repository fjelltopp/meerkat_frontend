/**
 * Pie title plugin
 * Last revision: 2012-12-21
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
