import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Button } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";
import { VehicleFeature } from './VehicleFeature';


export class PlanningShipmentsTab extends TranslatingComponent{

    constructor(props){
        super(props);
    }

    handleRemoveSegment(segment){
        this.props.onRemoveSegment &&
            this.props.onRemoveSegment(segment);
    }

    renderPackages(segment){
        let grossWeight = "";
        let volume = "";
        let ldm = "";

        if(segment.shipment.grossWeight) {
            grossWeight = segment.shipment.grossWeight;
        }

        if(segment.shipment.volume) {
            volume = segment.shipment.volume;
        }

        if(segment.shipment.ldm) {
            ldm = segment.shipment.ldm;
        }
        let packageTypes = [];
        if(segment.shipment.packageTypes){
            packageTypes = segment.shipment.packageTypes.map(item => item.count + " " + item.name);
        }
        return(
            <Grid>
                <GridCell width="1-4" noMargin = {true}>
                    <div className="uk-text-large md-color-grey-700">{packageTypes.join(" ")}</div>
                </GridCell>
                <GridCell width="1-4" noMargin = {true}>
                    <div className="uk-text-large md-color-grey-700">{grossWeight ? grossWeight + " kg" : ""}</div>
                </GridCell>
                <GridCell width="1-4" noMargin = {true}>
                    <div className="uk-text-large md-color-grey-700">{volume ? volume + " m³" : ""}</div>
                </GridCell>
                <GridCell width="1-4" noMargin = {true}>
                    <div className="uk-text-large md-color-grey-700">{ldm ? ldm + " ldm" : ""}</div>
                </GridCell>
            </Grid>
        );
    }

    renderVehicleFeaturesContent(segment) {
        return VehicleFeature.createVehicleRequirementElementsOfSegment(segment,
            (featureId) => {
                this.props.handleRequiredVehicleEnableDisable(segment._key, featureId)
            },
            (featureId) => {
                this.props.handleNotAllowedVehicleEnableDisable(segment._key, featureId)
            })

    }

    renderItem(segment){
        return(
            <div className="md-list-content">
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        <span className="uk-text-bold uk-text-x-large" style = {{marginRight: "12px"}}>{segment.shipment.code}</span>
                        <span className="uk-text-bold">{segment.shipment.customerName}</span>
                        <span style = {{float: "right"}}>
                            <Button label="remove" flat = {true} size="small" style="danger" onclick = {(e) => this.handleRemoveSegment(segment) } />
                        </span>
                    </GridCell>
                    <GridCell width="1-1" noMargin = {true}>
                        {this.renderPackages(segment)}
                    </GridCell>
                    <GridCell width="1-1" noMargin = {true}>
                        {this.renderVehicleFeaturesContent(segment)}
                    </GridCell>
                    <GridCell width="1-2" noMargin = {true}>
                        <Grid>
                            <GridCell width="1-1">
                                <span className="label">Sender</span>
                            </GridCell>
                            <GridCell width="1-1" noMargin = {true}>
                                <span className="uk-text-muted uk-text-small">{segment.shipment.sender.companyName}</span>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-2" noMargin = {true}>
                        <Grid>
                            <GridCell width="1-1">
                                <span className="label">Receiver</span>
                            </GridCell>
                            <GridCell width="1-1" noMargin = {true}>
                                <span className="uk-text-muted uk-text-small">{segment.shipment.receiver.companyName}</span>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-2" noMargin = {true}>
                        <Grid>
                            <GridCell width="1-1">
                                <span className="label">From</span>
                            </GridCell>
                            <GridCell width="1-1" noMargin = {true}>
                                <div className="uk-text-muted uk-text-small">{segment.fromLocation.name}</div>
                                <div className="uk-text-muted">{segment.fromLocation.countryIsoCode + "-" + segment.fromLocation.postalCode}</div>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-2" noMargin = {true}>
                        <Grid>
                            <GridCell width="1-1">
                                <span className="label">To</span>
                            </GridCell>
                            <GridCell width="1-1" noMargin = {true}>
                                <div className="uk-text-muted uk-text-small">{segment.toLocation.name}</div>
                                <div className="uk-text-muted">{segment.toLocation.countryIsoCode + "-" + segment.toLocation.postalCode}</div>
                            </GridCell>
                        </Grid>
                    </GridCell>

                </Grid>
            </div>
        );
    }

    renderListItem(segment){
        return(
            <li key={segment.shipment.code}>
                {this.renderItem(segment)}
            </li>
        );

    }
    render(){
        if(!this.props.segments){
            return null;
        }

        return(
            <ul className="md-list">
                {this.props.segments.map(item => this.renderListItem(item))}
            </ul>
        );
    }
}