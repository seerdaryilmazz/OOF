import React from 'react';
import d3 from 'd3';
import ReactDOM from 'react-dom';
import {d3Funcs} from './d3Funcs';

export class NodeChart extends React.Component{
    constructor(props){
        super(props);

        this.state = {width:"478",height:"251"}
        this.d3Funcs = new d3Funcs(this.props);
        this.force = this.d3Funcs.createForce();

    }
    componentDidMount(){

        this.d3Graph = d3.select(ReactDOM.findDOMNode(this.nodeChart));

        this.force.on('tick', () => {
            // after force calculation starts, call updateGraph
            // which uses d3 to manipulate the attributes,
            // and React doesn't have to go through lifecycle on each tick
            this.d3Graph.call(this.d3Funcs.updateGraph);
        });

    }

    shouldComponentUpdate(nextProps) {
        this.d3Graph = d3.select(ReactDOM.findDOMNode(this.nodeChart));


        var d3Nodes = this.d3Graph.selectAll('.node')
            .data(nextProps.nodes, (node) => node.key);
        d3Nodes.enter().append('g').call(this.d3Funcs.enterNode);

        d3Nodes.exit().remove();
        d3Nodes.call(this.d3Funcs.updateNode);
        if(this.props.onclick){

        d3Nodes.call(this.d3Funcs.addEvent);
        }

        var d3Links = this.d3Graph.selectAll('.link')
            .data(nextProps.links, (link) => link.key);
        d3Links.enter().insert('line', '.node').call(this.d3Funcs.enterLink);
        d3Links.exit().remove();
        d3Links.call(this.d3Funcs.updateLink);

        this.force.nodes(nextProps.nodes).links(nextProps.links);
        this.force.start();
      //  d3Nodes.call(this.d3Funcs.responsivefy);

        return false;
    }
    render(){

        return (<svg width={this.state.width} height={this.state.height}>
                <g width={this.state.width} height={this.state.height} ref= {(c) => this.nodeChart = c}/>
            </svg>);

    }
}