import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {PageHeader, Grid, GridCell, Card, Modal} from 'susam-components/layout';
import {Notify, Button, TextArea} from 'susam-components/basic';
import {StateTrackerButton} from 'susam-components/advanced';
import {ShipmentCard} from './ShipmentCard';

import {OrderRequestInfo} from './OrderRequestInfo';
import {OrderGeneralInfo} from './OrderGeneralInfo';
import {DocumentList} from './DocumentList';
import {RouteRequirements} from './RouteRequirements';
import {VehicleRequirements} from './VehicleRequirements';
import {EquipmentRequirements} from './EquipmentRequirements';
import {OrderPagePreview} from '../preview/OrderPagePreview';
import {TaskService, OrderRequestService, OrderService, ProjectService} from '../services';

//TODO: this page is intended to be used for development purpose only to create orders easily, this page should be removed once the tasks at order planning are finished.
export class OrderPageEasy extends React.Component {
    constructor(props) {
        super(props);
        this.state = {order: {shipments: []}, shipmentCount: 0, project: {}};
        if (this.props.location.query) {
            if (this.props.location.query.taskId) {
                this.state.taskId = this.props.location.query.taskId;
            } else if (this.props.location.query.orderId) {
                this.state.orderId = this.props.location.query.orderId;
            } else if (this.props.location.query.orderRequestId) {
                // Normalde böyle bir senaryo yok, sadece geliştirim yaparken ara adımları azaltmak için eklendi.
                // Bir order request oluşturup order request'in id'si ile order sayfası açılıp yeni bir order oluşturulabilsin diye...
                this.state.orderRequestId = this.props.location.query.orderRequestId;
            }
        }
    }

    componentDidMount() {
        if (this.state.taskId) {
            this.loadDataUsingTaskId(this.state.taskId);
            this.updateTaskStatusIfNecessary();
        } else if (this.state.orderId) {
            this.loadDataUsingOrderId(this.state.orderId);
        } else if (this.state.orderRequestId) {
            this.loadDataUsingOrderRequestId(this.state.orderRequestId);
        } else {
            this.setState({loaded: true});
        }

    }

    handleClickSave() {
        let order = _.cloneDeep(this.state.order);
        order.request = {id: this.state.orderRequest.id};
        OrderService.save(order).then(response => {
            if (this.state.taskId) {
                this.completeTask();
            }
            Notify.showSuccess("Order saved successfully");
        }).catch(error => {
            Notify.showError(error);
        });
    }

