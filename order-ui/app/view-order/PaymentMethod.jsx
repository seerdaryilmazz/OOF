import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Notify } from 'susam-components/basic';
import { Alert, Grid, GridCell, Modal } from 'susam-components/layout';
import { OrderService } from "../services";
import { MiniLoader } from './MiniLoader';


export class PaymentMethod extends TranslatingComponent{

    state = {};

    componentDidMount(){
        this.loadPaymentMethods();
    }

    loadPaymentMethods(){
        OrderService.getPaymentMethods().then(response => {
            this.setState({paymentMethods: response.data});
        }).catch(error => Notify.showError(error));
    }

    handleClick(){
        if(this.props.editable) {
            this.setState({paymentMethod: this.props.value}, () => {
                this.editModal.open();
            });
        }
    }

    handleChange(value){
        this.setState({paymentMethod: value});
    }

    handleClickSave(){
        this.props.onSave(this.state.paymentMethod);
        this.editModal.close();
    }

    handleCloseModal(){
        this.editModal.close();
    }

    render(){
        if(this.props.busy){
            return <MiniLoader title="saving..."/>
        }

        let paymentMethod = _.find(this.state.paymentMethods, {id: this.props.value.id + ""});
        if(!paymentMethod){
            return null;
        }
        let classNames = ["uk-badge", "wide-badge", "uk-margin-small-right", "md-bg-teal-700"];
        return(
            <span>
                <i className = {classNames.join(" ")}
                   title = {super.translate(paymentMethod.name)}
                   data-uk-tooltip="{pos:'bottom'}">{paymentMethod.code}</i>
                {this.renderModal()}
                {this.renderEditButton()}
            </span>
        );
    }

    renderEditButton(){
        if(this.props.editable){
            return <Button label = "Edit" flat = {true} size = "mini" style = "primary" onclick = {() => this.handleClick()} />
        }
        return null;
    }

    renderModal(){
        if(!this.props.template){
            return null;
        }
        let availablePaymentMethods = this.props.template.getAvailablePaymentMethods(this.props.shipmentId) || this.state.paymentMethods;
        let value = _.find(this.state.paymentMethods, {id: this.props.value.id+""});
        let isAvailablePaymentMethodsHasOptions =
            availablePaymentMethods && availablePaymentMethods.length > 0 && _.find(availablePaymentMethods, type => type.code !== value.code);
        let actions = [{label:"Close", action:() => this.handleCloseModal()}];
        if(isAvailablePaymentMethodsHasOptions){
            actions.push({label: "Save", buttonStyle: "primary", action:() => this.handleClickSave()});
        }
        return(
            <Modal title = "Edit Payment Method" ref = {c => this.editModal = c}
                   closeOtherOpenModals = {false}
                   actions={actions}>
                {this.renderModalContent(availablePaymentMethods)}
            </Modal>
        );
    }

    renderModalContent(availablePaymentMethods){
        let value = _.find(this.state.paymentMethods, {id: this.props.value.id+""});
        if(!availablePaymentMethods || availablePaymentMethods.length === 0){
            return (
                <Alert message = "There is no payment method available in template that fits all shipment parameters"
                       type = "danger" />
            );
        }else if(availablePaymentMethods.length === 1 && value && availablePaymentMethods[0].code === value.code){
            return (
                <Alert message = "There is only one payment method in template that fits all shipment parameters"
                       type = "danger" />
            );
        }else{
            return this.renderEdit(availablePaymentMethods);
        }
    }
    renderEdit(availablePaymentMethods){
        let paymentMethods = this.state.paymentMethods;
        if(availablePaymentMethods){
            paymentMethods = availablePaymentMethods.map(item => _.find(this.state.paymentMethods, {code: item.code}));
        }
        return(
            <Grid>
                <GridCell width = "1-1">
                    <DropDown label = "Payment Method" options = {paymentMethods} value = {this.state.paymentMethod}
                              onchange = {(value) => this.handleChange(value) } />
                </GridCell>
            </Grid>
        );
    }
}

PaymentMethod.contextTypes = {
    translator: PropTypes.object
};