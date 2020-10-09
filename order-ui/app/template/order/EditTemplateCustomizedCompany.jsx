import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify, TextInput } from 'susam-components/basic';
import { CardHeader, CardSubHeader, Grid, GridCell, Modal } from 'susam-components/layout';
import { SearchUtils } from "susam-components/utils/SearchUtils";
import uuid from 'uuid';
import { TemplateFields } from "./TemplateFields";
import { TemplateParty } from './TemplateParty';

let searchUtil = new SearchUtils(['company.name', 'location.name', 'handlingCompany.name', 'handlingLocation.name']);
export class EditTemplateCustomizedCompany extends TranslatingComponent {
    state = {editingParty: {}, editingPartyKey: null, customizationToEdit: null, editingFieldsOfTemplate: {}, size: 3, showAll: false};

    componentDidMount(){
        this.setState({customizations: _.take(this.props.customizations, this.state.size)});
    }

    componentDidUpdate(prevProps, prevState){
        if(!_.isEqual(this.props.customizations, prevProps.customizations) || !_.isEqual(this.state.size, prevState.size) ){
            this.setState({customizations: _.take(this.props.customizations, this.state.size)});
        }
    }

    handleToggleShowAllClick(){
        this.setState(prevState=>{
            return {
                size: prevState.showAll ? 3: this.props.customizations.length,
                showAll: !prevState.showAll
            }
        })
    }

    handleFilterChange(filter){
        this.setState({ filter: filter, customizations: _.take(searchUtil.search(filter, this.props.customizations), this.state.size) })
    }

    handleNewLocationClick(){
        this.setState({editingParty: {manufacturerOption:{id:'DONT_ASK', code:'DONT_ASK'}}, editingPartyKey: null}, () => this.modal.open());
    }
    handleClose(){
        this.modal.close();
    }
    handleChange(key, value){
        let editingParty = _.cloneDeep(this.state.editingParty);
        _.set(editingParty, key, value);
        this.setState({editingParty: editingParty});
    }
    handleCustomTemplateChange(customization, key, value){
        let customizations = _.cloneDeep(this.props.customizations);
        let index = _.findIndex(customizations, item => item._key === customization._key);
        if(index >= 0){
            customizations[index].customizedDefaults[key] = value;
        }
        this.props.onChange && this.props.onChange(customizations);
    }
    handleSaveCustomizationParty(party){
        if(!this.state.editingParty.company){
            return Notify.showError(`${party} should not be empty`);
        }
        if(!this.state.editingParty.companyLocation){
            return Notify.showError(`${party} location should not be empty`);
        }
        if(!this.state.editingParty.handlingCompany){
            return Notify.showError(`${party==='sender'?'':'un'}loading company should not be empty`);
        }
        if(!this.state.editingParty.handlingLocation){
            return Notify.showError(`${party==='sender'?'':'un'}loading location should not be empty`);
        }
        if(party === 'sender' && this.state.editingParty.manufacturerMode === 'specific' && _.isEmpty(this.state.editingParty.manufacturers)){
            return Notify.showError('at least one manufacturer should be defined');
        }
        if(this.state.editingPartyKey){
            this.handleUpdateCustomizationParty();
        }else{
            this.handleAddCustomizationParty();
        }
    }
    copyPartyDataFromState(customization){
        customization.company = this.state.editingParty.company;
        customization.companyLocation = this.state.editingParty.companyLocation;
        customization.handlingCompany = this.state.editingParty.handlingCompany;
        customization.handlingLocation = this.state.editingParty.handlingLocation;
        customization.companyContact = this.state.editingParty.companyContact;
        customization.handlingContact = this.state.editingParty.handlingContact;
        customization.askOrderNumbers = this.state.editingParty.askOrderNumbers;
        customization.askBookingOrderNumbers = this.state.editingParty.askBookingOrderNumbers;
        customization.manufacturerOption = this.state.editingParty.manufacturerOption;
        customization.manufacturers = this.state.editingParty.manufacturers;
    }