    completeTask() {
        axios.put('/task-service/' + this.state.taskId + '/complete').then((response) => {
            Notify.showSuccess("Task is completed");
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    updateTaskStatusIfNecessary() {
        let inProgess = "INPROGRESS";
        axios.get('/task-service/' + this.state.taskId + '/nextstates')
            .then((response) => {
                let nextStateIsInProgress = false;
                response.data.forEach((item) => {
                    if (item == inProgess) {
                        nextStateIsInProgress = true;
                    }
                });
                if (nextStateIsInProgress) {
                    axios.put('/task-service/' + this.state.taskId + '/changestatus?taskStatus=' + inProgess)
                        .then((response) => {
                            Notify.showSuccess("Task status updated to In Progress");
                        }).catch((error) => {
                        Notify.showError(error);
                    });
                }

            })
            .catch((error) => {
                Notify.showError(error);
            });
    }

    handleClickCreateShipment() {
        if (!this.state.loaded) {
            Notify.showError("Page is not Loaded yet, please wait a few seconds");
            return;
        }
        OrderService.getNewShipmentCode().then(response => {
            let code = response.data;
            let shipment = {
                code: code,
                readyAtDate: this.state.orderRequest ? this.state.orderRequest.readyAtDate : "",
                payWeight: 0
            };
            let order = _.cloneDeep(this.state.order);
            order.shipments.push(shipment);
            this.setState({order: order, shipmentCount: this.state.shipmentCount + 1});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadDataUsingTaskId(taskId) {
        TaskService.getTaskDetails(taskId).then(response => {
            this.loadDataUsingOrderRequestId(response.data.params.orderRequest.id);
        }).catch(error => {
            Notify.showError(error);
            let state = _.cloneDeep(this.state);
            state.loaded = true;
            this.setState(state);
        });
    }

    loadDataUsingOrderRequestId(orderRequestId) {
        this.loadDataUsingOrderRequestPromise(OrderRequestService.get(orderRequestId));
    }

    loadDataUsingOrderId(orderId) {
        this.loadDataUsingOrderRequestPromise(OrderRequestService.getByOrderId(orderId));
    }

    loadDataUsingOrderRequestPromise(orderRequestPromise) {
        orderRequestPromise.then(orderReqResponse => {
            if (orderReqResponse.data.orderType.code == "CONTRACTED" && orderReqResponse.data.projectNo) {
                ProjectService.getProjectDetailsHierarchy(orderReqResponse.data.projectNo, "OrderTemplate").then(projectResponse => {
                    this.loadDataWithOrderReqResponseAndProjectResponse(orderReqResponse, projectResponse);
                });
            } else {
                this.loadDataWithOrderReqResponseAndProjectResponse(orderReqResponse, null);
            }
        }).catch(error => {
            Notify.showError(error);
            let state = _.cloneDeep(this.state);
            state.loaded = true;
            this.setState(state);
        });
    }

    loadDataWithOrderReqResponseAndProjectResponse(orderReqResponse, projectResponse) {
        let state = _.cloneDeep(this.state);
        state.orderRequest = orderReqResponse.data;
        if (state.orderRequest.order) {
            state.order = state.orderRequest.order;
            if (state.order.shipments) {
                state.shipmentCount = _.size(state.order.shipments);
            }
        } else {
            state.order.documents = [];
            state.orderRequest.documents.forEach(item => {
                let copy = _.cloneDeep(item);
                state.order.documents.push(copy);
            });
        }
        if (projectResponse) {
            state.project = projectResponse.data;
        }
        state.loaded = true;
        this.setState(state);
    }

    handleDocumentListChange(newList) {
        let order = _.cloneDeep(this.state.order);
        order.documents = newList;
        this.setState({order: order});
    }

    handleShipmentUpdate(shipment) {
        let order = _.cloneDeep(this.state.order);
        let shipmentIndex = _.findIndex(order.shipments, item => {
            return item.code == shipment.code
        });
        if (shipmentIndex == -1) {
            order.shipments.push(shipment);
        } else {
            order.shipments[shipmentIndex] = shipment;
        }
        this.setState({order: order});
    }

    // shipment = copy of another shipment
    handleShipmentCopy(shipment) {
        let order = _.cloneDeep(this.state.order);
        order.shipments.push(shipment);
        this.setState({order: order, shipmentCount: this.state.shipmentCount + 1});
    }

    handleShipmentDelete(shipment) {
        let order = _.cloneDeep(this.state.order);
        _.remove(order.shipments, function (item) {
            return item.code == shipment.code;
        });
        this.setState({order: order, shipmentCount: this.state.shipmentCount - 1});
    }

    handleOrderGeneralInfoUpdate(value) {
        let order = _.cloneDeep(this.state.order);
        order.serviceType = value.serviceType;
        order.truckLoadType = value.truckLoadType;
        order.incoterm = value.incoterm;
        order.insuredByEkol = value.insuredByEkol;
        this.setState({order: order});
    }

    handleRouteRequirementsUpdate(requirements) {
        let order = _.cloneDeep(this.state.order);
        order.routeRequirements = requirements;
        this.setState({order: order});
    }

    handleVehicleRequirementsUpdate(requirements) {
        let order = _.cloneDeep(this.state.order);
        order.vehicleRequirements = requirements;
        this.setState({order: order});
    }

    handleEquipmentRequirementsUpdate(requirements) {
        let order = _.cloneDeep(this.state.order);
        order.equipmentRequirements = requirements;
        this.setState({order: order});
    }


    render() {
        let isSpotOrder = true;
        if (this.state.orderRequest && this.state.orderRequest.orderType && this.state.orderRequest.orderType.code === "CONTRACTED") {
            isSpotOrder = false;
        }

        let requirements = null;
        if (isSpotOrder) {
            requirements = (
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <RouteRequirements onupdate={(requirements) => this.handleRouteRequirementsUpdate(requirements)}
                                           project={this.state.project.data}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <VehicleRequirements
                            onupdate={(requirements) => this.handleVehicleRequirementsUpdate(requirements)}
                            project={this.state.project.data}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <EquipmentRequirements
                            onupdate={(requirements) => this.handleEquipmentRequirementsUpdate(requirements)}
                            project={this.state.project.data}/>
                    </GridCell>
                </Grid>
            );
        }

        let shipments = <span>Click "Create New Shipment" to start</span>;

        if (this.state.shipmentCount > 0) {

            shipments = [];

            for (let i = 0; i < this.state.shipmentCount; i++) {

                let initialShipment = this.state.order.shipments[i];

                shipments.push(
                    <GridCell key={i} width="1-3">
                        <ShipmentCard
                            value={initialShipment}
                            projectData={this.state.project.data}
                            onupdate={(shipment) => this.handleShipmentUpdate(shipment)}
                            oncopy={(shipment) => this.handleShipmentCopy(shipment)}
                            ondelete={(shipment) => this.handleShipmentDelete(shipment)}
                        />
                    </GridCell>);
            }
        }

        return (
            <div>
                <PageHeader title="New Order"  translate={true} />
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <div className="uk-float-right">
                            <StateTrackerButton label="save" style="primary" waves={true}
                                                onclick={() => this.handleClickSave()}
                                                component={this} propsToCheck={["order"]}
                                                options={{ignoreBooleanFalse: true}} initialState={this.state}/>
                            <Button label="Stringified" onclick={() => {
                                this.handleClickFillFromTemplate()
                            }}/>
                            <OrderPagePreview order={this.state.order}/>
                        </div>
                    </GridCell>
                    <GridCell width="1-1">
                        <Grid>
                            <GridCell width="3-4" noMargin={true}>
                                <Grid>
                                    <GridCell width="1-1" noMargin={true}>
                                        <Grid>
                                            <GridCell width="2-3" noMargin={true}>
                                                <OrderRequestInfo orderRequest={this.state.orderRequest}
                                                                  project={this.state.project}/>
                                            </GridCell>
                                            <GridCell width="1-3" noMargin={true}>
                                                <DocumentList
                                                    documents={this.state.order.documents ? this.state.order.documents : []}
                                                    onchange={(newList) => this.handleDocumentListChange(newList)}/>
                                            </GridCell>
                                        </Grid>
                                    </GridCell>
                                    <GridCell width="1-1">
                                        <OrderGeneralInfo
                                            onupdate={(value) => this.handleOrderGeneralInfoUpdate(value)}
                                            data={this.state.order}
                                            project={this.state.project.data}/>
                                    </GridCell>
                                    <GridCell width="1-1">
                                        <Button label="create new shipment" style="primary" waves={true}
                                                onclick={() => this.handleClickCreateShipment()}/>
                                    </GridCell>
                                </Grid>
                            </GridCell>
                            <GridCell width="1-4" noMargin={true}>
                                {requirements}
                            </GridCell>

                            <GridCell width="1-1">
                                <Grid>
                                    {shipments}
                                </Grid>
                            </GridCell>
                        </Grid>

                    </GridCell>
                    <GridCell>
                        <Modal ref={(c) => this.dateConfirmationModal = c}>
                            <Grid>
                                <GridCell>
                                    <Button label="Close" onclick={() => this.dateConfirmationModal.close()}/>
                                </GridCell>
                                <GridCell>
                                    <TextArea value={this.state.order ? JSON.stringify(this.state.order) : ""}
                                              onchange={(value) => {
                                                  this.setState({"order": JSON.parse(value)})
                                              }}/>
                                </GridCell>
                            </Grid>
                        </Modal>
                    </GridCell>

                </Grid>
            </div>
        );
    }

    handleClickFillFromTemplate() {
        this.dateConfirmationModal.open();
    }


}