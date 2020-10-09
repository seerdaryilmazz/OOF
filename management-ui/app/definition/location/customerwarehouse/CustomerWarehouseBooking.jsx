import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form, RadioGroup} from 'susam-components/basic';
import {Chip, NumericInput, Time} from 'susam-components/advanced';
import {CompanySearchAutoComplete} from 'susam-components/oneorder';

const BOOKING_OPTION_ASK = "ASK";
const BOOKING_OPTION_ALWAYS = "ALWAYS";
const BOOKING_OPTION_NEVER = "NEVER";
const BOOKING_TYPE_BEFORE_READY_DATE = "BEFORE_READY_DATE";
const BOOKING_TYPE_BEFORE_DELIVERY_DATE = "BEFORE_DELIVERY_DATE";
const BOOKING_TYPE_ORDER_REQUEST = "ORDER_REQUEST";
const BOOKING_CHANNEL_ONLINE = "ONLINE";
const BOOKING_CHANNEL_CONTACT = "CONTACT";

export class CustomerWarehouseBooking extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: {
                bookingLoading: {},
                bookingUnloading: {}
            }
        }
    }
    componentDidMount() {
        this.initializeState(this.props);
    }
    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }
    initializeState(props) {
        let state = _.cloneDeep(this.state);
        if(props.data) {
            state.data = _.cloneDeep(props.data);
            this.initializeBookingMethods(state.data);
        }
        this.setState(state);
    }

    initializeBookingMethods(data) {
        if(data.bookingLoading) {
            if (data.bookingLoading.bookingUrl) {
                data.bookingLoading._bookingMethod = {id: BOOKING_CHANNEL_ONLINE};
            } else if (data.bookingLoading.bookingContact) {
                data.bookingLoading._bookingMethod = {id: BOOKING_CHANNEL_CONTACT};
            }
        }else{
            data.bookingLoading = {bookingOption: {id: BOOKING_OPTION_ASK}};
        }
        if(data.bookingUnloading) {
            if (data.bookingUnloading.bookingUrl) {
                data.bookingUnloading._bookingMethod = {id: BOOKING_CHANNEL_ONLINE};
            } else if (data.bookingUnloading.bookingContact) {
                data.bookingUnloading._bookingMethod = {id: BOOKING_CHANNEL_CONTACT};
            }
        }else{
            data.bookingUnloading = {bookingOption: {id: BOOKING_OPTION_ASK}};
        }
    }

    updateState(field, value) {
        let data = _.cloneDeep(this.state.data);
        data[field] = value;
        this.setState({data: data});
    }

    next() {
        let data = this.state.data;
        return new Promise(
            (resolve, reject) => {
                if (!this.loadingBookingForm.validate() || !this.unloadingBookingForm.validate()) {
                    Notify.showError("There are eori problems");
                    reject();
                    return;
                } else if ((!data.registrationCompanyId && data.registrationLocationId) || (data.registrationCompanyId && !data.registrationLocationId)) {
                    Notify.showError("Either Company and Company Location should be selected or left empty.");
                    reject();
                    return;
                } else {
                    this.props.handleSave(data);
                    resolve(true);
                    return;
                }
            });
    }

    handleLoadingSelected(value) {
        let data = _.cloneDeep(this.state.data);
        data.bookingLoading.bookingOption = value;
        this.setState({data: data});
    }

    handleUnloadingSelected(value) {
        let data = _.cloneDeep(this.state.data);
        data.bookingUnloading.bookingOption = value;
        this.setState({data: data});
    }

    render() {
        let {data} = this.state;
        if (!data) {
            return null;
        }
        let loadingBookingTypes = _.filter(this.props.bookingTypes, item => item.id !== BOOKING_TYPE_BEFORE_DELIVERY_DATE);
        let unloadingBookingTypes = _.filter(this.props.bookingTypes, item => item.id !== BOOKING_TYPE_BEFORE_READY_DATE);

        let loadingBookingOptionId = _.get(data, "bookingLoading.bookingOption.id");
        let unloadingBookingOptionId = _.get(data, "bookingUnloading.bookingOption.id");
        return (
                <Grid>
                    <GridCell width="1-2">
                        <Form ref={(c) => this.loadingBookingForm = c}>
                            <Grid>
                                <GridCell width="1-1">
                                    <CardHeader title = "Loading"/>
                                </GridCell>
                                <GridCell width="2-3">
                                    <DropDown label = "Works with booking" required = {true}
                                        options={this.props.bookingOptions} value={data.bookingLoading.bookingOption}
                                                onchange={value => this.handleLoadingSelected(value)}>
                                    </DropDown>
                                </GridCell>
                                <GridCell width="2-3">
                                    <CustomerWarehouseBookingElem
                                        data={data.bookingLoading}
                                        bookingTypes={loadingBookingTypes}
                                        showBookingMethod = {loadingBookingOptionId !== BOOKING_OPTION_NEVER}
                                        showBookingAtStatus = {loadingBookingOptionId === BOOKING_OPTION_ALWAYS}
                                        bookingMethodRequired = {loadingBookingOptionId === BOOKING_OPTION_ALWAYS}
                                        bookingAtStatusRequired = {loadingBookingOptionId === BOOKING_OPTION_ALWAYS}
                                        timezone = {data.timezone}
                                        contacts={this.props.contacts}
                                        onchange={value => this.updateState("bookingLoading", value)}
                                        />
                                </GridCell>
                            </Grid>
                        </Form>
                    </GridCell>
                    <GridCell width="1-2">
                        <Form ref={(c) => this.unloadingBookingForm = c}>
                            <Grid>
                                <GridCell width="1-1">
                                    <CardHeader title = "Unloading"/>
                                </GridCell>
                                <GridCell width="2-3">
                                    <DropDown label = "Works with booking"
                                              options={this.props.bookingOptions} value={data.bookingUnloading.bookingOption}
                                              onchange={value => this.handleUnloadingSelected(value)}>
                                    </DropDown>
                                </GridCell>
                                <GridCell width="2-3">
                                    <CustomerWarehouseBookingElem
                                        data={data.bookingUnloading}
                                        bookingTypes={unloadingBookingTypes}
                                        showBookingMethod = {unloadingBookingOptionId !== BOOKING_OPTION_NEVER}
                                        showBookingAtStatus = {unloadingBookingOptionId === BOOKING_OPTION_ALWAYS}
                                        bookingMethodRequired = {unloadingBookingOptionId === BOOKING_OPTION_ALWAYS}
                                        bookingAtStatusRequired = {unloadingBookingOptionId === BOOKING_OPTION_ALWAYS}
                                        timezone = {data.timezone}
                                        contacts={this.props.contacts}
                                        onchange={value => this.updateState("bookingUnloading", value)}
                                    />
                                </GridCell>
                            </Grid>
                        </Form>
                    </GridCell>

                </Grid>
        );
    }
    
    
}