    handleUpdateCustomizationParty(){
        let {editingParty} = this.state; 
        let customizations = _.cloneDeep(this.props.customizations);
        let existing =
            _.find(customizations, { handlingCompany: { type: editingParty.handlingCompany.type }, handlingLocation:{id: editingParty.handlingLocation.id}, company: { id: editingParty.company.id}, companyLocation: {id: editingParty.companyLocation.id}});
        if(existing && existing._key !== this.state.editingPartyKey){
            Notify.showError(`Company location '${this.state.editingParty.handlingLocation.name}' already exists in list`);
            return false;
        }
        let existingIndex =
            _.findIndex(customizations, item => item._key === this.state.editingPartyKey);
        if(existingIndex === -1){
            Notify.showError(`Company location does not exist`);
            return;
        }
        this.copyPartyDataFromState(customizations[existingIndex]);
        this.setState({editingPartyKey: null, editingParty: {}}, () => {
            this.props.onChange && this.props.onChange(customizations);
            this.handleClose();
        });
    }
    handleAddCustomizationParty(){
        let {editingParty} = this.state; 
        let customizations = _.cloneDeep(this.props.customizations);
        let existing =
            _.find(customizations, { handlingCompany: { type: editingParty.handlingCompany.type }, handlingLocation: { id: editingParty.handlingLocation.id }, company: { id: editingParty.company.id }, companyLocation: { id: editingParty.companyLocation.id } });
        if(existing){
            Notify.showError(`Company location '${this.state.editingParty.handlingLocation.name}' already exists in list`);
            return false;
        }
        let newCustomization = {_key: uuid.v4(), customizedDefaults: {}};
        this.copyPartyDataFromState(newCustomization);
        customizations.push(newCustomization);
        this.setState({editingParty: {}, editingPartyKey: null}, () => {
            this.props.onChange && this.props.onChange(customizations);
            this.handleClose();
        });
    }
    handleDeleteCustomization(customization){
        Notify.confirm("Are you sure?", () => {
            let customizations = _.cloneDeep(this.props.customizations);
            _.remove(customizations, (item) => item._key === customization._key);
            this.props.onChange && this.props.onChange(customizations);
        });
    }
    handleEditPartyOfCustomization(customization){
        let editingParty = {
            company: customization.company,
            companyLocation: customization.companyLocation,
            handlingCompany: customization.handlingCompany,
            handlingLocation: customization.handlingLocation,
            companyContact: customization.companyContact,
            handlingContact: customization.handlingContact,
            askOrderNumbers: customization.askOrderNumbers,
            askBookingOrderNumbers: customization.askBookingOrderNumbers,
            manufacturerOption: customization.manufacturerOption,
            manufacturers: customization.manufacturers
        };
        this.setState({editingParty: editingParty, editingPartyKey: customization._key}, () => this.modal.open());
    }
    handleEditTemplateOfCustomization(customization){
        let key = null;
        if(!_.isEqual(this.state.customizationToEdit, customization._key)){
            key = customization._key;
        }
        this.setState({customizationToEdit: key, editingFieldsOfTemplate: {}});
    }
    handleAddField(customization, field){
        let customizations = _.cloneDeep(this.props.customizations);
        let index = _.findIndex(customizations, item => item._key === customization._key);
        customizations[index].customizedDefaults[field] = [];
        this.props.onChange && this.props.onChange(customizations);
    }
    handleRemoveField(customization, field){
        let customizations = _.cloneDeep(this.props.customizations);
        let index = _.findIndex(customizations, item => item._key === customization._key);
        customizations[index].customizedDefaults[field] = null;
        this.props.onChange && this.props.onChange(customizations);
    }
    findKeysFromCustomizedDefaults(customization){
        let keys = [];
        for(let key in customization.customizedDefaults) {
            if (customization.customizedDefaults.hasOwnProperty(key) && customization.customizedDefaults[key]) {
                keys.push(key);
            }
        }
        return keys;
    }

    renderRules(customization){
        return this.props.rules ? React.createElement(this.props.rules, { data: customization }) : null;
    }

