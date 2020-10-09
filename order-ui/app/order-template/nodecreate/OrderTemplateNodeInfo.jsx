import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown } from 'susam-components/basic';
import { Grid, GridCell } from 'susam-components/layout';
import { CompanySearchAutoComplete, HSCodeAutoComplete } from 'susam-components/oneorder';



export class OrderTemplateNodeInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            lookups: {},
            data: {},
            loadAddressSelected:false

        };
    }

    getServiceTypes() {
        return axios.get('/order-service/lookup/service-type');
    }

    getTruckLoadTypes() {
        return axios.get('/order-service/lookup/truck-load-type');
    }

    getPackageTypes() {
        return axios.get('/order-service/lookup/package-type');
    }

    getCertificates() {
        return axios.get('/order-service/lookup/hscode');
    }

    getAdrs() {
        return axios.get('/order-service/lookup/adr-class');
    }
    getCompanyLocations(companyId) {
        return axios.get('/kartoteks-service/company/' + companyId + '/locations');
    }
    componentDidMount() {
        axios.all([this.getServiceTypes(),
            this.getTruckLoadTypes(),
                KartoteksService.getCountries(), this.getPackageTypes(), this.getCertificates(), this.getAdrs()])
            .then(axios.spread((serviceType, loadTypes, country, packageType, certificate, adr) => {
                let state = _.cloneDeep(this.state);
                state.lookups.serviceTypes = serviceType.data;
                state.lookups.loadTypes = loadTypes.data;
                state.lookups.countries = country.data.map(c => { return ({id: c.id, code: c.phoneCode, name:c.countryName});});
                state.lookups.fromCountries = state.lookups.countries,
                state.lookups.toCountries=state.lookups.countries,
                state.lookups.packageTypes = packageType.data;
                state.lookups.certificates = certificate.data;
                state.lookups.adrs = adr.data;
                this.setState(state);
            })).catch((error) => {
            UIkit.notify("An Error Occured");
            console.log("Error:" + error);
            console.log(error);
        });

    }

    handleDataChange(field, value){

        this.state.data[field]=value;

        this.props.dataChangeHandler && this.props.dataChangeHandler(field, this.state.data[field]);

    }

    handleFromCountryChange(field, value, label){
        this.handleDataChange(field, value, label);
        if(this.state.lookups.loaderLocations ){

            let state = _.cloneDeep(this.state);

            let filteredLoc= state.lookups.loaderLocations.filter((loc)=>{
                value.code=loc.postaladdress.country.phoneCode;
            });
            if(filteredLoc){
                state.data.loaderLocations = filteredLoc;
                state.data.loadAddress = filteredLoc[0];
            }else{
                UIkit.notify("There is no loading address in the selected country!", {status:'danger'});
                return false;
            }

            this.setState(state);


        }
    }

    handleToCountryDataChange(field, value, label){
        this.handleDataChange(field, value, label);
        if(this.state.lookups.unloaderLocations ){

            let state = _.cloneDeep(this.state);
            let filteredLoc= state.lookups.unloaderLocations.filter((loc)=>{
                value.code=loc.postaladdress.country.phoneCode;
            });
            if(filteredLoc){
                state.data.unloaderLocations = filteredLoc;
                state.data.unloadAddress = filteredLoc[0];
            }else{
                UIkit.notify("There is no loading address in the selected country!", {status:'danger'});
                return false;
            }


            this.setState(state);


        }

    }

    handleLoaderSelect(field,value,label) {
        this.handleDataChange(field, value, label);

        this.loadCompanyLocations(value, ( locationsResponse) => {


            let state = _.cloneDeep(this.state);


            if(state.data.FROMCOUNTRY) {
                state.lookups.loaderLocations = locationsResponse.data.filter((item)=> {
                    state.data.selectedLoadAddressCountryCode = item.postaladdress.country.phoneCode;
                    return item.postaladdress.country.phoneCode == this.state.data.FROMCOUNTRY.code;
                });
            }else{
                state.lookups.loaderLocations = locationsResponse.data;
            }

            if(state.lookups.loaderLocations.length==0){
                UIkit.notify("There is no loading address in the selected country!", {status:'danger'});
                return false
            } else {
                state.lookups.loaderLocations = state.lookups.loaderLocations.filter(loc => {
                    loc.code = loc.id;
                    return loc;
                });
            }
            this.setState(state);

        });
    }
    handleUnloaderDataChange(field,value,label){
        this.handleDataChange(field,value,label);
        this.loadCompanyLocations(value, ( locationsResponse) => {


            let state = _.cloneDeep(this.state);


            if(state.data.TOCOUNTRY) {
                state.lookups.unloaderLocations = locationsResponse.data.filter((item)=> {
                    item.code = item.id;
                    state.data.selectedUnLoadAddressCountryCode = item.postaladdress.country.phoneCode;
                    return item.postaladdress.country.phoneCode == this.state.data.TOCOUNTRY.code;
                });
            }else{
                state.lookups.unloaderLocations = locationsResponse.data;
            }

            if(state.lookups.unloaderLocations.length==0){
                UIkit.notify("There is no unloading address in the selected country!", {status:'danger'});
                return false
            } else {
                state.lookups.unloaderLocations = state.lookups.unloaderLocations.filter(loc => {
                    loc.code = loc.id;
                    return loc;
                });
            }
            this.setState(state);

        });
    }

    loadCompanyLocations(selectedItem, callback, errorCallback){
        axios.all([ this.getCompanyLocations(selectedItem.id)])
            .then(axios.spread(( locationsResponse) => {

                callback( locationsResponse);
            })).catch((error) => {
            errorCallback && errorCallback(error);
            console.log(error);
        });
    }
    handleLocationSelect(field, value){
        let state = this.state;
        state.data[field] = value;

        if(field=="LOADADDRESS"&& !state.data.FROMCOUNTRY) {
            let filteredCountries = state.lookups.fromCountries.filter(country => {
                return country.code == value.postaladdress.country.phoneCode;
             });
            if(filteredCountries){
                state.lookups.fromCountries = filteredCountries;
                this.handleDataChange("FROMCOUNTRY", filteredCountries[0]);

            }
        }
        if(field=="UNLOADADDRESS" && !state.data.TOCOUNTRY){
            let filteredCountries = state.lookups.toCountries.filter(country => {
                return country.code == value.postaladdress.country.phoneCode;
            });
            if(filteredCountries){
                state.lookups.toCountries = filteredCountries;
                this.handleDataChange("TOCOUNTRY", filteredCountries[0]);

            }
        }
        this.handleDataChange(field, value);
        this.setState(state);

    }

    render() {

        let data = this.state.data;
        let lookups = this.state.lookups;

        return (
            <div>
                <Grid>
                    <GridCell width="1-2">
                        <CompanySearchAutoComplete label="Customer: "
                                                   value={data.CUSTOMER}
                                                   onchange={(value) => {value.code=value.id;
                                                   this.handleDataChange("CUSTOMER", value)}}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={(value) => this.props.handleRedirectForParamTemplate("CUSTOMER")} size ="small" iconColorClass="md-color-yellow-A200"/>
                    </GridCell>

                    <GridCell width="1-2">
                        <DropDown label="Service Type" options={lookups.serviceTypes}
                                  value={data.SERVICETYPE}
                                  onchange={(value) => this.handleDataChange("SERVICETYPE", value)} />
                    </GridCell>
                    <GridCell width="1-2">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("SERVICETYPE")} size ="small" iconColorClass="md-color-light-green-A700"/>
                    </GridCell>
                    <GridCell width="1-2">
                        <DropDown label="Load Type" options={lookups.loadTypes}
                                  value={data.LOADTYPE}
                                  onchange={(value) => this.handleDataChange("LOADTYPE", value)}  />
                    </GridCell>
                    <GridCell width="1-2">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("LOADTYPE")} size ="small" iconColorClass="md-color-pink-400"/>
                    </GridCell>
                    <GridCell width="1-2">
                        <DropDown label="Country (From): " options={lookups.fromCountries}
                                  value={data.FROMCOUNTRY}
                                  onchange={(value) => this.handleFromCountryChange("FROMCOUNTRY", value)}  />
                    </GridCell>
                    <GridCell width="1-2">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("FROMCOUNTRY")} size ="small" iconColorClass="md-color-deep-purple-A200"/>
                    </GridCell>
                    <GridCell width="1-2">
                        <DropDown label="Country (To): " options={lookups.countries}
                                  value={data.TOCOUNTRY}
                                  onchange={(value) => this.handleToCountryDataChange("TOCOUNTRY", value)}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("TOCOUNTRY")} size ="small" iconColorClass="md-color-purple-A700"/>
                    </GridCell>
                    <GridCell width="1-2">
                        <DropDown label="Container: " options={lookups.packageTypes}
                                  value={data.PACKAGETYPE}
                                  onchange={(value) => this.handleDataChange("PACKAGETYPE", value)}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("PACKAGETYPE")} size ="small" iconColorClass="md-color-teal-A700"/>
                    </GridCell>
                    <GridCell width="1-2">
                        <CompanySearchAutoComplete label="Sender Company: "
                                                   value={data.SENDERCOMPANY}
                                                   onchange={(value) => {value.code=value.id; this.handleDataChange("SENDERCOMPANY", value)}}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("SENDERCOMPANY")} size ="small" iconColorClass="md-color-pink-300"/>
                    </GridCell>

                    <GridCell width="1-2">
                        <CompanySearchAutoComplete label="Load Company: "
                                                   value={data.LOADCOMPANY}
                                                   onchange={(value) => {value.code=value.id; this.handleLoaderSelect("LOADCOMPANY", value)}}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("LOADCOMPANY")} size ="small" iconColorClass="md-color-deep-orange-400"/>
                    </GridCell>
                    <GridCell width="3-4">
                                 <DropDown label="Load Address" required={true}
                                  onchange={(value) => this.handleLocationSelect("LOADADDRESS", value)}
                                  uninitializedText="Please select load company"
                                  emptyText="No locations"
                                  value={data.LOADADDRESS}
                                  options={lookups.loaderLocations}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("LOADADDRESS")} size ="small" iconColorClass="md-color-deep-orange-200"/>
                    </GridCell>
                    <GridCell width="1-2">
                        <CompanySearchAutoComplete label="Consignee: "
                                                   value={data.RECEIVERCOMPANY}
                                                   onchange={(value) => {value.code=value.id; this.handleDataChange("RECEIVERCOMPANY", value)}}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("RECEIVERCOMPANY")} size ="small" iconColorClass="md-color-cyan-A200"/>
                    </GridCell>
                    <GridCell width="1-2">
                        <CompanySearchAutoComplete label="Unload Company: "
                                                   value={data.UNLOADCOMPANY}
                                                   onchange={(value) => {value.code=value.id; this.handleUnloaderDataChange("UNLOADCOMPANY", value)}}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("UNLOADCOMPANY")} size ="small" iconColorClass="md-color-amber-700"/>
                    </GridCell>
                    <GridCell width="3-4">
                        <DropDown label="Unload Address" required={true}
                                  onchange={(value) => this.handleLocationSelect("UNLOADADDRESS", value)}
                                  uninitializedText="Please select unload company"
                                  emptyText="No locations"
                                  value={data.UNLOADADDRESS}
                                  options={lookups.unloaderLocations}/>
                    </GridCell>
                    <GridCell width="1-4">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("UNLOADADDRESS")} size ="small" iconColorClass="md-color-amber-200"/>
                    </GridCell>
                    <GridCell width="1-2">
                        <HSCodeAutoComplete label="Certificate: "
                                                   value={data.CERTIFICATE}
                                                   onchange={(value) => {value.code=value.id; this.handleDataChange("CERTIFICATE", value)}}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("CERTIFICATE")} size ="small" iconColorClass="md-color-purple-A700"/>
                    </GridCell>
                    <GridCell width="1-2">
                        <DropDown label="ADR: " options={lookups.adrs}
                                  value={data.ADR}
                                  onchange={(value) => this.handleDataChange("ADR", value)}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <Button label="" style="flat" waves={true} icon="square uk-icon-medium"
                                onclick={() => this.props.handleRedirectForParamTemplate("ADR")} size ="small" iconColorClass="md-color-red-A200"/>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}

OrderTemplateNodeInfo.contextTypes = {
    translator: React.PropTypes.object
};