
SummaryWidget = function(node_id){
    this.node = node_id;
};
SummaryWidget.prototype = {

    init: function(){
        this.n = d3.selectAll(this.node);
        if (!this.n.selectAll('svg').empty()){
            return;
        }
        var g;
        var w = 194;
        var h = 200;
        this.n = this.n.append('svg').attr('class', 'summary-widget');

        var header = this.n.append('g').attr('class', 'summary-header');

        header.append('rect')
            .attr('x', 0).attr('y', 0).attr('width', w).attr('height', 22);

        header.append('text')
            .attr('x', w / 2).attr('y', 22 / 2).attr('dy', '0.35em').attr('height', 22).attr('text-anchor', 'middle')
            .attr('class', 'summary-indicator').text('Indicator');

        var graph = this.n.append('g').attr('class', 'summary-graph').attr('transform', 'translate(0, 25)');

        graph.append('rect')
            .attr('x', 0.5)
            .attr('y', 0)
            .attr('width', w -1)
            .attr('height', h)
            .attr('class', 'summary-border');

        var graph_head = graph.append('g').attr('class', 'summary-graph-header').attr('transform', 'translate(4,4)');

        graph_head.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', w - 8)
            .attr('height', 22);

        graph_head.append('text')
            .attr('x', (w - 8) / 2)
            .attr('y', 22 / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('class', 'summary-graph-name')
            .text('Aggregate target');

        var background = graph.append('g').attr('class', 'summary-background').attr('transform', 'translate(4, 29)');

        var r = 44;
        var midX = (w - 8) / 2;
        var midY = 150 / 2;
        var line_count = 30;

        background.append('rect').attr('x',0).attr('y', 0).attr('width', w - 8).attr('height', 140).attr('class', 'summary-background');
        background.append('circle').attr('cx', midX).attr('cy', midY).attr('r', r).attr('class', 'summary-background');


        for (var i =0; i< line_count; i++){
            background.append('line').attr('x1', midX).attr('x2', midX).attr('y1', midY - r).attr('y2', midY + r).attr('class', 'summary-background')
                    .attr('transform', 'rotate(' + (180 / line_count) * i + ', ' +midX + ', ' + midY + ')');
        }
        background.append('circle').attr('cx', midX ).attr('cy', midY).attr('r', r - 3).attr('fill', '#fff');

        var no_data = background.append('g').attr('class', 'summary-no-data').attr('transform', 'translate(10,10)');
        no_data.append('rect').attr('x', 0).attr('y', 0).attr('width', 65).attr('height', 15).attr('class', 'summary-background-data');
        g = no_data.append('g').attr('transform', 'translate(52, 1.5)scale(0.75)');
        COIA.icons.question(g);

        text = no_data.append('text').attr('y', 0);
        text.append('tspan').attr('dy', '1.2em').attr('x', 12).text('Countries have');
        text.append('tspan').attr('dy', '1.25em').attr('x', 12).text('no data available.');
        text.append('tspan').attr('x', 6).attr('y', 0).attr('dy', '1.25em').attr('class', 'summary-country-count nodata-countries').attr('text-anchor', 'middle').text('28');
        no_data.append('text').attr('y', 27).attr('class', 'summary-country-percent nodata-percent').text('25%');

        var fail_data = background.append('g').attr('class', 'summary-no-data').attr('transform', 'translate(' + (w - 8 - 65 - 10) + ',10)');
        fail_data.append('rect').attr('x', 0).attr('y', 0).attr('width', 65).attr('height', 15).attr('class', 'summary-background-data');

        text = fail_data.append('text').attr('y', 0);
        text.append('tspan').attr('dy', '1.2em').attr('x', 12).text('Countries did not');
        text.append('tspan').attr('dy', '1.25em').attr('x', 12).text('achieve their target.');
        text.append('tspan').attr('x', 6).attr('y', 8).attr('dy', '0.35em').attr('class', 'summary-country-count faildata-countries').attr('text-anchor', 'middle').text('28');

        fail_data.append('text').attr('y', 27).attr('x', 65).attr('text-anchor', 'end').attr('class', 'summary-country-percent faildata-percent').text('25%');
        g = fail_data.append('g').attr('transform', 'translate(52, 1.5)scale(0.75)');
        COIA.icons.cross(g);

        var ok_data = background.append('g').attr('class', 'summary-no-data').attr('transform', 'translate(10,' + (150 - 10 - 15) +')');
        ok_data.append('rect').attr('x', 0).attr('y', 0).attr('width', 65).attr('height', 15).attr('class', 'summary-background-data');

        text = ok_data.append('text').attr('y', 0);
        text.append('tspan').attr('dy', '1.2em').attr('x', 12).text('Countries achieved');
        text.append('tspan').attr('dy', '1.25em').attr('x', 12).text('their target.');
        text.append('tspan').attr('x', 6).attr('y', 8).attr('dy', '0.35em').attr('class', 'summary-country-count okdata-countries').attr('text-anchor', 'middle').text('28');

        ok_data.append('text').attr('y', -4).attr('class', 'summary-country-percent okdata-percent').text('25%');
        g = ok_data.append('g').attr('transform', 'translate(52, 1.5)scale(0.75)');
        COIA.icons.tick(g);

        graph.append('g').attr('class', 'summary-chart-inner').attr('transform', 'translate(' + (midX - 26) + ',' + (midY) +')');
        graph.append('g').attr('class', 'summary-chart-outter').attr('transform', 'translate(' + (midX - 36) + ',' + (midY - 10) +')');

        var target = graph.append('g').attr('class', 'summary-target').attr('transform', 'translate(' + midX +',' + (midY + 22) +')' );
        target.append('text').attr('x', 4).attr('y', 3).attr('text-anchor', 'middle').text('Target:');
        target.append('text').attr('x', 4).attr('y', 14).attr('text-anchor', 'middle').text('75%').attr('class','target');

        var source = graph.append('g').attr('class', 'summary-source').attr('transform', 'translate(4, 175)');
        source.append('rect').attr('x',0).attr('y', 0).attr('width', w - 8).attr('height', 17).attr('class', 'summary-source');
        //text = source.append('text').attr('x', midX).attr('y', 6).attr('dy', '0.35em').attr('text-anchor','middle').attr('class', 'source').text('Source: Test');
    },

    load: function(json){
        this.init();

        if (json === null){
            return;
        }

        this.json = json;

        var data = [];

        data.push({"value": this.json.scores.not_achieved_target.value});
        data.push({"value": this.json.scores.achieved_target.value});
        data.push({"value": this.json.scores.no_data.value});

        if (this.innerPie !== undefined){
            this.innerPie.update_data(data);
            this.outterPie.update_data(data);
        } else {
            ctx = {
                width: 62,
                height: 62,

                arc: {
                    width : 13
                },
                node : this.node + ' .summary-chart-inner',
                data: data,
                duration: 1500,
                colors: ['#ED1C24', '#8DC63F', '#FFDE17']
            };

            this.innerPie = new SegmentPieGraph(ctx);

            ctx = {
                width: 83,
                height: 83,

                arc: {
                    width : 8
                },
                node : this.node + ' .summary-chart-outter',
                data: data,
                duration: 1000,
                colors: ['#ED1C24', '#8DC63F', '#FFDE17']
            };
            this.outterPie = new SegmentPieGraph(ctx);
        }


        this.n.select('.summary-indicator').text(this.json.indicator +': ' + COIA.indicator_label[this.json.indicator]);

        var target = this.json.target;
        if (target != 'Y'){
            target = target + '%';
        }
        this.n.select('.target').text(target);

        this.n.select('.okdata-percent').text(this.json.scores.achieved_target.value + '%');
        this.n.select('.okdata-countries').text(this.json.scores.achieved_target.countries);

        this.n.select('.nodata-percent').text(this.json.scores.no_data.value + '%');
        this.n.select('.nodata-countries').text(this.json.scores.no_data.countries);

        this.n.select('.faildata-percent').text(this.json.scores.not_achieved_target.value + '%');
        this.n.select('.faildata-countries').text(this.json.scores.not_achieved_target.countries);

        this.set_source();
    },

    set_source: function(){
        this.n.selectAll('.summary-widget-text').remove();
        // add the sources output
        output = '';
        for ( i =0; i< this.json.sources.length; i ++){
            output += this.json.sources[i].name;
            if ( i + 1 < this.json.sources.length){
                output += ', ';
            }
        }
        if (output !== ''){
            insert_text(this.n.selectAll('rect.summary-source'), 'Source: ' + output, 'summary-widget-text source');
        }
    }
};