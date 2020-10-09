import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

export class FilterWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            internalValue: null
        };
    };

    componentDidMount(){

    }
    componentDidUpdate(){

    }
    componentWillReceiveProps(nextProps){
    }
    updateData(value){
        this.setState({internalValue: value}, () => {
            let targetValue = value;
            if(this.props.target && value){
                targetValue = value[this.props.target];
            }
            if(!targetValue){
                targetValue = "";
            }
            this.props.onchange && this.props.onchange(targetValue);
        });
    }

    render() {
        let components = React.Children.map(this.props.children, component => {
            return React.cloneElement(component, {
                value: this.state.internalValue,
                onchange: (value) => this.updateData(value),
                appendToBody: true,
            });
        });

        return <div>{components}</div>;
    }
}