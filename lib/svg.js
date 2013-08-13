var DEBUG = true;

AggregateWidget = function(node_id){
    this.node = node_id;
    this._svg = 'svg/aggregate.performance.data.svg?5555';
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
        var data = [];
        for (var i =0; i < 10; i ++){
            if (value > 10){
                data.push({"value": 10});
            }else {
                data.push({"value": value});
            }
            value -= 10;
            if (value < 0){
                break;
            }
        }

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
                    start_angle: -0.3,
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
                    start_angle: -0.3,
                    margin: 5
                },

                total: 100,
                node : '#' + this.node + ' .segment_chart',
                data: data,
                colors: function(d,i) { return '#ED1C24'; }
            };
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

BoxWhiskerWidgetB = function(node_id){
    this._bb = new BoxWhiskerWidget(node_id);
    this._bb._svg ='svg/box.and.whisker.2.svg?212';
    this._bb.h = 280;
    this._bb.w = 700;
};

BoxWhiskerWidgetB.prototype = {
    load: function(data){
        this._bb.load(data);
    }
};

ActualWidget = function(node_id){
    this.node = node_id;
    this._svg = 'svg/actual.performance.svg?34343';
};
ActualWidget.prototype = {
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
            this.n.selectAll(' .remove').remove();

    if (this.roundbar !== undefined){
        this.roundbar.line.constant = this.json.target;
        this.roundbar.update_data(this.json.data);
    } else {
        ctx = {
            width: 700,
            height: 595,

            chart_width: 1,

            bar : {
                width: 25,
                rounding: 0
            },
            line: {
                constant : this.json.target
            },
            node : node + ' .bar_chart .chart',
            data: this.json.data
        };

        this.roundbar = new RoundedBarGraph(ctx);
    }



    this.n.select('.header').text(this.json.region);
    this.n.select('.country_count').text(this.json.data.length);

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