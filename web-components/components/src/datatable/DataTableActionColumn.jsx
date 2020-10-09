import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class DataTableActionColumn extends React.Component{

    constructor(props) {
        super(props);
    };

    componentDidMount(){

    }
    componentDidUpdate(){

    }
    componentWillReceiveProps(){

    }

    renderHeader(){
        let width = this.props.width ? this.props.width + "%" : "";
        let className = "filter-false sorter-false";
        return <th className = {className} width={width}></th>;
    }
    renderData(){
        return <td className="uk-vertical-align">{
                    React.Children.map(this.props.children, child => {
                        return React.cloneElement(child, {data: this.props.data})
                    })
                }</td>;
    }

    render(){
        if(this.props.data){
            return this.renderData();
        }else{
            return this.renderHeader();
        }
    }
}