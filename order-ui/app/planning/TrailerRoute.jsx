import React from "react";
import {Sortable, DateTime} from "susam-components/advanced";
import {Grid, GridCell} from "susam-components/layout";

import {DateTimeMini} from "./DateTimeMini.jsx";

export class TrailerRoute extends React.Component {

    constructor(props) {
        super(props);

        this.routeButtons = [
            {
                icon: "trash-o",
                action: (item) => this.onRouteDelete(item)
            }
        ];

        this.OP_TYPE_LOAD = "LOAD";
        this.OP_TYPE_UNLOAD = "UNLOAD";

        this.LOCATION_TYPE_CUSTOMER = "CUSTOMER";
        this.LOCATION_TYPE_WAREHOUSE = "WAREHOUSE";
        this.LOCATION_TYPE_TRAILER = "TRAILER";

        this.renderers = {};
        this.renderers[this.LOCATION_TYPE_CUSTOMER] = (data) => this.renderStop(data);
        this.renderers[this.LOCATION_TYPE_WAREHOUSE] = (data) => this.renderStop(data);
        this.renderers[this.LOCATION_TYPE_TRAILER] = (data) => this.renderTrailer(data);
    }

    renderStop(data) {
        return (
            <div>
                <div className="uk-text-truncate">
                    {data.info.name}
                </div>
                <div className="uk-text-small uk-text-truncate">
                    {data.info.formattedAddress}
                </div>
            </div>
        );
    }

    renderTrailer(data) {
        return (
            <div>
                <div className="uk-text-truncate">
                    {data.info.name}
                </div>
                <div className="uk-text-small uk-text-truncate">
                    Location: {data.trailerDetails.latestLocation && data.trailerDetails.latestLocation.postaladdress ? data.trailerDetails.latestLocation.postaladdress.formattedAddress : ""}
                </div>
            </div>
        );
    }

    onAcceptOrderedRoute() {
        this.props.onAcceptOrderedRoute();
    }

    onRouteChanged(selectedData) {
        this.props.onRouteChanged(selectedData);
    }

    getMessages(list) {
        let messages = null;
        if (list && list.length > 0) {
            messages = list.map(message => {
                let className = message.type == "error" ? "uk-icon-times-circle uk-text-danger" : (message.type == "warning" ? "uk-icon-exclamation-circle uk-text-warning" : "" );
                return (
                    <div className="uk-text-small uk-text-truncate">
                        <i className={className}
                           style={{paddingLeft: "15px", paddingRight: "5px"}}/>
                        {message.text}
                    </div>
                );
            });
        }
        return messages;
    }

    getOpDisplay(op) {
        let iconClassName = null;
        if (op.opType) {
            if (op.opType.id == this.OP_TYPE_LOAD) {
                iconClassName = "uk-icon-plus-square-o";
            } else if (op.opType.id == this.OP_TYPE_UNLOAD) {
                iconClassName = "uk-icon-minus-square-o";
            }
        }

        let messages = this.getMessages(op.messages);

        let shipmentCodeDisplay = "#" + op.shipment.code;
        if (op.hasMessages) {
            shipmentCodeDisplay = <span className="uk-text-contrast md-bg-red-900">{shipmentCodeDisplay}</span>
        }

        return (
            <div style={{paddingLeft: "15px"}}>
                <div className="uk-text-small uk-text-truncate">
                    <i className={iconClassName} style={{paddingRight: "5px"}}/>
                    Shipment {shipmentCodeDisplay},
                    Ready at {op.shipment.readyAtDate.localDateTime} {op.shipment.readyAtDate.timezone}
                    {this.getOpCurrentTo(op)}
                </div>
                <div>
                    {messages}
                </div>
            </div>
        );
    }

    getOpCurrentTo(op) {
        let ret = null;
        if (op.shipment.newCurrentTo && op.shipment.newCurrentTo.location && op.opType && op.opType.id == this.OP_TYPE_LOAD) {
            ret = (
                <span>, &nbsp;
                    <span className="uk-text-contrast md-bg-red-900">
                        Changed to: {op.shipment.newCurrentTo.location.name}
                    </span>
                </span>
            );
        }
        return ret;
    }

