import _ from "lodash";
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Button, RadioButton } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";
import { StorageDataUpdater } from './updater/StorageDataUpdater';





export class SpotVehicleList extends TranslatingComponent{
    constructor(props){
        super(props);
        this.state = {};
        this.momentTimezone = require('moment-timezone');
        this.moment = require('moment');
        this.momentFormat = "DD/MM/YYYY HH:mm";
    }

    componentDidMount(){
        this._isMounted = true;
        this.startTrailerPolling();
    }

    componentWillReceiveProps(nextProps){

    }

    componentWillUnmount(){
        this._isMounted = false;
        $(window).off("resize", this.handleResize);
    }

    startTrailerPolling() {

        this.selectedSpotVehicleUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.selected-spot-vehicle", (prevData, nextData) => {
                    if (nextData) {
                        if (this._isMounted) {
                            this.setState({selectedSpotVehicle: nextData});
                        }
                    }
                });
        this.selectedSpotVehicleUpdater.startPolling(300);
    }


    handleSelectSpotVehicle(value, spotVehicle){
        if(value){
            this.writeStorage("trailer-planning.selected-spot-vehicle", spotVehicle);
        }
    }

    handlePlanningListSelect(){
        this.props.onPlanningListSelect && this.props.onPlanningListSelect();
    }

    writeStorage(key, value){
        if(this.context.storage){
            this.context.storage.write(key, value);
        }
    }
    readStorage(key){
        if(this.context.storage){
            return this.context.storage.read(key);
        }
        return null;
    }

    toMomentTimezone(dateTimeStr){
        let dateSplit = dateTimeStr.split(" ");
        return this.momentTimezone.tz(dateSplit[0] + " " + dateSplit[1], this.momentFormat, true, dateSplit[2]);
    }

    getTimezone(dateTimeStr){
        let dateSplit = dateTimeStr.split(" ");
        return dateSplit.length > 2 ? dateSplit[2] : "";
    }

    renderDistanceComponentContent(spotVehicleRoute) {

        let distanceInfo = spotVehicleRoute._groundDistanceAndDurationText;
        let pointOnMap = spotVehicleRoute.pointOnMap;

        if(distanceInfo) {
            return <span className="uk-text-small uk-text-muted">{distanceInfo}</span>;
        } else if(pointOnMap){
            return <span className="uk-align-right">
                    <Button flat="true" style="primary" size="small" label="Distance" onclick={() => {this.props.onDistanceCalculate(spotVehicleRoute)}} />
                </span>
        } else {
            return null;
        }
    }

    renderAvailability(spotVehicleRoute) {
        let availableAfter = null;
        let availableTime = _.get(spotVehicleRoute, 'availableTime');
        if(availableTime){
            availableAfter = this.toMomentTimezone(availableTime).format("DD/MM HH:mm") + " " + this.getTimezone(availableTime);
        }
        let availability =
            <div>
                <span className="uk-badge uk-badge-warning">Will Be Available</span>
                <span className="uk-text-small uk-text-muted uk-margin-left">after {availableAfter}</span>
            </div>;
        if(spotVehicleRoute.availableNow){
            availability =
                <div>
                    <span className="uk-badge uk-badge-success">Available</span>
                    <span className="uk-text-small uk-text-muted uk-margin-left">from {availableAfter}</span>
                </div>;
        }

        return availability;
    }

    renderSpotVehicleRouteItem(spotVehicleRoute) {
        let selected = (this.state.selectedSpotVehicle && this.state.selectedSpotVehicle.id == spotVehicleRoute.id);

        let code = spotVehicleRoute.code;
        let carrierPlateNumber = spotVehicleRoute.carrierPlateNumber ? spotVehicleRoute.carrierPlateNumber : "-";
        let motorVehicleNumber = spotVehicleRoute.motorVehiclePlateNumber ? spotVehicleRoute.motorVehiclePlateNumber : "-";
        let companyName = spotVehicleRoute.invoiceCompany.name;
        let countryDescription = spotVehicleRoute.countryDescription;
        let formattedAddress = spotVehicleRoute.formattedAddress;

        return (
            <li key={spotVehicleRoute._key}>
                <div className="md-list-addon-element">
                    <RadioButton onchange={(value) => this.handleSelectSpotVehicle(value, spotVehicleRoute)}
                                 checked={selected}/>
                </div>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width="1-3" noMargin="true">
                            <span className="md-list-heading">Carrier: {carrierPlateNumber}</span>
                        </GridCell>
                        <GridCell width="1-3" noMargin="true">
                            <span className="md-list-heading">MV: {motorVehicleNumber}</span>
                        </GridCell>
                        <GridCell width="1-3" noMargin="true">
                            {this.renderDistanceComponentContent(spotVehicleRoute)}
                        </GridCell>
                        <GridCell width="1-1" noMargin="true">
                            <span className="md-list-heading">Usage: {countryDescription}</span>
                        </GridCell>
                        <GridCell width="1-1" noMargin="true">
                            {this.renderAvailability(spotVehicleRoute)}
                        </GridCell>
                        <GridCell width="1-1" noMargin="true">
                            <span className="uk-text-small uk-text-muted">{formattedAddress}</span>
                        </GridCell>
                    </Grid>
                </div>
            </li>
        );
    }

    render(){
        let spotVehicles = <Grid>
            <GridCell width="1-1">
                <span>There are no Spot Vehicles</span>
            </GridCell>
        </Grid>;

        if(this.props.spotVehicleRoutes && this.props.spotVehicleRoutes.length > 0){
            spotVehicles = <ul className="md-list md-list-addon-small">
                {this.props.spotVehicleRoutes.map(item => this.renderSpotVehicleRouteItem(item))}
            </ul>;
        }
        return (
            <Grid overflow = {true} style = {{height: this.state.contentHeight}}>
                <GridCell width="1-4">
                    <Button label="Back" icon="arrow-left" size="small" style="primary" onclick = {() => this.handlePlanningListSelect()} />
                </GridCell>
                <GridCell width="1-1">
                    {spotVehicles}
                </GridCell>
            </Grid>
        );
    }
}
SpotVehicleList.contextTypes = {
    storage: React.PropTypes.object
};