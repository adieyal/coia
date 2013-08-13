
AbsoluteWidget = function(node_id){
    this.node = node_id;
    this.h = 332;
    this.w = 787;
};

AbsoluteWidget.prototype = {

    init: function(){
        this.n = d3.select(this.node);

        var chart = this.n.selectAll('g.aw-chart');
        if (!chart.empty()){
            return;
        }

        var margin = 10;
        var chart_height = this.h - 100;
        var m = 2 * margin;
        var midX = (this.w - margin) / 2;

        var g = this.n.append('g').attr('class', 'aw-chart');
        g.append('rect').attr('width', this.w).attr('height', this.h + 20).attr('class', 'aw-border');

        var head = this.n.append('g').attr('transform', 'translate(10,10)').attr('class', 'aw-indicators');

        head.append('rect').attr('width', this.w - m).attr('height', 22);

        var ax = g.append('g').attr('class', 'aw-axis').attr('transform', 'translate(10, 40)');

        var chart_margin = 20;

        ax.append('text').attr('x', 0).attr('y',  (chart_height  - chart_margin )/ 2).text('Percentage scale')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90, 0, ' + (chart_height  - chart_margin ) / 2 +')')
            .attr('dy', '2em');

        ax.append('line').attr('x1', 50).attr('x2', 50).attr('y1',0).attr('y2', chart_height - chart_margin).attr('class', 'aw-line');

        var axis = [];
        for (var i = 100; i >= 0; i -=10){
            axis.push(i);
        }

        var axis_y = d3.scale.linear()
            .domain([100, 0])
            .range([0, chart_height - chart_margin - 10]);

        ax.selectAll('text.aw-axis').data(axis).enter()
            .append('text')
            .attr('x', 40)
            .attr('y', axis_y)
            .attr('dy', '1em')
            .attr('text-anchor', 'end')
            .text(String);

        g.append('g').attr('class', 'aw-chart-insert').attr('transform', 'translate(65, 65)');

        var source = g.append('g').attr('class', 'aw-source').attr('transform', 'translate(10, ' + (100 + chart_height) + ')');
        source.append('rect').attr('x',0).attr('y', 0).attr('width', this.w - m).attr('height', 12);
        source.append('text').attr('x', midX).attr('y', 6).attr('dy', '0.35em').attr('text-anchor','middle').attr('class', 'source').text('Source: Test');

        this.chart_width = this.w - m - 55;
        this.chart_height = chart_height + 30;

    },

    load: function(json){
        console.log(json);
        this.init();
        this.data = json;

        if (json.length === 1){
            this.n.select('.aw-indicators').style('display', 'none');
        }else {
            this.n.select('.aw-indicators').style('display', 'block');
            this.build_indicators(this.data);
        }

        this.json = json[0];
        var data = this.json.countries;


        // Adjust the names to fix the charts variable naming scheme
        for (var i =0; i < data.length; i++){
            var d = data[i];
            d.series = d.name;
            d.value = d.score;
        }

        // sort based on region first
        data = data.sort(this._series_sort);

        if (this.bg !== undefined){
            this.bg.line.constant = this.json.target;
            this.bg.update_data( data);
        } else {
            var ctx = {
                width: this.chart_width,
                height: this.chart_height,
                chart_width: 1,
                chart_height:0.7,
                bar: {
                        'margin' : 5, // pixels between bars
                        'width': 25, // width of bars
                        'rounding': 0, // pixels for rounding effect
                        'max': 100
                    },
                line: {
                    constant : this.json.target
                },
                node : this.node + ' .aw-chart-insert',
                data: data
            };

            this.bg = new RoundedBarGraph(ctx);
        }

        this.set_source();
    },


    _series_sort: function(a, b){
        if (a.series > b.series){
            return 1;
        }
        if (a.series < b.series){
            return -1;
        }
        return 0;
    },

    set_source: function(){
        // add the sources output
        output = '';
        for ( i =0; i< this.json.sources.length; i ++){
            output += this.json.sources[i].name;
            if ( i + 1 < this.json.sources.length){
                output += ', ';
            }
        }
        this.n.selectAll('.source').text('Source: ' + output);
    }
};