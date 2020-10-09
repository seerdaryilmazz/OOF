import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {TranslatingComponent} from "susam-components/abstract";
import {Card, Grid, GridCell, Modal} from "susam-components/layout";
import {DropDown, Notify, Button} from "susam-components/basic";

import {TripService} from '../../services/TripService';

export class RouteSelectionModal extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {

    }

    openFor(fromStop, stops, routeLegStops) {

        if (!fromStop || !stops) {
            console.log("Modal open failed: no given from stop or stops");
            return;
        }

        let nextStop = this.findNextStop(fromStop, stops);

        if (!nextStop) {
            console.log("Modal open failed: selected stop is the last stop");
            return;
        }

        TripService.findUsableRoutes(fromStop.id, fromStop.type, nextStop.id, nextStop.type).then((response) => {
            response.data.forEach(data => {
                data._guiKey = uuid.v4();
                if(data.routeLegs) {
                    data.routeLegs.forEach(data => {
                        data._guiKey = uuid.v4();
                    });
                }
            });
            this.setState({
                routeLegStops: routeLegStops,
                fromStop: fromStop,
                toStop: nextStop,
                currentRoute: fromStop && fromStop.route ? _.cloneDeep(fromStop.route) : null,
                routeOptions: response.data
            }, () => {
                this.routeModal.open();
            });
        }).catch((error) => {
            Notify.showError(error);
            console.log(error);
        });


    }

    saveAndCloseRouteModal(fromStopKey, route) {
        if (this.props.onSave(fromStopKey, route)) {
            this.closeRouteModal();
        }
    }

    closeRouteModal() {
        this.setState({
            fromStop: null,
            toStop: null,
            currentRoute: null,
            routeOptions: null
        }, () => {
            this.routeModal.close();
        });
    }

    openLegModalFor(routeLeg) {
        this.setState({
            selectedRouteLeg: routeLeg,
            routeLegSelectionInProgress: this.initializeRouteLeg()
        }, () => {
            this.routeLegModal.open();
        })
    }

    saveAndCloseLegModal() {
        let selectedRouteLeg = this.state.selectedRouteLeg;
        let routeLegSelectionInProgress = this.state.routeLegSelectionInProgress;

        let currentRoute = this.state.currentRoute;
        if (!currentRoute || !currentRoute.routeLegs) {
            return;
        }

        if (!routeLegSelectionInProgress) {
            return;
        } else if (!routeLegSelectionInProgress.routeLeg) {
            Notify.showError("Route Leg is not selected");
            return;
        }

        let newRouteLeg = routeLegSelectionInProgress.routeLeg;

        let firstLeg = {
            _guiKey: uuid.v4(),
            from: selectedRouteLeg.from,
            to: newRouteLeg.from,
            legType: selectedRouteLeg.legType,
            editable: selectedRouteLeg.editable,
            removable: selectedRouteLeg.removable
        };

        let secondLeg = {
            _guiKey: uuid.v4(),
            from: newRouteLeg.from,
            to: newRouteLeg.to,
            legType: newRouteLeg.legType,
            editable: false,
            removable: true,
            expeditions: newRouteLeg.expeditions
        };

        let thirdLeg = {
            _guiKey: uuid.v4(),
            from: newRouteLeg.to,
            to: selectedRouteLeg.to,
            legType: selectedRouteLeg.legType,
            editable: selectedRouteLeg.editable,
            removable: selectedRouteLeg.removable
        };


        let legs = [];
        if (!this.areLocationsMatch(firstLeg.from, secondLeg.from)){
            legs.push(firstLeg);
        }
        legs.push(secondLeg);
        if (!this.areLocationsMatch(secondLeg.to, thirdLeg.to)){
            legs.push(thirdLeg);
        }

        let index = currentRoute.routeLegs.findIndex(leg => leg._guiKey == selectedRouteLeg._guiKey);

        currentRoute.routeLegs.splice(index, 1, ...legs);

        this.determineSortIndexes(currentRoute.routeLegs);
        this.setState({currentRoute: currentRoute}, () => {
            this.closeLegModal();
        })
    }

    closeLegModal() {
        this.setState({
            selectedRouteLeg: null,
            newRouteLeg: null,
            routeLegStopOptions: null,
            routeLegSelectionInProgress: null
        }, () => {
            this.routeLegModal.close();
        });
    }

    areLocationsMatch(locations1, locations2) {
        if(!locations1 || !locations2) {
            return false;
        }

        let loc1Ids = locations1.map(location1 => location1.companyLocationId ? location1.companyLocationId : location1.locationId);
        let loc2Ids = locations2.map(location2 => location2.companyLocationId ? location2.companyLocationId : location2.locationId);

        if(loc1Ids.length != loc2Ids.length) {
            return false;
        }

        let result = true;
        loc1Ids.forEach(loc1Id => {
            result = result && loc2Ids.includes(loc1Id);
        });

        return result;
    }

    determineSortIndexes(currentRouteLegs) {
        currentRouteLegs.forEach((item, index) => {
            item.sortIndex = index;
        })
    }

    findNextStop(stop, stops) {
        let currentStopFound = false;
        let nextStop;
        stops.forEach(s => {
            if (!nextStop && currentStopFound) {
                nextStop = s;
                return;
            }
            if (stop._key == s._key) {
                currentStopFound = true;
            }
        });
        return nextStop;
    }

    initializeRouteLeg() {
        return {
            editable: true
        }
    }

    handleRouteLegDataInProgressUpdate(field, value) {
        let routeLegSelectionInProgress = this.state.routeLegSelectionInProgress;

        routeLegSelectionInProgress[field] = value;

        if (routeLegSelectionInProgress.from && routeLegSelectionInProgress.to) {
            TripService.findUsableRouteLegs(routeLegSelectionInProgress.from.id, routeLegSelectionInProgress.to.id).then(response => {
                routeLegSelectionInProgress.routeLegOptions = response.data;
                routeLegSelectionInProgress.routeLegOptions.forEach(option => {
                    option._guiKey = uuid.v4();
                    option._label =
                        option.from.map(from => from.name).join(", ")
                        + " - " +
                        option.to.map(to => to.name).join(", ")
                        + " (" + option.legType.name + ")";
                });
                this.setState({routeLegSelectionInProgress: routeLegSelectionInProgress});
            }).catch(e => {
                routeLegSelectionInProgress.routeLegOptions = null;
                this.setState({routeLegSelectionInProgress: routeLegSelectionInProgress});
                Notify.showError(e);
            })
        } else {
            routeLegSelectionInProgress.routeLegOptions = null;
            this.setState({routeLegSelectionInProgress: routeLegSelectionInProgress});
        }
    }

    handleRouteLegSelection(value) {
        let routeLegSelectionInProgress = this.state.routeLegSelectionInProgress;
        if (routeLegSelectionInProgress) {
            routeLegSelectionInProgress.routeLeg = value;
            this.setState({routeLegSelectionInProgress: routeLegSelectionInProgress});
        }
    }

    removeRouteLeg(routeLeg) {
        let currentRoute = this.state.currentRoute;
        let currentRouteLegs = currentRoute.routeLegs;

        let index = currentRouteLegs.findIndex(route => route._guiKey == routeLeg._guiKey);

        let previousRouteLeg = index > 0 ? currentRouteLegs[index-1] : null;
        let nextRouteLeg  = currentRouteLegs.length-1 > index ? currentRouteLegs[index+1] : null;


        let from = routeLeg.from;
        let to = routeLeg.to;

        //removable legs are selected by user, remoiving them automaticaly is not a good idea
        if(previousRouteLeg && previousRouteLeg.editable && !previousRouteLeg.removable) {
            //remove previous reouteleg
            from = previousRouteLeg.from;
            currentRouteLegs.splice(index-1, 1);
            index--;
        }

        if(nextRouteLeg && nextRouteLeg.editable && !nextRouteLeg.removable) {
            //remove next routeleg
            to = nextRouteLeg.to;
            currentRouteLegs.splice(index+1, 1);
        }

        let newRouteLeg = {
            _guiKey: uuid.v4(),
            from: from,
            to: to,
            legType: {id: TripService.ROUTE_LEG_TYPE_ROAD},
            editable: true,
            removable: false
        };

        currentRouteLegs.splice(index, 1, newRouteLeg);

        this.determineSortIndexes(currentRouteLegs);

        this.setState({currentRoute: currentRoute});
    }

    setRouteLegExpedition(routeLeg, expedition) {
        let currentRoute = this.state.currentRoute;
        let currentRouteLegs = currentRoute.routeLegs;

        let index = currentRouteLegs.findIndex(currentRouteLeg => currentRouteLeg._guiKey == routeLeg._guiKey);

        let selectedRouteLeg = currentRouteLegs[index];

        selectedRouteLeg.expedition = expedition;

        this.setState({currentRoute: currentRoute});
    }


    getRouteLegIconAccordingToType(routeLeg) {

        let legTypeId = "";
        if (routeLeg && routeLeg.legType) {
            legTypeId = routeLeg.legType.id;
        }

        if (legTypeId == TripService.ROUTE_LEG_TYPE_ROAD) {
            return (<i className="uk-icon uk-icon-road uk-icon-medium"/>);
        } else if (legTypeId == TripService.ROUTE_LEG_TYPE_SEAWAY) {
            return (<i className="material-icons md-36">directions_boat</i>);
        } else if (legTypeId == TripService.ROUTE_LEG_TYPE_RAILWAY) {
            return (<i className="material-icons md-36">directions_train</i>);
        } else {
            return (<span key="uk-text-danger">Unknown Leg Type</span>);
        }
    }

    renderAddRouteLegButton(routeLeg) {

        if (!routeLeg.editable) {
            return null;
        }

        return <Button label="Add Route Leg" flat="true" style="primary"
                       onclick={() => {
                           this.openLegModalFor(routeLeg)
                       }}/>
    }

    renderRemoveRouteLegButton(routeLeg) {

        if (!routeLeg.removable) {
            return null;
        }

        return <Button label="Remove Route Leg" flat="true" style="danger"
                       onclick={() => {
                           this.removeRouteLeg(routeLeg)
                       }}/>
    }

    renderExpeditionSelection(routeLeg) {
        if(!routeLeg.expeditions || routeLeg.expeditions.length == 0) {
            return null;
        }

        return <DropDown key = {routeLeg._guiKey} options={routeLeg.expeditions} value={routeLeg.expedition} labelField="description"
                         onchange={(value) => {this.setRouteLegExpedition(routeLeg, value)}}/>
    }

    renderCurrentRoute(currentRoute) {
        if (!currentRoute || !currentRoute.routeLegs) {
            return null;
        }

        let elems = [];

        currentRoute.routeLegs.forEach((routeLeg, index) => {

            elems.push(
                <div key={"routeLeg" + elems.length + 1} className="timeline_item">
                    <div className="timeline_icon"><i className="material-icons">place</i></div>
                    <div className="timeline_content">
                        {routeLeg.from.map(from => from.name).join(", ")}
                    </div>
                </div>
            );

            elems.push(
                <div key={"routeLeg" + elems.length + 1} className="timeline_item">
                    <div className="timeline_content">
                        {this.getRouteLegIconAccordingToType(routeLeg)}
                        {this.renderAddRouteLegButton(routeLeg)}
                        {this.renderRemoveRouteLegButton(routeLeg)}
                        {this.renderExpeditionSelection(routeLeg)}
                    </div>
                </div>
            );

            if (index == currentRoute.routeLegs.length - 1) {
                elems.push(
                    <div key={"routeLeg" + elems.length + 1} className="timeline_item">
                        <div className="timeline_icon"><i className="material-icons">place</i></div>
                        <div className="timeline_content">
                            {routeLeg.to.map(to => to.name).join(", ")}
                        </div>
                    </div>
                );
            }
        });

        return <div className="timeline">
            {elems}
        </div>
    }

    renderRouteModalContent() {
        let currentRoute = this.state.currentRoute;
        let routeOptions = this.state.routeOptions;

        return (
            <Grid>
                <GridCell>
                    <DropDown label="Route" options={routeOptions} valueField="_guiKey" labelField="name"
                              value={currentRoute} onchange={(value) => {
                        this.setState({currentRoute: value});
                    }}/>
                </GridCell>
                <GridCell>
                    {this.renderCurrentRoute(currentRoute)}
                </GridCell>
            </Grid>
        )
    }

    renderFromToSelection(typeLabel, locationLabel, typeValue, locationValue, onTypeChangeCallback, onLocationChangeCallback) {

        let routeLegStopOptions = this.state.routeLegStops;

        let distinctTypes = [];

        if (routeLegStopOptions) {
            routeLegStopOptions.forEach(routeLegStop => {
                routeLegStop.types.forEach(type => {
                    if (!distinctTypes.find(distinctType => distinctType.id == type.id)) {
                        distinctTypes.push(_.cloneDeep(type));
                    }
                })
            });
        }

        let filteredRouteLegStopOptions;
        if (typeValue) {
            filteredRouteLegStopOptions = routeLegStopOptions.filter(
                option => option.types && option.types.find(type => type.id == typeValue.id)
            );
        }

        let typeSelectionContent = <DropDown key={typeLabel} label={typeLabel} options={distinctTypes}
                                             value={typeValue}
                                             onchange={(value) => {
                                                 onTypeChangeCallback(value)
                                             }}/>;

        let locationSelectionContent = <DropDown key={locationLabel} label={locationLabel}
                                                 options={filteredRouteLegStopOptions}
                                                 value={locationValue}
                                                 onchange={(value) => {
                                                     onLocationChangeCallback(value)
                                                 }}/>;


        let content = [];
        content.push(<GridCell width="1-2">{typeSelectionContent}</GridCell>);
        content.push(<GridCell width="1-2">{locationSelectionContent}</GridCell>);

        return content;
    }

    renderRouteLegModalContent() {
        let routeLegSelectionInProgress = this.state.routeLegSelectionInProgress;

        if (!routeLegSelectionInProgress) {
            return null;
        }

        let from = routeLegSelectionInProgress.from;
        let fromType = routeLegSelectionInProgress.fromType;

        let to = routeLegSelectionInProgress.to;
        let toType = routeLegSelectionInProgress.toType;

        let routeLegOptions = routeLegSelectionInProgress.routeLegOptions;
        let routeLeg = routeLegSelectionInProgress.routeLeg;

        let fromSelection = this.renderFromToSelection("From Type", "From", fromType, from,
            (value) => {this.handleRouteLegDataInProgressUpdate("fromType", value)},
            (value) => {this.handleRouteLegDataInProgressUpdate("from", value)});

        let toSelection = this.renderFromToSelection("ToType", "To", toType, to,
            (value) => {this.handleRouteLegDataInProgressUpdate("toType", value)},
            (value) => {this.handleRouteLegDataInProgressUpdate("to", value)});

        let routeLegSelection = <GridCell width="1-1">
                <DropDown label="Route Leg" options={routeLegOptions} value={routeLeg} valueField="_guiKey" labelField="_label"
                          onchange={(value) => {this.handleRouteLegSelection(value)}}/>
            </GridCell>;


        return (
            <Grid>
                {fromSelection}
                {toSelection}
                {routeLegSelection}
            </Grid>
        );
    }

    render() {

        let fromStop = this.state.fromStop;
        let toStop = this.state.toStop;
        let currentRoute = this.state.currentRoute;

        let routeModalContent;
        let routeLegModalContent;

        if (fromStop && toStop) {
            routeModalContent = this.renderRouteModalContent();
            routeLegModalContent = this.renderRouteLegModalContent();
        }

        let fromStopKey = this.state.fromStop ? this.state.fromStop._key : null;

        return (
            <div>
                <Modal ref={(c) => this.routeModal = c} title="Route" minHeight="500px"
                       actions={[{label: "Close", action: () => this.closeRouteModal()},
                           {
                               label: "Save",
                               buttonStyle: "primary",
                               action: () => this.saveAndCloseRouteModal(fromStopKey, currentRoute)
                           }]}>
                    {routeModalContent}
                </Modal>
                <Modal ref={(c) => this.routeLegModal = c} title="Route Legs"
                       minHeight="500px" closeOtherOpenModals={false}
                       actions={[{label: "Close", action: () => this.closeLegModal()},
                           {
                               label: "Save",
                               buttonStyle: "primary",
                               action: () => this.saveAndCloseLegModal()
                           }]}>
                    {routeLegModalContent}
                </Modal>
            </div>
        );

    }
}

RouteSelectionModal.contextTypes = {
    storage: React.PropTypes.object
};