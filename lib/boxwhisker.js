
BoxWhiskerWidget = function(node_id){
    this.node = node_id;
    this._svg ='svg/box.and.whisker.1.svg?24412';
    this.h = 332;
    this.w = 787;
};

BoxWhiskerWidget.prototype = {

    init: function(){
        this.n = d3.select(this.node);

        var chart = this.n.selectAll('g.bw-chart');
        if (!chart.empty()){
            return;
        }

        var margin = 10;
        var chart_height = this.h - 100;
        var m = 2 * margin;
        var midX = (this.w - margin) / 2;

        var g = this.n.append('g').attr('class', 'bw-chart');
        g.append('rect').attr('width', this.w).attr('height', this.h + 10).attr('class', 'bw-border');

        var head = this.n.append('g').attr('transform', 'translate(10,10)').attr('class', 'bw-header');

        head.append('rect').attr('width', this.w - m).attr('height', 22);
        head.append('text').attr('x', midX).attr('y', 22 / 2).attr('dy', '0.35em')
            .attr('text-anchor', 'middle').text('NAME OF GRAPH');

        g.append('text').attr('x', midX).attr('y', 50).attr('text-anchor', 'middle').attr('class', 'bw-description')
            .text('This box and whiskers plot shows the distribution of values within regions and helps compare across regions. The bottom edge of each box represents the lower quartile within that region,');

        g.append('text').attr('x', midX).attr('y', 50).attr('dy', '1.25em').attr('text-anchor', 'middle').attr('class', 'bw-description')
            .text('the upper edge represents the upper quartile. The dividing line in the box represents the median value. The whiskers at the top and bottom show the minimum and maximum values in that region.');

        var ax = g.append('g').attr('class', 'bw-axis').attr('transform', 'translate(10, 85)');

        var chart_margin = 20;

        ax.append('text').attr('x', 0).attr('y',  (chart_height  - chart_margin )/ 2).text('Percentage scale')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90, 0, ' + (chart_height  - chart_margin ) / 2 +')')
            .attr('dy', '2em');

        ax.append('line').attr('x1', 50).attr('x2', 50).attr('y1',0).attr('y2', chart_height - chart_margin);

        var axis = [];
        for (var i = 100; i >= 0; i -=10){
            axis.push(i);
        }

        var axis_y = d3.scale.linear()
            .domain([100, 0])
            .range([0, chart_height - chart_margin - 10]);

        ax.selectAll('text.bw-axis').data(axis).enter()
            .append('text')
            .attr('x', 40)
            .attr('y', axis_y)
            .attr('dy', '1em')
            .attr('text-anchor', 'end')
            .text(String);

        g.append('g').attr('class', 'bw-chart-insert').attr('transform', 'translate(65, 65)');

        var source = g.append('g').attr('class', 'bw-source').attr('transform', 'translate(10, ' + (80 + chart_height) + ')');
        source.append('rect').attr('x',0).attr('y', 0).attr('width', this.w - m).attr('height', 24);
        //source.append('text').attr('x', midX).attr('y', 6).attr('dy', '0.35em').attr('text-anchor','middle').attr('class', 'source').text('Source: Test');

        this.chart_width = this.w - m - 55;
        this.chart_height = chart_height + 45;

    },

    load: function(json){
        this.init();
        json.data = json.indicators;
        // Adjust the names to fix the charts variable naming scheme
        for (var i =0; i < json.data.length; i++){
            var d = json.data[i];
            d.max = d.max_value;

            d.max.label = d.max.country;

            d.min = d.min_value;
            d.min.label = d.min.country;

            delete d.max_value;
            delete d.min_value;
            delete d.max.country;
            delete d.min.country;

        }
        this.json = json;

        // sort based on region first
        this.json.data = this.json.data.sort(this._name_sort);

        if (this.bw !== undefined){
            this.bw.line.constant = this.json.target;
            this.bw.update_data( this.json.data);
        } else {
            ctx = {
                width: this.chart_width,
                height: this.chart_height,

                bar : {
                    width: 40
                },
                line: {
                    constant : this.json.target
                },
                node : this.node + ' .bw-chart-insert',
                data: this.json.data
            };

            this.bw = new BoxWhisker(ctx);
        }

        if (this.json.indicator === undefined){
            this.n.select('.bw-header text').text('1.1: ' + COIA.indicator_label['1.1'] + ' and 1.2: ' +COIA.indicator_label['1.2'] );
        } else {
            this.n.select('.bw-header text').text(this.json.indicator +': ' + COIA.indicator_label[this.json.indicator]);
        }

        this.set_source();
    },


    _name_sort: function(a, b){
        if (a.name > b.name){
            return 1;
        }
        if (a.name < b.name){
            return -1;
        }
        return 0;
    },

    set_source: function(){
        this.n.selectAll('div').remove();
        var sources = this.json.sources;
        if (sources === undefined){
            return;
        }
        // add the sources output
        output = '';
        for ( i =0; i< sources.length; i ++){
            output += sources[i].name;
            if ( i + 1 < sources.length){
                output += ', ';
            }
        }

        insert_text(this.n.selectAll('.bw-source rect'), 'Source: ' + output, 'bw-source-text source');
    }
};