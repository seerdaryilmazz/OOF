import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Notify } from 'susam-components/basic';
import { Alert, Grid, GridCell, Modal } from 'susam-components/layout';
import { OrderService } from "../services";
import { MiniLoader } from './MiniLoader';


export class Incoterm extends TranslatingComponent{

    state = {};

    componentDidMount(){
        this.loadIncoterms();
    }

    loadIncoterms(){
        OrderService.getIncoTerms().then(response => {
            this.setState({incoterms: response.data});
        }).catch(error => Notify.showError(error));
    }

    handleClick(){
        if(this.props.editable) {
            this.setState({incoterm: this.props.value}, () => {
                this.editModal.open();
            });
        }
    }

    handleChangeIncoterm(value){
        this.setState({incoterm: value});
    }

    handleClickSave(){
        this.props.onSave(this.state.incoterm);
        this.editModal.close();
    }

    handleCloseModal(){
        this.editModal.close();
    }

    render(){
        if(this.props.busy){
            return <MiniLoader title="saving..."/>
        }

        let incoterm = _.find(this.state.incoterms, {id: this.props.value.id + ""});
        if(!incoterm){
            return null;
        }
        let classNames = ["uk-badge", "wide-badge", "md-bg-orange-700", "uk-margin-small-right"];
        return(
            <div>
                <i className = {classNames.join(" ")}
                  title = {super.translate(incoterm.name)}
                  data-uk-tooltip="{pos:'bottom'}">{incoterm.code}</i>
                {this.renderModal()}
                {this.renderEditButton()}
           </div>
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
        let availableIncoterms = this.props.template.getAvailableIncoterms(this.props.shipmentId) || this.state.incoterms;
        let value = _.find(this.state.incoterms, {id: this.props.value.id+""});
        let isAvailableIncotermsHasOptions =
            availableIncoterms && availableIncoterms.length > 0 && _.find(availableIncoterms, type => type.code !== value.code);
        let actions = [{label:"Close", action:() => this.handleCloseModal()}];
        if(isAvailableIncotermsHasOptions){
            actions.push({label: "Save", buttonStyle: "primary", action:() => this.handleClickSave()});
        }
        return(
            <Modal title = "Edit Incoterm" ref = {c => this.editModal = c}
                   closeOtherOpenModals = {false}
                   actions={actions}>
                {this.renderModalContent(availableIncoterms)}
            </Modal>
        );
    }

    renderModalContent(availableIncoterms){
        let value = _.find(this.state.incoterms, {id: this.props.value.id+""});
        if(!availableIncoterms || availableIncoterms.length === 0){
            return (
                <Alert message = "There is no incoterm available in template that fits all shipment parameters"
                       type = "danger" />
            );
        }else if(availableIncoterms.length === 1 && value && availableIncoterms[0].code === value.code){
            return (
                <Alert message = "There is only one incoterm in template that fits all shipment parameters"
                       type = "danger" />
            );
        }else{
            return this.renderIncotermEdit(availableIncoterms);
        }
    }
    renderIncotermEdit(availableIncoterms){
        let incoterms = this.state.incoterms;
        if(availableIncoterms){
            incoterms = availableIncoterms.map(item => _.find(this.state.incoterms, {code: item.code}));
        }
        return(
            <Grid>
                <GridCell width = "1-1">
                    <DropDown label = "Incoterm" options = {incoterms} value = {this.state.incoterm}
                              onchange = {(value) => this.handleChangeIncoterm(value) } />
                </GridCell>
            </Grid>
        );
    }
}

Incoterm.contextTypes = {
    translator: PropTypes.object
};