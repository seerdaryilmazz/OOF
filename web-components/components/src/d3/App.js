import React from 'react';
import {Circle} from './Circle';

var sampleData = [
  //  {id: '5fbmzmtc', x: 7, y: 45, z: 6,label:"1"},
    {id: 's4f8phwm', x: 11, y: 45, z: 9,label:"2"}

];

export class App extends React.Component{
constructor(props){
    super(props);
    this.state={data:sampleData,domain: {x: [0, 30], y: [0, 100]}}

}

    render(){
        return (
            <div className="App">
                <Circle
                    data={this.state.data}
                    domain={this.state.domain} />
            </div>
        );
    }
}
