import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { CardHeader } from 'susam-components/layout';
import { TemplateFields } from "./TemplateFields";



export class EditTemplateDefaults extends TranslatingComponent {
    state = {};

    handleChange(key, value){
        let defaults = _.cloneDeep(this.props.defaults);
        _.set(defaults, key, value);
        this.props.onChange && this.props.onChange(defaults, key);
    }
    handleAddField(field){
        this.props.onAddField && this.props.onAddField(field);
    }
    handleRemoveField(field){
        this.props.onRemoveField && this.props.onRemoveField(field);
    }

    handleFieldItemSelected(item, field) {
        this.props.onFieldItemSelected && this.props.onFieldItemSelected(item, field);
    }
    handleFieldItemUnselected(item, field, addBack) {
        this.props.onFieldItemUnselected && this.props.onFieldItemUnselected(item, field, addBack);
    }

    render(){
        let {defaults, lookup, fields} = this.props;
        if(!lookup) {
            return null;
        }
        return (
            <div>
                <CardHeader title = "Default Template" />
                <TemplateFields fields = {fields} lookup = {lookup} defaults = {defaults}
                                disabledFields = {[]} 
                                onFieldItemSelected = {(item,field) => this.handleFieldItemSelected(item,field)}
                                onFieldItemUnselected = {(item,field, addBack) => this.handleFieldItemUnselected(item,field, addBack)}
                                onAddField = {(field) => this.handleAddField(field)}
                                onRemoveField = {(field) => this.handleRemoveField(field)}
                                onChange = {(key, value) => this.handleChange(key, value)}/>

            </div>
        );

    }

}