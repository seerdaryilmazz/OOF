import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from 'axios';

import {TranslatingComponent} from "susam-components/abstract";
import {Card, Grid, GridCell, Modal} from "susam-components/layout";
import {Notify, Button} from "susam-components/basic";

import {TripService} from '../services/TripService';

export class RouteModal extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {

    }

    openFor(tripStopId) {
        TripService.findTripStopRoute(tripStopId).then((response) => {
            let route = null;
            if(!response.data || !response.data.routeLegs) {
                Notify.showError("There does not exist any Route Legs for given Trip Stop");
            }
            this.setState({routeLegs: response.data.routeLegs}, () => {this.routeModal.open();})
        }).catch((error) => {
            Notify.showError(error);
            console.log(error);
            this.setState({route: null})
        });
    }

    closeRouteModal() {
        this.setState({
            route: null
        }, () => {
            this.routeModal.close();
        });
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

    renderExpeditionDetails(routeLeg) {
        if (routeLeg.expeditionId) {
            return <span className="uk-margin-small-left">{routeLeg.expeditionDescription}</span>;
        } else {
            return null;
        }
    }

    renderCurrentRoute(routeLegs) {
        if (!routeLegs) {
            return null;
        }

        let elems = [];

        routeLegs.forEach((routeLeg, index) => {

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
                        {this.renderExpeditionDetails(routeLeg)}
                    </div>
                </div>
            );

            if (index == routeLegs.length - 1) {
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

    render() {

        let routeLegs = this.state.routeLegs;
        let content = null;

        if (routeLegs) {
            content = this.renderCurrentRoute(routeLegs);
        }

        return (
            <div>
                <Modal ref={(c) => this.routeModal = c} title="Route" minHeight="500px"
                       actions={[{label: "Close", action: () => this.closeRouteModal()}]}>
                    {content}
                </Modal>
            </div>
        );

    }
}

RouteModal.contextTypes = {
    storage: React.PropTypes.object
};