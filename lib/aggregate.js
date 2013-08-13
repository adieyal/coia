AggregateWidget = function(node_id){
    this.node = node_id;
    this._svg = 'svg/aggregate.performance.data.svg';
};
AggregateWidget.prototype = {
    load: function(json){

        this.json = json;
        if (this.load_done === true){
            return this.svg_complete();
        }
        this.load_done = true;

        var me = this;
        d3.xml(this._svg, 'image/svg+xml', function(xml){

            var ele = document.getElementById(me.node);
            if (ele === null){
                throw Error('Unable to find element "' + me.node + "'");
            }
            ele.appendChild(xml.documentElement);

            me.svg_complete();
        });
    },
    svg_complete: function(){
        var node = '#' + this.node + "";

        this.n = d3.selectAll(node);

        value = this.json.score;
        var data = [{'value':value}];


        var background  =[];
        for (i = 0; i < 10; i ++){
            background.push({"value": 10});
        }

        this.n.selectAll(' .remove').remove();

        var w = 135;
        if (this.innerPie !== undefined){
            this.innerPie.update_data(data);
        } else {
            ctx = {
                width: w,
                height: w,

                arc: {
                    width : 10,
                    start_angle: 0.3,
                    margin: 5
                },

                total: 100,
                node :  '#' + this.node + ' .background_chart',
                data: background,
                colors: function(d,i) { return '#BCBEC0'; }
            };
            new SegmentPieGraph(ctx);

            ctx = {
                width: w,
                height: w,

                arc: {
                    width : 10,
                    start_angle: -0.31,
                    margin: 0
                },
                duration: 1000,
                total: 100,
                node : '#' + this.node + ' .segment_chart',
                data: data,
                colors: function(d,i) { return '#ED1C24'; }
            };
            console.log(data);
            this.innerPie = new SegmentPieGraph(ctx);

        }
        var c = 0;
        for(i =0; i< data.length; i++){
            c += data[i].countries;
        }

        this.n.selectAll(".score_value").text(this.json.score + "%");
        this.n.selectAll(".header").text(this.json.region);

        // add the sources output
        output = '';
        for ( i =0; i< this.json.sources.length; i ++){
            output += this.json.sources[i].name;
            if ( i + 1 < this.json.sources.length){
                output += ', ';
            }
        }
        this.n.selectAll('.source').text(output);


    }
};