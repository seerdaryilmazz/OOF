import * as axios from "axios";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Checkbox, Form, Notify, ReadOnlyDropDown } from 'susam-components/basic';
import { Card, CardHeader, Grid, GridCell } from 'susam-components/layout';
import { CountryDropDown, CountryPointDropDown } from '../common';
import { LocationService, LookupService } from '../services';
import { ObjectUtils, QuoteUtils } from "../utils";

const CLEARANCE_RESPONSIBLE_CUSTOMER = ObjectUtils.enumHelper("CUSTOMER");

export class Customs extends TranslatingComponent {

    static defaultProps = {
        customs: {
            departure: {},
            arrival: {}
        }
    };

    state = {
        departure: {},
        arrival: {},
        showCustomsLocationForArrival: false,
        showCustomsLocationForDeparture: false
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.checkCustomsLocations();
        this.determineOperationType(this.props.product).then(result=>{
            this.initializeLookups(result.operation);
        });
    }

    checkCustomsLocations(customs = this.props.customs) {
        if (_.isEmpty(_.get(customs,'departure.location')) && !_.isEmpty(_.get(customs,'departure.customsLocationCountry'))) {
            this.setState({ showCustomsLocationForDeparture: true });
        }

        if (_.isEmpty(_.get(customs,'arrival.location')) && !_.isEmpty(_.get(customs,'arrival.customsLocationCountry'))) {
            this.setState({ showCustomsLocationForArrival: true });
        }
    }

    componentWillReceiveProps(nextProps) {
        let nextIncoterm = nextProps.product.incoterm;
        let equalIncoterm = _.isEqual(nextIncoterm, this.props.product.incoterm);
        let deliveryTypeChanged = this.isDeliveryTypeChanged(nextProps);
        let toPointChanged = this.isToPointChanged(nextProps);

        this.isCountryChanged(nextProps).then(result => {
            if (result) {
                this.checkCustomsLocations(nextProps.customs);
                return this.determineOperationType(nextProps.product);
            } else {
                return Promise.resolve({operation: this.state.operation});
            }
        }).then(result => {
            let {operation, operationChanged} = result;
            if (operationChanged && !operation) {
                this.props.onChange(undefined);
                return
            }
            if (operationChanged || !equalIncoterm) {
                this.initializeLookups(operation, nextProps);
            } 
            if (operation && (deliveryTypeChanged || toPointChanged)) {
                this.handleCustomsOfficeChange('arrival', null);
            }
        })
            // adjust customs locations
        if (!nextProps.readOnly && this.props.readOnly) {
            this.retrieveCustomsLocations(nextProps.customs, 'departure');
            this.retrieveCustomsLocations(nextProps.customs, 'arrival');
        } else {
            if ((nextProps.customs.departure.clearanceType || {}).id !== (this.props.customs.departure.clearanceType || {}).id ||
                (nextProps.customs.departure.office || {}).id !== (this.props.customs.departure.office || {}).id) {
                this.retrieveCustomsLocations(nextProps.customs, 'departure');
            }

            if ((nextProps.customs.arrival.clearanceType || {}).id !== (this.props.customs.arrival.clearanceType || {}).id ||
                (nextProps.customs.arrival.office || {}).id !== (this.props.customs.arrival.office || {}).id) {
                this.retrieveCustomsLocations(nextProps.customs, 'arrival');
            }
        }
    }

    isCountryChanged(nextProps) {
        return new Promise((resolve, reject)=>{
            let nextFromCountry = _.get(nextProps.product.fromCountry, 'iso');
            let fromCountry = _.get(this.props.product.fromCountry, 'iso');

            let nextToCountry = _.get(nextProps.product.toCountry, 'iso');
            let toCountry = _.get(this.props.product.toCountry, 'iso');
            let changed = !_.isEqual(nextFromCountry, fromCountry) || !_.isEqual(nextToCountry, toCountry);
            resolve(changed);
        });
    }

    isDeliveryTypeChanged(nextProps) {
        return (nextProps.product.deliveryType && this.props.product.deliveryType) &&
            nextProps.product.deliveryType.code !== this.props.product.deliveryType.code;
    }

    isToPointChanged(nextProps) {
        return (nextProps.product && this.props.product &&
            nextProps.product.toPoint && this.props.product.toPoint &&
            nextProps.product.toPoint.id != this.props.product.toPoint.id);
    }

