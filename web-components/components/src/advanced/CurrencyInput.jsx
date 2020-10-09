import React from 'react';
import {TextInput, DropDown} from '../basic'
import {Grid, GridCell} from '../layout'
import _ from 'lodash';

export class CurrencyInput extends React.Component{
    constructor(props){
        super(props);
        this.state = {currency:{}, amount: 0};
        this.groupSeparator = ".";
        this.radixPoint = ",";
    }

    componentDidMount(){

    }

    handleCurrencyChange(value){
        let state = _.cloneDeep(this.state);
        state.currency = value;
        this.handleChange(state.currency, state.amount);
        this.setState(state);
    }
    handleAmountChange(value){
        let state = _.cloneDeep(this.state);
        state.amount = value;
        this.handleChange(state.currency, state.amount);
        this.setState(state);
    }

    handleChange(currency, amount){
        if(amount){
            amount = amount.replace(new RegExp("\\" + this.groupSeparator, "g"), "").replace(new RegExp("\\" + this.radixPoint, "g"), ".");
        }
        let value = {currency: currency, amount: amount};
        this.props.onchange && this.props.onchange(value);
    }

    componentWillReceiveProps(nextProps){
        let value = nextProps.value;
        if(value) {
            this.state.currency = value.currency;
            this.state.amount = value.amount;
        } else {
            this.state = {currency:{}, amount: 0};
        }
    }

    render(){

        let maskSettings = "'alias': 'numeric', 'radixPoint': '" + this.radixPoint + "', 'groupSeparator': '" + this.groupSeparator + "', 'autoGroup': true, 'digits': 2, 'digitsOptional': false, 'suffix': '', 'placeholder': '0'";
        let currencies = [{id:"EUR", name:"EUR"}, {id:"USD", name:"USD"}, {id:"TRY", name:"TRY"}];
        return(
            <Grid collapse = {true}>
                <GridCell width="1-2">
                    <TextInput mask = {maskSettings} label = {this.props.label}
                               onchange = {(value) => this.handleAmountChange(value)} value = {this.state.amount} required = {this.props.required}/>
                </GridCell>
                <GridCell width="1-2">
                    <DropDown options = {currencies} onchange = {(value) => this.handleCurrencyChange(value)} required = {this.props.required}
                          value = {this.state.currency} placeholder = "..." label = "Currency"/>
                </GridCell>
            </Grid>
        );
    }

}