import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {TextInput} from '../../basic';

export class TextFilter extends React.Component {

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
            <TextInput onchange = {(value) => this.handleChange(value)} value = {this.props.value}/>
        );
    }
}