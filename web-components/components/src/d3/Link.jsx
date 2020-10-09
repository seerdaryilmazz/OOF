import React from 'react';
import ReactDom from 'react-dom';
import _ from 'lodash';
import d3 from 'd3';

export class Link extends React.Component{
    constructor(props){
super(props);
    }

    componentDidMount() {
        this.d3Link = d3.select(ReactDOM.findDOMNode(this.ling))
            .datum(this.props.data)
            .call(enterLink);
    }

    componentDidUpdate() {
        this.d3Link.datum(this.props.data)
            .call(updateLink);
    }

    render() {
        return (<line className='link' ref= {(c) => this.ling = c} />);
    }


}