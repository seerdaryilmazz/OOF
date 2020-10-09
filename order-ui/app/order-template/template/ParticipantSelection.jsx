import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip } from 'susam-components/advanced';
import { Button, Checkbox, Notify } from 'susam-components/basic';
import { Grid, GridCell, Modal } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';



export class ParticipantSelection extends TranslatingComponent{

    constructor(props) {
        super(props);
        this.state = {selectedItem: {}, templateData: {}, differentCompany:{}, type: this.props.type, lookup: {}};
    }

    initializeTemplateData(templateData){

        this.setState({templateBackup: (templateData)});

    }

    loadTemplateData() {
        if(this.state.templateBackup){

            this.setState({
                templateData: _.cloneDeep(this.state.templateBackup),
                selectedItem: {},
                lookup: {},
                lockAddNewDifferentCompany:false
            });

            let templateData = this.state.templateData;

            if(templateData.isCompanyReadOnly){
                this.handleCompanySelect(templateData.company);
            }
            if(templateData.isLocationCompanyReadOnly){
                this.setState({differentAddress:true});
                this.handleOtherCompanySelect(templateData.differentCompany.company);

                if(templateData.differentCompany.locations) {
                    let locArray = [];
                    locArray.push(templateData.differentCompany.locations);
                    this.handleDifferentCompanyStateChange("locations", locArray);
                }
                //buraya handle location select
            } else {
                this.setState({differentAddress:false});
            }

        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.templateData) {
            this.initializeTemplateData(nextProps.templateData);
        }
        this.loadTemplateData();

    }

    componentDidMount(){
        if(this.props && this.props.templateData) {
            this.initializeTemplateData(this.props.templateData);
        }
        this.loadTemplateData();
    }

    addLookup(field, value) {
        let lookup =  _.cloneDeep(this.state.lookup);
        lookup[field] = value;
        this.setState({lookup: lookup});
    }


    getCompanyContacts(companyId) {
        return axios.get('/kartoteks-service/company/' + companyId + '/contacts');
    }
    getCompanyLocations(companyId) {
        return axios.get('/kartoteks-service/company/' + companyId + '/locations');
    }

    loadCompanyDetails(company){
        axios.all([this.getCompanyContacts(company.id), this.getCompanyLocations(company.id)])
            .then(axios.spread((contactsResponse, locationsResponse) => {
                this.addLookup("contacts", contactsResponse.data.map(elem => { let res = {}; res.id = elem.id; res.code = elem.id; res.name = elem.fullname; return res;}));
                this.addLookup("locations", locationsResponse.data.map(elem => { let res = {}; res.id = elem.id; res.code = elem.id; res.name = elem.name; return res;}));
            })).catch((error) => {
            Notify.showError(error);
        });
    }

    loadOtherCompanyDetails(company) {
        axios.all([this.getCompanyContacts(company.id), this.getCompanyLocations(company.id)])
            .then(axios.spread((contactsResponse, locationsResponse) => {
                this.addLookup("otherContacts", contactsResponse.data.map(elem => {
                    let res = {};
                    res.id = elem.id;
                    res.code = elem.id;
                    res.name = elem.fullname;
                    return res;
                }));
                this.addLookup("otherLocations", locationsResponse.data.map(elem => {
                    let res = {};
                    res.id = elem.id;
                    res.code = elem.id;
                    res.name = elem.name;
                    return res;
                }));
            })).catch((error) => {
            Notify.showError(error);
        });
    }
    handleDifferentCompanyStateChange(field, value){
        let differentCompany = _.cloneDeep(this.state.differentCompany);
        differentCompany[field] = value;
        this.setState({differentCompany:differentCompany});
    }
    handleSelectedItemStateChange(field, value){
        let selectedItem = _.cloneDeep(this.state.selectedItem);
        selectedItem[field] = value;
        this.setState({selectedItem: selectedItem});
    }
    handleStateChange(field, value){
        let state = _.cloneDeep(this.state);
        state[field] = value;
        this.setState(state);
    }
    handleSave(){
        let selectedItem = _.cloneDeep(this.state.selectedItem);
        if(this.state.differentAddress){
            selectedItem.locations = null;
            selectedItem.locationContacts = null;
        }else{
            selectedItem.differentCompanies = null;
        }
        this.props.onsave && this.props.onsave(selectedItem);
        this.handleClose();
    }
    handleCompanySelect(company){
        if(!company.code) company.code = company.id;
        this.handleSelectedItemStateChange("company", company);
        this.loadCompanyDetails(company);
    }
    handleOtherCompanySelect(company) {
        if(!company.code) company.code = company.id;
        this.handleDifferentCompanyStateChange("company", company);
        this.loadOtherCompanyDetails(company);
    }
    handleClose(){
        this.modal.close();
    }

    show(){
        this.modal.open();
    }

    handleAddDifferentAddress(){
        if(this.state.differentCompany){
            let state = _.cloneDeep(this.state);
            if(!state.selectedItem.differentCompanies){
                state.selectedItem.differentCompanies = [];
            }
            state.selectedItem.differentCompanies.push(this.state.differentCompany);
            state.differentCompany = {};

            if(this.props.templateData.isLocationCompanyReadOnly) {
                state.lockAddNewDifferentCompany = true;
            }
            this.loadTemplateData();
            this.setState(state);

        }
    }

    handleDeleteDifferentCompanyClick(e, item){
        let selectedItem = _.cloneDeep(this.state.selectedItem);
        _.remove(selectedItem.differentCompanies, req => {
            return req.key == item.key;
        });
        if(selectedItem.differentCompanies.length == 0 && this.props.templateData.isLocationCompanyReadOnly) {
            this.setState({lockAddNewDifferentCompany: false});
        }
        this.loadTemplateData();
        this.setState({selectedItem: selectedItem});
    }

