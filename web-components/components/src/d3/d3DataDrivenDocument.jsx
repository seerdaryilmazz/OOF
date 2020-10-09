import React from 'react';
import d3 from 'd3';
import ReactDOM from 'react-dom';

export class d3DataDrivenDocument extends React.Component{
    constructor(props){
        super(props);
        this.state={data:[]}
    }
    componentDidMount(){
console.log("testtt");
        this.setState({data:[5,10,15]});
        d3.select(ReactDOM.findDOMNode(this.test)).selectAll('div')
            .data(this.state.data)
            .enter().
            append('div')
            .attr('class', 'bar')
            .style('height', function (d) {
                return d * 5 + 'px';
            })
    }

    render(){
        return(
            <svg >
                <g  ref = {(c)=>{this.test = c}}/>
            </svg>);



    }
}