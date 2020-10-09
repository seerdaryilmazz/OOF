import React from 'react';
import {Table} from 'susam-components/table';
import {Card, Grid, GridCell, Modal} from 'susam-components/layout';
import {Button, DropDown, Checkbox, TextInput, TextArea, Notify} from 'susam-components/basic';
import {OrderRequestService} from '../services';

export class CustomerRepresentativeOrderRequestList extends React.Component {

    constructor(props) {

        super(props);

        this.state = {};

        this.state.tableData = [];

        this.tableHeaders = [
            {
                name: "Id",
                data: "id",
                hidden: true
            },
            {
                name: "Customer",
                data: "customer"
            },
            {
                name: "Order Type",
                data: "orderType"
            },
            {
                name: "Offer No",
                data: "offerNo"
            },
            {
                name: "Ready At Date",
                data: "readyAtDate"
            },
            {
                name: "Task Id",
                data: "taskId"
            },
            {
                name: "",
                data: "goToOrder",
                render: (value) => {
                    if (value.order && value.order.id) {
                        return <Button key={"goToOrder-" + value.order.id} label="Go To Order" style="primary" waves={true} onclick={() => this.handleGoToOrderClick(value.order.id)} />;
                    } else {
                        return "";
                    }
                }
            }
        ];

        this.tableIcons = {};

        this.tableActions = {};
    };

    componentDidMount() {
        OrderRequestService.getLast10CreatedByCurrentUser()
            .then((response) => {
                let state = _.cloneDeep(this.state);
                state.tableData = response.data;
                this.setState(state);
            })
            .catch((error) => {
                Notify.showError(error);
            });
    }

    handleGoToOrderClick(orderId) {
        window.location.href = "/ui/order/order-page?orderId=" + orderId;
    }

    render() {
        return (
            <Card title="Last 10 Order Requests Created By Me">
                <Grid>
                    <GridCell width="1-1">
                        <Table headers={this.tableHeaders}
                               data={this.state.tableData}
                               icons={this.tableIcons}
                               hover={true} />
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}