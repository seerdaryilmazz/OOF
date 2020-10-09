import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import d3 from 'd3';


export class Circle extends React.Component{
    constructor(props){
        super(props);


    }
    componentDidMount(){
        var el =  ReactDom.findDOMNode(this);
        console.log("test-->",el);
        var svg = d3.select(el).append('svg')
            .attr('class', 'd3')
            .attr('width', '100%')
            .attr('height', '300px');

        svg.append('g')
            .attr('class', 'node');
        console.log(svg);
        var scales = this._scales(el, this.props.domain);
        this._drawPoints(el, scales, this.props.data);

    }


    destroy(el) {
        // Any clean-up would go here
        // in this example there is nothing to do
    };
    _scales = function(el, domain) {
        if (!domain) {
            return null;
        }

        var width = el.offsetWidth;
        var height = el.offsetHeight;

        var x = d3.scale.linear()
            .range([0, width])
            .domain(domain.x);

        var y = d3.scale.linear()
            .range([height, 0])
            .domain(domain.y);

        var z = d3.scale.linear()
            .range([5, 20])
            .domain([1, 10]);

        return {x: x, y: y, z: z};
    };
    _drawPoints (el, scales, data) {
        var g = d3.select(el).selectAll('.node');

        var point = g.selectAll('.ring')
            .data(data, function(d) { return d.id; });

        // ENTER
        var elemEnter= point.enter();
        var circle= elemEnter.append('circle')
            .attr('class', 'ring')
            .attr("transform", function(d){return "translate("+d.x+",80)"});


        // ENTER & UPDATE
        circle.attr('cx', function(d) { return scales.x(d.x); })
            .attr('cy', function(d) { return scales.y(d.y); })
            .attr('r', function(d) { return scales.z(d.z); })
            .attr('fill','#68BDF6');

        //ADD Text
        elemEnter.append('text').attr('text-anchor', 'middle')
            .attr('pointer-events','none')
            .attr('y','0')
            .attr('font-size','10px')
            .attr('fill','black')
            .text(function(data){return data.label})
        // EXIT
        point.exit()
            .remove();
    };

    componentDidUpdate() {
        var el = ReactDom.findDOMNode(this);
        var scales = this._scales(el, this.props.domain);
        this._drawPoints(el, scales, this.props.data);
    }

    getChartState() {
        return {
            data: this.props.data,
            domain: this.props.domain
        };
    }

    componentWillUnmount() {
        var el = ReactDom.findDOMNode(this);
        this.destroy(el);
    }
    render(){
        return (
            <div className="Circle"></div>
        );
    }
}

Circle.propTypes = { data:PropTypes.array,domain:  PropTypes.object };