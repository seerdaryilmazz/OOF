import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {TranslatingComponent} from 'susam-components/abstract';
import {Notify, Span} from 'susam-components/basic';
import {Grid, GridCell, Card, Section} from 'susam-components/layout';

import {OrderRequestService} from '../services';

export class OrderRequestInfo extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render(){
        let orderRequest = this.props.orderRequest ? this.props.orderRequest : {};
        let project = this.props.project;

        let customer = "";
        if(orderRequest.customer) {
            customer = orderRequest.customer.name;
        }
        let orderType = "";
        if(orderRequest.orderType) {
            orderType = orderRequest.orderType.name;
        }
        let confirmation = "No";
        if(orderRequest.confirmationRequired){
            confirmation = "Yes";
        }
        let projectOrOffer = "";

        if (orderRequest.orderType && orderRequest.orderType.code == "CONTRACTED") {
            projectOrOffer = <GridCell width="1-3"><Span label="Contract Name" value={orderRequest.contract.name}/></GridCell>;
        } else {
            projectOrOffer = <GridCell width="1-3"><Span label="Offer No" value={orderRequest.offerNo}/></GridCell>;
        }

        let subsidiary = orderRequest.subsidiary;

        return(
            <Card title= {super.translate("Order Request Information")}>
            <Grid>
                <GridCell width="1-1" noMargin = {true}><span className="uk-text-bold">{customer}</span></GridCell>
                <GridCell width="1-3"><Span label="Requested By" value={orderRequest.lastUpdatedBy}/></GridCell>
                <GridCell width="1-3"><Span label="Requested No" value={orderRequest.id}/></GridCell>
                <GridCell width="1-3"><Span label="Order Type" value={orderType}/></GridCell>
                {projectOrOffer}
                <GridCell width="1-3"><Span label="Confirmation Required" translate = {true} value={confirmation}/></GridCell>
                <GridCell width="1-3"><Span label="Number of Orders" value={orderRequest.numberOfOrders}/></GridCell>
                <GridCell width="1-3"><Span label="Order Owner" value={subsidiary ? subsidiary.name : ""}/></GridCell>
            </Grid>
            </Card>
        );
    }
}

OrderRequestInfo.contextTypes = {
    translator: React.PropTypes.object
};