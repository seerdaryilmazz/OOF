import _ from "lodash";
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Span} from "susam-components/basic";
import {CompanySearchAutoComplete} from 'susam-components/oneorder';

import {RouteService} from "../../services";

import {RouteLegSchedule} from './RouteLegSchedule';
import {RouteLegNonSchedule} from './RouteLegNonSchedule';

export class RouteLegForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {showSchedules: true};
    }

    componentDidMount(){
        this.initialize(this.props);
    }
    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }
    handleSelectFromLocationType(value){
        RouteService.getRouteLegStopsByLocationType(value).then(response => {
            this.setState({fromLocationType: value, fromRouteLegStops: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }
    handleSelectToLocationType(value){
        RouteService.getRouteLegStopsByLocationType(value).then(response => {
            this.setState({toLocationType: value, toRouteLegStops: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    initialize(props){
        if(props.data){
            if(props.data.from && props.data.from.id){
                RouteService.getRouteLegStop(props.data.from.id).then(response => {
                    if(response.data.types){
                        this.setState({fromLocationType: response.data.types[0]});
                    }
                }).catch(error => {
                    Notify.showError(error);
                });
            }
            if(props.data.to && props.data.to.id){
                RouteService.getRouteLegStop(props.data.to.id).then(response => {
                    if(response.data.types){
                        this.setState({toLocationType: response.data.types[0]});
                    }
                }).catch(error => {
                    Notify.showError(error);
                });
            }
            if(props.data.type){
                RouteService.getRouteLegStopsByRouteLegType(props.data.type).then(response => {
                    this.setState({routeLeg: props.data,
                        fromRouteLegStops: response.data,
                        toRouteLegStops: response.data});
                }).catch(error => {
                    Notify.showError(error);
                });
            }
        }

    }

    updateState(key, value){
        let routeLeg = _.cloneDeep(this.state.routeLeg);
        _.set(routeLeg, key, value);
        this.setState({routeLeg: routeLeg});
    }

    handleSaveRouteLeg(){
        if(!this.form.validate()){
            return;
        }
        this.props.onsave && this.props.onsave(this.state.routeLeg);
    }
    handleDeleteRouteLeg(){
        this.props.ondelete && this.props.ondelete(this.state.routeLeg);
    }

    handleScheduleSelect(e){
        e.preventDefault();
        this.setState({showSchedules: true});
    }
    handleNonScheduleSelect(e){
        e.preventDefault();
        this.setState({showSchedules: false});
    }

    render(){
        if(!this.state.routeLeg || !this.props.lookups){
            return null;
        }
        let fromLocationType, toLocationType = null;
        let typeId = _.get(this.props, "data.type.id");
        let typeName = _.get(this.props, "data.type.name");
        if(typeId == RouteService.ROAD){
            fromLocationType = <GridCell width="1-4">
                <DropDown label="Type"
                          options = {this.props.lookups.locationTypes}
                          value = {this.state.fromLocationType}
                          onchange = {(value) => this.handleSelectFromLocationType(value)}
                          required = {true} />
            </GridCell>;
            toLocationType = <GridCell width="1-4">
                <DropDown label="Type"
                          options = {this.props.lookups.locationTypes}
                          value = {this.state.toLocationType}
                          onchange = {(value) => this.handleSelectToLocationType(value)}
                          required = {true} />
            </GridCell>;
        }
        let schedules = null;
        if(this.state.showSchedules){
            schedules = <RouteLegSchedule schedules = {this.state.routeLeg.schedules}
                                          from = {this.state.routeLeg.from}
                                          to = {this.state.routeLeg.to}
                                          type = {this.state.routeLeg.type}
                                          onchange = {(value) => this.updateState("schedules", value)}/>;
        }else{
            schedules = <RouteLegNonSchedule nonSchedules = {this.state.routeLeg.nonSchedules}
                                             onchange = {(value) => this.updateState("nonSchedules", value)}/>;
        }
        return (
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <CardHeader title={typeName}/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c} >
                        <Grid>
                            {fromLocationType}
                            <GridCell width="1-4">
                                <DropDown label="From"
                                          options = {this.state.fromRouteLegStops}
                                          value = {this.state.routeLeg.from}
                                          onchange = {(value) => this.updateState("from", value)}
                                          required = {true} />
                            </GridCell>
                            {toLocationType}
                            <GridCell width="1-4">
                                <DropDown label="To"
                                          options = {this.state.toRouteLegStops}
                                          value = {this.state.routeLeg.to}
                                          onchange = {(value) => this.updateState("to", value)}
                                          required = {true} />
                            </GridCell>
                        </Grid>
                        <GridCell width="1-4">
                            <ul className="uk-subnav uk-subnav-pill">
                                <li className={this.state.showSchedules ? 'uk-active' : ''}><a href="#" onClick = {(e) => this.handleScheduleSelect(e)}>{super.translate("Scheduled")}</a></li>
                                <li className={this.state.showSchedules ? '' : 'uk-active'}><a href="#" onClick = {(e) => this.handleNonScheduleSelect(e)}>{super.translate("Non Scheduled")}</a></li>
                            </ul>
                        </GridCell>
                    </Form>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    {schedules}
                </GridCell>
                <GridCell width="1-1">
                    <div className="uk-align-left">
                        <Button label="delete" waves = {true} style="danger" size="small" onclick = {() => {this.handleDeleteRouteLeg()}} />
                    </div>
                    <div className="uk-align-right">
                        <Button label="save" waves = {true} style="primary" size="small" onclick = {() => {this.handleSaveRouteLeg()}} />
                    </div>
                </GridCell>
            </Grid>
        );
    }
}
