import _ from "lodash";
import * as axios from 'axios';
import uuid from 'uuid';
import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form} from "susam-components/basic";

import {BasicMap} from '../location/common/BasicMap';
import {RouteService} from "../../services";

const ROUTE_LEG = "Route Leg";
const ROUTE = "Route";

export class LinehaulRouteForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.INITIAL_POSITION = {lat: 40.97379, lng: 29.253641};
        this.initialPin = {name: "Start", draggable: false, pinColor: "red", position: this.INITIAL_POSITION, label: this.labels.charAt(0)};
        this.state = {
            pins: [this.initialPin],
            route: null,
            lastStop: null,
            selectedRouteComponent: null,
            routeComponents: []
        };
    }

    componentDidMount() {
        if(this.props.selectedItem){
            this.initializeRoute(this.props.selectedItem);
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.selectedItem){
            this.initializeRoute(nextProps.selectedItem);
        }
    }

    initializeRoute(route) {

        let state = _.cloneDeep(this.state);

        state.route = route;


        if (route.routeLegs && route.routeLegs.length > 0) {
            state.lastStop = route.routeLegs[route.routeLegs.length - 1].to;
        } else {
            state.lastStop = null;
        }

        state.selectedRouteComponent = null;

        this.getRouteComponentsFromLocation(state.lastStop);

        this.setState(state);
        this.refreshPins(state);
    }

    updateInternalSelectedRouteState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    updateRouteState(key, value){
        this.props.onchange && this.props.onchange(key, value);
    }

    updateRouteChangeState(value) {
        this.props.onroutechange && this.props.onroutechange(value);
    }

    handleRouteNext() {

        let state = _.cloneDeep(this.state);

        if (state.selectedRouteComponent) {

            let routeFragment = null;
            let routeLegs = [];

            if (state.selectedRouteComponent.type == ROUTE_LEG) {
                routeFragment = {
                    orderNo: state.route.fragments.length + 1,
                    type: {
                        id: RouteService.ONE_LEGGED
                    },
                    leg: state.selectedRouteComponent.innerObject,
                    // Bu 2 alan servis tarafında zaten dolduruluyor ancak servise gitmeden önce aşağıda bir yerde kullanılabilirler diye burada da dolduruyoruz.
                    from: state.selectedRouteComponent.innerObject.from,
                    to: state.selectedRouteComponent.innerObject.to
                }
                routeLegs.push(state.selectedRouteComponent.innerObject);
            } else {
                routeFragment = {
                    orderNo: state.route.fragments.length + 1,
                    type: {
                        id: RouteService.MULTIPLE_LEGGED
                    },
                    route: state.selectedRouteComponent.innerObject,
                    // Bu 2 alan servis tarafında zaten dolduruluyor ancak servise gitmeden önce aşağıda bir yerde kullanılabilirler diye burada da dolduruyoruz.
                    from: state.selectedRouteComponent.innerObject.from,
                    to: state.selectedRouteComponent.innerObject.to
                };
                state.selectedRouteComponent.innerObject.routeLegs.forEach(item => {
                    routeLegs.push(item);
                });
            }

            state.route.fragments.push(routeFragment);
            routeLegs.forEach(item => {
                state.route.routeLegs.push(item);
            });
            state.route.to = state.selectedRouteComponent.innerObject.to;

            state.lastStop = state.route.to;
            state.selectedRouteComponent = null;

            this.setState(state);
            this.updateRouteChangeState(state);
            this.getRouteComponentsFromLocation(state.lastStop);

            if (state.route.routeLegs.length == routeLegs.length) {
                this.dropPin(state.route.id + "-" + state.route.routeLegs[0].from.name, state.route.routeLegs[0].from.pointOnMap, this.labels.charAt(0));
            }

            routeLegs.forEach((item, index) => {
                this.dropPin(item.id + "-" + item.to.name, item.to.pointOnMap, this.labels.charAt(state.route.routeLegs.length - routeLegs.length + index + 1));
            });

        } else {
            Notify.showError("Please select a route leg / route.");
        }
    }

    refreshPins(state) {
        if (this.map) {
            let newPins = [];
            if (state.route && state.route.routeLegs && state.route.routeLegs.length > 0) {
                let labelIndex = 0;
                state.route.routeLegs.forEach((item, index) => {
                    if (index == 0) {
                        newPins.push({name: item.id + "-" + item.from.name,
                            draggable: false,
                            pinColor: "red",
                            position: item.from.pointOnMap, label: this.labels.charAt(labelIndex)})
                        labelIndex++;
                    }
                    newPins.push({name: item.id + "-" + item.to.name,
                        draggable: false,
                        pinColor: "red",
                        position: item.to.pointOnMap, label: this.labels.charAt(labelIndex)})
                    labelIndex++;
                });
            } else {
                newPins.push(this.initialPin);
            }
            this.setState({pins: newPins});
        }
    }

    dropPin(name, latlng, label){
        let pins = _.cloneDeep(this.state.pins);
        pins.push({name: name,
            draggable: false,
            pinColor: "red",
            position: latlng, label: label});
        this.setState({pins: pins});
    }

    getRouteComponentsFromLocation(location) {

        let routeLegsPromise = null;
        let routesPromise = null;

        if (location && location.id) {
            routeLegsPromise = RouteService.getRouteLegsFromLocation(location);
            routesPromise = RouteService.getRoutesFromLocation(location);
        } else {
            routeLegsPromise = RouteService.getRouteLegs();
            routesPromise = RouteService.getRoutes();
        }

        axios.all([
            routeLegsPromise,
            routesPromise
        ]).then(axios.spread((routeLegsResponse, routesResponse) => {

            let routeComponents = [];

            routeLegsResponse.data.forEach(item => {
                routeComponents.push({
                    id: routeComponents.length + 1,
                    name: ROUTE_LEG + ": " + item.from.name + "-" + item.to.name + " (" + item.type.name + ")",
                    type: ROUTE_LEG,
                    innerObject: item
                });
            });

            routesResponse.data.forEach(item => {
                routeComponents.push({
                    id: routeComponents.length + 1,
                    name: ROUTE + ": " + item.from.name + "-" + item.to.name,
                    type: ROUTE,
                    innerObject: item
                });
            });

            this.setState({routeComponents: routeComponents});

        })).catch((error) => {
            Notify.showError(error);
        });
    }

    handleDeleteThisAndAllBelowClick(fragment) {

        let state = _.cloneDeep(this.state);
        let startIndex = null;

        state.route.routeLegs.some((item, index) => {

            let fragmentThatStartsWithRouteLeg = this.findFragmentThatStartsWithRouteLeg(state.route.fragments, item);

            if (fragmentThatStartsWithRouteLeg && fragmentThatStartsWithRouteLeg.orderNo == fragment.orderNo) {
                startIndex = index;
                return true;
            } else {
                return false;
            }
        });

        state.route.routeLegs.splice(startIndex);
        state.route.fragments.splice(fragment.orderNo - 1);

        if (state.route.routeLegs.length > 0) {
            state.route.to = state.route.routeLegs[state.route.routeLegs.length - 1].to;
        } else {
            state.route.from = null;
            state.route.to = null;
        }

        state.lastStop = state.route.to;
        state.selectedRouteComponent = null;

        this.setState(state);
        this.updateRouteChangeState(state);
        this.getRouteComponentsFromLocation(state.lastStop);

        this.refreshPins(state);
    }

    getRouteLegIconAccordingToType(routeLeg) {
        if (routeLeg.type.code == "ROAD") {
            return (<i className="uk-icon uk-icon-road uk-icon-medium"/>);
        } else if (routeLeg.type.code == "SEAWAY") {
            return (<i className="material-icons md-36">directions_boat</i>);
        } else if (routeLeg.type.code == "RAILWAY") {
            return (<i className="material-icons md-36">directions_train</i>);
        }
    }

    renderRouteLegLocation(types){
        let classNames = ["timeline_icon"];
        if(_.find(types, {code: 'PORT'})){
            classNames.push("timeline_icon_primary");
        }else if(_.find(types, {code: 'TRAIN_TERMINAL'})){
            classNames.push("timeline_icon_warning");
        }else if(_.find(types, {code: 'CROSSDOCK_WAREHOUSE'})){
            classNames.push("timeline_icon_success");
        }
        return (<div className={classNames.join(" ")}>
            <i className="material-icons">place</i>
        </div>);
    }

    renderRouteLeg(key, routeLeg, fragmentThatStartsWithRouteLeg) {

        if (fragmentThatStartsWithRouteLeg) {
            return (
                <div key={key} className="timeline_item">
                    <div className="timeline_content">
                        <Grid>
                            <GridCell width="1-2" noMargin = {true}>
                                {this.getRouteLegIconAccordingToType(routeLeg)}
                            </GridCell>
                            <GridCell width="1-2" noMargin = {true}>
                                <Button label="Delete This And All Below" size="small" style="danger" flat = {true}
                                        onclick={() => this.handleDeleteThisAndAllBelowClick(fragmentThatStartsWithRouteLeg)}/>
                            </GridCell>
                        </Grid>


                    </div>
                </div>
            );
        } else {
            return (
                <div key={key} className="timeline_item">
                    <div className="timeline_content">
                        {this.getRouteLegIconAccordingToType(routeLeg)}
                    </div>
                </div>
            );
        }
    }

    renderNextRouteComponent(key, lastStop) {

        let label = null;
        let lastStopName = "";
        if (lastStop) {
            lastStopName = lastStop.name;
            label = "Next Route Leg / Route From " + lastStopName;
        } else {
            label = "First Route Leg / Route";
        }

        return (
            <div key={key} className="timeline_item">
                <div className="timeline_icon"><i className="material-icons">place</i></div>
                <div className="timeline_content">
                    <Grid>
                        <GridCell width="1-1" noMargin = {true}>
                            {lastStopName}
                        </GridCell>
                        <GridCell width="3-4">
                            <DropDown label={label} options={this.state.routeComponents}
                                      value={this.state.selectedRouteComponent}
                                      onchange={(value) => this.updateInternalSelectedRouteState("selectedRouteComponent", value)}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <Button label="next" size="small" style="success"
                                    onclick={() => this.handleRouteNext()}/>
                        </GridCell>
                    </Grid>
                </div>
            </div>
        );
    }

    findFragmentThatStartsWithRouteLeg(fragments, routeLeg) {

        let foundFragment = null;

        fragments.some(fragment => {
            if (fragment.from.id == routeLeg.from.id) {
                foundFragment = fragment;
                return true;
            } else {
                return false;
            }
        });

        return foundFragment;
    }

    renderRouteLegs() {

        let legs = [];

        this.state.route.routeLegs.forEach((item) => {

            let fragmentThatStartsWithRouteLeg = this.findFragmentThatStartsWithRouteLeg(this.state.route.fragments, item);

            legs.push(
                <div key={legs.length + 1} className="timeline_item">
                    <div className="timeline_icon"><i className="material-icons">place</i></div>
                    <div className="timeline_content">
                        {item.from.name}
                    </div>
                </div>
            );

            legs.push(this.renderRouteLeg(legs.length + 1, item, fragmentThatStartsWithRouteLeg));
        });

        legs.push(this.renderNextRouteComponent(legs.length + 1, this.state.lastStop));

        return legs;
    }

    validate(){
        return this.form.validate();
    }

    reset(){
        return this.form.reset();
    }
    render() {
        if(!this.state.route){
            return null;
        }
        return(
            <div>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <CardHeader title="Route Definition"/>
                    </GridCell>
                </Grid>
                <Grid>
                    <GridCell width="1-2" noMargin={true}>
                        <Form ref = {(form) => this.form = form}>
                            <Grid>
                                <GridCell width="1-1">
                                    <TextInput label="Name" value = {this.state.route.name}
                                               onchange = {(value) => this.updateRouteState("name", value)}
                                               required = {true}/>
                                </GridCell>
                                <GridCell width="1-1">
                                    <div className="timeline">
                                        {this.renderRouteLegs()}
                                    </div>
                                </GridCell>
                            </Grid>
                        </Form>
                    </GridCell>
                    <GridCell width="1-2" noMargin={true}>
                        <BasicMap ref = {(c) => this.map = c} id="googlePlaceMap" height="600px"
                                  map={{zoom: 7}}
                                  dropPins={this.state.pins}/>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}