import React from "react";
import _ from "lodash";
import uuid from "uuid";
import * as axios from 'axios';


import {TranslatingComponent} from 'susam-components/abstract';
import {Page, Card, Grid, GridCell, PageHeader, CardHeader, Loader, Wizard} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';
import {Chip, WorkingHour} from 'susam-components/advanced';

import {PlaceLocation} from '../place/PlaceLocation';
import {WorkingHours} from '../place/WorkingHours';
import {TrailerParkAttributes} from './TrailerParkAttributes';

import {TrailerParkService} from '../../../services/LocationService';

export class TrailerParkWizard extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
        this.steps = [
            {
                title: "Location",
                onNextClick: () => {
                    return this.locationStep.next()
                },
                prevButtonLabel: "Cancel",
                onPrevClick: () => {
                    this.handleCancelClick()
                }
            },
            {
                title: "Working Hours",
                onNextClick: () => {
                    return this.workingHoursStep.next()
                }
            },
            {
                title: "Security Information",
                nextButtonLabel: "save",
                onNextClick: () => {
                    return this.securityInfo.next()
                }
            }];
    }

    componentDidMount() {
        this.initializeState(this.props);
        this.initialize();
    }

    initialize(){

    }

    initializePlace(){
        return (
            {
                active: true,
                location: {},
                establishment: {
                    address: {},
                    workingHours: [],
                    phoneNumbers: []
                }
            }
        );
    }

    initializeState(props) {
        if (props.location.query && props.location.query.id) {
            this.loadTrailerPark(props.location.query.id);
        }else{
            let state = _.cloneDeep(this.state);
            state.place = this.initializePlace();
            this.setState(state);
        }
    }

    loadTrailerPark(id){
        TrailerParkService.get(id).then(response => {
            let state = _.cloneDeep(this.state);
            state.place = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        })
    }

    handleCancelClick(){
        this.context.router.push('/ui/management/trailer-park-list');
    }

    updateLocation(location) {
        let place = _.cloneDeep(this.state.place);
        place = _.merge(place, location);
        this.setState({place: place});
    }
    updateWorkingHours(workingHours) {
        let place = _.cloneDeep(this.state.place);
        place.establishment.workingHours = workingHours;
        this.setState({place: place});
    }

    updateSecurityInfo(securityInfo){
        let place = _.cloneDeep(this.state.place);
        place = _.merge(place, securityInfo);
        this.setState({place: place}, () => this.saveTrailerPark());
    }

    saveTrailerPark(){
        TrailerParkService.save(this.state.place).then(response => {
            Notify.showSuccess("Trailer park saved");
            this.context.router.push('/ui/management/trailer-park-list');
        }).catch(error => {
            Notify.showError(error);
        })
    }

    render() {
        if (!this.state.place) {
            return null;
        }
        let title = super.translate("New Trailer Park");

        if(this.state.place.name){
            title = this.state.place.name;
        }

        return (
            <Page title={title}>
                <Wizard steps={this.steps}>
                    <PlaceLocation ref={(c) => this.locationStep = c}
                                   place={this.state.place}
                                   handleSave={data => this.updateLocation(data)}/>
                    <WorkingHours ref={(c) => this.workingHoursStep = c}
                                  workingHours={this.state.place.establishment.workingHours}
                                  handleSave={data => this.updateWorkingHours(data)}/>

                    <TrailerParkAttributes ref = {(c) => this.securityInfo = c}
                                           place={this.state.place}
                                           handleSave={data => this.updateSecurityInfo(data)} />
                </Wizard>
            </Page>
        );
    }

}

TrailerParkWizard.contextTypes = {
    router: React.PropTypes.object.isRequired
};