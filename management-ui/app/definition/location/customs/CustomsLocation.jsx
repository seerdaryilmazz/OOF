import * as axios from "axios";
import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Checkbox, DropDown, Form, Notify, Span, TextInput } from 'susam-components/basic';
import { CardHeader, Grid, GridCell, Loader } from "susam-components/layout";
import { PhoneNumberUtils } from 'susam-components/utils';
import { KartoteksService } from '../../../services/KartoteksService';
import { LocationService } from '../../../services/LocationService';
import { PhoneNumberList } from '../phoneNumbers/PhoneNumberList';
import { GooglePlacesSearch } from '../place/GooglePlacesSearch';
import { LocationMap } from '../place/LocationMap';

export class CustomsLocation extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            pins: {
                primary: {
                    name: "User", draggable: !this.props.readOnly, pinColor: "red",
                    dragend: (marker) => this.relocateCurrentPin(marker)
                },
            }
        };
        this.INITIAL_POSITION = {lat: 40.97379, lng: 29.253641};
    }

    componentDidMount() {
        this.initialize(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {
        if (!props.place) {
            return;
        }
        let state = _.cloneDeep(this.state);
        state.place = _.cloneDeep(props.place);
        if(state.place.registrationCompanyId) {
            state.place.registrationCompany = {id: state.place.registrationCompanyId, name: state.place.registrationCompanyName};
        }
        if(state.place.registrationLocationId) {
            state.place.registrationLocation = {id: state.place.registrationLocationId, name: state.place.registrationLocationName};
        }
        this.convertPhoneTypeCodeToObject(state.place);
        state.pins.primary.position = state.place.pointOnMap || this.INITIAL_POSITION;
        this.setState(state);


    }

    initialize(props) {
        axios.all([
            LocationService.retrieveCountries(),
            KartoteksService.getPhoneTypeList()
        ]).then(axios.spread((countries, phoneTypes) => {
            this.setState({countries: countries.data, phoneTypes: phoneTypes.data}, () => this.initializeState(props));
        })).catch((error) => {
            Notify.showError(error);
        });
    }

    relocateCurrentPin(pin) {

        let pins = this.state.pins;

        let position = pin.getPosition();
        pins.primary.position = {lat: position.lat(), lng: position.lng()};

        let place = _.cloneDeep(this.state.place);
        place.pointOnMap = pins.primary.position;

        this.setState({pins: pins, place: place});
    }

    copyPlaceLocationToPin(){
        let pins = _.cloneDeep(this.state.pins);
        pins.primary.position = {lat: this.state.place.pointOnMap.lat, lng: this.state.place.pointOnMap.lng};
        this.setState({pins: pins});
    }

    convertPhoneTypeCodeToObject(place) {
        let phoneNumbers = _.get(place, "phoneNumbers");
        if (phoneNumbers) {
            phoneNumbers.forEach(item => {
                if (item.phoneType) {
                    item.phoneType = _.find(this.state.phoneTypes, {code: item.phoneType});
                    PhoneNumberUtils.setIsValid(item.phoneNumber);
                }
            });
        }
    }

    convertPhoneTypeToCode(place) {
        let phoneNumbers = _.get(place, "phoneNumbers");
        if (phoneNumbers) {
            phoneNumbers.forEach(item => {
                if (item.phoneType) {
                    item.phoneType = item.phoneType.code;
                }
            });
        }
    }

    updateState(key, value) {
        let place = _.cloneDeep(this.state.place);
        _.set(place, key, value);
        this.setState({place: place});
    }

    handleUseSearchResult(result) {
        let place = _.cloneDeep(this.state.place);
        place.googlePlaceId = result.id;
        place.googlePlaceUrl = result.url;
        if (!place.name && !place.localName) {
            place.name = result.name.toUpperCase();
            place.localName = result.name.toUpperCase();
        }
        place.country = result.country;
        if(this.props.showPostalCode){
            place.postalCode = result.postalCode.toUpperCase();
        }
        place.pointOnMap = result.pointOnMap;
        place.address = result.address;
        if (result.phoneNumber) {
            let isNumberExists = false;
            place.phoneNumbers.forEach(item => {
                if (!item.phoneNumber.countryCode) {
                    item.phoneNumber.countryCode = result.phoneNumber.countryCode;
                }
                if (!item.phoneNumber.regionCode) {
                    item.phoneNumber.regionCode = result.phoneNumber.regionCode;
                }
                if (PhoneNumberUtils.format(item.phoneNumber) === PhoneNumberUtils.format(result.phoneNumber)) {
                    isNumberExists = true;
                }
            });
            if (!isNumberExists) {
                let phoneType = _.find(this.state.phoneTypes, {code: "PHONE"});
                let phone = {phoneType: phoneType, phoneNumber: result.phoneNumber};
                PhoneNumberUtils.setIsValid(phone.phoneNumber);
                if (place.phoneNumbers.length === 0) {
                    phone.default = true;
                }
                place.phoneNumbers.push(phone);
                this.setState({place: place});
            }
        }
        this.setState({place: place}, () => this.setSearchPinAsCurrent());
    }
    setSearchPinAsCurrent() {
        if (!this.state.pins.secondary) {
            return;
        }
        let pins = _.cloneDeep(this.state.pins);
        pins.primary.position = pins.secondary.position;
        pins.secondary = null
        this.setState({pins: pins});
    }

    pinSearchResult(pointOnMap) {
        let pins = _.cloneDeep(this.state.pins);
        pins.secondary = {
            name: "Search", draggable: false, position: pointOnMap, pinColor: "blue"
        };

        this.setState({pins: pins});
    }

    handlePhoneNumbersChange(phoneNumbers) {
        let place = _.cloneDeep(this.state.place);
        place.phoneNumbers = phoneNumbers;
        this.setState({place: place});
    }

    validateQuadroCompanyCode() {
        let qcc = _.get(_.find(this.state.place.externalIds,{externalSystem:'QUADRO'}), 'externalId');
        return _.isEmpty(qcc) || new RegExp('^[0-9]{10}$').test(qcc);
    }

    handleSaveClick() {
        if(!this.validateQuadroCompanyCode() || !this.form.validate()) {
            Notify.showError("There are eori problems");
            return;
        } else {
            let place = _.cloneDeep(this.state.place);
            this.convertPhoneTypeToCode(place);
            this.props.onSave && this.props.onSave(place);
        }
    }
    handleCopyAddress(){
        let officeLocation = _.find(this.props.locations, {office: true});
        if(!officeLocation){
            Notify.showError("There is no office location");
            return;
        }
        let place = _.cloneDeep(this.state.place);
        place.country = officeLocation.country;
        place.postalCode = officeLocation.postalCode;
        place.address = officeLocation.address;
        place.pointOnMap = officeLocation.pointOnMap;
        place.googlePlaceId = officeLocation.googlePlaceId;
        place.googlePlaceUrl = officeLocation.googlePlaceUrl;
        this.setState({place: place}, () => this.copyPlaceLocationToPin());
    }
    handleCancelClick() {
        this.props.onCancel && this.props.onCancel();
    }

    renderIsActiveCheckBox() {

        if (this.props.readOnly) {

            let value = "";
            if (this.state.place.active) {
                value = "Active";
            } else {
                value = "Not Active";
            }
            return <Span label="Status" value={value}></Span>
        }
        else {
            return (
                <Checkbox label="Set as active" readOnly={this.props.readOnly}
                          value={this.state.place.active}
                          onchange={(value) => this.updateState("active", value)}/>
            )
        }
    }

    renderGooglePlaceLink(){
        if (this.state.place.googlePlaceId) {
            return (
                <a className="md-btn md-btn-wave-light md-btn-icon waves-effect waves-button waves-light uk-align-right"
                   href={this.state.place.googlePlaceUrl} target="_blank">
                    <i className="uk-icon-check"/>
                    {super.translate("Google Places")}
                </a>
            );
        }
        return null;
    }

    render() {
        if (!this.state.place || !this.state.countries) {
            return <Loader title="Fetching location data"/>;
        }
        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Location"/>
                </GridCell>
                <GridCell width="1-2" noMargin={true}>
                    <Grid>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-1" noMargin={true}>
                                    <Form ref={(c) => this.form = c}>
                                        <Grid>
                                            <GridCell width="1-1" noMargin={true}>
                                                <Grid>
                                                    <GridCell width="1-4" noMargin={true}>
                                                        {this.renderIsActiveCheckBox()}
                                                    </GridCell>
                                                    <GridCell width="1-4" noMargin={true}>
                                                        <Checkbox label = "Office Location"
                                                                  value = {this.state.place.office}
                                                                  onchange = {(value) => this.updateState("office", value)} />
                                                    </GridCell>
                                                    <GridCell width="1-4" noMargin={true}>
                                                        <Button label="copy office address" size = "small" flat = {true} style = "success"
                                                                onclick = {() => this.handleCopyAddress()} />
                                                    </GridCell>
                                                    <GridCell width="1-4" noMargin={true}>
                                                        {this.renderGooglePlaceLink()}
                                                    </GridCell>
                                                </Grid>
                                            </GridCell>
                                            <GridCell width="1-1">
                                                <TextInput label="Name" required={true} readOnly={this.props.readOnly} uppercase = {true}
                                                           value={this.state.place.name}
                                                           onchange={(value) => this.updateState("name", value)}/>
                                            </GridCell>
                                            <GridCell width="1-1">
                                                <TextInput label="Local Name" readOnly={this.props.readOnly} uppercase = {true}
                                                           value={this.state.place.localName}
                                                           onchange={(value) => this.updateState("localName", value)}/>
                                            </GridCell>
                                            <GridCell width="1-2">
                                                <DropDown label="Country" required={true} readOnly={this.props.readOnly}
                                                          options={this.state.countries}
                                                          valueField="iso"
                                                          value={_.get(this.state, "place.country.iso")}
                                                          onchange={(value) => this.updateState("country", value)}/>
                                            </GridCell>
                                            <GridCell width="1-2">
                                                <TextInput label="Postal Code" required={true} readOnly={this.props.readOnly}
                                                           value={_.get(this.state, "place.postalCode")} uppercase = {true}
                                                           onchange={(value) => this.updateState("postalCode", value)}/>
                                            </GridCell>
                                            <GridCell width="1-1">
                                                <TextInput label="Address" required={true}  readOnly={this.props.readOnly}
                                                           value={this.state.place.address}
                                                           onchange={(value) => this.updateState("address", value)}/>
                                            </GridCell>
                                            <GridCell width="1-2">
                                                <TextInput label="Quadro Company Code" uppercase = {true}
                                                            validationGroup="quadroCompanyCode"
                                                            danger={!this.validateQuadroCompanyCode()}
                                                            mask="'mask': '9', 'repeat': 10, 'greedy' : false"
                                                            helperText="Quadro Company Code consists of 10 numbers."
                                                            value={_.get(_.find(this.state.place.externalIds,{externalSystem:'QUADRO'}), 'externalId')}
                                                            onchange={(value) => this.updateState("externalIds", value ?[{externalSystem:'QUADRO', externalId: value}]:[])}
                                                            maxLength = "10"/>
                                            </GridCell>
                                        </Grid>
                                    </Form>
                                </GridCell>
                                <GridCell width="1-1">
                                    <PhoneNumberList
                                        readOnly = {this.props.readOnly}
                                        phoneTypes={this.state.phoneTypes}
                                        phoneNumbers={this.state.place.phoneNumbers}
                                        country={this.state.place.country}
                                        onChange={(phoneNumbers) => this.handlePhoneNumbersChange(phoneNumbers)} />
                                </GridCell>
                                <GridCell width = "1-1">
                                    <div className = "uk-align-right">
                                            <Button label="Cancel" size = "small"
                                                    onclick = {() => this.handleCancelClick()} />
                                            <Button label="Save" size = "small" style = "primary"
                                                    onclick = {() => this.handleSaveClick()} />
                                    </div>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-2">
                    <LocationMap id="googlePlaceMap" height="600px"
                                 dropPins={this.state.pins}/>
                </GridCell>
                <GridCell width="1-1" hidden={this.props.readOnly}>
                    <GooglePlacesSearch query={this.state.place.name}
                                        locationPointOnMap={this.state.place.pointOnMap}
                                        matchedPlaceId={this.state.place.googlePlaceId}
                                        handleSearchResultSelect={(pointOnMap) => this.pinSearchResult(pointOnMap)}
                                        handleUseSearchResult={(place) => this.handleUseSearchResult(place)}/>
                </GridCell>
            </Grid>
        );
    }

}