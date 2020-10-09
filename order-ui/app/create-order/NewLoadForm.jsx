import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Form, DropDown, TextInput, Button, Checkbox} from 'susam-components/basic';
import {Modal, Card, Grid, GridCell, CardSubHeader} from 'susam-components/layout';
import {DateTime, TimeRange, CurrencyInput, DateWithTimeRange} from 'susam-components/advanced';
import {Table} from 'susam-components/table';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {Wizard} from 'susam-components/layout';

import {OrderImportInfo} from './customs/OrderImportInfo';
import {OrderExportInfo} from './customs/OrderExportInfo';
import {OrderEuropeanInfo} from './customs/OrderEuropeanInfo';

export class NewLoadForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {load: {}};
        this.state.load.differentLoadAddress = false;
        this.state.load.differentUnloadAddress = false;
    }
    
    clearState(){
        let state = _.cloneDeep(this.state);
        state.senderContacts = null;
        state.senderLocations = null;
        state.receiverContacts = null;
        state.receiverLocations = null;
        this.setState(state);
    }

    getAdrClasses() {
        return axios.get('/order-service/lookup/adr-class/');
    }

    componentDidMount() {
        axios.all([this.getAdrClasses()])
            .then(axios.spread((adrClassesResponse) => {
                let state = _.cloneDeep(this.state);
                state.adrClasses = adrClassesResponse.data.map( elem => {
                    return (
                        {id: elem.id, name: elem.code + " - " + elem.name}
                    );
                }

                );
                this.setState(state);
            })).catch((error) => {
            console.log(error);
        });
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.load && nextProps.load.sender){
            this.loadCompanyDetails(nextProps.load.sender, (contactsResponse, locationsResponse) => {
                let state = _.cloneDeep(this.state);
                state.senderContacts = contactsResponse.data;
                state.senderLocations = locationsResponse.data;
                this.setState(state);
            }, (error) => {
                console.log(error);
                let state = _.cloneDeep(this.state);
                state.senderContacts = null;
                state.senderLocations = null;
                this.setState(state);
            });    
        }
        if(nextProps.load && nextProps.load.receiver){
            this.loadCompanyDetails(nextProps.load.receiver, (contactsResponse, locationsResponse) => {
                let state = _.cloneDeep(this.state);
                state.receiverContacts = contactsResponse.data;
                state.receiverLocations = locationsResponse.data;
                this.setState(state);
            }, (error) => {
                console.log(error);
                let state = _.cloneDeep(this.state);
                state.receiverContacts = null;
                state.receiverLocations = null;
                this.setState(state);
            });
        }
        let state = _.cloneDeep(this.state);
        if(nextProps.load){
            state.load = nextProps.load;
        }
        this.setState(state);
    }

    handleValueChange(field, value){
        let state = _.cloneDeep(this.state);
        state.load[field] = value;
        this.setState(state);
    }

    handleSave(){
        this.props.onsave && this.props.onsave(this.state.load);
        this.clearState();
    }

    handleClose(){
        this.props.onclose && this.props.onclose();
    }

    getCompanyContacts(companyId) {
        return axios.get('/kartoteks-service/company/' + companyId + '/contacts');
    }

    getCompanyLocations(companyId) {
        return axios.get('/kartoteks-service/company/' + companyId + '/locations');
    }

    loadCompanyDetails(selectedItem, callback, errorCallback){
        axios.all([this.getCompanyContacts(selectedItem.id), this.getCompanyLocations(selectedItem.id)])
            .then(axios.spread((contactsResponse, locationsResponse) => {
                callback(contactsResponse, locationsResponse);
            })).catch((error) => {
            errorCallback && errorCallback(error);
            console.log(error);
        });
    }

    handleSenderSelect(selectedItem) {
        this.handleValueChange("sender", selectedItem);
        this.loadCompanyDetails(selectedItem, (contactsResponse, locationsResponse) => {
            let state = _.cloneDeep(this.state);
            state.senderContacts = contactsResponse.data;
            state.senderLocations = locationsResponse.data;
            this.setState(state);
        });
    }
    handleLoaderSelect(selectedItem) {
        this.handleValueChange("loadCompany", selectedItem);
        this.loadCompanyDetails(selectedItem, (contactsResponse, locationsResponse) => {
            let state = _.cloneDeep(this.state);
            state.loaderContacts = contactsResponse.data;
            state.loaderLocations = locationsResponse.data;
            this.setState(state);
        });
    }
    handleUnloaderSelect(selectedItem){
        this.handleValueChange("unloadCompany", selectedItem);
        this.loadCompanyDetails(selectedItem, (contactsResponse, locationsResponse) => {
            let state = _.cloneDeep(this.state);
            state.unloaderContacts = contactsResponse.data;
            state.unloaderLocations = locationsResponse.data;
            this.setState(state);
        });
    }

    handleLocationSelect(field, value){
        let state = _.cloneDeep(this.state);
        state.load[field] = value;
        this.setState(state);
        this.determineTradeType(state);
    }
    
    handleReceiverSelect(selectedItem){
        this.handleValueChange("receiver", selectedItem);
        this.loadCompanyDetails(selectedItem, (contactsResponse, locationsResponse) => {
            let state = _.cloneDeep(this.state);
            state.receiverContacts = contactsResponse.data;
            state.receiverLocations = locationsResponse.data;
            this.setState(state);
        });
    }
    show(){
        this.newLoadForm.open();
    }
    hide(){
        this.newLoadForm.close();
    }

    handleLoadInfoSubmit(e){
        if(this.state.tradeType && this.state.tradeType.id == "NONE"){
            UIkit.notify("Unknown trade type", {status:'danger'});
            return false;
        }
        return true;

    }

    determineTradeType(state){
        let loadAddressId = "";
        let unloadAddressId = "";

        if(!state.load.differentLoadAddress) {
            loadAddressId = state.load.loadAddress ? state.load.loadAddress.id : "";
        }else{
            loadAddressId = state.load.loadAddressDifferent ? state.load.loadAddressDifferent.id : "";
        }
        if(!state.load.differentUnloadAddress) {
            unloadAddressId = state.load.unloadAddress ? state.load.unloadAddress.id : "";
        }else{
            unloadAddressId = state.load.unloadAddressDifferent ? state.load.unloadAddressDifferent.id : "";
        }
        if(loadAddressId && unloadAddressId){
            axios.get('/order-service/lookup/trade-type/by-src-and-dest-location?sourceLocationId=' + loadAddressId + '&destinationLocationId=' + unloadAddressId)
                .then((response) =>{
                    let state = _.cloneDeep(this.state);
                    state.tradeType = response.data;
                    this.setState(state);
                }).catch((error) => {
                console.log(error);
            });
        }

    }


    getSenderElem(data) {
        return (
            <Grid>
                <GridCell width="2-5">
                    <CompanySearchAutoComplete label="Sender"
                                               required={true}
                                               value = {data.sender}
                                               onchange={(selectedItem) => this.handleSenderSelect(selectedItem)}/>
                </GridCell>
                <GridCell width="1-5">
                    <DropDown label="Contact Person" required={true}
                              onchange={(value) => this.handleValueChange("senderContactPerson", value)}
                              value={data.senderContactPerson}
                              labelField="fullname"
                              uninitializedText="Please select sender"
                              emptyText="No contacts"
                              options={this.state.senderContacts}/>
                </GridCell>
                <GridCell width="2-5"/>
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="1-1">
                            <Checkbox label = "Use load address from a different company" value = {this.state.load.differentLoadAddress}
                                      onchange = {(value) => this.handleValueChange("differentLoadAddress", value)}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <Grid hidden = {this.state.load.differentLoadAddress}>
                                <GridCell width="2-5">
                                    <DropDown label="Load Address" required={true}
                                              onchange={(value) => this.handleLocationSelect("loadAddress", value)}
                                              uninitializedText="Please select sender"
                                              emptyText="No locations"
                                              value={data.loadAddress}
                                              options={this.state.senderLocations}/>
                                </GridCell>
                                <GridCell width="1-5">
                                    <DropDown label="Load Address Contact Person" required={true}
                                              onchange={(value) => this.handleValueChange("loadAddressContactPerson", value)}
                                              value={data.loadAddressContactPerson}
                                              labelField="fullname"
                                              uninitializedText="Please select sender"
                                              emptyText="No contacts"
                                              options={this.state.senderContacts}/>
                                </GridCell>
                                <GridCell width="2-5"/>
                            </Grid>
                            <Grid hidden = {!this.state.load.differentLoadAddress}>
                                <GridCell width="2-5">
                                    <CompanySearchAutoComplete label="Load Company"
                                                               required={true}
                                                               value = {data.loadCompany}
                                                               onchange={(selectedItem) => this.handleLoaderSelect(selectedItem)}/>
                                </GridCell>
                                <GridCell width="2-5">
                                    <DropDown label="Load Address" required={true}
                                              onchange={(value) => this.handleLocationSelect("loadAddressDifferent", value)}
                                              uninitializedText="Please select load company"
                                              emptyText="No locations"
                                              value={data.loadAddressDifferent}
                                              options={this.state.loaderLocations}/>
                                </GridCell>
                                <GridCell width="1-5">
                                    <DropDown label="Load Address Contact Person" required={true}
                                              onchange={(value) => this.handleValueChange("loadAddressDifferentContactPerson", value)}
                                              value={data.loadAddressDifferentContactPerson}
                                              labelField="fullname"
                                              uninitializedText="Please select load company"
                                              emptyText="No contacts"
                                              options={this.state.loaderContacts}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>

                </GridCell>


                <GridCell width="4-10">
                    <TextInput label="Load No" onchange={(value) => this.handleValueChange("loadNo", value)}
                               value={data.loadNo} />
                </GridCell>
                <GridCell width="5-10">
                        <DateWithTimeRange label="Load Appointment Date" format="DD/MM/YYYY"
                                  onchange={(value) => this.handleValueChange("loadAppointment", value)}
                                  value={data.loadAppointment} />


                </GridCell>
                <GridCell width="1-10"></GridCell>
            </Grid>
        );
    }

    getReceiverElem(data) {
        return (
            <Grid>
                <GridCell width="2-5">
                    <CompanySearchAutoComplete label="Receiver"
                                               value = {data.receiver}
                                               required={true}
                                               onchange={(selectedItem) => this.handleReceiverSelect(selectedItem)}/>
                </GridCell>
                <GridCell width="1-5">
                    <DropDown label="Contact Person" required={true}
                              onchange={(value) => this.handleValueChange("receiverContactPerson", value)}
                              value={data.receiverContactPerson}
                              labelField="fullname"
                              uninitializedText="Please select receiver"
                              emptyText="No contacts"
                              options={this.state.receiverContacts}/>
                </GridCell>
                <GridCell width="2-5"></GridCell>
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="1-1">
                            <Checkbox label = "Use unload address from a different company" value = {this.state.load.differentUnloadAddress}
                                      onchange = {(value) => this.handleValueChange("differentUnloadAddress", value)}/>
                        </GridCell>
                        <GridCell width="1-1">
                            <Grid hidden = {this.state.load.differentUnloadAddress}>
                                <GridCell width="2-5">
                                    <DropDown label="Unload Address" required={true}
                                              onchange={(value) => this.handleLocationSelect("unloadAddress", value)}
                                              value={data.unloadAddress}
                                              uninitializedText="Please select receiver"
                                              emptyText="No locations"
                                              options={this.state.receiverLocations}/>
                                </GridCell>
                                <GridCell width="1-5">
                                    <DropDown label="Unload Address Contact Person" required={true}
                                              onchange={(value) => this.handleValueChange("unloadAddressContactPerson", value)}
                                              value={data.unloadAddressContactPerson}
                                              labelField="fullname"
                                              uninitializedText="Please select receiver"
                                              emptyText="No contacts"
                                              options={this.state.receiverContacts}/>
                                </GridCell>
                                <GridCell width="2-5"></GridCell>
                            </Grid>
                            <Grid hidden = {!this.state.load.differentUnloadAddress}>
                                <GridCell width="2-5">
                                    <CompanySearchAutoComplete label="Unload Company"
                                                               required={true}
                                                               value = {data.unloadCompany}
                                                               onchange={(selectedItem) => this.handleUnloaderSelect(selectedItem)}/>
                                </GridCell>
                                <GridCell width="2-5">
                                    <DropDown label="Unload Address" required={true}
                                              onchange={(value) => this.handleLocationSelect("unloadAddressDifferent", value)}
                                              uninitializedText="Please select unload company"
                                              emptyText="No locations"
                                              value={data.unloadAddressDifferent}
                                              options={this.state.unloaderLocations}/>
                                </GridCell>
                                <GridCell width="1-5">
                                    <DropDown label="Unload Address Contact Person" required={true}
                                              onchange={(value) => this.handleValueChange("unloadAddressDifferentContactPerson", value)}
                                              value={data.unloadAddressDifferentContactPerson}
                                              labelField="fullname"
                                              uninitializedText="Please select unload company"
                                              emptyText="No contacts"
                                              options={this.state.unloaderContacts}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </GridCell>


                <GridCell width="4-10">
                    <TextInput label="Unload No" onchange={(value) => this.handleValueChange("unloadNo", value)}
                               value={data.unloadNo} />
                </GridCell>
                <GridCell width="5-10">
                    <DateWithTimeRange label="Unload Appointment" format="DD/MM/YYYY"
                              onchange={(value) => this.handleValueChange("unloadAppointment", value)}
                              value={data.unloadAppointment} />
                </GridCell>
                <GridCell width="1-10"></GridCell>
            </Grid>
        );
    }

    getOrderDetails(data) {
        let loadWorth = data.loadWorth;
        if(!loadWorth){
            loadWorth = {};
        }
        return (
            <Grid>
                <GridCell width="2-5">
                    <DateTime label="Ready Date" format="DD/MM/YYYY"
                              onchange={(value) => this.handleValueChange("readyDate", value)}
                              value={data.readyDate} />
                    </GridCell>
                <GridCell width="3-5"/>
                <GridCell width="2-5">
                    <DropDown label="ADR Class" required={true}
                              onchange={(value) => this.handleValueChange("adrClass", value)}
                              value={data.adrClass}
                              options={this.state.adrClasses}/>
                </GridCell>
                <GridCell width="2-5">
                    <DropDown label="Certificated Load" required={true}
                              onchange={(value) => this.handleValueChange("certificatedLoad", value)}
                              value={data.certificatedLoad}
                              options={[{id:"1",name:"Opt 1"},{id:"0",name:"Opt 2"}]}/>
                </GridCell>

                <GridCell width="2-5">
                    <CurrencyInput required = {true} label = "Amount"
                                   value = {loadWorth}
                                   onchange = {(value) =>  this.handleValueChange("loadWorth", value)}/>
                </GridCell>
                <GridCell width="2-5">
                    <DropDown label="Special Load" required={true}
                              onchange={(value) => this.handleValueChange("specialLoad", value)}
                              value={data.specialLoad}
                              options={[{id:"1",name:"Opt 1"},{id:"0",name:"Opt 2"}]}/>
                </GridCell>
            </Grid>
        );
    }

    render() {
        let senderElem = this.getSenderElem(this.state.load);
        let receiverElem = this.getReceiverElem(this.state.load);
        let orderDetails = this.getOrderDetails(this.state.load);

        let tradeInfoElem = "";
        if(this.state.tradeType){
            if(this.state.tradeType.id == "EXPORT"){
                tradeInfoElem = <OrderExportInfo/>;
            }else if(this.state.tradeType.id == "IMPORT"){
                tradeInfoElem = <OrderImportInfo/>;
            }else if(this.state.tradeType.id == "EU"){
                tradeInfoElem = <OrderEuropeanInfo/>;
            }else{
                tradeInfoElem = <Grid><GridCell width="1-1" >Trade type unknown</GridCell></Grid>
            }
        }
        return (
            <Modal ref={(c) => this.newLoadForm = c} large={true} title="New Load"
                   actions = {[{label:"Close", action:() => this.handleClose()},
                       {label:"Save", buttonStyle:"primary", action:() => this.handleSave()}]}>
                <Wizard steps = {[{title:"Load Details", onNextClick: (e) => this.handleLoadInfoSubmit(e)},{title:"Trade Info"}]} >
                    <div>
                        <CardSubHeader title="Sender" />
                        {senderElem}
                        <CardSubHeader title="Receiver" />
                        {receiverElem}
                        <CardSubHeader title="Load Info" />
                        {orderDetails}
                    </div>
                    {tradeInfoElem}
                </Wizard>
            </Modal>
        );
    }

}