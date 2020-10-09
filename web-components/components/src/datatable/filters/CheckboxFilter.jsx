import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {Checkbox} from '../../basic';

export class CheckboxFilter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    };

    componentDidMount(){

    }
    componentDidUpdate(){

    }
    componentWillReceiveProps(){

    }
    handleChange(value){
        this.props.onchange && this.props.onchange(value);
    }

    render(){
        return(
            <Checkbox onchange = {(value) => this.handleChange(value)} value = {this.props.value}/>
        );
    }
}