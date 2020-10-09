import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Checkbox, DropDown, Notify } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import { convertLocationsWithPostalCodes } from '../../Helper';
import { Kartoteks, LocationService, ProjectService } from '../../services';
import { ManufacturerCompany } from './ManufacturerCompany';

export class TemplateParty extends TranslatingComponent {
    state = {};

    componentDidMount(){
        this.loadLookups();
        if(this.props.party){
            this.loadCompanyData(this.props.party.company);
            this.loadHandlingCompanyData(this.props.party.handlingCompany);
        }
    }
    componentWillReceiveProps(nextProps){
        let currentCompanyId = _.get(this.props, "party.company.id");
        let nextCompany = _.get(nextProps, "party.company");
        if(nextCompany && currentCompanyId !== nextCompany.id){
            this.loadCompanyData(nextCompany);
        }
        let currentHandlingCompanyId = _.get(this.props, "party.handlingCompany.id");
        let nextHandlingCompany = _.get(nextProps, "party.handlingCompany");
        if(nextHandlingCompany && currentHandlingCompanyId !== nextHandlingCompany.id){
            this.loadHandlingCompanyData(nextHandlingCompany);
        }
    }

    loadLookups(){
        if(this.props.type !== 'sender'){
            return;
        }
        axios.all([
            ProjectService.listTemplateLookups("manufacturer-options")
        ]).then(axios.spread(manufacturerOptions => {
            this.setState({manufacturerOptions: manufacturerOptions.data});
        })).catch(error => Notify.showError(error));
    }


    loadHandlingCompanyData(company){
        if(!company || !company.id) return;
        if(company.type==='CUSTOMS'){
            LocationService.getCustomsOffice(company.id).then(response=>{
                let locationsWithPostalCode = response.data.locations.map(item => convertLocationsWithPostalCodes(item));
                this.setState({handlingLocations: locationsWithPostalCode, handlingContacts: response.data.contacts});
                if(locationsWithPostalCode.length === 1){
                    this.handleChange("handlingLocation", _.first(locationsWithPostalCode));
                }
            }).catch(error => Notify.showError(error));
        } else {
            axios.all([
                Kartoteks.getCompanyLocations(company.id),
                Kartoteks.getCompanyContacts(company.id)
            ]).then(axios.spread((locations, contacts) => {
                let locationsWithPostalCode = locations.data.map(item => convertLocationsWithPostalCodes(item));
                this.setState({handlingLocations: locationsWithPostalCode, handlingContacts: contacts.data});
                if(locationsWithPostalCode.length === 1){
                    this.handleChange("handlingLocation", _.first(locationsWithPostalCode));
                }
            })).catch(error => Notify.showError(error));
        }
    }

    loadCompanyData(company){
        if(!company || !company.id) return;
        if(company.type==='CUSTOMS'){
            LocationService.getCustomsOffice(company.id).then(response=>{
                let locationsWithPostalCode = response.data.locations.map(item => convertLocationsWithPostalCodes(item));
                this.setState({companyLocations: locationsWithPostalCode, companyContacts: response.data.contacts});
                if(locationsWithPostalCode.length === 1){
                    this.handleChange("companyLocation", _.first(locationsWithPostalCode));
                }
            }).catch(error => Notify.showError(error));
        } else {
            axios.all([
                Kartoteks.getCompanyLocations(company.id),
                Kartoteks.getCompanyContacts(company.id)
            ]).then(axios.spread((locations, contacts) => {
                let locationsWithPostalCode = locations.data.map(item => convertLocationsWithPostalCodes(item));
                this.setState({companyLocations: locationsWithPostalCode, companyContacts: contacts.data});
                if(locationsWithPostalCode.length === 1){
                    this.handleChange("companyLocation", _.first(locationsWithPostalCode));
                }
            })).catch(error => Notify.showError(error));
        }
    }

    handleChange(key, value){
        this.props.onChange && this.props.onChange(key, value);
    }
    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handleSetOwnerAsCompany(){
        let {owner} = this.props;
        if(owner && owner.id){
            this.handleChange("company", owner);
            this.loadCompanyContacts(owner.id);
        }
    }
    handleSetCompanyAsHandlingCompany(){
        let {party} = this.props;
        if(party.company) {
            this.handleChange("handlingCompany", party.company);
            this.loadHandlingCompanyData(party.company);
        }
    }
    handleCompanyChange(value){
        this.handleChange("company", value);
        this.loadCompanyData(value);
    }
    handleHandlingCompanyChange(value){
        this.handleChange("handlingCompany", value);
        this.loadHandlingCompanyData(value);
    }

