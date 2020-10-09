import React from 'react';
import { TextInput } from '../basic';

export class NumberInput extends React.Component{
    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){

    }

    handleChange(value){
        if(this.props.onchange){
            this.props.onchange(value)
        } else if(this.props.oninput){
            this.props.oninput(value)
        }
    }

    render(){
        let maxLength = this.props.maxLength ? this.props.maxLength : "*";
        return(
            <TextInput mask = {"'mask': '9', 'repeat': '" + maxLength + "', 'greedy' : false, 'showmaskonhover' : false"} {...this.props} oninput = {(value) => this.handleChange(value)} />
        );
    }

}