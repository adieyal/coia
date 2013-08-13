
var COIA = { 'graphs': [] , 'graph': 'target', 'data':{}};
/**
 * Initilize the SVG using json data to populate the recommendations,
 * regions and countries
 */
COIA.init = function(json){
    COIA.recommendations.data = json.recommendations;
    COIA.regions.data = json.regions;
    COIA.countries.data = json.countries.sort(name_sort);
    COIA.data = {};

    COIA.indicator_label = json.indicator_label;

    this.switch_page(1);
    this.insert_recommendations();
    this.insert_regions();

    var c_length = Math.ceil(this.countries.data.length / 4);

    var country_y = d3.scale.linear()
        .domain([0, c_length ])
        .range([0, 240]);


    var countries = dashboard.select('#page1  .countries').selectAll('text.country').data(this.countries.data)
        .enter().append('text')
            .attr('class', 'country')
            .text(function(d, i){ return d.name; })
            .attr('x', function(d, i){ return 228 * Math.floor(i / c_length) + 10; })
            .attr('y', function(d, i){ return country_y(i % c_length); });

    countries.on('click', function(d, i){
        console.log(d.name, i, 'Clicked');
        History.pushState({'country':d.name},'country','?country=' + d.name);
        //COIA.show_country(d);
    });

    COIA.icons.tick(dashboard.select('#hover-box .ok'));
    COIA.icons.cross(dashboard.select('#hover-box .fail'));
    COIA.icons.question(dashboard.select('#hover-box .nodata'));
};

COIA.history = function(){
    var rec = COIA.recommendations.current;
    var reg = COIA.regions.current;
    if (reg === undefined){
        return;
    }
    var graph = COIA.graph;
    History.pushState({"rec": rec,
                        "reg": reg,
                        "graph": graph,
                        "page": this.page},
                        "graph-page",
                        "?rec=" +rec +"&reg=" + reg + "&graph=" + graph + "&page=" + this.page );
};

COIA.height = function(x){
    var size = browser_size();

    var db = d3.select('#dashboard');

    db.attr('height', x * 1.5 ).attr('viewBox', "0 0 960 " + x);
    db.select('#background').transition().duration(this.transition_time).attr('height', x - 100);
};


COIA.get_json_url = function(){
    var rec = this.recommendations.current + 1;
    var region = this.regions.current + 1;

    if (this.graph === undefined || isNaN(rec) || isNaN(region)){
        return undefined;
    }

    if (region == 7){
        region = 'all';
    }

    return 'json/'  + this.graph + '/' + rec + '/' + region +'.json';
};
/**
 * Transition between pages
 */
COIA.switch_page = function(new_page){
    if (this.page == new_page){
        return;
    }

    console.log('switch page', this.page , '->' , new_page );
    dashboard.select('#page' + this.page)
        .transition()
        .duration(COIA.transition_time).style('opacity', 0)
        .delay(COIA.transition_time).style('visibility', 'hidden');

    this.page = new_page;
    dashboard.select('#page' + this.page)
        .transition()
        .style('visibility', '')
        .delay(COIA.transition_time / 2)
        .duration(COIA.transition_time).style('opacity', 1);

};
/**
 * Inser the recommendation Links into the page
 * for page 1, 2 and 3.
 */
COIA.insert_recommendations = function(){
    var button_x = d3.scale.linear()
        .domain([0, this.recommendations.data.length])
        .range([0, content_size - 3]);

    var class_func = function(d, i){ return 'button recommendation-' + i; };
    var x = function(d, i){ return button_x(i); };
    var text_x = function(d, i){ return button_x(i) + 108 / 2; };
    var name = function(d, i){ return d.title; };
    var click_func = function(d, i){
        if (COIA.graph == 'data'){
            COIA.graph = 'target';
        }
        COIA.recommendations.set(i);

        if (COIA.page === 1){
            COIA.regions.set(6);
            COIA.switch_page(2);
        }
        COIA.history();
    };

    for (var i = 1; i <= 2; i++){
        var buttons = dashboard.select('#page' + i + ' .recommendation').selectAll('g.button');
        if (buttons.empty()){
            buttons = buttons.data(this.recommendations.data)
                .enter().append('g')
                .attr('class',  class_func);

            buttons.append('rect')
                .attr('x', x)
                .attr('y', 0)
                .attr('width', 108)
                .attr('height', 23);

            buttons.append('text')
                .attr('x', text_x)
                .attr('y', 14.5)
                .attr('text-anchor','middle')
                .text(name);

            buttons.on('click', click_func);
        }
    }
};

