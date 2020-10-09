import React from "react";
import {TrailerRoute} from "./TrailerRoute";
import {ShipmentsRoute} from "./ShipmentsRoute";
import {TrailerSelection} from "./TrailerSelection";
import {Card, Grid, GridCell} from "susam-components/layout";
import {Button} from "susam-components/basic";

export class Route extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            display: "T"
        }
    }

    changeDisplay(e, display) {
        $("li").removeClass("uk-active");
        $(e.target).closest("li").addClass("uk-active");
        this.setState({display: display});
    }

    onRoute() {
        this.props.onRoute();
    }

    onPlan() {
        this.props.onPlan();
    }

    onAcceptOrderedRoute() {
        this.props.onAcceptOrderedRoute();
    }

    onRouteChanged(selectedData) {
        this.props.onRouteChanged(selectedData);
    }

    onRouteDelete(data) {
        this.props.onRouteDelete(data);
    }

    onSelectTrailer(values) {
        this.props.onSelectTrailer(values);
    }

    getRouteInfo() {
        let routeInfo = null;

        if (this.props.routeInfo) {
            let routeSaveButton = null;
            if (this.props.routeInfo.orderedRoute) {
                routeSaveButton =
                    <a href="javascript:void(0)" className="uk-icon-button uk-icon-save"
                       onClick={() => this.onAcceptOrderedRoute()}/>;
            }

            routeInfo = (
                <div className="uk-alert uk-alert-success uk-text-small">
                    <Grid>
                        <GridCell width="8-10" noMargin="true">
                            <Grid>
                                <GridCell width="1-1" noMargin="true">
                                    <div className="uk-text-truncate">
                                        <b>Total</b> {this.props.routeInfo.distance}, {this.props.routeInfo.duration}
                                    </div>
                                </GridCell>
                                <GridCell width="1-1" noMargin="true">
                                    <div className="uk-text-truncate">
                                        <b>Empty</b> {this.props.routeInfo.legs[0].distance}, {this.props.routeInfo.legs[0].duration}
                                    </div>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="2-10" noMargin="true">
                            {routeSaveButton}
                        </GridCell>
                    </Grid>
                </div>
            );
        }

        return routeInfo;
    }

    dataUpdateHandler(dataId, field, value) {
        this.props.dataUpdateHandler(dataId, field, value);
    }

    render() {
        let result = null;

        if (this.props.selectedData && this.props.selectedData.length > 0) {

            let routeButton = null, planButton = null;
            if (this.props.selectedDataValid) {
                routeButton = <Button label="Route" style="primary" waves={true} onclick={() => this.onRoute()}/>;
                planButton = <Button label="Plan" style="primary" waves={true} onclick={() => this.onPlan()}/>;
            }

            let displayComponent = this.state.display == "T" ?
                <TrailerRoute onAcceptOrderedRoute={() => this.onAcceptOrderedRoute()}
                              onRouteChanged={(selectedData) => this.onRouteChanged(selectedData)}
                              onRouteDelete={(data) => this.onRouteDelete(data)}
                              routeInfo={this.props.routeInfo}
                              selectedData={this.props.selectedData}
                              dataUpdateHandler={(dataId, field, value) => {this.dataUpdateHandler(dataId, field, value)}}/>
                :
                <ShipmentsRoute selectedShipments={this.props.selectedShipments}/>;

            result = (
                <div>
                    <ul className="uk-tab">
                        <li className="uk-width-1-2 uk-active">
                            <a href="javascript:void(0)" onClick={(e) => this.changeDisplay(e, "T")}>Stops</a>
                        </li>
                        <li className="uk-width-1-2">
                            <a href="javascript:void(0)" onClick={(e) => this.changeDisplay(e, "S")}>Shipments</a>
                        </li>
                    </ul>
                    {displayComponent}
                    <div style={{minHeight: "70px", marginTop: "15px"}}>
                        <Grid>
                            <GridCell width="6-10" noMargin="true">
                                <TrailerSelection origin={this.props.origin}
                                                  onSelectTrailer={(values) => this.onSelectTrailer(values)}/>
                                {routeButton}
                                {planButton}
                            </GridCell>
                            <GridCell width="4-10" noMargin="true">
                                {this.getRouteInfo()}
                            </GridCell>
                        </Grid>
                    </div>
                </div>
            )
        }

        return result;
    }
}
