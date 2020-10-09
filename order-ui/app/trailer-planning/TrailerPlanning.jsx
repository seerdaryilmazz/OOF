import _ from "lodash";
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Notify } from "susam-components/basic";
import { Card, Grid, GridCell } from "susam-components/layout";
import { ShipmentAssignmentPlanningService, SpotVehicleService, VehicleService } from "../services";
import { PlanningList } from './PlanningList';
import { PlanningSegments } from './PlanningSegments';
import { Storage } from './storage/Storage';
import { StorageDataUpdater } from './updater/StorageDataUpdater';
import { VehicleFeature } from './VehicleFeature';





export class TrailerPlanning extends TranslatingComponent{

    static TYPE_COL_DIST = "COLLECION/DISTRIBUTION";
    static TYPE_LINEHAUL = "LINEHAUL";
    static TYPE_FTL = "FTL";

    constructor(props){
        super(props);
        this.state = {segments:[]};
    }
    componentDidMount(){
        this.storage = new Storage(this.context);
        this.storage.writeStorage("trailer-planning.map-status", "WAITING");
        this.storage.writeStorage("trailer-planning.all-segments", []);
        this.initData();
        this.loadTrailers();
        this.loadSpotVehicles();
        this.startSegmentPolling();
    }

    componentWillUnmount(){
        this.selectedSegmentUpdater.clearInterval();
    }

    isPageRequestedAsColDist() {
        return this.props.segmentType && this.props.segmentType == TrailerPlanning.TYPE_COL_DIST;
    }

    isPageRequestedAsLinehaul() {
        return this.props.segmentType && this.props.segmentType == TrailerPlanning.TYPE_LINEHAUL;
    }

    isPageRequestedAsFTL() {
        return this.props.segmentType && this.props.segmentType == TrailerPlanning.TYPE_FTL;
    }

    fetchMyShipmentSegments() {
        if(this.isPageRequestedAsColDist()) {
            return ShipmentAssignmentPlanningService.getMyColDistShipmentSegments();
        } else  if(this.isPageRequestedAsLinehaul()) {
            return ShipmentAssignmentPlanningService.getMyLinehaulShipmentSegments();
        } else  if(this.isPageRequestedAsFTL()) {
            return ShipmentAssignmentPlanningService.getMyFTLShipmentSegments();
        } else {
            return ShipmentAssignmentPlanningService.getMyShipmentSegments();
        }
    }

    initData(){
        this.fetchMyShipmentSegments().then(response => {
            response.data.forEach(item => {
                item._key = item.id
                VehicleFeature.initializeSelectedVehicleFeaturesOfShipment(item);
            });
            this.storage.writeStorage("trailer-planning.all-segments", response.data);
            let selectedSegments = JSON.parse(this.storage.readStorage("trailer-planning.selected-segments"));
            let matchingSelectedSegments = _.intersectionWith(selectedSegments, response.data, (source, dest) => source.id == dest.id);
            VehicleFeature.initializeSelectedVehicleFeaturesOfShipment(matchingSelectedSegments);
            this.storage.writeStorage("trailer-planning.selected-segments", matchingSelectedSegments);
        }).catch((error) => {
            Notify.showError(error);
            this.storage.writeStorage("trailer-planning.all-segments", null);
            this.storage.writeStorage("trailer-planning.selected-segments", null);
            this.storage.writeStorage("trailer-planning.route", null);
        });
    }

    loadTrailers(){
        VehicleService.allAvailableTrailers().then(response => {
            let trailers = response.data;
            trailers.forEach(item => item._key = item.id);
            this.storage.writeStorage("trailer-planning.all-trailers", trailers);
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    loadSpotVehicles(){
        SpotVehicleService.findSpotVehicleRoutes().then(response => {
            let spotVehicles = response.data;
            spotVehicles.forEach(item => item._key = item.id);
            this.storage.writeStorage("trailer-planning.spot-vehicles", spotVehicles);
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    startSegmentPolling(){
        this.selectedSegmentUpdater =
            new StorageDataUpdater(this.context.storage,
                "trailer-planning.selected-segments", (prevData, nextData) => {
                    let showSelectedSegments = nextData && nextData.length > 0;
                    if(showSelectedSegments != this.state.showSelectedSegments){
                        this.setState({showSelectedSegments: showSelectedSegments});
                    }
                });
        this.selectedSegmentUpdater.startPolling(300);
    }

    render(){
        let rightPanelComponent = null;
        let listSize = "1-1";
        if(this.state.showSelectedSegments){
            rightPanelComponent =
                <GridCell width="3-10">
                    <PlanningList />
                </GridCell>;

            listSize = "7-10";
        }
        return(
            <Card zeroPadding = {true}>
                <Grid style = {{margin:"0px"}} smallGutter = {true}>
                    <GridCell width={listSize} style = {{padding:"0px"}} noMargin = {true}>
                        <PlanningSegments />
                    </GridCell>
                    {rightPanelComponent}
                </Grid>
            </Card>


        );
    }
}
TrailerPlanning.contextTypes = {
    storage: React.PropTypes.object
};

export const TrailerPlanningForColDist = () => (
    <TrailerPlanning segmentType={TrailerPlanning.TYPE_COL_DIST}/>
);
export const TrailerPlanningForLinehaul = () => (
    <TrailerPlanning segmentType={TrailerPlanning.TYPE_LINEHAUL}/>
);
export const TrailerPlanningForFTL = () => (
    <TrailerPlanning segmentType={TrailerPlanning.TYPE_FTL}/>
);