import React from 'react';
import { TextInput } from '../basic';

const GROUP_SEPARATOR = ".";
const RADIX_POINT = ",";
export class NumericInput extends React.Component{
    state = {};
    constructor(props){
        super(props);
    }

    handleChange(value){
        let amount = value && value.split(GROUP_SEPARATOR).join("").replace(RADIX_POINT, ".");
        let parsedAmount = parseFloat(amount);
        if(isNaN(parsedAmount)){
            parsedAmount = null;
        }
        this.props.onchange && this.props.onchange(parsedAmount);
    }

    render(){
        let digits = 0;
        let digitsOptional = false;
        if(this.props.digits){
            digits = this.props.digits;
        }
        if(this.props.digitsOptional){
            digitsOptional = this.props.digitsOptional;
        }
        let groupSeparator = "";
        if(this.props.grouping){
            groupSeparator = GROUP_SEPARATOR
        }
        let suffix = "";
        if(this.props.suffix){
            suffix = this.props.suffix;
        }

        let max = undefined;
        if(this.props.maxIntegerDigit) {
            max = Math.pow(10, this.props.maxIntegerDigit)-1;
        }

        let allowMinus = this.props.allowMinus ? true : false;
        let maskSettings = "'alias': 'numeric', 'allowMinus': " + allowMinus + ", 'radixPoint': '" + RADIX_POINT + "', 'groupSeparator': '" + groupSeparator +
            "', 'autoGroup': true, 'digits': " + digits + ", 'digitsOptional': " + digitsOptional +
            ", 'suffix': '" + suffix + "', 'max': '" + max + "'";
        return(
            <div style = {{position: "relative", width:"100%", height:"100%"}}>
                <TextInput mask = {maskSettings} {...this.props} onchange = {(value) => this.handleChange(value)} />
            </div>
        );
    }

}