COIA.show_dashboard = function(){
    COIA.height(650);
    COIA.switch_page(1);
    COIA.recommendations.set(undefined);
    if (COIA.graph == 'data'){
        COIA.graph = 'target';
    }
    COIA.regions.set(undefined);
};

/**
 * Insert the recommendation buttons into the current page
 * @return a d3 array of the buttons that were inserted.
 */
COIA.insert_regions = function(){
    // Insert regions into page one
    var button_x = d3.scale.linear()
        .domain([0, this.regions.data.length])
        .range([0, content_size]);
    var buttons = dashboard.select('#page1 .regions').selectAll('g.button').data(this.regions.data)
        .enter().append('g')
            .attr('class', 'button');

    buttons.append('rect')
        .attr('x', function(d, i) { return button_x(i); })
        .attr('y', 0)
        .attr('width', 121)
        .attr('height', 21);

    buttons.append('text')
        .attr('x', function(d, i){ return button_x(i) + 121 / 2;})
        .attr('y', 13.5)
        .attr('text-anchor','middle')
        .text(function(d, i){ return d.name;});


    var region_change = function(d, i){
        console.log(d.name, d.id, i, 'Clicked');
        if(!COIA.regions.set(d.id)){
            return;
        }

        COIA.switch_page(2);
        if (COIA.regions.current === undefined){
            COIA.regions.set(6); // default to global if no region is specified
        }
        if (COIA.recommendations.current === undefined){
            if (COIA.graph != "data"){
                COIA.recommendations.set(0); // default to first recommendation
            }
        }
        COIA.history();
    };

    buttons.on('click', region_change);

    // page two regions
    var regions = dashboard.select('#page2 .regions').selectAll('g.button');
    regions = regions.data(this.regions.data).enter()
                .append('g')
                .attr('class', function(d, i){ return 'button region_button region-' + d.id; })
                .attr('transform', function(d, i) { return 'translate(5, ' + ((i + 1) * 40 - 9) +')';});

    regions.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', 34)
        .attr('width', 84);

    regions.append('text')
        .attr('x', 42)
        .attr('y', function(d, i){
            var index = d.name.indexOf('(');
            if (index > 0){
                return 16;
            }
            return 20;
            })
        .attr('text-anchor', 'middle')
        .text( function(d,i){
            var index = d.name.indexOf('(');
            if (index > 0){
                return d.name.substring(0, index);
            }
            return d.name;
            });

    regions.append('text')
        .attr('x', 42)
        .attr('y', 26)
        .attr('text-anchor', 'middle')
        .text( function(d,i){
            var index = d.name.indexOf('(');
            if (index > 0){
                return d.name.substring(index);
            }
            return '';
            });

    regions.on('click', region_change);
};

