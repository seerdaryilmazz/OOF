import React from 'react';

import {NodeChart} from './NodeChart'


export class GraphApp extends React.Component{
    constructor(props){
        super(props);
        this.state = { nodes: [],
            links: []}
    }


    componentDidMount() {

        this.updateData();
    }

    updateData() {

    }
    handleClick(event){
    }
    render() {

        return (
            <div className="GraphApp">

                <NodeChart nodes={this.props.nodes} links={this.props.links}
                           onclick={(event)=>this.handleClick(event)} width={this.props.width}
                           height = {this.props.height}></NodeChart>

            </div>

        );
    }
}