    getPinDisplay(data) {
        let pinDisplay = null;
        if (this.props.routeInfo && this.props.routeInfo.orderedRoute) {
            let index = _.findIndex(this.props.routeInfo.orderedRoute, function (o) {
                return o.id == data.id;
            });
            if (index >= 0) {
                let pinClassName = "map-pin map-" + (index == this.props.routeInfo.orderedRoute.length - 1 ? "b" : "a");
                pinDisplay = (
                    <div className={pinClassName}>
                        {String.fromCharCode(65 + index)}
                    </div>
                );
            }
        }
        return pinDisplay;
    }

    getTripInfo(data) {
        let tripInfo = null;

        if (data.tripInfo) {
            let firstLine = "";

            if (data.tripInfo.grossWeight) {
                firstLine += " " + data.tripInfo.grossWeight + " kg";
            }

            if (data.tripInfo.volume) {
                firstLine += " " + data.tripInfo.volume + " m3";
            }

            if (data.tripInfo.ldm) {
                firstLine += " " + data.tripInfo.ldm + " ldm";
            }

            firstLine = firstLine == "" ? null : <span>{_.trim(firstLine)}<br/></span>;

            if (!firstLine && data.index == 0) {
                firstLine = <span className="md-color-red-500"><b>Empty</b><br/></span>
            }

            let secondLine = "";

            if (data.tripInfo.km) {
                secondLine += " " + data.tripInfo.km;
            }

            secondLine = secondLine == "" ? null : <span><b>{_.trim(secondLine)}</b></span>;

            if (firstLine || secondLine) {
                tripInfo = (
                    <div className="uk-text-small uk-text-truncate" style={{
                        position: "relative",
                        width: "175px",
                        backgroundColor: "white",
                        zIndex: 1,
                        marginTop: "25px",
                    }}>
                        {firstLine}
                        {secondLine}
                    </div>
                );
            }
        }

        return tripInfo
    }

    dataUpdateHandler(dataId, field, value) {
        this.props.dataUpdateHandler(dataId, field, value);
    }

    onRouteRender(data) {
        let pinDisplay = this.getPinDisplay(data);
        let text = (
            <div>
                {this.renderers[data.info.type](data)}
                {
                    data.ops.map(op => {
                        return this.getOpDisplay(op);
                    })
                }
                {this.getMessages(data.messages)}
            </div>
        );

        let tripInfo = this.getTripInfo(data);

        let divStyle = {padding: "5px", borderWidth: "1px", borderRadius: "5px", borderColor: "white"};
        let divClassName = null;
        if (data.hasMessages) {
            divStyle.borderColor = "red";
            divClassName = "md-bg-red-50";
        }

        return (
            <div style={divStyle} className={divClassName}>
                <div style={{
                    background: "rgba(0,0,0,.085)",
                    height: "100%",
                    position: "absolute",
                    zIndex: "1",
                    width: "4px",
                    marginLeft: pinDisplay ? "51px" : "16px",
                    display: data.index == this.props.selectedData.length - 1 ? "none" : "block"
                }}/>
                {pinDisplay}
                <div className={"map-icon map_" + data.icon}
                     style={{position: "absolute", zIndex: 2, marginLeft: pinDisplay ? "35px" : "0px"}}/>
                <div style={{paddingLeft: pinDisplay ? "80px" : "53px"}}>
                    {text}
                </div>
                <div style={{paddingLeft: pinDisplay ? "80px" : "53px"}}>
                    <div style={{paddingLeft: "10px"}}>
                        <Grid>
                            <DateTimeMini label="PTA" data={data.plannedTimeArrival}
                                          onchange={(value) => {this.dataUpdateHandler(data.id, "plannedTimeArrival", value)}} />
                            <DateTimeMini label="PTD" data={data.plannedTimeDeparture}
                                          onchange={(value) => {this.dataUpdateHandler(data.id, "plannedTimeDeparture", value)}}/>
                        </Grid>
                    </div>
                </div>
                {tripInfo}
            </div>
        );
    }

    onRouteDelete(data) {
        this.props.onRouteDelete(data);
    }

    render() {
        let route = null;

        if (this.props.selectedData && this.props.selectedData.length > 0) {
            route = (
                <div>
                    <Sortable onchange={(items) => this.onRouteChanged(items)}
                              renderItem={(item) => this.onRouteRender(item)}
                              items={this.props.selectedData}
                              buttons={this.routeButtons}/>
                </div>
            );
        }

        return (
            <div>
                {route}
            </div>
        );
    }
}