COIA.get_country_region = function(country){
    for (var i = 0; i < this.regions.data.length; i++){
        var region = this.regions.data[i];
        if (region.countries === undefined){
            continue;
        }
        if (region.countries[country] === undefined){
            continue;
        }
        return region.id;
    }
    return -1;
};
COIA.show_country = function(country){
    this.height(1380);
    this.switch_page(3);
    dashboard.selectAll('div').remove();
    dashboard.select('.download_button').attr('country', country.name);

    d3.json('json/country/' + country.index + '.json', function(e){
        if (e === null || e === undefined){
            return;
        }
        if(!d3.selectAll('#page3').select('svg').empty()){
            return COIA.fill_country_svg(e, country);
        }

        d3.xml('svg/country.svg', 'image/svg+xml', function(xml){
            var ele = document.getElementById('page3');
            if (ele === null){
                throw Error('Unable to find element "page3"');
            }
            ele.appendChild(xml.documentElement);

            COIA.fill_country_svg(e, country);
        });
    });
};
COIA.fill_country_svg = function(json, country){

    var indicators = {};
    for (var i in json.indicators){
        var d = json.indicators[i];

        build_indicator((d.id +'').replace('.',''), (d.value + '').toUpperCase());
        indicators[d.id] = d.value;
    }
    var name = json.country_name.toLowerCase();
    var flag = json.country_flag;
    if (flag === null || flag === undefined) {
        flag = name.replace(' ', '_') + '.png';
    }

    d3.select('#country_name').text(name);
    d3.select('#country_flag').attr('xlink:href', 'icons/flags/' + flag.toLowerCase().replace('/static/flags/', ''));

    insert_text(d3.select('#summary'), 'Up to 4 lines of summary text will show here (maximum 600 characters) to be developed by the iERG', 'summary');
};


COIA.show_country_by_name = function(name){
    var search_name = name.toLowerCase().replace('ô', 'o'); // Some things seem to replace this character and throw off the name matching
    var countries = this.countries.data;
    for (var i = 0; i < countries.length; i ++){
        var country = countries[i];
        if (country.name.toLowerCase() == search_name){
            console.log(country);
            return this.show_country(country);
        }
    }
};

COIA.get_data_indicators = function(){
    if (this.data.raw === undefined){
        this.data.raw = [];
    }
    var results = 8;
    var handle_data = function(o){
        results --;
            for (var i =0; i < o.indicators.length; i++){
                var ind = o.indicators[i];

                var count = 0;
                for (var c = ind.countries.length - 1; c >= 0; c--){
                    var country = ind.countries[c];
                    if (country.rating != 'missing'){
                        ind.countries.splice(c, 1);
                    }
                }
            }

            COIA.data.raw = COIA.data.raw.concat(o.indicators);
            if (results === 0){
                COIA.data.raw = COIA.data.raw.sort(indicator_sort);
                COIA.build_data_chart();
            }
    };
    for (var i = 0; i < results; i++){
        var indicator = i + 1;
        var data_url = 'json/target/' + indicator +'/all.json';
        d3.json(data_url, handle_data);
    }
};

COIA.filter_data_indicators = function(){
    var region = this.regions.current;

    var raw = this.data.raw;
    if (raw === undefined){
        this.get_data_indicators();
        return undefined;
    }

    var output = {'indicator':'', 'children':[], 'countries':''};
    for (var i =0; i < raw.length; i++){
        var r = raw[i];
        var obj = {'countries':[], 'indicator': r.indicator, 'scores': r.scores};
        for (var c = 0; c < r.countries.length; c++){

            var country = r.countries[c];
            if (region === 6){
                obj.countries.push(country.name);
            } else {
                var c_region = COIA.get_country_region(country.name);
                if (c_region === region){
                    obj.countries.push(country.name);
                }
            }
        }
        if (obj.countries.length > 0){
            output.children.push(obj);
        }
    }
    return output;
};

