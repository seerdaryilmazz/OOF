import * as axios from 'axios';
import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from "susam-components/basic";
import { Grid, GridCell, Loader, Page } from "susam-components/layout";
import { AuthorizationService, OrderService, ShipmentAssignmentPlanningService, WarehouseService } from "../services";
import { OrderList } from "./responsibility/OrderList";
import { Responsibility } from "./responsibility/Responsibility";





export class OrderPlanning extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            lookup: {}
        };
    }

    loadShipments(){
        this.setState({busy: true});
        axios.all([
            OrderService.getMyShipments(),
            WarehouseService.retrieveWarehouses(),
            AuthorizationService.getSubsidiaries()
        ]).then(axios.spread((shipments, wareHouseNameIdPair, subsidiaries) => {
            let state = _.cloneDeep(this.state);
            state.shipments = shipments.data;
            state.lookup.warehouses = wareHouseNameIdPair.data.map(item => item.companyLocation);
            state.lookup.subsidiaries = subsidiaries.data;
            state.busy = false;
            this.setState(state);
        })).catch(error => {
            Notify.showError(error);
            this.setState({busy: false});
        })
    }

    componentDidMount(){
        this.loadShipments();
    }

    componentWillReceiveProps(nextProps){

    }

    handleSelectFromList(item){
        ShipmentAssignmentPlanningService.getShipmentAssignments(item.id).
        then((response) => {
            if(response.data) {
                this.setState({selectedShipment: _.cloneDeep(item), planSegments: response.data});
            } else {
                this.setState({selectedShipment: null, planSegments: null});
                Notify.showError("There is no plan for the selected shipment");
            }
        }).catch(error => {
            Notify.showError(error);
        })
    }

    updateWarehouse(segmentId, warehouse) {
        let request = {
            shipmentId: this.state.selectedShipment.id,
            assignmentId: segmentId,
            warehouse: this.convertToIdNamePair(warehouse),
        }

        ShipmentAssignmentPlanningService.updateWarehouse(request).then((response) => {
            Notify.showSuccess("Warehouse Update Successful.");
            this.reloadSelectedSegment();
        }).catch(error => {
            Notify.showError(error);
            this.reloadSelectedSegment();
        })
    }

    updateResponsible(segmentId, responsible) {
        let request = {
            shipmentId: this.state.selectedShipment.id,
            assignmentId: segmentId,
            responsible: this.convertToIdNamePair(responsible),
        }

        ShipmentAssignmentPlanningService.updateResponsible(request).then((response) => {
            Notify.showSuccess("Responsible Update Successful.");
            this.reloadSelectedSegment();
        }).catch(error => {
            Notify.showError(error);
            this.reloadSelectedSegment();
        })
    }

    divideSegment(segmentId, warehouse, responsible) {
        let request = {
            shipmentId: this.state.selectedShipment.id,
            assignmentId: segmentId,
            warehouse: this.convertToIdNamePair(warehouse),
            responsible: this.convertToIdNamePair(responsible)
        };

        ShipmentAssignmentPlanningService.divideAssignments(request).then((response) => {
            Notify.showSuccess("Divide Successful.");
            this.reloadSelectedSegment();
        }).catch(error => {
            Notify.showError(error);
            this.reloadSelectedSegment();
        })
    }

    mergeSegment(firstSegmentId, secondSegmentId) {
        let request = {
            shipmentId: this.state.selectedShipment.id,
            firstAssignmentId: firstSegmentId,
            secondAssignmentId: secondSegmentId,
        }

        ShipmentAssignmentPlanningService.mergeAssignments(request).then((response) => {
            Notify.showSuccess("Merge Successful.");
            this.reloadSelectedSegment();
        }).catch(error => {
            Notify.showError(error);
            this.reloadSelectedSegment();
        })
    }

    reloadSelectedSegment() {
        if(this.state.selectedShipment) {
            this.handleSelectFromList(this.state.selectedShipment);
        }
    }


    convertToIdNamePair(data) {
        return {id: data.id, name: data.name};
    }

    render(){
        let title = super.translate("Shipment Planning Assignment");

        let selectedItem = this.state.selectedItem;

        let planSegments = this.state.planSegments;

        let collectionWarehouse = null;
        let distributionWarehouse = null;

        if(this.state.selectedShipment) {
            collectionWarehouse = this.state.selectedShipment.collectionWarehouse ? this.state.selectedShipment.collectionWarehouse.location : null;
            distributionWarehouse = this.state.selectedShipment.distributionWarehouse ? this.state.selectedShipment.distributionWarehouse.location : null;
        }

        let content = <Loader title="Loading Shipments" />;
        if(!this.state.busy){
            content = <OrderList shipments={this.state.shipments}
                                 selectedItem = {selectedItem}
                                 onselect = {(item) => this.handleSelectFromList(item)}/>;
        }
        return (
            <Page title={title} >
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <Responsibility shipments={{}}
                                        collectionWarehouse={collectionWarehouse}
                                        distributionWarehouse={distributionWarehouse}
                                        segments={planSegments}
                                        lookup={this.state.lookup}
                                        handleResponsibleUpdate={(segmentId, responsible) => this.updateResponsible(segmentId, responsible)}
                                        handleWarehouseUpdate={(segmentId, warehouse) => this.updateWarehouse(segmentId, warehouse)}
                                        handleDivide={(segmentId, warehouse, responsible) => this.divideSegment(segmentId, warehouse, responsible)}
                                        handleMerge={(previousSegmentId, nextSegmentId) => this.mergeSegment(previousSegmentId, nextSegmentId)}

                        />
                    </GridCell>
                    <GridCell width="1-1" noMargin={true}>
                        {content}
                    </GridCell>
                </Grid>
            </Page>
        );
    }
}