class CustomerWarehouseBookingElem extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};

        this.bookingMethods = [{id: BOOKING_CHANNEL_ONLINE, name: "Online"}, {id: BOOKING_CHANNEL_CONTACT, name: "Contact"}];
    }


    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    updateState(field, value) {
        let data = _.cloneDeep(this.props.data);
        data[field] = value;
        this.props.onchange(data);
    }

    handleBookingMethodSelection(value) {

        let data = _.cloneDeep(this.props.data);

        if (data._bookingMethod) {
            if (value.id === BOOKING_CHANNEL_ONLINE) {
                data.bookingContact = null
            } else if (value.id === BOOKING_CHANNEL_CONTACT) {
                data.bookingUrl = null;
            }
        } else {
            data.bookingContact = null;
            data.bookingUrl = null;
        }

        data._bookingMethod = value;


        this.props.onchange(data);
    }

    renderBookingMethod() {
        if(!this.props.showBookingMethod){
            return null;
        }
        let {data, bookingMethodRequired} = this.props;
        return (
            <Grid>
                <GridCell width="1-2" noMargin={true}>
                    <DropDown label = "Booking Method" required = {bookingMethodRequired}
                              options = {this.bookingMethods} value={data._bookingMethod}
                              onchange = {value => this.handleBookingMethodSelection(value)}>
                    </DropDown>
                </GridCell>
                <GridCell width="1-2" noMargin={true}>
                    {this.renderBookingResource()}
                </GridCell>
            </Grid>
        )
    }

    renderBookingResource() {
        let {data, bookingMethodRequired} = this.props;
        let method = data._bookingMethod;
        if (!method) {
            return null;
        }
        else if (method.id === BOOKING_CHANNEL_ONLINE) {
            return (
                <TextInput label="URL" value={data.bookingUrl} required = {bookingMethodRequired}
                           onchange={(value) => this.updateState("bookingUrl", value)}/>
            );
        } else if (method.id === BOOKING_CHANNEL_CONTACT) {
            return (
                <DropDown label="Company Contact" options={this.props.contacts}
                          required = {bookingMethodRequired}
                          value={data.bookingContact} onchange={(value) => {
                    this.updateState("bookingContact", value)
                }}/>
            )
        } else {
            return null;
        }

    }

    handleBookingTypeChange(value) {
        let data = _.cloneDeep(this.props.data);
        if (value && value.id === BOOKING_TYPE_ORDER_REQUEST) {
            data.bookingDaysBefore = null;
            data.bookingTimeUntil = null;
        }
        data.bookingType = value;
        this.props.onchange(data);
    }

    renderBookingContentLoading() {
        if(!this.props.showBookingAtStatus){
            return null;
        }
        let {data, bookingAtStatusRequired} = this.props;
        let timeContent = null;
        if (data.bookingType && data.bookingType.id !== BOOKING_TYPE_ORDER_REQUEST) {
            timeContent =
                <Grid collapse = {true}>
                    <GridCell width = "1-4">
                        <div className = "uk-margin-top">Before</div>
                    </GridCell>
                    <GridCell width = "1-4">
                        <NumericInput value={data.bookingDaysBefore} required = {bookingAtStatusRequired}
                                      onchange={(value) => this.updateState("bookingDaysBefore", value)}/>
                    </GridCell>
                    <GridCell width = "1-4">
                        <div className = "uk-margin-top">days, until</div>
                    </GridCell>
                    <GridCell width = "1-4">
                        <Time label="" value = {data.bookingTimeUntil} hideIcon = {true} timezone = {this.props.timezone}
                              required = {bookingAtStatusRequired}
                              onchange = {(value) => this.updateState("bookingTimeUntil", value)} />
                    </GridCell>
                </Grid>
        }

        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <DropDown label = "Booking at Status" required = {bookingAtStatusRequired}
                              options={this.props.bookingTypes} value={data.bookingType}
                              onchange={value => this.handleBookingTypeChange(value)}>
                    </DropDown>
                </GridCell>
                <GridCell width="2-3">
                    {timeContent}
                </GridCell>
            </Grid>
        )
    }

    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    {this.renderBookingMethod()}
                </GridCell>
                <GridCell width="1-1">
                    {this.renderBookingContentLoading()}
                </GridCell>
            </Grid>
        )
    }
}