    determineOperationType(product) {
        this.retrieveCustomsOffices();
        return new Promise((resolve, reject) => {
            QuoteUtils.determineProductOperation(product).then(operation =>{
                if("IMPORT" === operation){
                    this.setState(prevState => {
                        prevState.showCustomsLocationForArrival = false;
                        return prevState;
                    });
                }
                this.setState(prevState=>({
                                    operation:operation, 
                                    operationChanged: prevState.operation!==operation
                                }), ()=>resolve({operation: operation, operationChanged: this.state.operationChanged}));
            }).catch(error=>{
                Notify.showError(error);
                reject(error);
            });
        });
    }

    initializeLookups(operation, props = this.props) {
        if (operation) {
            axios.all([
                LookupService.getClearanceResponsibles('DEPARTURE', operation, props.product.incoterm),
                LookupService.getClearanceResponsibles('ARRIVAL', operation, props.product.incoterm),
                LookupService.getCustomsClearanceTypes('DEPARTURE', operation),
                LookupService.getCustomsClearanceTypes('ARRIVAL', operation),
            ]).then(axios.spread((depClearanceResponsibles, arrClearanceResponsibles, depCustomsClearanceTypes, arrCustomsClearanceTypes) => {
                let customs = _.cloneDeep(props.customs);
                if (!props.readOnly) {
                    let depClearanceResponsible = ObjectUtils.getSingleItem(depClearanceResponsibles.data); 
                    if (!depClearanceResponsible && _.find(depClearanceResponsibles.data, props.customs.departure.clearanceResponsible)) {
                        depClearanceResponsible = props.customs.departure.clearanceResponsible;
                    }
                    
                    let arrClearanceResponsible = ObjectUtils.getSingleItem(arrClearanceResponsibles.data); 
                    if (!arrClearanceResponsible && _.find(arrClearanceResponsibles.data, props.customs.arrival.clearanceResponsible)) {
                        arrClearanceResponsible = props.customs.arrival.clearanceResponsible;
                    }
                    customs.departure.clearanceResponsible = depClearanceResponsible;
                    customs.arrival.clearanceResponsible = arrClearanceResponsible;
                }

                if (!props.customs.departure.clearanceType) {
                    customs.departure.clearanceType = _.find(depCustomsClearanceTypes.data, { code: "STANDARD" });
                }
                if (!props.customs.arrival.clearanceType) {
                    customs.arrival.clearanceType = _.find(arrCustomsClearanceTypes.data, { code: "STANDARD" });
                }
                this.setState(prevState => {
                    prevState.departure.customsClearanceTypes = depCustomsClearanceTypes.data;
                    prevState.arrival.customsClearanceTypes = arrCustomsClearanceTypes.data;
                    prevState.departure.clearanceResponsibles = depClearanceResponsibles.data;
                    prevState.arrival.clearanceResponsibles = arrClearanceResponsibles.data;
                    return prevState;
                }, () => this.props.onChange(customs));
            })).catch(error => Notify.showError(error));
        }
    }

    handleChange(key, value) {
        let customs = _.cloneDeep(this.props.customs);
        _.set(customs, key, value);
        this.props.onChange(customs);
    }

    handleClearanceTypeChange(activity, clearanceType) {
        let customs = _.cloneDeep(this.props.customs);
        let customsActivity = _.get(customs, activity);
        customsActivity.clearanceType = clearanceType;
        customsActivity.office = null;
        customsActivity.location = null;
        customsActivity.customsLocationCountry = null;
        customsActivity.customsLocationPostal = null;
        if (customsActivity.clearanceType && 'WAREHOUSE' !== customsActivity.clearanceType.source) {
            customsActivity.customsLocationCountry = activity === 'departure' ? this.props.product.fromCountry : this.props.product.toCountry;
            customsActivity.customsLocationPostal = activity === 'departure' ? this.props.product.fromPoint : this.props.product.toPoint;
        }
        this.props.onChange(customs);
    }

    handleCustomsOfficeChange(activity, customsOffice) {
        let customs = _.cloneDeep(this.props.customs);
        _.set(customs, `${activity}.office`, customsOffice)
        _.set(customs, `${activity}.location`, null)
        this.props.onChange(customs);
    }