COIA.build_data_chart = function(){
    var fill = ['#0093d5', '#f1b821', '#009983','#cf3d96', '#df7627', '#252', '#528'];
    var data = this.filter_data_indicators();
    if  (data === undefined){
        // The data is loading this function will be recalled once its loaded.
        return;
    }
    COIA.height(700);
    var size = 450;
    var pack = d3.layout.pack()
        .size([size, size])
        .value(function(d) { return d.countries.length; });

    var vis = dashboard.selectAll('#data-chart');

    var circles = vis.data([data]).selectAll('circle').data(pack.nodes);
    circles.enter().append("circle")
        .attr('class', function(d, i) { return d.countries.length === 0 ? 'parent circle-' + i : 'leaf circle-' + i; })
        .attr("r", function(d) { return d.r * 0.95; })
        .attr('fill', function(d){ return fill[parseInt(d.indicator.substring(0,1)-1, 0)  ]; })
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });

    circles
        .transition()
        .duration(COIA.transition_time)
        .attr('r', function(d) { return d.r * 0.95; })
        .attr('fill', function(d){ return fill[parseInt(d.indicator.substring(0,1) -1, 0)  ]; })
        .attr('cx', function(d) { return d.x; })
        .attr('cy', function(d) { return d.y; });
    circles.exit().remove();

    var hover = d3.select('#hover-box');

    var hover_func = function(d, i){
        if (d.children !== undefined){
            return;
        }


        hover.style('display', 'block');
        hover.transition().duration(500).attr('opacity', 1);
        var x = d.x + 36.47 +d.r;// + 36.47 +  d.r;
        var y = d.y + 180 - 25;// + 100 + d.r;
        hover.attr('transform','translate(' + x + ',' + y + ')'  );
        hover.select('.header').text(d.indicator  + ' : ' + COIA.indicator_label[d.indicator]);
        hover.select('.ok text').text(d.scores.achieved_target.countries);
        hover.select('.nodata text').text(d.scores.no_data.countries);
        hover.select('.fail text').text(d.scores.not_achieved_target.countries);
    };

    circles.on('mouseover', hover_func);
    circles.on('mouseout', function(d){
        hover.transition().duration(500).attr('opacity', 0).style('display', 'none');
    });

    var text = vis.data([data]).selectAll('text.indicator').data(pack.nodes);

    text.enter().append('text')
        .attr('x', function(d) { return d.x; })
        .attr('y', function(d) { return d.y; })
        .attr("text-anchor", "middle")
        .attr('class', 'indicator')
        .attr("dy", ".3em")
        .text(function(d) { return d.indicator; });

    text.transition()
        .duration(COIA.transition_time)
        .attr('x', function(d) { return d.x; })
        .attr('y', function(d) { return d.y; })
                .text(function(d) { if (d.countries.length === 0) { return ''; } return d.indicator; });

    text.exit().remove();


    var indicator_click = function(d,i){
        var indicator  = parseInt(d.indicator.substring(0,1), 10);
        COIA.graph = 'target';
        COIA.recommendations.set(indicator - 1);
        COIA.history();
    };

    circles.on('click', indicator_click);
    text.on('click', indicator_click);
    text.on('mouseover', hover_func);
    text.on('mouseout', function(d){
        hover.transition().duration(500).attr('opacity', 0).style('display', 'none');
    });
};


COIA.recommendations = {};
COIA.recommendations.set = function(index){
    if (this.current === index){
        return false;
    }
    this.current = index;
    console.log('set-recommendation', index);
    update_recommendation();
    return true;
};


COIA.recommendations.get = function(){
    if (this.current === undefined || this.data === undefined || this.data.length === 0){
        return undefined;
    }
    return this.data[this.current];
};

COIA.countries = {};

COIA.regions = { };
COIA.regions.set = function(index){
    if (this.current === index){
        return false;
    }
    this.current = index;
    console.log('set-region', index);
    update_regions();
    return true;
};

COIA.regions.get = function(){
    if (this.current === undefined || this.data === undefined || this.data.length === 0){
        return undefined;
    }
    for (var i =0; i < this.data.length; i++){
        if (this.data[i].id == this.current){
            return this.data[i];
        }
    }
    return undefined;
};


/**
 * COIA Icons
 * Insert cross, tick, question marks into SVG elements.
 */
COIA.icons = {};
COIA.icons.cross = function(node){
    var g = node.append('g').attr('class', 'coia-icon icon-cross');
    g.append('circle').attr('cx', 8).attr('cy', 8).attr('r', 7);
    g.append('line').attr('x1', 8).attr('x2', 8).attr('y1', 4).attr('y2', 12).attr('transform', 'rotate(-45, 8, 8)');
    g.append('line').attr('x1', 8).attr('x2', 8).attr('y1', 4).attr('y2', 12).attr('transform', 'rotate(45, 8, 8)');
    g.append('title').text('Did not achieve their target.');
    return g;
};

