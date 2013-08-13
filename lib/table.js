
TableWidget = function(node_id){
    this.node = node_id;
    this.w  = 787;
    this.h = 332;

    this.header_width = this.w * 0.95;
    this.header_height = this.h * 0.43;
    this.row_height = 22;

    this.duration = 1000;
};

TableWidget.prototype = {
    init: function(){
        this.n = d3.select(this.node);

        var chart = this.n.selectAll('g.tw-chart');
        if (!chart.empty()){
            return;
        }

        var margin = 10;
        var m = 2 * margin;
        var midX = this.w / 2;

        var g = this.n.append('g').attr('class', 'tw-chart');
        g.append('text').attr('x', 5).attr('y', 20)
            .attr('width', 100).attr('height', 20).attr('class', 'tw-title').text('Africa');

        g.append('rect').attr('width', this.w).attr('height', this.h).attr('class', 'tw-border');

        var table = g.append('g').attr('class', 'tw-table').attr('transform', 'translate(35, 30)');
        g.append('g').attr('class', 'tw-overlay').attr('transform', 'translate(35, 30)');

        var source = g.append('g').attr('class', 'tw-source').attr('transform', 'translate(10, ' + (80 + 150) + ')');
        source.append('rect').attr('x',0).attr('y', 0).attr('width', this.w).attr('height', 17);
        //source.append('text').attr('x', midX).attr('y', 6).attr('dy', '0.35em').attr('text-anchor','middle').attr('class', 'source').text('Source: Test');

        table.append('rect').attr('width', this.header_width).attr('height', this.header_height)
                .attr('class','tw-background');
        table.append('line').attr('x1', 0).attr('x2', this.header_width).attr('y1', 0).attr('y2',0)
            .attr('class','tw-background');
        table.append('line').attr('x1', this.header_width).attr('x2', this.header_width).attr('y1', 0).attr('y2', this.header_height)
            .attr('class','tw-background');
    },

    load: function(json){
        if (json === null){ return; }
        this.init();

        var me = this;
        this.data = json;
        this.json = json.indicators[0];
        this.indicators = json.indicators;

        this.n = this.n.select('.tw-chart');

        var overlay = this.n.select('.tw-overlay');
        var table = this.n.select('.tw-table');


        this.chart_height = this.header_height + this.row_height * this.indicators.length;
        var data_x = d3.scale.linear()
            .domain([0, this.json.countries.length])
            .range([0, this.header_width]);

        var header = this.n.selectAll('.tw-overlay').selectAll('line.tw-header-line').data(this.json.countries);
        header.enter().append('line')
            .attr('x1', function(d, i) { return data_x(i); })
            .attr('y1', 0)
            .attr('x2', function(d, i) { return data_x(i); })
            .attr('class', 'tw-header-line')
            .attr('y2', this.chart_height);

        header.transition().duration(this.duration)
            .ease("bounce")
            .attr('x1', function(d, i) { return data_x(i); })
            .attr('x2', function(d, i) { return data_x(i); })
            .attr('y2', this.chart_height);

        header.exit().remove();


        var text = table.selectAll('text.tw-header-text')
                    .data(this.json.countries);

        text.enter().append('text')
            .attr('transform' , function(d,i) {
                return 'translate(' + ((data_x(i) + data_x(i + 1)) / 2) +
                                ',' + me.header_height + ')rotate(-90)';})
            .attr('dy', '0.5em')
            .attr('dx', '1em')
            .attr('class', 'tw-header-text')
            .text(function(d, i) { return d.name;});

        text.transition().duration(this.duration)
            .attr("transform", function(d,i) {
                return 'translate(' + ((data_x(i) + data_x(i + 1)) / 2) +
                                ',' + me.header_height + ')rotate(-90)';})
            .text(function(d, i) { return d.name;});

        text.exit().remove();

        table.selectAll('.tw-header-text').on('click', function(d, i){
            COIA.show_country_by_name(d.name);
        });

        var rows = table.selectAll('.tw-row').data(this.indicators);
        rows.enter().append('rect')
            .attr('class', 'tw-row' )
            .attr('y', function(d, i){ return me.header_height + i * me.row_height; })
            .attr('x', -30)
            .attr('height', this.row_height)
            .attr('width', this.header_width + 30);

        var titles = overlay.selectAll('.tw-row-text').data(this.indicators);
        titles.enter().append('text')
            .attr('class', 'tw-row-text')
            .attr('text-anchor', 'end')
            .attr('x', -5)
            .attr('y', function(d, i){ return me.header_height + i *  me.row_height + me.row_height / 2;})
            .attr('dy', '0.35em')
            .text(function(d, i){ return d.indicator; });

        titles.transition().duration(this.duration).text( function(d, i){ return d.indicator; });

        titles.exit().transition().duration(this.duration).style('opacity', 0).remove();
        rows.exit().transition().duration(this.duration).style('opacity', 0).remove();



        var row_height = function(d ,i){ return 'translate(0, ' + (me.header_height + i * me.row_height) + ')'; };
        g = table.selectAll('g.tw-icon-row').data(this.indicators);
        g.enter().append('g')
            .attr('class', function(d, i){  return 'tw-icon-row tw-icon-row-' + i;})
            .attr('transform', row_height );
        g.exit().transition().duration(this.duration).style('opacity', 0).remove();

        var icon_x = function(d, i){ return 'translate(' +  (data_x(i + 0.5) - 8) + ',3)';};
        var set_icons = function(d, i){ me.icon(this, 'rating' );  };

        for (var i =0; i < this.indicators.length; i++){
            var row = table.select('.tw-icon-row-' + i );
            row.selectAll('.coia-icon').remove();
            var icons = row.selectAll('.tw-icon').data(this.indicators[i].countries);

            icons.enter().append('g')
                .attr('class','tw-icon');

            icons.transition().duration(this.duration)
                .style('display', 'block')
                .attr('transform', icon_x)
                .call(set_icons);

            icons.exit().transition().duration(this.duration).style('display', 'none');
        }

        this.n.select('.tw-border').transition().duration(this.duration).attr('height', this.chart_height + 55);
        this.n.select('.tw-source').transition().duration(this.duration).attr('transform', 'translate(0, ' + (this.chart_height + 65) + ')');

        // add the sources output
        output = '';
        for (i =0; i < this.data.indicators.length; i++){
            var ind = this.data.indicators[i];
            for (j = 0; j < ind.sources.length; j ++){
                output += ind.sources[j].name + ',';
            }
        }


        this.n.selectAll('foreignobject').remove();
        if (output === ''){
            this.n.selectAll('.tw-source').style('display','none');
        }else {
            output = output.substring(0, output.length - 1);
            this.n.selectAll('.tw-source').style('display', 'block');
            insert_text(this.n.selectAll('.tw-source rect'), output, 'tw-source-text source');
        }



        this.n.selectAll('.tw-title').text(this.data.title);
    },

    icon : function(o, name){
            o.each(function (d, i){
                var value = d[name];
                if (value === undefined){
                    return;
                }
                var n = d3.select(this);
                if (value == 'ok' || value == 'tick'){
                    COIA.icons.tick(n);
                }else if (value == 'cross' || value == 'fail'){
                    COIA.icons.cross(n);
                } else if (value == 'missing' || value == 'question'){
                    COIA.icons.question(n);
                }
            });

        }
};