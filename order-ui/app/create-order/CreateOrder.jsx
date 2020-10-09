import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import { Grid, GridCell, Loader } from 'susam-components/layout';
import { OrderService } from '../services';
import { CreateOrderWithRequest } from "./CreateOrderWithRequest";
import { CreateOrderWithTemplate } from "./CreateOrderWithTemplate";
import { CreateOrderWithTemplateMulti } from "./CreateOrderWithTemplateMulti";





export class CreateOrder extends TranslatingComponent {
    state = {};

    getTaskId(){
        return this.props.location.query ? this.props.location.query.taskId : null;
    }
    getTemplateId(){
        return this.props.location.query ? this.props.location.query.templateId : null;
    }
    navigateTo(orderId){
        this.context.router.push('/ui/order/view-order/' + orderId);
    }

    saveOrder(order){
        console.log("save order data", order);
        this.setState({busy: true});
        OrderService.create(order).then(response => {
            console.log("save order response", response.data);
            this.setState({orders: response.data});
        }).catch(error => Notify.showError(error)).then(() => this.setState({busy: false}));
    }

    renderSaveSuccessful(){
        let orderLines = this.state.orders.map(order => {
            return (
                <GridCell key = {order.id} width = "1-1" textCenter = {true}>
                    <Button label = {"Order #" + order.code} style = "primary" flat = {true}
                            onclick = {() => this.navigateTo(order.id)} />
                </GridCell>
            );
        });
        return (
            <Grid>
                <GridCell width = "1-1" textCenter = {true} center = {true}>
                    <i className = "mdi mdi-48px mdi-approval uk-text-success"/>
                </GridCell>
                <GridCell width = "1-1" textCenter = {true} center = {true}>
                    <span className = "uk-text-large">{super.translate("Order saved successfully")}</span>
                </GridCell>
                {orderLines}
            </Grid>
        );
    }

    render(){
        let loader = null;
        if(this.state.busy){
            loader = <Loader title = "Saving Orders" size = "L" />;
        }
        if(this.state.orders && this.state.orders.length > 0){
            return this.renderSaveSuccessful();
        }
        if(this.getTemplateId()){
            return (
                <div>
                    {loader}
                    <div style = {{display: this.state.busy ? "none" : "block"}}>
                        <CreateOrderWithTemplateMulti templateId = {this.getTemplateId()}
                                                 onSave = {(order) => this.saveOrder(order)}/>
                    </div>
                </div>
            );
        }
        if(this.getTaskId()){
            return <CreateOrderWithRequest taskId = {this.getTaskId()}
                                            onSave = {(order) => this.saveOrder(order)}/>
        }
    }
}
CreateOrder.contextTypes = {
    router: React.PropTypes.object.isRequired
};