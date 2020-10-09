import React from 'react';
import {Graph} from './Graph';
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
        // randomData is loaded in from external file generate_data.js
        // and returns an object with nodes and links
        var newState = {nodes:[{key:8,size:20,x:349,y:252, klass:"country",label:"country"},
            {key:25,size:20,x:349,y:251, klass:"company" ,label:"company"},
            {key:18,size:20,x:349,y:152, klass:"customer",label:"Customer"}],
            links:[{source:0,target:1,key:"0,1",size:2},
                {source:1,target:2,key:"asdasdasd",size:2}]};//randomData(this.state.nodes, 950, 500);

        this.setState(newState);
    }
    handleClick(event){
    console.log("click event-->"+JSON.stringify(event));
    }
    render() {

        return (
          <div className="GraphApp">
                <div className="update" onClick={() => this.updateData()}>update</div>
              <NodeChart nodes={this.props.nodes} links={this.props.links}

                         onclick={(event)=>this.handleClick(event)}></NodeChart>

          </div>

        );
    }
}