    renderItem(customization){
        let handlingCompany = customization.company.id !== customization.handlingCompany.id && <div className="uk-text-truncate uk-text-small">{customization.handlingCompany.name}</div>;
        let selected = customization._key === this.state.customizationToEdit;
        let isCustomized = null;
        for(let key in customization.customizedDefaults) {
            if (customization.customizedDefaults.hasOwnProperty(key) && customization.customizedDefaults[key]) {
                isCustomized = true;
            }
        }
        let customizedBanner = null;
        if(isCustomized){
            customizedBanner =  <i className = "uk-margin-left uk-badge">Customized</i>;
        }

        let detailsComponent = null;
        if(selected){
            detailsComponent = <GridCell width = "1-1">{this.renderCustomizedTemplate()}</GridCell>;
        }
        return (
            <li key = {customization._key}>
                <Grid>
                    <GridCell width = "2-4">
                        <div className="md-list-content">
                            <div className="uk-text-bold">
                                <div className="uk-text-truncate">{customization.company.name} {customizedBanner}</div>
                                {(customization.companyLocation && customization.companyLocation.id !== customization.handlingLocation.id) && <div className="uk-text-truncate uk-text-small" style={{opacity:"0.9"}}>{customization.companyLocation.name}</div>}
                            </div>
                            <div>
                                <i className="material-icons" style={{float:"left", fontSize:"22px", verticalAlign:"bottom"}}>place</i>
                                <div className = "uk-text-truncate" style = {{opacity: .8}}>{customization.handlingLocation.name}</div>
                                {handlingCompany}
                            </div>
                        </div>
                    </GridCell>
                    <GridCell width = "1-4" style={{}}>
                        { this.renderRules(customization) }
                    </GridCell>
                    <GridCell width = "1-4">
                        <Button label = "customize" flat = {true} size = "small" style = "primary"
                                onclick = {() => this.handleEditTemplateOfCustomization(customization)} />
                        <Button label = "edit" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleEditPartyOfCustomization(customization)} />
                        <Button label = "delete" flat = {true} size = "small" style = "danger"
                                onclick = {() => this.handleDeleteCustomization(customization)} />
                    </GridCell>
                    {detailsComponent}
                </Grid>
            </li>
        );
    }


    renderCustomizedTemplate(){
        if(!this.state.customizationToEdit){
            return null;
        }
        let {lookup, customizations, fields, defaults} = this.props;
        let customization = _.find(customizations, {_key: this.state.customizationToEdit});
        let customizedFields = this.findKeysFromCustomizedDefaults(customization);
        let fieldsToDisplay = _.union(fields, customizedFields);
        return(
        <div>
            <CardSubHeader title = "Template Customization" />
            <TemplateFields fields = {fieldsToDisplay} lookup = {lookup} defaults = {defaults}
                            customizedDefaults = {customization.customizedDefaults}
                            disabledFields = {fields}
                            onAddField = {(field) => this.handleAddField(customization, field)}
                            onRemoveField = {(field) => this.handleRemoveField(customization, field)}
                            onCustomChange = {(key, value) => this.handleCustomTemplateChange(customization, key, value)}/>
        </div>
        );
    }

    render(){
        let { customizations } = this.state;
        let { partyType } = this.props;

        let showAllTitle = this.state.showAll ? "Show Less" : "Show All";

        let modalTitle = partyType === "sender" ? "Select Sender & Location" : "Select Consignee & Location";
        let title = partyType === "sender" ? "Sender Company & Locations" : "Consignee Company & Locations"
        return (
            <div>
                <CardHeader title = {title} />
                <Grid>
                    <GridCell width="5-6" noMargin = {true}>
                        <TextInput value={this.state.filter} onchange={value=>this.handleFilterChange(value)} placeholder="Filter"/>
                    </GridCell>
                    <GridCell width="1-6">
                        <Button label="Add New Location" style = "success" flat = {true} onclick = {() => this.handleNewLocationClick()} />
                    </GridCell>
                    <GridCell width="1-1" noMargin = {true}>
                        <ul className = "md-list">
                            {customizations && customizations.map(item => this.renderItem(item))}
                        </ul>
                    </GridCell>
                    <GridCell width="1-1">
                        {this.props.customizations.length >= this.state.size && <Button label={showAllTitle} size="mini" flat={true} style="success" onclick={() => this.handleToggleShowAllClick()} />}
                    </GridCell>
                </Grid>
                <Modal title={modalTitle} ref={(c) => this.modal = c} large = {true}
                        closeOnBackgroundClicked = {false}
                        onclose={()=>this.setState({editingParty: {}, editingPartyKey: null})}
                       actions={[
                           {label:"Close", action:() => this.handleClose()},
                           {label:"Save", action: () => this.handleSaveCustomizationParty(partyType)}
                           ]}>
                    {!_.isEmpty(this.state.editingParty) 
                            && <TemplateParty party = {this.state.editingParty} type = {partyType} onChange = {(key, value) => this.handleChange(key, value)} /> }
                </Modal>
            </div>
        );
    }

}

