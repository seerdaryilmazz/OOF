import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from 'axios';

import {TranslatingComponent} from "susam-components/abstract";
import {Card, Grid, GridCell, Modal} from "susam-components/layout";
import {DropDown, Notify, Button} from "susam-components/basic";

import {RouteService} from '../../services/RouteService';

import * as DataTable from 'susam-components/datatable';

export class RoadTariffDetailsModal extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};

    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    openFor(routeLeg, tariff) {

        RouteService.getRouteLegExpeditionTripRelations(tariff.id).then(response => {
            this.setState({routeLeg: routeLeg, tariff: tariff, expeditionTrips: response.data}, () => {
                this.modal.open()
            });
        }).catch(e => {
            Notify.showError(e);
            this.setState({routeLeg: null, tariff: null, expeditionTrips: null}, () => {
                this.modal.open()
            });
        })

    }

    closeModal() {
        this.setState({routeLeg: null, tariff: null, expeditionTrips: null}, () => {
            this.modal.close();
        });
    }


    renderHeader(routeLeg, tariff, expeditionTrips) {
        return (
            <Grid>
                <GridCell width="4-5">
                    <Grid>
                        <GridCell width="1-4">
                                <span className="uk-text-primary">Tariff Code: </span>
                                <span>{tariff.code}</span>
                        </GridCell>
                        <GridCell width="3-4">
                            <span className="uk-text-primary">Tariff Name: </span>
                            <span>{routeLeg.description}</span>
                        </GridCell>
                        <GridCell width="1-4">
                            <span className="uk-text-primary">From: </span>
                            <span>{routeLeg.from ? routeLeg.from.name : "N/A"}</span>
                        </GridCell>
                        <GridCell width="1-4">
                            <span className="uk-text-primary">ETD: </span>
                            <span>{tariff.departure}</span>
                        </GridCell>
                        <GridCell width="1-4">
                            <span className="uk-text-primary">To: </span>
                            <span>{routeLeg.to ? routeLeg.to.name : "N/A"}</span>
                        </GridCell>
                        <GridCell width="1-4">
                            <span className="uk-text-primary">ETA: </span>
                            <span>{tariff.arrival}</span>
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-5">
                    <Grid>
                        <GridCell>
                                <span className="uk-text-primary">Number Of Planned Vehicles: </span>
                                <span>{expeditionTrips ? expeditionTrips.length : 0}</span>
                        </GridCell>
                        <GridCell>
                                <span className="uk-text-primary">Capacity: </span>
                                <span>{tariff.parentSchedule.capacity}</span>
                        </GridCell>
                    </Grid>
                </GridCell>
            </Grid>
        )
    }

    renderTable(expeditionTrips) {

        if(!expeditionTrips) {
            return null;
        }

        return (
            <DataTable.Table data={expeditionTrips} filterable={false} sortable={true} insertable={false}
                             editable={false}>
                <DataTable.Text width="15" field="tripPlanCode" header="Trip Plan"/>
                <DataTable.Text width="15" field="trailerPlate" header="Vehicle" reader = {new VehicleReader()} printer = {new VehiclePrinter()}/>
                <DataTable.Text width="20" field="finalLocationCountryCode" header="Plan Arrival Country" />
                <DataTable.Text width="20" header="Next Destination" reader = {new AddressReader()} printer = {new AddressPrinter()}/>
            </DataTable.Table>
        );
    }

    renderContent(routeLeg, tariff, expeditionTrips) {
        return (
            <Grid>
                <GridCell width="1-1">
                    {this.renderHeader(routeLeg, tariff, expeditionTrips)}
                </GridCell>
                <GridCell width="1-1">
                    {this.renderTable(expeditionTrips)}
                </GridCell>
            </Grid>
        )
    }


    render() {

        let routeLeg = this.state.routeLeg;
        let tariff = this.state.tariff;
        let expeditionTrips = this.state.expeditionTrips;

        let content = null;

        if(routeLeg && tariff) {
            content = this.renderContent(routeLeg, tariff, expeditionTrips);
        }

        return (
            <div>
                <Modal ref={(c) => this.modal = c} large={true} title="Road Tariff Details" minHeight="500px"
                       actions={[{label: "Close", action: () => this.closeModal()}]}>
                    {content}
                </Modal>
            </div>
        );

    }
}

class VehicleReader{
    readCellValue(row) {
        return row;
    }
    readSortValue(row) {
        return row.trailerPlate ? row.trailerPlate : row.spotVehicleCarrierPlate;
    }
}

class VehiclePrinter {
    print(data) {
        if (!data) {
            return "-";
        }
        if (data.trailerPlate) {
            return <span>{data.trailerPlate}</span>
        } else if (data.spotVehicleCarrierPlate)
            return <span>{data.spotVehicleCarrierPlate + " (spot)"}</span>
    }
}

class AddressReader{
    readCellValue(row) {
        return row;
    }
    readSortValue(row) {
        return row.nextLocationPostalCode;
    }
}

class AddressPrinter{
    print(data) {
        if(!data){
            return "";
        }
        return (<div>
                <div>{data.nextLocationName}</div>
                <div>{data.nextLocationCountryCode} - {data.nextLocationPostalCode}</div>
                <div>{data.nextLocationEta}</div>
            </div>
        );
    }
}

RoadTariffDetailsModal.contextTypes = {
    storage: React.PropTypes.object
};