    handleCustomsLocationCountryChange(activity, key, value) {
        let customs = _.cloneDeep(this.props.customs);
        let customsActivity = _.get(customs, activity);
        _.set(customsActivity, key, value);
        customsActivity.location = null;
        this.props.onChange(customs);
    }

    handleCustomsLocationChange(activity, value) {
        let customs = _.cloneDeep(this.props.customs);
        let customsActivity = _.get(customs, activity);
        customsActivity.location = value;
        customsActivity.customsLocationCountry = _.get(value, 'customsLocationCountry');
        customsActivity.customsLocationPostal = _.get(value, 'customsLocationPostal');
        this.props.onChange(customs);
    }

    retrieveCustomsLocations(customs, activity) {
        let clearanceType = _.get(customs, activity).clearanceType;
        let customsOffice = _.get(customs, activity).office;
        if (clearanceType && clearanceType.onlyLocation) {
            if ('WAREHOUSE' === clearanceType.source) {
                this.retrieveWarehouses(clearanceType, activity);
            } else {
                this.setState(prevState => {
                    _.set(prevState, `${activity}.locations`, [])
                    _.set(prevState, `${activity}.showCheckbox`, true);
                    return prevState;
                })
            }
        } else if (customsOffice) {
            this.retrieveWarehouses(clearanceType, activity, customsOffice);
        } else {
            this.setState(prevState => {
                _.set(prevState, `${activity}.locations`, [])
                return prevState;
            })
        }
    }

    retrieveWarehouses(clearanceType, activity, customsOffice) {
        let customsOfficeId = customsOffice ? customsOffice.id : null;
        let countryCode, point;
        if ('IMPORT' === this.state.operation && 'arrival' === activity) {
            if (this.props.product.deliveryType &&
                this.props.product.deliveryType.code === 'CUSTOMS_ADDRESS') {
                countryCode = this.props.product.toCountry.iso;
                point = (this.props.product.toPoint || {}).name;
            }
        }
        LocationService.retrieveWarehouses(clearanceType.ownerType, clearanceType.customsType, clearanceType.companyType, customsOfficeId, countryCode, point).then(response => {
            let warehouses = [];
            response.data.forEach(warehouse => {
                let displayName = warehouse.location.name + " (" + warehouse.establishment.address.country.iso + " - " + warehouse.establishment.address.postalCode + ")";
                warehouses.push({
                    id: warehouse.location.id,
                    name: displayName,
                    location: warehouse.location,
                    customsLocationCountry: { iso: warehouse.establishment.address.country.iso, name: warehouse.establishment.address.country.name },
                    customsLocationPostal: { id: warehouse.establishment.address.postalCode.substring(0, 2), name: warehouse.establishment.address.postalCode.substring(0, 2) },
                    company: warehouse.company
                });
            });
            this.setState(prevState => {
                _.set(prevState, `${activity}.locations`, warehouses)
                _.set(prevState, `${activity}.showCheckbox`, false);
                return prevState;
            });
        }).catch(error => {
            this.setState(prevState => {
                _.set(prevState, `${activity}.locations`, [])
                return prevState;
            });
            Notify.showError(error);
        });
    }

    retrieveCustomsOffices() {
        LocationService.retrieveCustomsOffices().then(response => {
            let freeZoneCustomsOffices = [];
            let nonFreeZoneCustomsOffices = [];
            response.data.filter(i=>i.active).forEach(customsOffice => {
                customsOffice.name = customsOffice.shortName;
                if (customsOffice.freeZone) {
                    freeZoneCustomsOffices.push(customsOffice);
                } else {
                    nonFreeZoneCustomsOffices.push(customsOffice);
                }
            });
            this.setState({ freeZoneCustomsOffices: freeZoneCustomsOffices, nonFreeZoneCustomsOffices: nonFreeZoneCustomsOffices });
        }).catch(error => {
            console.log(error);
        });
    }

    validate() {
        if (this.form) {
            return this.form.validate();
        }
        return true;
    }

