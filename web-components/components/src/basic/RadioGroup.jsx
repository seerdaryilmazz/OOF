import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';

import {TranslatingComponent} from '../abstract/'
import {RadioButton} from './RadioButton';

export class RadioGroup extends TranslatingComponent {
    constructor(props) {
        super(props);
        if(props.id){
            this.state = {id:props.id};
        }else{
            this.state = {id:uuid.v4()};
        }
    };
    componentDidMount(){

    };

    handleOnChange(option, value){
        if(value){
            this.props.onchange && this.props.onchange(option);
        }
    }

    render(){

        var valueField = this.props.valueField;
        if(!valueField){
            valueField = "id";
        }
        var labelField = this.props.labelField;
        if(!labelField){
            labelField = "name";
        }
        let options = this.props.options ? _.clone(this.props.options) : [];

        if(this.props.value){
            options.map(option => {
                let val = "";
                if(this.props.value instanceof Object){
                    val = this.props.value[valueField];
                }else{
                    val = this.props.value;
                }
                option.checked = (option[valueField] === val);
            });
        }
        else {
            options.map(option => {
                option.checked = false;
            });
        }
        return(
            <div className="parsley-row">
                {options.map(option =>
                    <RadioButton key = {option[valueField]} id={option[valueField]} label={option[labelField]} inline={this.props.inline} name={this.props.name}
                                 required={this.props.required} value={option[valueField]}
                                 checked={option.checked} onchange={(value) => this.handleOnChange(option, value)}/>
                )}
            </div>

        );
    }
}
RadioGroup.childContextTypes = {
    translator: PropTypes.object
};