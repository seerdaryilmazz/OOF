import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {PageHeader, Grid, GridCell, Card} from 'susam-components/layout';
import {Notify, Button} from 'susam-components/basic';
import {StateTrackerButton} from 'susam-components/advanced';
import {ShipmentCard} from './ShipmentCard';

import {OrderRequestInfo} from './OrderRequestInfo';
import {OrderGeneralInfo} from './OrderGeneralInfo';
import {DocumentList} from './DocumentList';
import {RouteRequirements} from './RouteRequirements';
import {VehicleRequirements} from './VehicleRequirements';
import {EquipmentRequirements} from './EquipmentRequirements';
import {OrderPagePreview} from '../preview/OrderPagePreview';
import {TaskService, OrderRequestService, OrderService, ProjectService, RuleService, LocationService, BillingService} from '../services';

export class OrderPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {order: {shipments:[]}, shipmentCount:0, project:{}, locationRegionMap: {sender: {}, receiver:{}}};
        if(this.props.location.query){
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
    componentDidMount(){
        if(this.state.taskId){
            this.loadDataUsingTaskId(this.state.taskId);
            this.updateTaskStatusIfNecessary();
        } else if (this.state.orderId) {
            this.loadDataUsingOrderId(this.state.orderId);
        } else if (this.state.orderRequestId) {
            this.loadDataUsingOrderRequestId(this.state.orderRequestId);
        } else{
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

    updateTaskStatusIfNecessary(){
        let inProgess = "INPROGRESS";
        axios.get('/task-service/' + this.state.taskId + '/nextstates')
            .then((response) => {
                let nextStateIsInProgress = false;
                response.data.forEach((item) => {
                    if(item == inProgess){
                        nextStateIsInProgress = true;
                    }
                });
                if(nextStateIsInProgress){
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
        if(!this.state.loaded) {
            Notify.showError("Page is not Loaded yet, please wait a few seconds");
            return;
        }
        OrderService.getNewShipmentCode().then(response => {
            let code = response.data;
            let shipment = {code: code, _defaultReadyAtDate: this.state.orderRequest ? this.state.orderRequest.readyAtDate + " 00:00": "", payWeight: 0};
            let order = _.cloneDeep(this.state.order);
            order.shipments.push(shipment);
            this.setState({order: order, shipmentCount: this.state.shipmentCount + 1});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadDataUsingTaskId(taskId){
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
            if(orderReqResponse.data.orderType.code == "CONTRACTED" && orderReqResponse.data.projectNo) {
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
        this.setState(state, () => {
            this.handleProductRuleExecution();
        });
    }

    handleDocumentListChange(newList) {
        let order = _.cloneDeep(this.state.order);
        order.documents = newList;
        this.setState({order: order});
    }

    handleShipmentUpdate(shipment){
        let order = _.cloneDeep(this.state.order);
        let shipmentIndex =_.findIndex(order.shipments, item => { return item.code == shipment.code});
        if(shipmentIndex == -1){
            order.shipments.push(shipment);
        }else{
            order.shipments[shipmentIndex] = shipment;
        }
        this.setState({order: order}, () => {
            this.handleProductRuleExecution();
            this.handlePackageGroupVehicleRuleExecution();
        });
    }

    handlePackageGroupVehicleRuleExecution() {

        let order = _.cloneDeep(this.state.order);

        let packageGroupVehicleRuleKey = [];
        order.shipments.filter(shipment => shipment.shipmentUnits)
                .forEach(shipment => {
                    shipment.shipmentUnits.forEach(shipmentUnit => {
                        if (shipmentUnit && shipmentUnit.type && !packageGroupVehicleRuleKey.find( elem => elem == shipmentUnit.type.id)) {
                            packageGroupVehicleRuleKey.push(shipmentUnit.type.id);
                        }
                    })
                });


        if (this.state.packageGroupVehicleRuleKey && _.isEqual(this.state.packageGroupVehicleRuleKey, packageGroupVehicleRuleKey)) {
            //no parameter relate with productRules are updated since last method call
            return;
        }

        //Missing parameters for rule to be triggered
        if (packageGroupVehicleRuleKey.length == 0) {
            //reset if there exit any rule result
            this.setState({packageGroupVehicleRuleKey: packageGroupVehicleRuleKey, vehicleFilterRuleResult: null});
            return;
        }

        RuleService.executePackageGroupVehicleRequirementRules(order).then(response => {
            this.setState({packageGroupVehicleRuleKey: packageGroupVehicleRuleKey, vehicleFilterRuleResult: response.data})
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleProductRuleExecution() {

        let order = _.cloneDeep(this.state.order);

        let productRuleKey = {
            truckLoadType: order.truckLoadType,
            serviceType: order.serviceType,
            shipmentsDetail: order.shipments
                .filter(shipment => shipment.code && shipment.sender && shipment.receiver)
                .map(shipment => {
                    return {
                        shipmentCode: shipment.code,
                        senderLocationId: shipment.sender.locationId,
                        receiverLocationId: shipment.receiver.locationId,
                        readyAtDate: shipment.readyAtDate,
                        pickupAppointment: shipment.pickupAppointment
                    }
                })
        }

        if(this.state.productRuleKey && _.isEqual(this.state.productRuleKey, productRuleKey)) {
            //no parameter relate with productRules are updated since last method call
            return;
        }

        //Missing parameters for rule to be triggered
        if(!productRuleKey.truckLoadType || !productRuleKey.serviceType  || productRuleKey.shipmentsDetail.length == 0) {
            //reset if there exit any rule result
            order.shipments.forEach(shipment => {
                if (shipment.requestedDeliveryDate) {
                    shipment.requestedDeliveryDate = null;
                }
            })

            this.setState({productRuleKey: productRuleKey, order: order});
            return;
        }

        this.callWithResolvedLocationRegionsOfOrderShipments((resolvedOrder) => {
            //new shipments does not have id, old shipments has id
            //each shipment should have id in order to execute relates rules so we ensure each of thme has id
            //this is the copy of order object, manipulating id won't cause problems
            let index = 0;
            resolvedOrder.shipments.forEach(shipment => shipment.id = index++);
            RuleService.executeProductRule(resolvedOrder).then(response => {
                let i = 0;
                order.shipments.forEach(shipment => {
                    let shipmentRuleResult = response.data.result[i++];
                    if (shipmentRuleResult) {
                        shipment.requestedDeliveryDate = shipmentRuleResult.shouldBeDeliveredBefore;
                    } else {
                        shipment.requestedDeliveryDate = null;
                    }
                    if(!ShipmentCard.validateDeliveryDates(shipment.requestedDeliveryDate, shipment.deliveryAppointment)) {
                        shipment._rddErrorExist = true;
                    } else {
                        shipment._rddErrorExist = null;
                    }
                })
                this.setState({order: order, productRuleKey: productRuleKey})
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    callWithResolvedLocationRegionsOfOrderShipments(callback) {

        let locationRegionMap = _.cloneDeep(this.state.locationRegionMap);

        let requestArray = [];
        this.state.order.shipments.forEach(shipment => {

            let senderLocationId = shipment.sender.locationId;
            let senderRegionData = locationRegionMap.sender[senderLocationId];
            if (!senderRegionData) {
                let newElem = {
                    locationId: senderLocationId,
                    type: "sender",
                    request: LocationService.findCollectionRegionOfLocation(senderLocationId),
                    response: null
                };
                locationRegionMap.sender[senderLocationId] = newElem;
                requestArray.push(newElem);
            }

            let receiverLocationId = shipment.receiver.locationId;
            let receiverRegionData = locationRegionMap.receiver[receiverLocationId];
            if (!receiverRegionData) {
                let newElem = {
                    locationId: receiverLocationId,
                    type: "sender",
                    request: LocationService.findDistributionRegionOfLocation(receiverLocationId),
                    response: null
                };
                locationRegionMap.receiver[receiverLocationId] = newElem;
                requestArray.push(newElem);
            }
        });

        if (requestArray.length > 0) {
            axios.all(requestArray.map(ra => ra.request)).then((results) => {
                let index = 0;
                results.forEach(result => {
                    requestArray[index].response = result.data;
                    index++;
                });

                this.setState({locationRegionMap: locationRegionMap}, (order) => {
                    let resolvedOrder = this.retrieveCopyOfOrderWithResolvedLocationRegions();
                    callback(resolvedOrder)
                });
            }).catch((error) => {
                Notify.showError(error);
            });
        } else {
            let resolvedOrder = this.retrieveCopyOfOrderWithResolvedLocationRegions();
            callback(resolvedOrder);
        }
    };

    retrieveCopyOfOrderWithResolvedLocationRegions() {
        let order = _.cloneDeep(this.state.order);

        let locationRegionMap = this.state.locationRegionMap;

        order.shipments.forEach(shipment => {
            this.setShipmentSenderReceiverRegionData(shipment.sender, locationRegionMap.sender[shipment.sender.locationId].response);
            this.setShipmentSenderReceiverRegionData(shipment.receiver, locationRegionMap.receiver[shipment.receiver.locationId].response);
        })

        return order;
    }

    setShipmentSenderReceiverRegionData(senderOrReceiver, regionData) {
        if(regionData) {
            senderOrReceiver.locationRegionId = regionData.id;
            senderOrReceiver.locationRegionCategoryId = regionData.category.id;
            senderOrReceiver.locationOperationRegionId = regionData.operationRegion.id;
        }
    }

    // shipment = copy of another shipment
    handleShipmentCopy(shipment) {
        let order = _.cloneDeep(this.state.order);
        order.shipments.push(shipment);
        this.setState({order: order, shipmentCount: this.state.shipmentCount + 1});
    }

    handleShipmentDelete(shipment) {
        let order = _.cloneDeep(this.state.order);
        _.remove(order.shipments, function(item) {
            return item.code == shipment.code;
        });
        this.setState({order: order, shipmentCount: this.state.shipmentCount - 1}, () => {
            this.handlePackageGroupVehicleRuleExecution();
        });
    }

    handleOrderGeneralInfoUpdate(value){
        let order = _.cloneDeep(this.state.order);
        order.serviceType = value.serviceType;
        order.truckLoadType = value.truckLoadType;
        order.incoterm = value.incoterm;
        order.insuredByEkol = value.insuredByEkol;
        this.setState({order: order}, () => {
            this.handleProductRuleExecution();
        });
    }
    handleRouteRequirementsUpdate(requirements){
        let order = _.cloneDeep(this.state.order);
        order.routeRequirements = requirements;
        this.setState({order: order});
    }
    handleVehicleRequirementsUpdate(requirements){
        let order = _.cloneDeep(this.state.order);
        order.vehicleRequirements = requirements;
        this.setState({order: order});
    }
    handleEquipmentRequirementsUpdate(requirements){
        let order = _.cloneDeep(this.state.order);
        order.equipmentRequirements = requirements;
        this.setState({order: order});
    }

    handleCreateProvisionsClick() {

        OrderRequestService.getJustOrderId(this.state.orderRequest.id).then(response => {

            let orderId = response.data;
            let data = {
                orderId: orderId
            };

            BillingService.produceProvisionsOfOrderCanBeCreatedEvent(data).then(responseInner => {
                Notify.showSuccess("Event triggered for order with id " + orderId);
            }).catch(error => {
                Notify.showError(error);
            });

        }).catch(error => {
            Notify.showError(error);
        });
    }

    render(){
        let isSpotOrder = true;
        if(this.state.orderRequest && this.state.orderRequest.orderType && this.state.orderRequest.orderType.code === "CONTRACTED") {
            isSpotOrder = false;
        }

        let requirements =  <Grid>
                <GridCell width="1-1">
                    <VehicleRequirements onupdate = {(requirements) => this.handleVehicleRequirementsUpdate(requirements)}
                                         project={this.state.project.data} vehicleFilterRuleResult={this.state.vehicleFilterRuleResult}/>
                </GridCell>
        </Grid>;
        if(isSpotOrder) {
            requirements = (
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        <RouteRequirements onupdate = {(requirements) => this.handleRouteRequirementsUpdate(requirements)}
                                           project={this.state.project.data}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <VehicleRequirements onupdate = {(requirements) => this.handleVehicleRequirementsUpdate(requirements)}
                                             project={this.state.project.data} vehicleFilterRuleResult={this.state.vehicleFilterRuleResult}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <EquipmentRequirements onupdate = {(requirements) => this.handleEquipmentRequirementsUpdate(requirements)}
                                               project={this.state.project.data}/>
                    </GridCell>
                </Grid>
            );
        }

        let shipments = <span>Click "Create New Shipment" to start</span>;

        if(this.state.shipmentCount > 0){

            shipments = [];

            for(let i = 0; i < this.state.shipmentCount; i++){

                let initialShipment = this.state.order.shipments[i];

                shipments.push(
                    <GridCell key = {i} width="1-3">
                        <ShipmentCard
                            value = {initialShipment}
                            projectData = {this.state.project.data}
                            onupdate = {(shipment) => this.handleShipmentUpdate(shipment)}
                            oncopy = {(shipment) => this.handleShipmentCopy(shipment)}
                            ondelete = {(shipment) => this.handleShipmentDelete(shipment)}
                        />
                    </GridCell>);
            }
        }

        return (
            <div>
                <PageHeader title="New Order"  translate={true} />
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        <div className="uk-float-right">
                            <StateTrackerButton label="save" style="primary" waves = {true} onclick={() => this.handleClickSave()}
                                                component={this} propsToCheck={["order"]} options={{ignoreBooleanFalse:true}} initialState={this.state} />
                            <OrderPagePreview order={this.state.order} />
                            <span>
                                &nbsp;&nbsp;<Button label="Create Provisions" onclick={() => this.handleCreateProvisionsClick()}/>
                            </span>
                        </div>
                    </GridCell>
                    <GridCell width="1-1">
                        <Grid>
                            <GridCell width="3-4" noMargin = {true}>
                                <Grid>
                                    <GridCell width="1-1" noMargin = {true}>
                                        <Grid>
                                            <GridCell width="2-3" noMargin = {true}>
                                                <OrderRequestInfo orderRequest={this.state.orderRequest} project={this.state.project}/>
                                            </GridCell>
                                            <GridCell width="1-3" noMargin = {true}>
                                                <DocumentList
                                                    documents={this.state.order.documents ? this.state.order.documents : []}
                                                    onchange={(newList) => this.handleDocumentListChange(newList)}/>
                                            </GridCell>
                                        </Grid>
                                    </GridCell>
                                    <GridCell width="1-1" >
                                        <OrderGeneralInfo
                                            onupdate={(value) => this.handleOrderGeneralInfoUpdate(value)}
                                            data={this.state.order}
                                            project={this.state.project.data}/>
                                    </GridCell>
                                    <GridCell width="1-1">
                                        <Button label="create new shipment" style="primary" waves = {true} onclick={() => this.handleClickCreateShipment()}/>
                                    </GridCell>
                                </Grid>
                            </GridCell>
                            <GridCell width="1-4" noMargin = {true}>
                                {requirements}
                            </GridCell>

                            <GridCell width="1-1">
                                <Grid>
                                    {shipments}
                                </Grid>
                            </GridCell>
                        </Grid>

                    </GridCell>

                </Grid>
            </div>
        );
    }
}