import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { withReadOnly } from 'susam-components/abstract/withReadOnly';
import { Button, Checkbox, DropDown } from 'susam-components/basic';
import { Grid, GridCell, Modal } from 'susam-components/layout';
import { Chip } from './Chip';
import { TemplateOriginalCustomers } from "./TemplateOriginalCustomers";

export class TemplateFields extends TranslatingComponent {
    
    constructor(props){
        super(props);
        this.state = {editingFieldsOfTemplate: {}, fields: this.props.fields};
    }

    componentDidUpdate(prevProps){
        if(!_.isEqual(prevProps.fields, this.props.fields)){
            this.setState( {fields: this.fields});
        }
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handleAddFieldClick(){
        this.modal.open();
    }
    handleAddFieldClose(){
        this.modal.close();
    }

    handleModalOpen(){
        this.fields = _.cloneDeep(this.state.fields);
        this.fieldsState = {}
    }

    handleFieldSelect(field, value){
        if(value){
            this.fieldsState[field] = 'add'
            this.fields.push(field)
        } else {
            this.fieldsState[field] = 'remove';
            this.fields = _.reject(this.fields, i=>i===field);
        }
    }

    handleModalClose(){
        for(let key in this.fieldsState){
            if(this.fieldsState[key] === 'add'){
                this.props.onAddField && this.props.onAddField(key);
            } else if (this.fieldsState[key] === 'remove') {
                this.props.onRemoveField && this.props.onRemoveField(key);
            }
        }
    }
    handleChange(key, value){
        this.props.onChange && this.props.onChange(key, value);
    }
    handleCustomTemplateChange(key, value){
        this.props.onCustomChange && this.props.onCustomChange(key, value);
    }
    toggleEditTemplate(key){
        let editingFieldsOfTemplate = _.cloneDeep(this.state.editingFieldsOfTemplate);
        editingFieldsOfTemplate[key] = !editingFieldsOfTemplate[key];
        this.setState({editingFieldsOfTemplate: editingFieldsOfTemplate});
    }
    
    renderField(id, label, defaults, customizedDefaults, options, width){
        if(this.props.fields.includes(id)) {
            let filteredOptions = _.filter(options, (v) => _.isNil(defaults[id]) ? options : _.isArray(defaults[id]) ? _.indexOf(defaults[id].map(i=>i.code), v.code) !== -1 : defaults[id].code === v.code)
            if (customizedDefaults) {
                return <GridCell width = {width || "1-3"}>{this.renderReadOnlyTemplateField(id, label, customizedDefaults[id], filteredOptions)}</GridCell>
            }
            return  <GridCell width = {width || "1-3"}>{this.renderEditableTemplateField(id, label, defaults[id], options)}</GridCell>
        }
        return null;
    }
    renderEditableTemplateField(id, label, value, options){
        if(id === "originalCustomers"){
            return <TemplateOriginalCustomers value = {value}
                                              onChange = {(value) => this.handleChange(id, value)}/>;
        }else if(id === "insurance"){
            return <DropDown label = {label} options = {options} value = {value} valueField = "code"
                             onchange = {(value) => this.handleChange(id, value)}/>;
        }else if(id === "shipmentUnit"){
            return <DropDown label = {label} options = {options} value = {value} valueField = "code"
                             onchange = {(value) => this.handleChange(id, value)}/>;
        }
        return <Chip    label={label} options={options} valueField="code"
                        onAddSelectedItem={(item) => this.handleSelectedItemAdd(item, id)} 
                        onRemoveSelectedItem={(item, addBack) => this.handleSelectedItemRemove(item, id, addBack)}
                        value={value} onchange={(value) => this.handleChange(id, value)} />;
    }

    handleSelectedItemAdd(item, field){
        this.props.onFieldItemSelected && this.props.onFieldItemSelected(item, field);
    }
    
    handleSelectedItemRemove(item, field, addBack){
        this.props.onFieldItemUnselected && this.props.onFieldItemUnselected(item, field, addBack);
    }

    renderReadOnlyTemplateField(id, label, value, options){
        let ReadOnlyChip = withReadOnly(Chip);
        let ReadOnlyDropDown = withReadOnly(DropDown);
        let {defaults} = this.props;
        let customValue = value || defaults[id];
        if(_.isArray(customValue)){
            customValue = customValue.length === 0 ? "No selection" : customValue;
        }else{
            customValue = !customValue ? "No selection" : customValue;
        }
        let restoreValueButton = null;
        if(!_.isNil(value)){
            restoreValueButton = <div className = "uk-margin-top">
                <Button label = "reset" size = "mini" flat = {true} style = "danger" disableCooldown = {true}
                        onclick = {() => this.handleCustomTemplateChange(id, null)}/>
            </div>
        }

        let component = <ReadOnlyChip label = {label} options = {options} valueField="code"
                                      value = {customValue} readOnly = {!this.state.editingFieldsOfTemplate[id]}
                                      onchange = {(value) => this.handleCustomTemplateChange(id, value)} />;
        if(id === "originalCustomers"){
            component = <TemplateOriginalCustomers value = {customValue} readOnly = {!this.state.editingFieldsOfTemplate[id]}
                                                   onChange = {(value) => this.handleCustomTemplateChange(id, value)}
                                                   showAddNew={false}/>
        }else if(id === "insurance"){
            component = <ReadOnlyDropDown label = {label} options = {options} value = {customValue}
                                          readOnly = {!this.state.editingFieldsOfTemplate[id]} valueField = "code"
                                          onchange = {(value) => this.handleCustomTemplateChange(id, value)}/>;
        }else if(id === "shipmentUnit"){
            component = <ReadOnlyDropDown label = {label} options = {options} value = {customValue}
                                          readOnly = {!this.state.editingFieldsOfTemplate[id]} valueField = "code"
                                          onchange = {(value) => this.handleCustomTemplateChange(id, value)}/>;
        }
        return(
            <Grid collapse = {true}>
                <GridCell width = "6-10">
                    {component}
                </GridCell>
                <GridCell width = "1-10">
                    <div className = "uk-margin-top">
                        <Button style = "success" size = "mini" flat = {true} label="edit" disableCooldown = {true}
                                onclick = {() => this.toggleEditTemplate(id)}/>
                    </div>
                </GridCell>
                <GridCell width = "3-10">
                    {restoreValueButton}
                </GridCell>
            </Grid>
        );
    }
    render(){
        let {defaults, lookup, customizedDefaults} = this.props;
        let {fields} = this.state;
        return (
            <div>
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        <Button label="add field" style="success" size = "small" flat = {true}
                                onclick = {() => this.handleAddFieldClick()} />
                    </GridCell>
                    {this.renderField("loadTypes", "Load Types", defaults, customizedDefaults, lookup.truckLoadTypes)}
                    {this.renderField("serviceTypes", "Service Types", defaults, customizedDefaults, lookup.serviceTypes)}
                    {this.renderField("incoterms", "Incoterms", defaults, customizedDefaults, lookup.incoterms)}
                    {this.renderField("paymentTypes", "Payment Types", defaults, customizedDefaults, lookup.paymentTypes)}
                    {this.renderField("currencies", "Currencies", defaults, customizedDefaults, lookup.currencies)}
                    {this.renderField("insurance", "Insurance", defaults, customizedDefaults, lookup.yesNoOptions)}
                    {this.renderField("shipmentUnit", "Shipment Unit", defaults, customizedDefaults, lookup.shipmentUnitOptions)}
                    {this.renderField("originalCustomers", "Original Customers", defaults, customizedDefaults, null, "1-1")}
                </Grid>
                <Modal title="Add Template Field" ref={(c) => this.modal = c}
                        onopen={()=>this.handleModalOpen()}
                        onclose={()=>this.handleModalClose()}
                       actions={[
                           {label:"Close", action:() => this.handleAddFieldClose()}
                       ]}>
                    <Grid>
                        <GridCell width = "1-1">
                            <Checkbox label = "Load Types" value = {fields.includes("loadTypes")}
                                      disabled = {this.props.disabledFields.includes("loadTypes")}
                                      onchange = {(value) => this.handleFieldSelect("loadTypes", value)} />
                        </GridCell>
                        <GridCell width = "1-1">
                            <Checkbox label = "Service Types" value = {fields.includes("serviceTypes")}
                                      disabled = {this.props.disabledFields.includes("serviceTypes")}
                                      onchange = {(value) => this.handleFieldSelect("serviceTypes", value)} />
                        </GridCell>
                        <GridCell width = "1-1">
                            <Checkbox label = "Incoterms" value = {fields.includes("incoterms")}
                                      disabled = {this.props.disabledFields.includes("incoterms")}
                                      onchange = {(value) => this.handleFieldSelect("incoterms", value)} />
                        </GridCell>
                        <GridCell width = "1-1">
                            <Checkbox label = "Payment Types" value = {fields.includes("paymentTypes")}
                                      disabled = {this.props.disabledFields.includes("paymentTypes")}
                                      onchange = {(value) => this.handleFieldSelect("paymentTypes", value)} />
                        </GridCell>
                        <GridCell width = "1-1">
                            <Checkbox label = "Currencies" value = {fields.includes("currencies")}
                                      disabled = {this.props.disabledFields.includes("currencies")}
                                      onchange = {(value) => this.handleFieldSelect("currencies", value)} />
                        </GridCell>
                        <GridCell width = "1-1">
                            <Checkbox label = "Insurance" value = {fields.includes("insurance")}
                                      disabled = {this.props.disabledFields.includes("insurance")}
                                      onchange = {(value) => this.handleFieldSelect("insurance", value)} />
                        </GridCell>
                        <GridCell width = "1-1">
                            <Checkbox label = "Shipment Unit" value = {fields.includes("shipmentUnit")}
                                      disabled = {this.props.disabledFields.includes("shipmentUnit")}
                                      onchange = {(value) => this.handleFieldSelect("shipmentUnit", value)} />
                        </GridCell>
                        <GridCell width = "1-1">
                            <Checkbox label = "Original Customers" value = {fields.includes("originalCustomers")}
                                      disabled = {this.props.disabledFields.includes("originalCustomers")}
                                      onchange = {(value) => this.handleFieldSelect("originalCustomers", value)} />
                        </GridCell>
                    </Grid>
                </Modal>
            </div>
        );
    }

}