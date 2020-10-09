import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { NumericInputWithUnit } from 'susam-components/advanced';
import { Button, Notify } from 'susam-components/basic';
import { Grid, GridCell, Modal } from 'susam-components/layout';
import { OrderService } from "../services";
import { MiniLoader } from './MiniLoader';


export class ValueOfGoods extends TranslatingComponent{

    formatter = new Intl.NumberFormat('tr-TR', {
        maximumFractionDigits: 2, minimumFractionDigits: 2
    });

    state = {};

    componentDidMount(){
        this.loadCurrencies();
    }

    loadCurrencies(){
        OrderService.getCurrencies().then(response => {
            this.setState({currencies: response.data});
        }).catch(error => Notify.showError(error));
    }

    handleClick(){
        if(this.props.editable) {
            let currency = this.props.currency ? _.find(this.state.currencies, {code: this.props.currency}) : null;
            this.setState({amount: this.props.amount, currency: currency}, () => {
                this.editModal.open();
            });
        }
    }

    handleChange(value){
        console.log("handleChange", value);
        this.setState({amount: value.amount, currency: value.unit});
    }

    handleClickSave(){
        this.props.onSave({
            amount: this.state.amount,
            currency: this.state.currency
        });
        this.editModal.close();
    }

    handleCloseModal(){
        this.editModal.close();
    }

    render(){
        if(this.props.busy){
            return <MiniLoader title="saving..."/>
        }
        let valueOfGoodsText = this.props.amount && this.props.currency ?
            this.formatter.format(this.props.amount) + " " + this.props.currency : super.translate("No Value of goods");
        return(
            <div>
                {this.renderValueOfGoods(valueOfGoodsText)}
                {this.renderEditButton()}
                {this.renderModal()}
           </div>
        );
    }
    renderEditButton(){
        if(this.props.editable){
            return <Button label = "Edit" flat = {true} size = "mini" style = "primary" onclick = {() => this.handleClick()} />
        }
        return null;
    }
    renderValueOfGoods(valueOfGoodsText){
        return <span className = "uk-badge uk-badge-outline wide-badge uk-margin-small-right" title = {super.translate("Value of Goods")}
                     data-uk-tooltip="{pos:'bottom'}"> {valueOfGoodsText}</span>;
    }

    renderModal(){
        if(!this.props.template){
            return null;
        }
        let availableCurrencies = this.props.template.getAvailableCurrencies(this.props.shipmentId) || this.state.currencies;
        return(
            <Modal title = "Edit Value of Goods" ref = {c => this.editModal = c}
                   closeOtherOpenModals = {false}
                   actions={[
                       {label:"Close", action:() => this.handleCloseModal()},
                       {label: "Save", buttonStyle: "primary", action:() => this.handleClickSave()}
                       ]}>
                {this.renderModalContent(availableCurrencies)}
            </Modal>
        );
    }

    renderModalContent(availableCurrencies){
        let currencies = this.state.currencies;
        if(availableCurrencies){
            currencies = availableCurrencies.map(item => _.find(this.state.currencies, {code: item.code}));
        }
        let value = {amount: this.state.amount, unit: this.state.currency};
        return(
            <Grid>
                <GridCell width = "1-1" noMargin = {true}>
                    <NumericInputWithUnit digits="2" digitsOptional = {true} value = {value}
                                          units = {currencies}
                                          onchange = {(value) => this.handleChange(value)}/>
                </GridCell>
            </Grid>
        );
    }

}

ValueOfGoods.contextTypes = {
    translator: PropTypes.object
};