    render(){
        let addressSelection = null;

        if(!this.state.differentAddress){
            addressSelection = <Grid>
                <GridCell width="2-5">
                    <Chip label="Location"
                          onchange={(value) => this.handleSelectedItemStateChange("locations", value)}
                          uninitializedText={"Please select " + this.props.type}
                          emptyText="No locations"
                          value={this.state.selectedItem.locations}
                          options={this.state.lookup.locations}/>
                </GridCell>
                <GridCell width="1-5">
                    <Chip label="Contact Person"
                          onchange={(value) => this.handleSelectedItemStateChange("locationContacts", value)}
                          value={this.state.selectedItem.locationContacts}
                          labelField="name"
                          uninitializedText={"Please select " + this.props.type}
                          emptyText="No contacts"
                          options={this.state.lookup.contacts}/>
                </GridCell>
                <GridCell width="2-5"/>
            </Grid>;
        }else {
            let addedCompanies = "";
            if (this.state.selectedItem.differentCompanies) {
                addedCompanies = this.state.selectedItem.differentCompanies.map(item => {
                    return <li key={item.company.id}>
                        <div className="md-list-content">
                            <Grid collapse={true}>
                                <GridCell width="9-10" noMargin={true}>
                                    {item.company.name}
                                    <span
                                        className="uk-text-small uk-text-muted uk-text-truncate">{item.locations ? item.locations.map(each => each.name).join(",") : ""}</span>
                                    <span
                                        className="uk-text-small uk-text-muted uk-text-truncate">{item.locationContacts ? item.locationContacts.map(each => each.name).join(",") : ""}</span>
                                </GridCell>
                                <GridCell width="1-10" noMargin={true}>
                                    <a href="#" className="md-list-action"
                                       onClick={(e) => this.handleDeleteDifferentCompanyClick(e, item)}><i
                                        className="md-icon uk-icon-times"/></a>
                                </GridCell>
                            </Grid>
                        </div>
                    </li>;
                });
            }
            if (!this.state.lockAddNewDifferentCompany) {
                addressSelection = <Grid>
                    <GridCell width="1-1">
                        <ul className="md-list">
                            {addedCompanies}
                        </ul>
                    </GridCell>
                    <GridCell width="4-10">
                        <CompanySearchAutoComplete label="Other Company"
                                                   readOnly={this.props.templateData ? this.props.templateData.isLocationCompanyReadOnly : false}
                                                   value={this.state.differentCompany.company}
                                                   onchange={(company) => this.handleOtherCompanySelect(company)}/>
                    </GridCell>
                    <GridCell width="3-10">
                        <Chip label="Location"
                              readOnly={this.props.templateData ? this.props.templateData.isLocationAddressReadOnly : false}
                              onchange={(value) => this.handleDifferentCompanyStateChange("locations", value)}
                              uninitializedText="Please select other company"
                              emptyText="No locations"
                              value={this.state.differentCompany.locations}
                              options={this.state.lookup.otherLocations}/>
                    </GridCell>
                    <GridCell width="2-10">
                        <Chip label="Contact Person"
                              onchange={(value) => this.handleDifferentCompanyStateChange("locationContacts", value)}
                              value={this.state.differentCompany.locationContacts}
                              labelField="name"
                              uninitializedText="Please select other company"
                              emptyText="No contacts"
                              options={this.state.lookup.otherContacts}/>
                    </GridCell>
                    <GridCell width="1-10">
                        <Button label="Add" onclick={() => this.handleAddDifferentAddress()} waves={true}
                                style="success" flat={true}/>
                    </GridCell>
                </Grid>;
            } else {
                addressSelection = <Grid>
                    <GridCell width="1-1">
                        <ul className="md-list">
                            {addedCompanies}
                        </ul>
                    </GridCell>
                </Grid>
            }
        }

        let differentAddressCheckBox;
        if(!this.props.templateData.isLocationCompanyReadOnly) {
            differentAddressCheckBox = <GridCell width="1-1">
                <Checkbox label = "Use address from a different company"
                          readOnly={this.props.templateData.isLocationCompanyReadOnly}
                          value = {this.state.differentAddress}
                          onchange = {(value) => this.handleStateChange("differentAddress", value)}/>
            </GridCell>;
        }

        return (
            <Modal title={"Select " + this.props.type} ref = {(c) => this.modal = c} large={true}
                   actions = {[{label:"Close", action:() => this.handleClose()},
                       {label:"Save", buttonStyle:"primary", action:() => this.handleSave()}]}>
                <Grid>
                    <GridCell width="3-5">
                        <CompanySearchAutoComplete label={this.props.type}
                                                   readOnly = {this.props.templateData ? this.props.templateData.isCompanyReadOnly : false}
                                                   required={true}
                                                   value = {this.state.selectedItem.company}
                                                   onchange={(company) => this.handleCompanySelect(company)}/>
                    </GridCell>
                    <GridCell width="2-5">
                        <Chip label="Contact Person"
                                  onchange={(value) => this.handleSelectedItemStateChange("contacts", value)}
                                  value={this.state.selectedItem.contacts}
                                  labelField="name"
                                  uninitializedText={"Please select " + this.props.type}
                                  emptyText="No contacts"
                                  options={this.state.lookup.contacts}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <Grid>
                            {differentAddressCheckBox}
                            <GridCell width="1-1">
                                {addressSelection}
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>

            </Modal>
        );
    }
}