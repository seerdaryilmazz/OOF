import React from 'react';
import uuid from 'uuid';

import {Checkbox} from './Checkbox';
import {Grid, GridCell} from '../layout/Grid';
import {TranslatingComponent} from '../abstract/TranslatingComponent';

export class CheckboxGroup extends TranslatingComponent{
    constructor(props){
        super(props);
    };
    componentDidMount(){

    };
    render(){
        var valueField = this.props.valueField;
        if(!valueField){
            valueField = "value";
        }
        var labelField = this.props.labelField;
        if(!labelField){
            labelField = "name";
        }
        var label = "";
        if(!this.props.hideLabel){
            label = super.translate(this.props.label);
        }
        var requiredForLabel = "";
        if(this.props.required && label){
            requiredForLabel = <span className="req">*</span>;
        }
        let width = "1-6";
        if(this.props.width){
            width = this.props.width;
        }
        let options = [];
        if(this.props.options){
            options = this.props.options.map(option =>
                <GridCell key={uuid.v4()} width = {width} noMargin = {true}>
                    <Checkbox label={option[labelField]} inline={this.props.inline} name={this.props.name}
                              checked={option[valueField]} required={this.props.required}
                              minRequired={this.props.minRequired}/>
                </GridCell>
            );
        }
        return(
            <div className="parsley-row">
                <div className="md-input-wrapper md-input-filled">
                    <label className="uk-form-label">{label}{requiredForLabel}</label>
                </div>
                <Grid>
                {options}
                </Grid>
            </div>
        );

    }
}