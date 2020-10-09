import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {Chip, NumericInput} from 'susam-components/advanced';
import {CompanyLocationSearchAutoComplete} from 'susam-components/oneorder';

export class EntranceInfo extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            data: {}
        }
    }

    componentDidMount() {
        this.initializeState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.initializeState(nextProps);
    }

    initializeState(props) {
        let state =  _.cloneDeep(this.state);
        if (props.place) {
            state.place =  props.place;
        }
        this.setState(state);
    }

    updateState(field, value) {
        let place = this.state.place;
        place[field] = value;
        this.updateData(place);
    }

    updateRegistrationCompanyLocation(value){
        let place = _.cloneDeep(this.state.place);
        place.registrationCompanyId = value.company ? value.company.id : null;
        place.registrationCompanyName = value.company ? value.company.name : null;
        place.registrationLocationId = value.location ? value.location.id : null;
        place.registrationLocationName = value.location ? value.location.name : null;
        this.updateData(place);
    }


    updateData(place) {
        this.setState({place: place});
    }

    next() {
        let data = this.state.data;
        return new Promise(
            (resolve, reject) => {
                if(!this.form.validate()) {
                    Notify.showError("There are eori problems");
                    reject();
                } else if((!data.registrationCompanyId && data.registrationLocationId) || (data.registrationCompanyId && !data.registrationLocationId)) {
                    Notify.showError("Either Company and Company Location should be selected or left empty.");
                    reject();
                }else {
                    this.props.handleSave && this.props.handleSave(this.state.place);
                    resolve(true);
                }
            });
    }

    render() {
        if (!this.state.place) {
            return null;
        }
        let style = {borderBottom: "none"};
        let registrationCompany = this.state.place.registrationCompanyId ?
            {id: this.state.place.registrationCompanyId, name: this.state.place.registrationCompanyName} : null;
        let registrationLocation = this.state.place.registrationCompanyId ?
            {id: this.state.place.registrationLocationId, name: this.state.place.registrationLocationName} : null;
        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Entrance Information"/>
                </GridCell>
                <GridCell width="1-2">
                    <Form ref={(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-2">
                                <DropDown label="Registration Method"
                                          options={this.props.registrationMethods}
                                          value={this.state.place.registrationMethod}
                                          onchange={(value) => this.updateState("registrationMethod", value)}/>
                            </GridCell>
                            <GridCell width="1-2"/>
                            <GridCell width="1-1">
                                <CompanyLocationSearchAutoComplete
                                    companyLabel="Registration Company" locationLabel="Registration Location"
                                    value={{
                                        company: registrationCompany,
                                        location: registrationLocation
                                        }}
                                    onChange = {value => this.updateRegistrationCompanyLocation(value)} />
                            </GridCell>
                            <GridCell width="1-2">
                                <TextInput label="Entrance Gate" value={this.state.place.entranceGate}
                                           onchange={(value) => this.updateState("entranceGate", value)}/>
                            </GridCell>
                            <GridCell width="1-2"/>
                            <GridCell width="1-1"/>
                            <GridCell width="1-3">
                                <NumericInput label="Gates open"
                                              value={this.state.place.entranceTimeFrom}
                                              onchange = {(value) => this.updateState("entranceTimeFrom", value)}
                                              required={true} digits="0" />
                            </GridCell>
                            <GridCell width="2-3">
                                <span className="uk-text-large">{super.translate(" hours, before departure")}</span>
                            </GridCell>
                            <GridCell width="1-2"/>
                            <GridCell width="1-1"/>
                            <GridCell width="1-3">
                                <NumericInput label="Latest check-in time"
                                              value={this.state.place.entranceTimeTo}
                                              onchange = {(value) => this.updateState("entranceTimeTo", value)}
                                              required={true} digits="0" />
                            </GridCell>
                            <GridCell width="2-3">
                                <span className="uk-text-large">{super.translate(" hours, before departure")}</span>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
            </Grid>
        );
    }
}