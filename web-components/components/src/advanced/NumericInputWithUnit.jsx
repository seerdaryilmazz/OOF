import React from 'react';
import {TextInput, DropDown} from '../basic'
import {Grid, GridCell} from '../layout'
import _ from 'lodash';

export class NumericInputWithUnit extends React.Component{
    constructor(props){
        super(props);
        this.state = {unit:{}, amount: 0};
        this.groupSeparator = ".";
        this.radixPoint = ",";
        if(this.props.value){
            this.state.unit = this.props.value.unit;
            this.state.amount = this.props.value.amount;
        }
    }

    componentDidMount(){

    }

    handleUnitChange(value){
        let state = _.cloneDeep(this.state);
        state.unit = value;
        this.handleChange(state.unit, state.amount);
        this.setState(state);
    }
    handleAmountChange(value){
        let state = _.cloneDeep(this.state);
        state.amount = value;
        this.handleChange(state.unit, state.amount);
        this.setState(state);
    }

    handleChange(unit, amount){
        let parsedAmount = amount;
        if(amount && (typeof amount === 'string')){
            amount = amount.replace(new RegExp("\\" + this.groupSeparator, "g"), "").replace(new RegExp("\\" + this.radixPoint, "g"), ".");
            if(amount.indexOf(".") != -1){
                parsedAmount = parseFloat(amount);
            }else{
                parsedAmount = parseInt(amount);
            }
        }
        let value = {unit: unit, amount: parsedAmount};
        this.props.onchange && this.props.onchange(value);
    }

    componentWillReceiveProps(nextProps){
        let value = nextProps.value;
        if(value) {
            this.state.unit = value.unit;
            this.state.amount = value.amount;
        } else {
            this.state = {unit:{}, amount: 0};
        }
    }

    render(){
        let unitLabel = this.props.label ? "Unit" : "";
        let allowMinus = this.props.allowMinus ? true : false;
        let maskSettings = "'alias': 'numeric', 'allowMinus': " + allowMinus + ", 'radixPoint': '" + this.radixPoint + "', 'groupSeparator': '" + this.groupSeparator + "', 'autoGroup': true, 'digits': " + this.props.digits + ", 'digitsOptional': " + this.props.digitsOptional + ", 'suffix': '', 'placeholder': '0'";
        return(
            <Grid collapse = {true}>
                <GridCell width="1-2">
                    <TextInput id = {this.props.id} mask = {maskSettings} {...this.props}
                               onchange = {(value) => this.handleAmountChange(value)} value = {this.state.amount} />
                </GridCell>
                <GridCell width="1-2">
                    <DropDown id = {this.props.id + "-unit"}
                              options = {this.props.units}
                              onchange = {(value) => this.handleUnitChange(value)}
                              required = {this.props.required}
                              value = {this.state.unit}
                              placeholder = "..."
                              label = {unitLabel}
                              labelField={this.props.unitLabelField}
                              appendToBody={this.props.appendToBody}/>
                </GridCell>
            </Grid>
        );
    }

}