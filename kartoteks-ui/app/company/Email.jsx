import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {Card, Grid, GridCell} from "susam-components/layout";
import {TextInput} from 'susam-components/basic';

import {TranslatingComponent} from 'susam-components/abstract';

export class Email extends TranslatingComponent{
    constructor(props){
        super(props);
    }

    value(){
        let value = {};
        if(this.props.value){
            value = this.props.value;
        }
        return value;
    }

    update(key, value){
        let email = _.cloneDeep(this.value());
        email[key] = value;
        this.props.onchange && this.props.onchange(email);
    }

    render(){
        let value = this.value();
        
        return (
            <Grid collapse = {true}>
                <GridCell noMargin = {true}>
                    <TextInput value = {value.emailAddress} onchange = {(value) => this.update("emailAddress", value)} />
                </GridCell>
                
            </Grid>
        );


    }
}