COIA.icons.tick = function(node){
    var g = node.append('g').attr('class', 'coia-icon icon-tick');
    g.append('circle').attr('cx', 8).attr('cy', 8).attr('r', 7);
    g.append('line').attr('x1', 9).attr('x2', 9).attr('y1', 4.5).attr('y2', 11).attr('transform', 'rotate(55, 8, 8)');
    g.append('line').attr('x1', 5).attr('x2', 5).attr('y1', 5.5).attr('y2', 10).attr('transform', 'rotate(-35, 8, 8)');
    g.append('title').text('Achieved their target.');
    return g;
};

COIA.icons.question = function(node){
    var g = node.append('g').attr('class', 'coia-icon icon-question');
    g.append('circle').attr('cx', 8).attr('cy', 8).attr('r', 7);
    g.append('path').attr('d', 'm 8.5,9.5 h -2.094 v -0.209 c 0,-0.357 0.039,-0.646 0.121,-0.865 0.08,-0.227 0.201,-0.428 0.357,-0.609 0.162,-0.186 0.521,-0.508 1.078,-0.973 0.299,-0.242 0.447,-0.463 0.447,-0.664 0,-0.203 -0.062,-0.359 -0.182,-0.469 -0.117,-0.115 -0.295,-0.172 -0.541,-0.172 -0.26,0 -0.475,0.086 -0.648,0.26 -0.168,0.172 -0.277,0.473 -0.326,0.902 l -2.137,-0.266 c 0.074,-0.785 0.359,-1.416 0.854,-1.895 0.5,-0.482 1.266,-0.723 2.293,-0.723 0.799,0 1.445,0.17 1.939,0.504 0.666,0.453 1.002,1.055 1.002,1.807 0,0.311 -0.086,0.613 -0.26,0.904 -0.172,0.289 -0.525,0.643 -1.055,1.062 -0.373,0.293 -0.607,0.531 -0.707,0.711 -0.092,0.177 -0.141,0.407 -0.141,0.695 z m -2.089,0.953 h 2.164 v 1.795 h -2.164 v -1.795 z');
    g.append('title').text('No data available.');
    return g;
};


COIA.page = 1; // starting page
COIA.transition_time = 500; // Time to transition between pages

var content_size = 895; // width of the page


browser_size = function(){
    var theWidth, theHeight;
    // Window dimensions:
    if (window.innerWidth) {
    theWidth=window.innerWidth;
    }
    else if (document.documentElement && document.documentElement.clientWidth) {
    theWidth=document.documentElement.clientWidth;
    }
    else if (document.body) {
    theWidth=document.body.clientWidth;
    }
    if (window.innerHeight) {
    theHeight=window.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
    theHeight=document.documentElement.clientHeight;
    }
    else if (document.body) {
    theHeight=document.body.clientHeight;
    }

    return {'width': theWidth, 'height':theHeight};
};


/**
 * Use a foreignObject to insert html text into the svg element
 * at the location an size of the node element.
 */
var insert_text = function(node, text, classes, id){
    var n = node.node();
    if (n === null){
        throw Error('Unable to access the node to insert text');
    }
    var bb = n.getBBox();

    var parent = n.parentNode;
    if (parent === undefined || parent === null){
        throw Error('Unable to find parent node for element ' + node.node());
    }

    parent = d3.select(parent);

    var fo = parent.append("foreignObject")
        .attr('x', bb.x)
        .attr('y', bb.y)
        .attr("width", bb.width)
        .attr("height", bb.height)
        .append("xhtml:div")
            .attr('width', bb.width)
            .attr('height', bb.height)
            .html(text);

    if (id !== undefined){
        fo.attr('id', id);
    }

    if (classes !== undefined){
        fo.attr('class', classes);
    }
};

function name_sort(a, b){
    if (a.name < b.name){
        return -1;
    }
    if (a.name > b.name){
        return 1;
    }
    return 0;
}

function indicator_sort(a, b){
    if (a.indicator < b.indicator){
        return -1;
    }
    if (a.indicator > b.indicator){
        return 1;
    }
    return 0;
}