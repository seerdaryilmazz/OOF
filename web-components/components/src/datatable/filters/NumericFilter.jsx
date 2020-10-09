import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {TextInput, DropDown} from '../../basic';
import {Grid, GridCell} from '../../layout';

export class NumericFilter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {value: this.props.value, op: "="};
    };

    componentDidMount(){

    }
    componentDidUpdate(){

    }
    componentWillReceiveProps(nextProps){


    }
    handleValueChange(value){
        let state = _.cloneDeep(this.state);
        state.value = value;
        this.setState(state);
        this.props.onchange && this.props.onchange(this.concatenateValue(state));
    }
    handleOpChange(value){
        let state = _.cloneDeep(this.state);
        state.op = value.id;
        this.setState(state);
        this.props.onchange && this.props.onchange(this.concatenateValue(state));
    }
    concatenateValue(state){
        if(!state.value){
            return "";
        }else{
            return state.op + state.value;
        }
    }

    render(){
        return(
            <Grid collapse = {true}>
                <GridCell width="1-2" noMargin = {true}>
                    <DropDown options = {[{id:"=", name:"eq"},{id:"<", name:"lt"},{id:">", name:"gt"}, {id:"<=", name:"lte"}, {id:">=", name:"gte"}]}
                              placeholder = ".."
                              onchange = {(value) => this.handleOpChange(value)}
                              value = {this.state.op} />
                </GridCell>
                <GridCell width="1-2" noMargin = {true}>
                    <TextInput onchange = {(value) => this.handleValueChange(value)} value = {this.state.value}/>
                </GridCell>
            </Grid>
        );
    }
}