    handleManufacturerOptionChange(value) {
        this.handleChange("manufacturerOption", value);
        if(value && value.code === 'DONT_ASK') {
            this.handleChange("manufacturers", []);
        }
    }

    renderManufacturerCompany(party, type){
        if(type !== 'sender'){
            return null;
        }

        return [
            <GridCell key="0" width="1-3">
                <DropDown   label = "Manufacturer Company" options={this.state.manufacturerOptions}
                            translate={true} value={party.manufacturerOption}
                            onchange = {(value) => this.handleManufacturerOptionChange(value)} required={true}
                />
            </GridCell>,
            <GridCell key="1" width="2-3" />,
            <GridCell key="2">
                <ManufacturerCompany
                    mode={party.manufacturerMode}
                    manufacturers={party.manufacturers} 
                    option={party.manufacturerOption} 
                    onmodechange={mode=>this.handleChange('manufacturerMode',mode)}
                    onchange={(value=>this.handleChange('manufacturers', value))} />
            </GridCell>
        ];
    }

    render(){
        let {party, owner, type} = this.props;
        if(!party){
            return null;
        }
        let useOwnerButton = null;
        if(owner && owner.id){
            useOwnerButton =
                <div className = "uk-margin-top">
                    <Button label="use template owner" flat = {true} size = "small" style = "success"
                        onclick = {() => this.handleSetOwnerAsCompany()} />
                </div>;
        }
        let companyLabel = type === "sender" ? "Sender Company" : "Consignee Company";
        let companyLocationLabel = type === "sender" ? "Sender Location" : "Consignee Location";
        let handlingCompanyLabel = type === "sender" ? "Loading Company" : "Unloading Company";
        let handlingLocationLabel = type === "sender" ? "Loading Location" : "Unloading Location";
        let useCompanyLabel = type === "sender" ? "Use Sender Company" : "Use Consignee Company";
        let selectHandlingCompanyLabel = type === "sender" ? "Select loading company..." : "Select unloading company...";
        let askOrderNumbersLabel = type === "sender" ? "Ask Sender Order Numbers" : "Ask Consignee Order Numbers";
        let askBookingOrderNumbersLabel = type === "sender" ? "Ask Loading Order Numbers" : "Ask Unloading Order Numbers";

        return(
            <Grid>
                <GridCell width = "1-3">
                    <CompanySearchAutoComplete label = {companyLabel} value = {party.company}
                                               required = {true}
                                               onchange = {(value) => this.handleCompanyChange(value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <Checkbox label= {askOrderNumbersLabel} value = {party.askOrderNumbers}
                              onchange = {(value) => this.handleChange("askOrderNumbers", value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <DropDown label = "Contact" options = {this.state.companyContacts} labelField = "fullname"
                              emptyText = "No contacts..." uninitializedText = "Select company..."
                              value = {party.companyContact} required = {true}
                              onchange = {(value) => this.handleChange("companyContact", value)} />
                </GridCell>

                <GridCell width = "1-3">
                    <DropDown label = {companyLocationLabel} options = {this.state.companyLocations}
                              emptyText = "No locations..." uninitializedText = "Select company..."
                              value = {party.companyLocation} required = {true}
                              onchange = {(value) => this.handleChange("companyLocation", value)} />
                </GridCell>
                <GridCell width = "2-3" />

                <GridCell width = "1-3">
                    <CompanySearchAutoComplete label = {handlingCompanyLabel} value = {party.handlingCompany}
                                               sources={['COMPANY', 'CUSTOMS']}
                                               required = {true}
                                               onchange = {(value) => this.handleHandlingCompanyChange(value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Button label={useCompanyLabel} flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleSetCompanyAsHandlingCompany()} />
                    </div>
                </GridCell>
                <GridCell width = "1-3" />

                <GridCell width = "1-3">
                    <DropDown label = {handlingLocationLabel} options = {this.state.handlingLocations}
                              emptyText = "No locations..." uninitializedText = {selectHandlingCompanyLabel}
                              value = {party.handlingLocation} required = {true}
                              onchange = {(value) => this.handleChange("handlingLocation", value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <Checkbox label={askBookingOrderNumbersLabel} value = {party.askBookingOrderNumbers}
                              onchange = {(value) => this.handleChange("askBookingOrderNumbers", value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <DropDown label = "Contact" options = {this.state.handlingContacts} labelField = "fullname"
                              emptyText = "No contacts..." uninitializedText = {selectHandlingCompanyLabel}
                              value = {party.handlingContact} required = {true}
                              onchange = {(value) => this.handleChange("handlingContact", value)} />
                </GridCell>

               {this.renderManufacturerCompany(party, type)}
            </Grid>
        );
    }


}