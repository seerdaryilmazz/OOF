import React from 'react';
import d3 from 'd3';
import ReactDom from 'react-dom';
import {d3Funcs} from './d3Funcs';
import uuid from 'uuid';


export class Graph extends React.Component{
    constructor(props){
        super(props);
        this.state = {width:478,height:251};
        this.state.id = this.props.id?this.props.id: uuid.v4();
        this.d3Funcs = new d3Funcs(this.props);
        this.force = this.d3Funcs.createForce();

    };


    componentDidMount() {
        this.d3Graph = d3.select(ReactDom.findDOMNode(this._input));

        this.force.on('tick', () => {
            // after force calculation starts, call updateGraph
            // which uses d3 to manipulate the attributes,
            // and React doesn't have to go through lifecycle on each tick
            this.d3Graph.call(this.d3Funcs.updateGraph);
        });
    }


    shouldComponentUpdate(nextProps) {
        this.d3Graph = d3.select(ReactDom.findDOMNode(this._input));

        var d3Nodes = this.d3Graph.selectAll('.node')
            .data(nextProps.nodes, (node) => node.key);
        d3Nodes.enter().append('g').call(this.d3Funcs.enterNode);
        d3Nodes.exit().remove();
        d3Nodes.call(this.d3Funcs.updateNode);

        var d3Links = this.d3Graph.selectAll('.link')
            .data(nextProps.links, (link) => link.key);
        d3Links.enter().insert('line', '.node').call(this.d3Funcs.enterLink);
        d3Links.exit().remove();
        d3Links.call(this.d3Funcs.updateLink);

        // we should actually clone the nodes and links
        // since we're not supposed to directly mutate
        // props passed in from parent, and d3's force function
        // mutates the nodes and links array directly
        // we're bypassing that here for sake of brevity in example

        this.force.nodes(nextProps.nodes).links(nextProps.links);
        this.force.start();

        return false;
    }

    render() {
        return (
            <svg width={960} height={500}>
                <g id={this.state.id} ref={(c) => this._input = c} />
            </svg>
        );
    }
}
