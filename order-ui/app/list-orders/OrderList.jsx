import React from 'react';
import { Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { OrderService } from '../services';
import { OrderListItem } from './OrderListItem';



export class OrderList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {shipments:[]};
    }

    componentDidMount(){
        OrderService.list().then(response => {
            let shipments = [];
            response.data.forEach(order => {
                order.shipments.forEach(shipment => {
                    shipment.orderId = order.id;
                    shipment.orderStatus = order.status ? order.status : "New";
                    shipments.push(shipment);
                })
            });
            this.setState({shipments: shipments});
        }).catch(error => {
            Notify.showError(error);
        })
    }

    render(){
        return(
            <div>
                <PageHeader title="Orders"  translate={true} />
                    <Card>
                        <Grid divider = {true} collapse = {true}>
                            <GridCell width="1-1" noMargin = {true}>
                                {
                                    this.state.shipments.map(shipment => {
                                        return <OrderListItem key = {shipment.id} shipment = {shipment} />
                                    })
                                }
                            </GridCell>
                        </Grid>
                    </Card>
            </div>

        );
    }

}