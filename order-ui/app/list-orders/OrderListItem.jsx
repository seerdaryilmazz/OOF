import React from 'react';
import { Grid, GridCell } from 'susam-components/layout';


export class OrderListItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){

    }

    renderSender(sender){
        if(sender){
            return (
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>On behalf of <span className="uk-text-bold">{sender.companyId}</span> from <span className="uk-text-bold">{sender.locationOwnerCompanyId}</span></GridCell>
                    <GridCell width="1-1" noMargin = {true}>location <span className="uk-text-bold">{sender.locationId}</span></GridCell>
                    <GridCell width="1-1" noMargin = {true}>{this.props.shipment.pickupAppointment ? this.props.shipment.pickupAppointment.start : this.props.shipment.readyAtDate}</GridCell>
                </Grid>
            );
        }else{
            return(<div className="md-card-list-item-sender"></div>);
        }
    }
    renderReceiver(receiver){
        if(receiver){
            return(
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>On behalf of <span className="uk-text-bold">{receiver.companyId}</span> to <span className="uk-text-bold">{receiver.locationOwnerCompanyId}</span></GridCell>
                    <GridCell width="1-1" noMargin = {true}>location <span className="uk-text-bold">{receiver.locationId}</span></GridCell>
                    <GridCell width="1-1" noMargin = {true}>{this.props.shipment.deliveryAppointment ? this.props.shipment.deliveryAppointment.start : ""}</GridCell>
                </Grid>
            );
        }else{
            return(<div className="md-card-list-item-sender"></div>);
        }
    }
    renderShipmentUnitDimensions(shipmentUnits){
        let totalGrossWeightInKilograms = 0;
        let totalVolumeInCubicMeters = 0;
        let totalLdm = 0;

        shipmentUnits.forEach(unit => {
            totalGrossWeightInKilograms += unit.totalGrossWeightInKilograms;
            totalVolumeInCubicMeters += unit.totalVolumeInCubicMeters;
            totalLdm += unit.totalLdm;
        });
        return(
            <Grid>
                <GridCell width="1-1" noMargin = {true}><span className="uk-text-bold">{totalGrossWeightInKilograms}</span> kg</GridCell>
                <GridCell width="1-1" noMargin = {true}><span className="uk-text-bold">{totalVolumeInCubicMeters}</span> m3</GridCell>
                <GridCell width="1-1" noMargin = {true}><span className="uk-text-bold">{totalLdm}</span> ldm</GridCell>
            </Grid>
        );
    }
    renderShipmentUnitPackages(shipmentUnits){
        let packageCount = 0;
        let packageType = "";

        shipmentUnits.forEach(unit => {
            unit.shipmentUnitPackages.forEach(pack => {
                packageCount += pack.count;
                packageType = pack.type.name;
            });

        });
        return(
            <Grid>
                <GridCell width="1-2" noMargin = {true}><span className="uk-text-bold">{packageCount}</span>{packageType}</GridCell>
                <GridCell width="1-2" noMargin = {true}>
                    {this.renderShipmentUnitDimensions(this.props.shipment.shipmentUnits)}
                </GridCell>
            </Grid>
        );
    }

    render(){
        return(

                <Grid>
                    <GridCell width="1-1">
                        <Grid divider = {true} collapse = {true}>
                            <GridCell width="2-10" noMargin = {true}>
                                <div>Shipment <span className="uk-text-bold">{this.props.shipment.code}</span></div>
                                <div>Customer</div>
                                <div>Order No <span className="uk-text-bold">{this.props.shipment.orderId}</span></div>
                            </GridCell>
                            <GridCell width="2-10" noMargin = {true}>
                                <span className="uk-badge uk-badge-success">{this.props.shipment.orderStatus}</span>
                            </GridCell>
                            <GridCell width="2-10" noMargin = {true}>
                                {this.renderSender(this.props.shipment.sender)}
                            </GridCell>
                            <GridCell width="2-10" noMargin = {true}>
                                {this.renderReceiver(this.props.shipment.receiver)}
                            </GridCell>
                            <GridCell width="2-10" noMargin = {true}>
                                {this.renderShipmentUnitPackages(this.props.shipment.shipmentUnits)}
                            </GridCell>
                        </Grid>
                    </GridCell>
                </Grid>
        );

    }

}