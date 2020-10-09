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
import {EntranceInfo} from '../place/EntranceInfo';
import {Assets} from '../place/Assets';

import {TerminalService} from '../../../services/LocationService';

export class TerminalWizard extends TranslatingComponent {

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
                title: "Entrance Information",
                onNextClick: () => {
                    return this.entranceInfoStep.next()
                }
            },
            {
                title: "Assets",
                onNextClick: () => {
                    return this.assetsStep.next()
                },
                nextButtonLabel: "Save"
            }];
    }

    componentDidMount() {
        this.initializeState(this.props);
        this.initialize();
    }

    initialize(){
        axios.all([
            TerminalService.listRegistrationMethods(),
            TerminalService.listAssetTypes()
        ]).then(axios.spread((registrationMethods, assetTypes) => {
            this.setState({registrationMethods: registrationMethods.data, assetTypes: assetTypes.data});
        })).catch((error) => {
            Notify.showError(error);
        });
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
                },
                assets:[]
            }
        );
    }

    initializeState(props) {
        if (props.location.query && props.location.query.id) {
            this.loadTerminal(props.location.query.id);
        }else{
            let state = _.cloneDeep(this.state);
            state.place = this.initializePlace();
            this.setState(state);
        }
    }

    loadTerminal(id){
        TerminalService.get(id).then(response => {
            let state = _.cloneDeep(this.state);
            state.place = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        })
    }

    handleCancelClick(){
        this.context.router.push('/ui/management/terminal-list');
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
    updateEntranceInformation(entranceInfo){
        let place = _.cloneDeep(this.state.place);
        place = _.merge(place, entranceInfo);
        this.setState({place: place});
    }

    updateAssets(assets) {
        let place = _.cloneDeep(this.state.place);
        place.assets = assets;
        this.setState({place: place}, () => this.saveTerminal());
    }

    saveTerminal(){
        TerminalService.save(this.state.place).then(response => {
            Notify.showSuccess("Terminal saved");
            this.context.router.push('/ui/management/terminal-list');
        }).catch(error => {
            Notify.showError(error);
        })
    }

    render() {
        if (!this.state.place) {
            return null;
        }
        let title = super.translate("New Terminal");
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
                    <EntranceInfo ref={(c) => this.entranceInfoStep = c}
                                  place={this.state.place}
                                  registrationMethods = {this.state.registrationMethods}
                                  handleSave={data => this.updateEntranceInformation(data)}/>

                    <Assets ref={(c) => this.assetsStep = c}
                            assets={this.state.place.assets}
                            assetTypes = {this.state.assetTypes}
                            handleSave={data => this.updateAssets(data)}/>

                </Wizard>
            </Page>
        );
    }

}

TerminalWizard.contextTypes = {
    router: React.PropTypes.object.isRequired
};