    renderDepartureInfo() {
        let customsOffice, customsLocation, customsLocationCheckbox = null;
        if ('EXPORT' === this.state.operation) {
            let customsOffices = this.state.nonFreeZoneCustomsOffices;
            if (this.props.customs.departure.clearanceType &&
                this.props.customs.departure.clearanceType.source === 'FREEZONE') {
                customsOffices = this.state.freeZoneCustomsOffices;
            } else if (this.props.customs.departure.clearanceType &&
                this.props.customs.departure.clearanceType.source === 'FREEZONE,NON_FREEZONE') {
                customsOffices = _.unionWith(this.state.nonFreeZoneCustomsOffices, this.state.freeZoneCustomsOffices, (x, y) => x.id === y.id)
            }
            if (_.isEmpty(this.props.customs.departure.clearanceResponsible)) {
                this.props.customs.departure.clearanceResponsible = CLEARANCE_RESPONSIBLE_CUSTOMER;
            }
            customsOffice = <GridCell width="1-4">
                <ReadOnlyDropDown options={customsOffices} label="Customs Office"
                    value={this.props.customs.departure.office}
                    required={true} readOnly={this.props.readOnly}
                    onchange={value => this.handleCustomsOfficeChange("departure", value) } />
            </GridCell>
        }
        else if ('IMPORT' === this.state.operation || 'NON_TURKEY' === this.state.operation) {
            customsLocation = this.renderCustomsLocation("departure");
            customsLocationCheckbox = <Checkbox label="Another Location"
                value={this.state.showCustomsLocationForDeparture}
                disabled={this.props.readOnly || this.state.departure.showCheckbox}
                onchange={(e) => {
                    this.toggleCustomLocationView("Departure", e)
                }} />
        }
        return (
            <div>
                <h3 className="heading_a" style={{ fontSize: "12px", fontWeight: "bold", textDecoration: "underline", color: "#1976d2" }}>
                    {super.translate('DEPARTURE')}
                </h3>
                <Grid>
                    <GridCell width="1-4">
                        <ReadOnlyDropDown options={this.state.departure.clearanceResponsibles} label="Clearance Responsible"
                            value={this.props.customs.departure.clearanceResponsible}
                            required={true} readOnly={this.props.readOnly}
                            translate={true}
                            onchange={(value) => this.handleChange("departure.clearanceResponsible", value)} />
                    </GridCell>
                    <GridCell width="1-4">
                        <ReadOnlyDropDown options={this.state.departure.customsClearanceTypes} label="Customs Clearance Type"
                            value={this.props.customs.departure.clearanceType}
                            required={true} readOnly={this.props.readOnly}
                            translate={true}
                            onchange={(value) => this.handleClearanceTypeChange("departure", value)} />
                    </GridCell>
                    {customsOffice}
                    {customsLocation}
                    <GridCell width="1-4">
                        {customsLocationCheckbox}
                    </GridCell>
                </Grid>
            </div>
        );
    }

    renderArrivalInfo() {
        let customsOffice, customsLocationCheckBox = null;

        if ('IMPORT' === this.state.operation) {
            let customsOffices = this.state.nonFreeZoneCustomsOffices;
            if (this.props.customs.arrival.clearanceType &&
                this.props.customs.arrival.clearanceType.source === 'FREEZONE') {
                customsOffices = this.state.freeZoneCustomsOffices;
            }
            customsOffice = <GridCell width="1-4">
                <ReadOnlyDropDown options={customsOffices} label="Customs Office"
                    value={this.props.customs.arrival.office}
                    required={true} readOnly={this.props.readOnly}
                    onchange={value => this.handleCustomsOfficeChange("arrival", value)} />
            </GridCell>
        }
        else {
            customsLocationCheckBox = <Checkbox label="Another Location"
                value={this.state.showCustomsLocationForArrival}
                disabled={this.props.readOnly || this.state.arrival.showCheckbox}
                onchange={(e) => {
                    this.toggleCustomLocationView("Arrival", e)
                }} />
        }

        return (
            <div>
                <h3 className="heading_a" style={{ fontSize: "12px", fontWeight: "bold", textDecoration: "underline", color: "#1976d2" }}>
                    {super.translate('ARRIVAL')}
                </h3>
                <Grid>
                    <GridCell width="1-4">
                        <ReadOnlyDropDown options={this.state.arrival.clearanceResponsibles} label="Clearance Responsible"
                            value={this.props.customs.arrival.clearanceResponsible}
                            required={true} readOnly={this.props.readOnly}
                            translate={true}
                            onchange={(value) => this.handleChange("arrival.clearanceResponsible", value)} />
                    </GridCell>
                    <GridCell width="1-4">
                        <ReadOnlyDropDown options={this.state.arrival.customsClearanceTypes} label="Customs Clearance Type"
                            value={this.props.customs.arrival.clearanceType}
                            required={true} readOnly={this.props.readOnly}
                            translate={true}
                            onchange={(value) => this.handleClearanceTypeChange("arrival", value)} />
                    </GridCell>
                    {customsOffice}
                    {this.renderCustomsLocation("arrival")}
                    <GridCell width="1-4">
                        {customsLocationCheckBox}
                    </GridCell>
                </Grid>
            </div>
        );
    }

