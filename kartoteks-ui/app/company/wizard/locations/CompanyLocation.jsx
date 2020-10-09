import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Checkbox, DropDown, Form, Notify, TextInput } from 'susam-components/basic';
import { Alert, CardHeader, Grid, GridCell, Loader } from "susam-components/layout";
import uuid from "uuid";
import { CompanyService, LookupService } from '../../../services/KartoteksService';
import { PhoneNumberUtils, StringUtils } from '../../../utils/';
import { BasicMap } from './BasicMap';
import { CompanyLocationUpdateList } from './CompanyLocationUpdateList';
import * as Addresses from './config/';
import { GoogleComponentsReader } from './config/GooglePlaceResult';
import { GooglePlacesSearch } from './GooglePlacesSearch';
import { LocationPhoneNumbers } from './LocationPhoneNumbers';

export class CompanyLocation extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
        this.addressConfigs = Addresses.AddressConfig;
    }

    componentDidMount(){
        this.initializeLookups();
        this.initializeState(this.props);
        if(this.props.location.postaladdress){
            if(this.props.location.postaladdress.pointOnMap){
                this.validateMarkerPosition(this.props.location.postaladdress.pointOnMap.lat, this.props.location.postaladdress.pointOnMap.lng);
            }else{
                this.findInitialLatLng(this.props.location.postaladdress.country.countryName);
            }
        }
        if(!this.props.location.shortName){
            this.generateShortName(this.props.location);
        }
    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
    }

    initializeState(props){
        let state = _.cloneDeep(this.state);
        state.showUpdateList = props.showUpdateList;
        state.location = props.location;
        state.location.oldName = state.location.name;
        state.addressConfig = this.selectAddressConfig(_.get(props.location, 'postaladdress.country.iso'));
        state.location.phoneNumbers.forEach(i=>PhoneNumberUtils.setIsValid(i.phoneNumber));
        this.setState(state);
    }

    selectAddressConfig(countryCode){
        let addressConfig = this.addressConfigs[countryCode];
        if(!addressConfig){
            addressConfig = this.addressConfigs.DEFAULT;
        }
        return addressConfig;
    }

    isNew(){
        return (this.props.mode || "").startsWith("NewCompany");
    }

    isTemp(){
        return this.state.location.id && !this.state.location.temp;
    }

    isReadOnly(){
        return this.isNew() && this.isTemp();
    }

    findInitialLatLng(countryName){
        CompanyService.searchCountry(countryName).then(response => {
            let position = {lat: 0, lng: 0};
            if(response.data.status === "OK"){
                let countryResult = _.find(response.data.results, item => {
                    return _.indexOf(item.types, "country") != -1;
                });
                if (countryResult) {
                    position = countryResult.geometry.location;
                }
                this.updateState("postaladdress.pointOnMap", position);
                this.validateMarkerPosition(position.lat, position.lng);
            }else{
                Notify.showError('Google country lookup failed, Google returned status: ' + response.data.status);
                console.error(response.data.error_message);
            }
        }).catch(error => {
            Notify.showError(error);
        })
    }

    initializeLookups(){
        LookupService.getCountryList().then(response => {
            let state = _.cloneDeep(this.state);
            state.countries = response.data;
            state.euCountries = _.filter(response.data, {euMember: true});
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    validate(){
        let formIsValid = this.form.validate();
        let postalCodeValid = !(this.state.correctPostalCode && this.state.correctPostalCode != this.state.location.postaladdress.postalCode);
        let phoneNumbersAreValid = true;
        this.state.location.phoneNumbers.forEach(item => {
            if(!item.phoneNumber._valid){
                Notify.showError("Phone number " + PhoneNumberUtils.format(item.phoneNumber) + " is not valid");
                phoneNumbersAreValid = false;
            }
        });

        return formIsValid && phoneNumbersAreValid && postalCodeValid;
    }
    handleUseGooglePlaceMap(place){
        let location = _.cloneDeep(this.state.location);
        location.googlePlaceId = place.id;
        location.googlePlaceUrl = place.url;
        location.postaladdress.pointOnMap = place.pointOnMap;
        if(place.postalCode){
            location.postaladdress.postalCode = place.postalCode;
        }
        location.postaladdress.formattedAddress = this.state.addressConfig.formattedAddress(location.postaladdress);
        this.setState({location: location, correctPostalCode: place.postalCode});
    }
    handleUseGooglePlace(place){
        let location = _.cloneDeep(this.state.location);

        location.googlePlaceId = place.id;
        location.googlePlaceUrl = place.url;
        location.postaladdress.country = _.find(this.state.countries, {iso: place.countryCode});

        let locale = location.postaladdress.country ? location.postaladdress.country.language : null;
        location.postaladdress.region = StringUtils.toUpperCaseWithLocale(place.region, locale);
        location.postaladdress.city = StringUtils.toUpperCaseWithLocale(place.city, locale);
        location.postaladdress.district = StringUtils.toUpperCaseWithLocale(place.district, locale);
        location.postaladdress.streetName = StringUtils.toUpperCaseWithLocale(place.streetName, locale);
        location.postaladdress.pointOnMap = place.pointOnMap;
        if(place.postalCode){
            location.postaladdress.postalCode = StringUtils.toUpperCaseWithLocale(place.postalCode, locale);
        }
        location.postaladdress.formattedAddress = this.state.addressConfig.formattedAddress(location.postaladdress);

        if(place.phoneNumber){
            let isNumberExists = false;
            location.phoneNumbers.forEach(item => {
                if(!item.phoneNumber.countryCode){
                    item.phoneNumber.countryCode = place.phoneNumber.countryCode;
                }
                if(!item.phoneNumber.regionCode){
                    item.phoneNumber.regionCode = place.phoneNumber.regionCode;
                }
                if(PhoneNumberUtils.format(item.phoneNumber) == PhoneNumberUtils.format(place.phoneNumber)){
                    isNumberExists = true;
                }
          
            });
            
            if(!isNumberExists){
                LookupService.getPhoneTypeList().then(response => {
                    let phoneType = _.find(response.data, {code:"PHONE"});
                    let phone = {numberType: phoneType, phoneNumber: place.phoneNumber};
                    phone.default = true;
                    PhoneNumberUtils.setIsValid(phone.phoneNumber);
                    location.phoneNumbers.push(phone);
                    this.setState({location: location});          
                }).catch(error => {
                    Notify.showError(error);
                });
            }
        }
        this.setState({location: location, correctPostalCode: place.postalCode}, () => this.generateShortName(location));
    }

    updateState(key, value, callback){
        let location = _.cloneDeep(this.state.location);
        _.set(location, key, value);
        location.postaladdress.formattedAddress = this.state.addressConfig.formattedAddress(location.postaladdress);
        if(callback){
            this.setState({location: location}, callback);
        } else{
            this.setState({location: location});
        }
    }
    updateCountry(value){
        let state = _.cloneDeep(this.state);
        state.location.postaladdress.country = value;
        if(value){
            state.addressConfig = this.selectAddressConfig(value.iso);
            state.location.postaladdress.formattedAddress = state.addressConfig.formattedAddress(state.location.postaladdress);
        }
        this.setState(state);
    }

    validateMarkerPosition(lat, lng){
        this.setState({correctPostalCode: null});
        CompanyService.reverseGeocode(lat, lng).then(response => {
            if (response.data.status === 'OK') {
                let postalCode = GoogleComponentsReader.read(response.data.results[0].address_components, "postal_code");
                if(!postalCode) {
                    Notify.showError("There is no postal code information");
                }else{
                    this.setState({correctPostalCode: postalCode});
                }

            } else {
                Notify.showError('Postal code lookup failed, Google returned status: ' + status);
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }

    resolveTimezone(point, success){
        CompanyService.timezone(point.lat, point.lng).then(response => {
            if (response.data.status === 'OK') {
                let timezone = response.data.timeZoneId;
                if(timezone){
                    success(timezone);
                } else{
                    success(null);
                }
            }
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleMarkerDragEnd(marker){
        let position = marker.getPosition();
        this.validateMarkerPosition(position.lat(), position.lng());
        this.updateState("postaladdress.pointOnMap", {lat: position.lat(), lng: position.lng()});
    }

    handleCancelClick(){
        this.props.oncancel && this.props.oncancel();
    }
    handleUndoClick(){
        this.initializeState(this.props);
    }

    handleSaveClick(){
        if(this.state.showUpdateList && this.updateList.hasPendingItems()){
            Notify.showError("Please complete all items in update list");
            return;
        }
        if(!this.validate()){
            Notify.showError("There are validation errors");
            return;
        }

        this.setState({busy: true});
        this.resolveTimezone(this.state.location.postaladdress.pointOnMap, (timezone)=>{
            this.updateState("timezone", timezone, ()=>{
                CompanyService.validateLocation(this.state.location).then(response => {
                    this.props.onsave && this.props.onsave(this.state.location);
                }).catch(error => {
                    Notify.showError(error);
                    this.setState({busy: false});
                });
            });
        })
        
    }
    handlePhoneCreate(item){
        PhoneNumberUtils.setIsValid(item.phoneNumber);
        let location = _.cloneDeep(this.state.location);
        item._key = uuid.v4();
        location.phoneNumbers.push(item);
        this.setState({location: location});
    }
    handlePhoneDelete(item){
        let location = _.cloneDeep(this.state.location);
        _.remove(location.phoneNumbers, {_key: item._key});
        this.setState({location: location});
    }
    handlePhoneUpdate(item){
        PhoneNumberUtils.setIsValid(item.phoneNumber);
        let location = _.cloneDeep(this.state.location);
        let index = _.findIndex(location.phoneNumbers, {_key: item._key});
        if(index != -1){
            location.phoneNumbers[index] = item;
        }else{
            console.warn("Can not find phone number with _key: " + JSON.stringify(item));
        }
        this.setState({location: location});
    }

    handleUpdateFromUpdateList(items){
        items.forEach(item => {
            this.updateState(item.fieldToCopy, item.valueToCopy);
            if(item.fieldToCopy == "postaladdress.pointOnMap"){
                this.validateMarkerPosition(item.valueToCopy.lat, item.valueToCopy.lng);
            }
        });
    }
    handleUndoUpdateFromUpdateList(items){
        items.forEach(item => {
            this.updateState(item.fieldToCopy, item.valueToUndo);
            if(item.fieldToCopy == "postaladdress.pointOnMap"){
                this.validateMarkerPosition(item.valueToCopy.lat, item.valueToCopy.lng);
            }
        });
    }

    handleGenerateShortNameClick(location){
        if(!(location.postaladdress.city || location.postaladdress.district)){
            Notify.showError("Please select city and district first");
            return;
        }
        this.generateShortName(location);
    }

    generateShortName(location){
        if(!(location.postaladdress.city || location.postaladdress.district)){
            return;
        }
        CompanyService.generateLocationShortName(location.id,
            this.props.companyShortName,
            location.postaladdress.city,
            location.postaladdress.district,
            this.props.otherLocationNames).then(response => {
            this.updateState("shortName", response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render(){
        if(!this.state.location){
            return <Loader title="Fetching location data"/>;
        }
        if(this.state.busy){
            return <Loader title="Validating location"/>;
        }
        
        let matchedGooglePlace = null;
        if(this.state.location.googlePlaceId){
            matchedGooglePlace = <a className="md-btn md-btn-wave-light md-btn-icon waves-effect waves-button waves-light uk-align-right"
                                    href = {this.state.location.googlePlaceUrl} target="_blank">
                <i className="uk-icon-check"/>
                {super.translate("Google Places")}
            </a>;
        }
        let updateList = "";
        if(this.state.showUpdateList){
            updateList = <GridCell width="1-1">
                <CompanyLocationUpdateList ref = {(c) => this.updateList = c}
                                           onupdate = {(items) => this.handleUpdateFromUpdateList(items)}
                                           onundo = {(items) => this.handleUndoUpdateFromUpdateList(items)}
                                           current = {this.state.location}
                                           updated = {this.props.locationToMerge}
                                           original = {this.props.locationOriginal ? this.props.locationOriginal : _.cloneDeep(this.props.location)}/>
            </GridCell>;
        }

        let addressComponent = null;
        if(this.state.addressConfig){
            let errors = {};
            if(this.state.correctPostalCode && this.state.correctPostalCode != this.state.location.postaladdress.postalCode){
                errors.postalCode = [{code: "markerMismatch", message: "Marker position have " + this.state.correctPostalCode + " as postal code"}];
            }
            addressComponent = React.cloneElement(this.state.addressConfig.component(), {
                location: this.state.location,
                errors: errors,
                readOnly: this.isReadOnly(),
                onupdate: (key, value) => this.updateState(key, value)
            })
        }

        let locale = this.state.location.postaladdress.country ? this.state.location.postaladdress.country.language :  (this.state.location.company ? this.state.location.company.country : null);

        return (
            <Grid>
                {updateList}
                {(this.props.mode || "").startsWith("NewCompany") ? this.renderGooglePlacesSearch() : null}
                <GridCell width="1-1">
                    <CardHeader title="Location Information"/>
                </GridCell>
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-1" noMargin = {true}>
                                    <Form ref = {(c) => this.form = c}>
                                        <Grid>
                                            <GridCell width="1-1">
                                                <Grid>
                                                    <GridCell width="1-3" noMargin = {true}>
                                                        <Checkbox label="Set as active" value = {this.state.location.active} onchange = {(value) => this.updateState("active", value)} disabled={this.isReadOnly()}/>
                                                    </GridCell>
                                                    <GridCell width="1-3" noMargin = {true}>
                                                        {(!this.isNew() || this.isTemp()) && <Checkbox label="Set as default" value = {this.state.location.default} onchange = {(value) => this.updateState("default", value)} disabled={this.isReadOnly()}/> }
                                                    </GridCell>
                                                    <GridCell width="1-3" noMargin = {true}>
                                                        {matchedGooglePlace}
                                                    </GridCell>
                                                </Grid>
                                            </GridCell>
                                            <GridCell width="1-2">
                                                <TextInput label="Name" required = {true} uppercase = {{locale: locale}}
                                                           value = {this.state.location.name} readOnly={this.isReadOnly()}
                                                           onchange = {(value) => this.updateState("name", value)} />
                                            </GridCell>
                                            <GridCell width="1-2">
                                                <TextInput label="Short Name" required = {true} uppercase = {{locale: locale}}
                                                           value = {this.state.location.shortName} readOnly={this.isReadOnly()}
                                                           onchange = {(value) => this.updateState("shortName", value)} maxLength = {30}
                                                           button = {{style:"success",
                                                               label: "generate",
                                                               onclick: () => {this.handleGenerateShortNameClick(this.state.location)}}
                                                           }/>
                                            </GridCell>
                                            <GridCell width="1-1">
                                                <DropDown label="Country" required = {true}
                                                          options = {this.state.countries} labelField = "countryName" valueField="iso"
                                                          translate={true} readOnly={this.isReadOnly()}
                                                          postTranslationCaseConverter={1}
                                                          value = {this.state.location.postaladdress.country}
                                                          onchange = {(value) => this.updateCountry(value)} />
                                            </GridCell>
                                            <GridCell width="1-1" noMargin = {true}>
                                                {addressComponent}
                                            </GridCell>
                                        </Grid>
                                    </Form>
                                </GridCell>

                                <GridCell width="1-1">
                                    <LocationPhoneNumbers phoneNumbers = {this.state.location.phoneNumbers}
                                                          country = {this.state.location.postaladdress.country}
                                                          oncreate = {(item) => this.handlePhoneCreate(item)}
                                                          onupdate = {(item) => this.handlePhoneUpdate(item)}
                                                          ondelete = {(item) => this.handlePhoneDelete(item)}/>
                                </GridCell>
                                <GridCell width="1-1">
                                    <div className="uk-align-right">
                                    <div className="uk-align-right">
                                        <Button label="cancel" waves = {true} style="danger" onclick = {() => this.handleCancelClick()}/>
                                    </div>
                                        <Button label="Ok" style= "danger" waves = {true} style = "primary" onclick = {() => this.handleSaveClick()}/>
                                    </div>
                                   
                                
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-2">
                            {this.renderConfirmedMapPositionMessage()}
                            {this.renderGoogleMaps()}
                        </GridCell>
                    </Grid>
                </GridCell>
                {(this.props.mode || "").startsWith("NewCompany") ? null : this.renderGooglePlacesSearch()}
            </Grid>
        );
    }
    renderConfirmedMapPositionMessage(){
        if(this.state.location.pointOnMapConfirmed){
            return <Alert type = "warning" message = "Map position of this location is confirmed and can not be changed" />;
        }
        return null;
    }
    renderGoogleMaps(){
        let locationMap = null;
        if(this.state.location.postaladdress.pointOnMap){
            locationMap = <BasicMap id={uuid.v4()}
                                    map = {{zoom: 16, disableDefaultUI: true, center: this.state.location.postaladdress.pointOnMap}}
                                    dropPins = {[{name:"1", draggable: !this.state.location.pointOnMapConfirmed, position: this.state.location.postaladdress.pointOnMap,
                                        dragend: (marker) => this.handleMarkerDragEnd(marker)}]}/>;
        }

        return locationMap;
    }
    renderGooglePlacesSearch(){
        if(this.state.location.pointOnMapConfirmed){
            return null;
        }
        if(this.isReadOnly()){
            return null;
        }
        return(
            <GridCell width="1-1">
                <GooglePlacesSearch query = {this.state.location.name}
                                    country={this.state.location.postaladdress.country}
                                    addressConfig = {this.state.addressConfig}
                                    locationPointOnMap = {this.state.location.postaladdress.pointOnMap}
                                    matchedPlaceId = {this.state.location.googlePlaceId}
                                    onuse = {(place) => this.handleUseGooglePlace(place)}
                                    onusemap = {(place) => this.handleUseGooglePlaceMap(place)}/>
            </GridCell>
        );
    }
}