import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify, Span, TextInput } from 'susam-components/basic';
import { Card, Grid, GridCell } from 'susam-components/layout';
import { OrderRequestService, OrderService } from '../services';



export class OrderRuleSetPage extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            order: null,
            queryParam1: null,
            queryParam2: null
        };
        if (this.props.location.query && this.props.location.query.orderId) {
            this.state.orderId = this.props.location.query.orderId;
        }
    }

    componentDidMount() {
        if (this.state.orderId) {
            OrderService.getWithRuleSetDetails(this.state.orderId).then(response => {
                this.setState({order: response.data});
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    goToOrder(orderId) {
        window.open("/ui/order/order-page?orderId=" + orderId);
    }

    renderOrder(order) {
        return (
            <Card title="Order Details">
                <Grid>
                    <GridCell width="1-3">
                        <Span label="Id" value={order.id}/>
                    </GridCell>
                    <GridCell width="1-3">
                        <Span label="Status" value={order.status.name}/>
                    </GridCell>
                    <GridCell width="1-3">
                        <Button label="Go To Order" onclick={() => this.goToOrder(order.id)}/>
                    </GridCell>
                </Grid>
            </Card>
        );
    }

    renderRuleSet(ruleSet) {

        if (ruleSet) {
            return (
                <Grid>
                    <GridCell width="1-1">
                        {this.renderApprovalRules(ruleSet.approvalRules)}
                    </GridCell>
                    <GridCell width="1-1">
                        {this.renderVehicleRules(ruleSet.vehicleRules)}
                    </GridCell>
                    <GridCell width="1-1">
                        {this.renderHandlingTimeRules(ruleSet.handlingTimeRules)}
                    </GridCell>
                    <GridCell width="1-1">
                        {this.renderRfUsageRules(ruleSet.rfUsageRules)}
                    </GridCell>
                    <GridCell width="1-1">
                        {this.renderWarehouseHandlingRules(ruleSet.warehouseHandlingRules)}
                    </GridCell>
                    <GridCell width="1-1">
                        {this.renderLoadSpecRules(ruleSet.loadSpecRules)}
                    </GridCell>
                </Grid>
            );
        } else {
            return (
                <Grid>
                    <GridCell width="1-1">
                        <Card>
                            There is no rule set.
                        </Card>
                    </GridCell>
                </Grid>
            );
        }
    }

    renderApprovalRules(approvalRules) {

        let innerComponent;

        if (approvalRules && approvalRules.length > 0) {

            let gridCells = [];

            approvalRules.forEach(elem => {
                gridCells.push(
                    <GridCell width="1-2">
                        <Span label="Rule Name" value={elem.name}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-2">
                        <Span label="Workflow" value={elem.workflow.name}/>
                    </GridCell>
                );
            });

            innerComponent = (
                <Grid>
                    {gridCells}
                </Grid>
            );

        } else {
            innerComponent = ("There is no rule.");
        }

        return (
            <Card title="Approval Rules">
                {innerComponent}
            </Card>
        );
    }

    renderVehicleRules(vehicleRules) {

        let innerComponent;

        if (vehicleRules && vehicleRules.length > 0) {

            let gridCells = [];

            vehicleRules.forEach(elem => {

                let requiredVehicles = "";
                let notAllowedVehicles = "";

                if (elem.requiredVehicles) {
                    requiredVehicles = elem.requiredVehicles.join(", ");
                }
                if (elem.notAllowedVehicles) {
                    notAllowedVehicles = elem.notAllowedVehicles.join(", ");
                }

                gridCells.push(
                    <GridCell width="1-3">
                        <Span label="Shipment Unit Id" value={elem.shipmentUnit.id}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-3">
                        <Span label="Required Vehicles" value={requiredVehicles}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-3">
                        <Span label="Not Allowed Vehicles" value={notAllowedVehicles}/>
                    </GridCell>
                );
            });

            innerComponent =  (
                <Grid>
                    {gridCells}
                </Grid>
            );

        } else {
            innerComponent = ("There is no rule.");
        }

        return (
            <Card title="Vehicle Rules">
                {innerComponent}
            </Card>
        );
    }

    renderHandlingTimeRules(handlingTimeRules) {

        let innerComponent;

        if (handlingTimeRules && handlingTimeRules.length > 0) {

            let gridCells = [];

            handlingTimeRules.forEach(elem => {
                gridCells.push(
                    <GridCell width="1-2">
                        <Span label="Shipment Unit Id" value={elem.shipmentUnit.id}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-2">
                        <Span label="Duration" value={elem.duration}/>
                    </GridCell>
                );
            });

            innerComponent = (
                <Grid>
                    {gridCells}
                </Grid>
            );

        } else {
            innerComponent = ("There is no rule.");
        }

        return (
            <Card title="Handling Time Rules">
                {innerComponent}
            </Card>
        );
    }

    renderRfUsageRules(rfUsageRules) {

        let innerComponent;

        if (rfUsageRules && rfUsageRules.length > 0) {

            let gridCells = [];

            rfUsageRules.forEach(elem => {
                gridCells.push(
                    <GridCell width="1-3">
                        <Span label="Warehouse Id" value={elem.warehouseId}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-3">
                        <Span label="Required When Loading" value={"" + elem.requiredWhenLoading}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-3">
                        <Span label="Required When Unloading" value={"" + elem.requiredWhenUnloading}/>
                    </GridCell>
                );
            });

            innerComponent =  (
                <Grid>
                    {gridCells}
                </Grid>
            );

        } else {
            innerComponent = ("There is no rule.");
        }

        return (
            <Card title="RF Usage Rules">
                {innerComponent}
            </Card>
        );
    }

    renderWarehouseHandlingRules(warehouseHandlingRules) {

        let innerComponent;

        if (warehouseHandlingRules && warehouseHandlingRules.length > 0) {

            let gridCells = [];

            warehouseHandlingRules.forEach(elem => {

                let requiredStaffIfHandlingAllowed = "";
                let requiredEquipmentIfHandlingAllowed = "";

                if (elem.requiredStaffIfHandlingAllowed) {
                    requiredStaffIfHandlingAllowed = elem.requiredStaffIfHandlingAllowed.join(", ");
                }
                if (elem.requiredEquipmentIfHandlingAllowed) {
                    requiredEquipmentIfHandlingAllowed = elem.requiredEquipmentIfHandlingAllowed.join(", ");
                }

                gridCells.push(
                    <GridCell width="1-4">
                        <Span label="Warehouse Id" value={elem.warehouseId}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-4">
                        <Span label="Handling Allowed" value={"" + elem.handlingAllowed}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-4">
                        <Span label="Required Staff If Handling Allowed" value={requiredStaffIfHandlingAllowed}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-4">
                        <Span label="Required Equipment If Handling Allowed" value={requiredEquipmentIfHandlingAllowed}/>
                    </GridCell>
                );
            });

            innerComponent =  (
                <Grid>
                    {gridCells}
                </Grid>
            );

        } else {
            innerComponent = ("There is no rule.");
        }

        return (
            <Card title="Warehouse Handling Rules">
                {innerComponent}
            </Card>
        );
    }

    renderLoadSpecRules(loadSpecRules) {

        let innerComponent;

        if (loadSpecRules && loadSpecRules.length > 0) {

            let gridCells = [];

            loadSpecRules.forEach(elem => {
                gridCells.push(
                    <GridCell width="1-5">
                        <Span label="Shipment Unit Id" value={elem.shipmentUnit.id}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-5">
                        <Span label="Long Goods" value={"" + elem.longGoods}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-5">
                        <Span label="Oversize Goods" value={"" + elem.outOfGaugeGoods}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-5">
                        <Span label="Heavy Goods" value={"" + elem.heavyGoods}/>
                    </GridCell>
                );
                gridCells.push(
                    <GridCell width="1-5">
                        <Span label="Valuable Goods" value={"" + elem.valuableGoods}/>
                    </GridCell>
                );
            });

            innerComponent =  (
                <Grid>
                    {gridCells}
                </Grid>
            );

        } else {
            innerComponent = ("There is no rule.");
        }

        return (
            <Card title="Load Spec Rules">
                {innerComponent}
            </Card>
        );
    }

    updateQueryParam1(value) {
        this.setState({queryParam1: value});
    }

    updateQueryParam2(value) {
        this.setState({queryParam2: value});
    }

    queryByOrderId() {
        if (!this.state.queryParam1) {
            Notify.showError("Enter order id!");
        } else {
            window.location.href = "/ui/order/order-rule-set-page?orderId=" + this.state.queryParam1;
        }
    }

    queryByOrderRequestId() {
        if (!this.state.queryParam2) {
            Notify.showError("Enter order request id!");
        } else {
            OrderRequestService.getJustOrderId(this.state.queryParam2).then(response => {
                window.location.href = "/ui/order/order-rule-set-page?orderId=" + response.data;
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    render() {
        if (this.state.order) {
            return (
                <Grid>
                    <GridCell width="1-1" noMargin="true">
                        {this.renderOrder(this.state.order)}
                    </GridCell>
                    <GridCell width="1-1" noMargin="true">
                        {this.renderRuleSet(this.state.order.ruleSet)}
                    </GridCell>
                </Grid>
            );
        } else {
            return (
                <Card>
                    <Grid>
                        <GridCell width="1-2">
                            <TextInput label="Order Id"
                                       value={this.state.queryParam1}
                                       onchange={(value) => this.updateQueryParam1(value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <Button label="Query By Order Id" onclick={() => this.queryByOrderId()}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <TextInput label="Order Request Id"
                                       value={this.state.queryParam2}
                                       onchange={(value) => this.updateQueryParam2(value)}/>
                        </GridCell>
                        <GridCell width="1-2">
                            <Button label="Query By Order Request Id" onclick={() => this.queryByOrderRequestId()}/>
                        </GridCell>
                    </Grid>
                </Card>
            );
        }
    }
}

OrderRuleSetPage.contextTypes = {
    translator: React.PropTypes.object
};