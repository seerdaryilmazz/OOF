import React from 'react';
import { generate_data } from './generate_data';
import { GraphApp } from './GraphApp';




export class GraphTemplate extends React.Component{
    constructor(props){
        super(props);
        this.state = { nodesFrom: [],
            linksFrom: [],
            nodesTo:[],
            linksTo:[],
            width:{},
            height:{},
            data: []
        }
        this.generate_data = new generate_data(props);
    };


    componentDidMount() {
        this.updateData(this.props.data);
    }
    updateData(data) {
        var graphNodes = [];
        var graphLinks = [];
        if(data) {
            if (data.nodes) {
                graphNodes = data.nodes;
            }

            if (data.relations) {
                graphLinks = data.relations;
            }
        }
        var myData = this.generate_data.createFromGraphData(graphNodes, graphLinks, this.props.myheight, this.props.myheight);
        var newState = myData;
        this.setState(newState);
    }

    componentWillReceiveProps(props) {
        this.updateData(props.data);
    }

    render(){
        return(
            <GraphApp nodes ={this.state.nodesFrom} links={this.state.linksFrom}
                      width = {this.props.width} height= {this.props.height} mywidth= {this.props.mywidth}
                      myheight={this.props.myheight}/>
        );
    }
}