    renderCustomsLocation(origin) {
        let originCapitalized = origin.charAt(0).toUpperCase() + origin.slice(1);
        {/*let customsLocation = <ReadOnlyDropDown options = {_.get(this.state, `${origin}.locations`)} label="Customs Location"
                                                                                  value = {_.get(this.props.customs,`${origin}.location`)}
                                                                                  readOnly={this.props.readOnly}
                                                                                  onchange = {(value) => this.handleCustomsLocationChange(origin, value)} /> */}
        let customsLocation = <ReadOnlyDropDown options={_.isEmpty(_.get(this.state, `${origin}.locations`)) ? [{ id: "", name: "" }] : _.get(this.state, `${origin}.locations`)}
            label="Customs Location"
            value={_.get(this.props.customs, `${origin}.location`)}
            required={"IMPORT" === this.state.operation && "arrival" === origin &&
                "CUSTOMER_ADDRESS" === _.get(this.props.product, "deliveryType.code")
                && !["FREE_ZONE", "CUSTOMS_CLEARANCE_PARK", "CUSTOMER_CUSTOMS_WAREHOUSE"].includes(_.get(this.props.customs, "arrival.clearanceType.code"))}
            readOnly={this.props.readOnly}
            onchange={(value) => this.handleCustomsLocationChange(origin, value)} />;

        let customLocationCountry = <CountryDropDown placeholder="Country"
            value={_.get(this.props.customs, `${origin}.customsLocationCountry`)}
            translate={true}
            valueField="iso"
            readOnly={this.props.readOnly || _.get(this.state, `${origin}.showCheckbox`)}
            onchange={(value) => this.handleCustomsLocationCountryChange(origin, "customsLocationCountry", value)} />

        let customLocationPostal = <CountryPointDropDown placeholder="Postal Code"
            multiple={false}
            country={_.get(this.props.customs, `${origin}.customsLocationCountry`)}
            type="POSTAL"
            value={_.get(this.props.customs, `${origin}.customsLocationPostal`)}
            translate={true}
            readOnly={this.props.readOnly || _.get(this.state, `${origin}.showCheckbox`)}
            onchange={(value) => this.handleCustomsLocationCountryChange(origin, "customsLocationPostal", value)} />

        return (
            <GridCell width="1-4">
                {!_.get(this.state, `showCustomsLocationFor${originCapitalized}`)
                    ? customsLocation
                    : <Grid collapse={true}>
                        <GridCell noMargin={true}>
                            <div className="md-input-wrapper md-input-filled">
                                <label> {super.translate('Customs Location')} </label>
                            </div>
                        </GridCell>
                        <GridCell width="1-2" noMargin={true}>
                            {customLocationCountry}
                        </GridCell>
                        <GridCell width="1-2" noMargin={true}>
                            {customLocationPostal}
                        </GridCell>
                    </Grid>}
            </GridCell>
        );
    }

    toggleCustomLocationView(activity, e) {
        let toBeRenderedParams = {};
        let showCustomsLocation = "showCustomsLocationFor" + activity;
        _.set(toBeRenderedParams, showCustomsLocation, e);

        let customs = _.cloneDeep(this.props.customs);
        let customsActivity = _.get(customs, activity.toLowerCase());
        customsActivity.location = null;
        customsActivity.customsLocationCountry = null;
        customsActivity.customsLocationPostal = null;
        this.props.onChange(customs);

        this.setState(toBeRenderedParams);
    }

    render() {
        if (!this.state.operation) {
            return null;
        }
        return (
            <Form ref={c => this.form = c}>
                <Card>
                    <CardHeader title="Customs Information" />
                    <Grid>
                        <GridCell>
                            {this.renderDepartureInfo()}
                        </GridCell>
                        <GridCell>
                            {this.renderArrivalInfo()}
                        </GridCell>
                    </Grid>
                </Card>
            </Form>
        );
    }
}
Customs.contextTypes = {
    translator: PropTypes.object
};
