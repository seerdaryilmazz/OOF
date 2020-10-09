import _ from "lodash";
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { DateTime, Slider } from "susam-components/advanced";
import { Button, Checkbox, RadioButton } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";
import { StorageDataUpdater } from './updater/StorageDataUpdater';
import { TrailerUtil } from './util/TrailerUtil';
import { VehicleFeature } from './VehicleFeature';





export class TrailerList extends TranslatingComponent{
    constructor(props){
        super(props);
        this.state = {};
        this.momentTimezone = require('moment-timezone');
        this.moment = require('moment');
        this.momentFormat = "DD/MM/YYYY HH:mm";

        this.tripStopDistanceMap = {};
    }

    static DEFAULT_TRAILER_DISTANCE_FILTER = 100;

    componentDidMount(){
        this._isMounted = true;
        this.trailerUtil = new TrailerUtil(this.context.storage);
        this.startTrailerPolling();
    }

    componentWillReceiveProps(nextProps){

    }

    componentWillUnmount(){
        this._isMounted = false;
        $(window).off("resize", this.handleResize);
        this.selectedTrailerUpdater.clearInterval();
        this.firstStopUpdater.clearInterval();
    }

    startTrailerPolling() {


        this.selectedTrailerUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.selected-trailer", (prevData, nextData) => {
                    if (nextData) {
                        if (this._isMounted) {
                            this.setState({selectedTrailer: nextData});
                        }
                    }
                });
        this.selectedTrailerUpdater.startPolling(300);

        this.firstStopUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.first-stop", (prevData, nextData) => {

                });
        this.firstStopUpdater.startPolling(300);

    }

    toMomentTimezone(dateTimeStr){
        let dateSplit = dateTimeStr.split(" ");
        return this.momentTimezone.tz(dateSplit[0] + " " + dateSplit[1], this.momentFormat, true, dateSplit[2]);
    }

    getTimezone(dateTimeStr){
        let dateSplit = dateTimeStr.split(" ");
        return dateSplit.length > 2 ? dateSplit[2] : "";
    }

    handleSelectTrailer(value, trailer){
        if(value){
            this.writeStorage("trailer-planning.selected-trailer", trailer);
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

    handleChangeDistance(distance) {
        let filter = _.cloneDeep(this.props.filter);
        filter.distance = distance;
        this.props.onChange && this.props.onChange(filter);
    }

    resetTrailerDistanceLimit() {
        this.handleChangeDistance(-1);
    }

    handleChangeDate(date) {
        let filter = _.cloneDeep(this.props.filter);
        filter.date = date;
        this.props.onChange && this.props.onChange(filter);
    }

    isDistanceFilterActive(){
        return this.props.filter.distance != -1;
    }

    calculateGroundDistance(trailer) {

        this.props.onDistanceCalculate && this.props.onDistanceCalculate(trailer);

/*        let firstStop = JSON.parse(this.readStorage("trailer-planning.first-stop"));
        if (!firstStop) {
            return;
        }

        let tripStopTrailers = this.trailerUtil.getTripStopTrailers();

        TrailerDistanceCalculation.calculateGroundDistanceForSingleTrailer(
            trailer,
            firstStop.pointOnMap,
            (distanceMatrix) => {
                if (distanceMatrix) {
                    TrailerDistanceCalculation.applyDistanceMatrixToTrailer(tripStopTrailers.find(tr => tr.id == trailer.id), distanceMatrix);
                    this.trailerUtil.setTripStopTrailers(tripStopTrailers);
                    this.setState({trailers: this.trailerUtil.getFilteredTrailers()});
                }
            });*/
    }

    handleChangeVehicleFeature(id, value) {
        let filter = _.cloneDeep(this.props.filter);
        if(!filter.vehicleFeature){
            filter.vehicleFeature = {};
        }
        filter.vehicleFeature[id] = value;
        this.props.onChange && this.props.onChange(filter);
    }

    renderDistance(trailer) {
        return <span className="uk-text-small uk-text-muted">{trailer._airDistanceToFirstStop}</span>
    }

    renderTrailerItem(trailer){
        let selected = (this.state.selectedTrailer && this.state.selectedTrailer.vehicle.vehicleId == trailer.vehicle.vehicleId);
        let distance = trailer._groundDistanceAndDurationText ?
            <span className="md-list-heading uk-float-right">{trailer._groundDistanceAndDurationText}</span> :
            (_.isNumber(trailer._airDistanceToFirstStop) ?
                <span className="md-list-heading uk-float-right">
                    <Button flat="true" style="primary" size="small" label="Distance" onclick={() => {this.calculateGroundDistance(trailer)}} />
                </span>: null)
        let availableAfter = null;
        if(_.get(trailer, 'availableTime')){
            availableAfter = this.toMomentTimezone(_.get(trailer, 'availableTime')).format("DD/MM HH:mm") + " " + this.getTimezone(_.get(trailer, 'availableTime'));
        }
        let availability =
            <div>
                <span className="uk-badge uk-badge-warning">Will Be Available</span>
                <span className="uk-text-small uk-text-muted uk-margin-left">after {availableAfter}</span>
            </div>;
        if(trailer.availableNow){
            availability =
                <div>
                    <span className="uk-badge uk-badge-success">Available</span>
                    <span className="uk-text-small uk-text-muted uk-margin-left">from {availableAfter}</span>
                </div>;
        }

        return (
            <li key = {trailer._key}>
                <div className="md-list-addon-element">
                    <RadioButton onchange = {(value) => this.handleSelectTrailer(value, trailer)} checked = {selected}/>
                </div>
                <div className="md-list-content">
                    <span className="md-list-heading">{trailer.vehicle.plateNumber}</span>
                    {distance}
                    {availability}
                    <span className="uk-text-small uk-text-muted">{_.get(trailer, 'assignment.location.formattedAddress')}</span>
                    {VehicleFeature.createVehicleRequirementElementsOfVehicle(trailer)}
                </div>
            </li>
        );
    }

    renderFeatureFilter() {
        let content = VehicleFeature.VEHICLE_FEATURE.map(feature => {
            return <GridCell key = {feature.id} width="1-5">
                <Checkbox label={feature.name} value={this.props.filter.vehicleFeature ? this.props.filter.vehicleFeature[feature.id] : false}
                          onchange={(value) => {this.handleChangeVehicleFeature(feature.id, value)}}></Checkbox>
            </GridCell>
        });

        return <Grid>
            {content}
        </Grid>

    }
    render(){
        let trailers = <Grid>
            <GridCell width="1-1">
                <span>There are no trailers matching this filter</span>
            </GridCell>
        </Grid>;

        if(this.props.trailers && this.props.trailers.length > 0){
            trailers = <ul className="md-list md-list-addon-small">
                {this.props.trailers.map(item => this.renderTrailerItem(item))}
            </ul>;
        }
        return (
            <Grid overflow = {true} style = {{height: this.state.contentHeight}}>
                <GridCell width="1-4">
                    <Button label="Back" icon="arrow-left" size="small" style="primary" onclick = {() => this.handlePlanningListSelect()} />
                </GridCell>
                <GridCell width="3-4">
                    <Grid>
                        <GridCell width="4-5">
                            <Slider label = "Distance Filter" min = "1" max = "500"
                                    from = {this.props.filter.distance} to = {this.props.filter.distance}
                                    onchange = {(value)=>this.handleChangeDistance(value)}/>
                        </GridCell>
                        <GridCell width="1-5">
                            <Button active={!this.isDistanceFilterActive()}
                                    flat="true" style="primary" size="small" label="All" onclick={() => {this.resetTrailerDistanceLimit()}}/>
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-1" noMargin="true">
                    <DateTime label="Date Filter" timeAsTextInput="true"
                              onchange={(value)=> this.handleChangeDate(value) }
                              value={this.props.filter.date}/>
                </GridCell>
                <GridCell>
                    {this.renderFeatureFilter()}
                </GridCell>
                <GridCell width="1-1">
                    {trailers}
                </GridCell>
            </Grid>
        );
    }
}
TrailerList.contextTypes = {
    storage: React.PropTypes.object
};