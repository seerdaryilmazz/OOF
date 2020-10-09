import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Map } from "susam-components/advanced";
import { Notify } from "susam-components/basic";
import { Card, Grid, GridCell } from "susam-components/layout";
import { TripService } from "../services";
import { DateEditModal } from "./DateEditModal";
import { DisplayMode } from "./DisplayMode";
import { PlanDetails } from "./PlanDetails";
import { PlanList } from "./PlanList";
import { PlanProgressingModal } from "./PlanProgressingModal";





export class PlanningSearch extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {displayMode: "E", /* EQUAL: E, LEFT: L, RIGHT: R */};
        this.moment = require('moment');

    }

    componentDidMount() {
        this.loadTripPlans();
    }

    componentWillReceiveProps(nextProps) {

    }

    loadTripPlans() {
        TripService.findTripPlans().then(response => {
            this.setState({tripPlans: _.orderBy(response.data.tripPlans, ['code'], ['desc'])})
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handlePlanSelect(plan) {
        if (this.state.selectedPlan && this.state.selectedPlan.id == plan.id) {
            this.setState({selectedPlan: null});
        } else {
            this.setState({selectedPlan: plan});
        }
    }

    onSelectTrailer(trailer){
        TripService.assignTrailerToTripPlan(trailer.id, this.state.selectedPlan.id).then(response => {
            window.setTimeout(() => {
                this.loadTripPlans();
            }, 2000);
            Notify.showSuccess("Assigned trailer to trip plan");
        }).catch(error => {
            Notify.showError(error);
        });
    }

    refreshTripPlan(tripPlan){
        let state = _.cloneDeep(this.state);
        state.selectedPlan = tripPlan;
        let index = _.findIndex(state.tripPlans, {id: tripPlan.id});
        if(index >= 0){
            state.tripPlans[index] = tripPlan;
        }
        this.setState(state);
    }

    handleArrive(tripPlanId, tripStop) {
        this.planProgressingModal.openFor("Arrival Date", tripPlanId, tripStop, tripStop.location.timezone,
            (tripPlanId, tripStop, date) => {
                TripService.arriveToTripStop(tripPlanId, tripStop.id, date).then(response => {
                    Notify.showSuccess("Trip Started successfully.");
                    this.planProgressingModal.close();
                    this.refreshTripPlan(response.data);
                }).catch(error => {
                    Notify.showError(error);
                });
            });
    }

    handleDepart(tripPlanId, tripStop) {
        this.planProgressingModal.openFor("Departure Date", tripPlanId, tripStop, tripStop.location.timezone,
            (tripPlanId, tripStop, date) => {
                TripService.departFromTripStop(tripPlanId, tripStop.id, date).then(response => {
                    Notify.showSuccess("Trip Completed successfully.");
                    this.planProgressingModal.close();
                    this.refreshTripPlan(response.data);
                }).catch(error => {
                    Notify.showError(error);
                });
            });
    }

    handleStartUnloadJob(tripPlanId, tripStop) {
        this.planProgressingModal.openFor("Unload Start Date", tripPlanId, tripStop, tripStop.location.timezone,
            (tripPlanId, tripStop, date) => {
                TripService.startUnloadJob(tripPlanId, tripStop.id, date).then(response => {
                    Notify.showSuccess("Unload Started successfully.");
                    this.planProgressingModal.close();
                    this.refreshTripPlan(response.data);
                }).catch(error => {
                    Notify.showError(error);
                });
            });
    }

    handleCompleteUnloadJob(tripPlanId, tripStop) {
        this.planProgressingModal.openFor("Unload Completion Date", tripPlanId, tripStop, tripStop.location.timezone,
            (tripPlanId, tripStop, date) => {
                TripService.completeUnloadJob(tripPlanId, tripStop.id, date).then(response => {
                    Notify.showSuccess("Unload Completed successfully.");
                    this.planProgressingModal.close();
                    this.refreshTripPlan(response.data);
                }).catch(error => {
                    Notify.showError(error);
                });
            });
    }

    handleStartLoadJob(tripPlanId, tripStop) {
        this.planProgressingModal.openFor("Load Start Date", tripPlanId, tripStop, tripStop.location.timezone,
            (tripPlanId, tripStop, date) => {
                TripService.startLoadJob(tripPlanId, tripStop.id, date).then(response => {
                    Notify.showSuccess("Load Started successfully.");
                    this.planProgressingModal.close();
                    this.refreshTripPlan(response.data);
                }).catch(error => {
                    Notify.showError(error);
                });
            });
    }

    handleCompleteLoadJob(tripPlanId, tripStop) {
        this.planProgressingModal.openFor("Load Completion Date", tripPlanId, tripStop, tripStop.location.timezone,
            (tripPlanId, tripStop, date) => {
                TripService.completeLoadJob(tripPlanId, tripStop.id, date).then(response => {
                    Notify.showSuccess("Load Completed successfully.");
                    this.planProgressingModal.close();
                    this.refreshTripPlan(response.data);
                }).catch(error => {
                    Notify.showError(error);
                });
            });
    }

    handleSaveTripEstimatedDates(tripPlanId, data) {
        TripService.updateTripPlanEstimatedDates(tripPlanId, data).then(response => {
            Notify.showSuccess("Dates are Updates successfully.");
            this.refreshTripPlan(response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }



    handleDetailsClick(tripPlanId, tripStop) {
        this.dateEditModal.openFor(tripPlanId, tripStop,
            (tripPlanId, tripStopId, date) => {
                TripService.updateDates(tripPlanId, tripStopId, date).then(response => {
                    Notify.showSuccess("Dates are Updated Successfully.");
                    this.dateEditModal.close();
                    this.refreshTripPlan(response.data);
                }).catch(error => {
                    Notify.showError(error);
                });
            });
    }


    render() {
        let tripPlans = this.state.tripPlans;
        let displayMode = this.state.displayMode;
        let selectedPlan = this.state.selectedPlan;
        return (
            <Grid>
                <GridCell width="1-1">
                    <Card className={"uk-scrollable-text uk-max-height-1200"}>
                        <PlanList
                            data={tripPlans}
                            selectedPlan={selectedPlan}
                            planSelectHandler={(plan) => { this.handlePlanSelect(plan)}}/>
                    </Card>
                </GridCell >
                <GridCell width="1-1">
                    <DisplayMode
                        displayMode={this.state.displayMode}
                        onDisplayModeChange={(value) => this.setState({displayMode: value})}/>
                </GridCell>
                <GridCell width={displayMode=="E"?"1-2":"1-1"} hidden={displayMode=="L"?true:false} >
                    <Card>
                        <Map width="100%"
                             height="400px"
                             data={this.state.currentData}
                             onShowInfo={(data) =>{}}
                             onMarkerClicked={(data) =>{}}
                             onRouteDrawn={(routeInfo) =>{}}
                             traffic={false}
                             clustering={false}
                             optimization={false}
                             route={this.state.selectedData}
                             routeDrawRequestTime={this.state.routeDrawRequestTime}
                             routeCheckFunction={(route) =>{}}
                             onOptimizationChange={() =>{}}
                             showTraffic={false}
                             showClustering={false}
                             showOptimization={false}
                             ref={(c) => this._map = c}
                        />
                    </Card>
                </GridCell>
                <GridCell width={displayMode=="E"?"1-2":"1-1"} hidden={displayMode=="R"?true:false} >
                    <PlanDetails data={selectedPlan}
                                 onSelectTrailer={(trailer) => this.onSelectTrailer(trailer)}
                                 handleArrive={(tripPlanId, tripStop)=> {this.handleArrive(tripPlanId, tripStop)}}
                                 handleDepart={(tripPlanId, tripStop)=> {this.handleDepart(tripPlanId, tripStop)}}
                                 handleStartUnloadJob={(tripPlanId, tripStop)=> {this.handleStartUnloadJob(tripPlanId, tripStop)}}
                                 handleCompleteUnloadJob={(tripPlanId, tripStop)=> {this.handleCompleteUnloadJob(tripPlanId, tripStop)}}
                                 handleStartLoadJob={(tripPlanId, tripStop)=> {this.handleStartLoadJob(tripPlanId, tripStop)}}
                                 handleCompleteLoadJob={(tripPlanId, tripStop)=> {this.handleCompleteLoadJob(tripPlanId, tripStop)}}
                                 handleSaveTripEstimatedDates={(tripPlanId, data) => {this.handleSaveTripEstimatedDates(tripPlanId, data)}}
                                 handleDetailsClick={(tripPlanId, tripStop) => {this.handleDetailsClick(tripPlanId, tripStop)}}
                    />
                </GridCell>
                <GridCell>
                    <PlanProgressingModal ref={(c) => this.planProgressingModal = c}/>
                </GridCell>
                <GridCell>
                    <DateEditModal ref={(c) => this.dateEditModal = c}/>
                </GridCell>
            </Grid>
        )
    }
}


PlanningSearch.contextTypes = {
    translator: React.PropTypes.object
};
