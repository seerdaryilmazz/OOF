import React from "react";
import _ from "lodash";
import uuid from "uuid";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {Chip} from 'susam-components/advanced';

import {LocationMap} from './LocationMap';
import {BasicMap} from './BasicMap';

import {PhoneNumbers} from './PhoneNumbers';
import {GooglePlacesSearch} from './GooglePlacesSearch';
import {PhoneNumberUtils} from 'susam-components/utils';

import {LocationService} from '../../../services/LocationService';
import {KartoteksService} from '../../../services/KartoteksService';

export class PlaceLocation extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            pins: {
                primary: {
                    name: "User", draggable: !this.props.readOnly, pinColor: "red",
                    dragend: (marker) => this.relocateCurrentPin(marker)
                },
            },
            polygon: {
                name: "UserPolygon", /*paths: [{lat: 40.774, lng: 27.190},
                    {lat: 40.466, lng: 27.918},
                    {lat: 41.321, lng: 26.757}],*/
                updateCoordinate: (paths) => this.reshapePolygonCoords(paths)

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
        state.pins.primary.position = state.place.location.pointOnMap || this.INITIAL_POSITION;
        state.polygon.paths = state.place.location.polygonPath;
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
        place.location.pointOnMap = pins.primary.position;

        this.setState({pins: pins, place: place});
    }

    reshapePolygonCoords(paths) {
        let polygon = this.state.polygon;

        if(polygon.paths == paths) {
            return;
        }

        polygon.paths = paths;

        let place = _.cloneDeep(this.state.place);
        place.location.polygonPath = paths;

        this.setState({polygon: polygon, place: place});
    }


    convertPhoneTypeCodeToObject(place) {
        let phoneNumbers = _.get(place, "establishment.phoneNumbers");
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
        let phoneNumbers = _.get(place, "establishment.phoneNumbers");
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
        place.location.googlePlaceId = result.id;
        place.location.googlePlaceUrl = result.url;
        if (!place.name && !place.localName) {
            place.name = result.name;
            place.localName = result.name;
        }
        place.establishment.address.country = result.country;
        place.location.pointOnMap = result.pointOnMap;
        place.establishment.address.streetAddress = result.address;
        if (result.phoneNumber) {
            let isNumberExists = false;
            place.establishment.phoneNumbers.forEach(item => {
                if (!item.phoneNumber.countryCode) {
                    item.phoneNumber.countryCode = result.phoneNumber.countryCode;
                }
                if (!item.phoneNumber.regionCode) {
                    item.phoneNumber.regionCode = result.phoneNumber.regionCode;
                }
                if (PhoneNumberUtils.format(item.phoneNumber) == PhoneNumberUtils.format(result.phoneNumber)) {
                    isNumberExists = true;
                }
            });
            if (!isNumberExists) {
                let phoneType = _.find(this.state.phoneTypes, {code: "PHONE"});
                let phone = {phoneType: phoneType, phoneNumber: result.phoneNumber};
                PhoneNumberUtils.setIsValid(phone.phoneNumber);
                if (place.establishment.phoneNumbers.length == 0) {
                    phone.default = true;
                }
                place.establishment.phoneNumbers.push(phone);
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

    handlePhoneCreate(item) {
        PhoneNumberUtils.setIsValid(item.phoneNumber);
        let place = _.cloneDeep(this.state.place);
        item._key = uuid.v4();
        place.establishment.phoneNumbers.push(item);
        this.setState({place: place});
    }

    handlePhoneDelete(item) {
        let place = _.cloneDeep(this.state.place);
        _.remove(place.establishment.phoneNumbers, {_key: item._key});
        this.setState({place: place});
    }

    handlePhoneUpdate(item) {
        PhoneNumberUtils.setIsValid(item.phoneNumber);
        let place = _.cloneDeep(this.state.place);
        let index = _.findIndex(place.establishment.phoneNumbers, {_key: item._key});
        if (index != -1) {
            place.establishment.phoneNumbers[index] = item;
        } else {
            console.warn("Can not find phone number with _key: " + JSON.stringify(item));
        }
        this.setState({place: place});
    }

    next() {
        return new Promise(
            (resolve, reject) => {
                if(!this.form.validate()) {
                    Notify.showError("There are eori problems");
                    reject();
                } else {
                    let place = _.cloneDeep(this.state.place);
                    this.convertPhoneTypeToCode(place);
                    this.props.handleSave && this.props.handleSave(place);
                    resolve(true);
                }
            });
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
        if (this.state.place.location.googlePlaceId) {
            return (
                <a className="md-btn md-btn-wave-light md-btn-icon waves-effect waves-button waves-light uk-align-right"
                   href={this.state.place.location.googlePlaceUrl} target="_blank">
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
                                                    <GridCell width="1-3" noMargin={true}>
                                                        {this.renderIsActiveCheckBox()}
                                                    </GridCell>
                                                    <GridCell width="1-3" noMargin={true}>
                                                        {this.renderGooglePlaceLink()}
                                                    </GridCell>
                                                </Grid>
                                            </GridCell>
                                            <GridCell width="1-1">
                                                <TextInput label="Name" required={true}  readOnly={this.props.readOnly}
                                                           value={this.state.place.name}
                                                           onchange={(value) => this.updateState("name", value)}/>
                                            </GridCell>
                                            <GridCell width="1-1">
                                                <TextInput label="Local Name" required={true}  readOnly={this.props.readOnly}
                                                           value={this.state.place.localName}
                                                           onchange={(value) => this.updateState("localName", value)}/>
                                            </GridCell>
                                            <GridCell width="1-2">
                                                <DropDown label="Country" required={true}  readOnly={this.props.readOnly}
                                                          options={this.state.countries}
                                                          valueField="iso"
                                                          value={_.get(this.state, "place.establishment.address.country.iso")}
                                                          onchange={(value) => this.updateState("establishment.address.country", value)}/>
                                            </GridCell>
                                            <GridCell width="1-1">
                                                <TextInput label="Address" required={true}  readOnly={this.props.readOnly}
                                                           value={this.state.place.establishment.address.streetAddress}
                                                           onchange={(value) => this.updateState("establishment.address.streetAddress", value)}/>
                                            </GridCell>
                                        </Grid>
                                    </Form>
                                </GridCell>
                                <GridCell width="1-1">
                                    <PhoneNumbers
                                        readOnly={this.props.readOnly}
                                        phoneTypes={this.state.phoneTypes}
                                        phoneNumbers={this.state.place.establishment.phoneNumbers}
                                        country={this.state.place.establishment.address.country}
                                        oncreate={(item) => this.handlePhoneCreate(item)}
                                        onupdate={(item) => this.handlePhoneUpdate(item)}
                                        ondelete={(item) => this.handlePhoneDelete(item)}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-2">
                    <LocationMap id="googlePlaceMap" height="600px"
                              dropPins={this.state.pins}
                              polygon={this.state.polygon}/>
                </GridCell>
                <GridCell width="1-1" hidden={this.props.readOnly}>
                    <GooglePlacesSearch query={this.state.place.name}
                                        locationPointOnMap={this.state.place.location.pointOnMap}
                                        matchedPlaceId={this.state.place.location.googlePlaceId}
                                        handleSearchResultSelect={(pointOnMap) => this.pinSearchResult(pointOnMap)}
                                        handleUseSearchResult={(place) => this.handleUseSearchResult(place)}/>
                </GridCell>
            </Grid>
        );
    }

}