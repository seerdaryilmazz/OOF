import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Notify, Span } from 'susam-components/basic';
import { CardSubHeader, Grid, GridCell, Loader, Modal } from 'susam-components/layout';
import { OptionList } from "../create-order/steps/OptionList";
import { LocationService, OrderService } from "../services";


export class HealthCertificates extends TranslatingComponent{

    state = {};
    optionYes = {id: "YES", name: "Yes"};
    optionNo = {id: "NO", name: "No"};
    optionUnknown = {id: "UNKNOWN", name: "Unknown"};
    borderCrossingHealthCheckOptions = [this.optionYes, this.optionNo, this.optionUnknown];

    componentDidMount(){

    }
    componentWillReceiveProps(nextProps){

    }

    handleClickEdit(){
        this.setState({healthCertificatesToEdit: _.cloneDeep(this.props.certificates),
                healthCertificateDocuments: _.cloneDeep(this.props.documents),
                borderCrossingHealthCheck:
                    _.isNil(this.props.borderCrossingHealthCheck) ? this.optionUnknown :
                        (this.props.borderCrossingHealthCheck ? this.optionYes : this.optionNo),
                borderCustoms: this.props.borderCustoms},
            () => {
                if(!this.props.documents){
                    OrderService.getShipmentDocuments(this.props.shipmentId).then(response => {
                        this.setState({healthCertificateDocuments: _.filter(response.data, item => item.group.id === "HEALTH_CERTIFICATE")});
                    }).catch(error => Notify.showError(error));
                }
                LocationService.getBorderCustoms()
                    .then(response => this.setState({borderCustomsOptions: response.data}))
                    .catch(error => Notify.showError(error));
                this.showEditModal();
        });
    }
    handleClickSave(){
        let hasCertificates = this.state.healthCertificatesToEdit && this.state.healthCertificatesToEdit.length > 0;
        let request = {
            healthCertificateTypes: this.state.healthCertificatesToEdit,
            borderCrossingHealthCheck: hasCertificates ?
                (this.state.borderCrossingHealthCheck.id === "UNKNOWN" ? null : this.state.borderCrossingHealthCheck.id === "YES") : null,
            borderCustoms: hasCertificates ? (this.state.borderCrossingHealthCheck.id === "YES" ? this.state.borderCustoms : null) : null
        }
        this.props.onSave && this.props.onSave(request);
        this.hideEditModal();
    }

    hideEditModal(){
        this.setState({healthCertificatesToEdit: null}, () => this.editModal.close());
    }
    showEditModal(){
        this.editModal.open();
    }
    updateState(value){
        let hasMissingType = false;
        this.state.healthCertificateDocuments.map(item => item.type.code).forEach(type => {
            if(!value.map(item => item.code).includes(type)){
                Notify.showError(`Document type ${type} is already attached to shipment documents. It should be selected`);
                hasMissingType = true;
            }
        });
        if(!hasMissingType){
            this.setState({healthCertificatesToEdit: value});
        }
    }
    render(){
        return(
            <div>
                <Grid>
                    <GridCell width = "1-1" noMargin = {true}>
                        <CardSubHeader title="Health Certificates" />
                    </GridCell>
                    {this.renderContent()}
                </Grid>
                {this.renderEditModal()}
            </div>
        );
    }
    renderContent(){
        if(this.props.busy){
            return <GridCell width = "1-1" noMargin = {true}><Loader title = "Saving..." size = "M"/></GridCell>;
        }
        let lines = [];
        if(!this.props.certificates || this.props.certificates.length === 0){
            lines.push(
                <GridCell key = "no-data" width = "1-1">
                    <span className="uk-text-muted" style = {{marginTop: "12px"}}>
                        {super.translate("No health certificates")}
                    </span>
                </GridCell>
            );
        }else{
            this.props.certificates.forEach(item => {
                lines.push(
                    <GridCell key = {item.code} width = "1-1">
                        <span>{super.translate(item.name)}</span>
                    </GridCell>
                );
            });
            lines.push(
                <GridCell key = "health-check" width = "1-2">
                    <Span label = "Health check at border crossing"
                          value = {_.isNil(this.props.borderCrossingHealthCheck) ? super.translate("Unknown") : (this.props.borderCrossingHealthCheck ? super.translate("Yes") : super.translate("No"))} />
                </GridCell>
            );
            if(this.props.borderCrossingHealthCheck){
                lines.push(
                    <GridCell key = "health-check-border" width = "1-2">
                        <Span label = "Border Customs"
                              value = {this.props.borderCustoms ? this.props.borderCustoms.name : ""} />
                    </GridCell>
                );
            }
        }
        if(this.props.editable){
            lines.push(
                <GridCell key = "edit-button" width = "1-1">
                    <div className = "uk-text-center">
                        <Button label = "edit" style = "primary" size = "small" flat = {true} onclick = {() => {this.handleClickEdit()}} />
                    </div>
                </GridCell>
            );
        }
        return lines;
    }
    renderEditModal(){
        let actions = [
            {label:"Close", action:() => this.hideEditModal()},
            {label: "Save", buttonStyle: "primary", action:() => this.handleClickSave()}
        ];

        return (
            <Modal title = "Edit Health Certificates" ref = {c => this.editModal = c} medium = {true} minHeight = {300}
                   closeOtherOpenModals = {false}
                   actions={actions}>
                {this.renderEditModalContent()}
            </Modal>
        );

    }
    renderEditModalContent(){
        if(!this.state.healthCertificatesToEdit){
            return null;
        }
        let borderCustoms = null;
        if(this.state.borderCrossingHealthCheck && this.state.borderCrossingHealthCheck.id === "YES"){
            let borderCustomsOptions = this.state.borderCustomsOptions;
            if(this.props.senderTemplate && this.props.senderTemplate.borderCustoms && this.props.senderTemplate.borderCustoms.length > 0){
                borderCustomsOptions = this.props.senderTemplate.borderCustoms;
            }
            borderCustoms = <DropDown label = "Border Customs"
                                      options = {borderCustomsOptions}
                                      value = {this.state.borderCustoms}
                                      onchange = {(value) => this.setState({borderCustoms: value})}/>
        }
        return (
            <Grid>
                <GridCell width = "1-1">
                    <OptionList options = {this.props.documentTypes} columns = {3} multiple = {true}
                                value = {this.state.healthCertificatesToEdit} keyField = "code"
                                onChange = {(value) => this.updateState(value)}
                                onRender = {(option) => this.renderHealthCertificateItem(option)} />
                </GridCell>
                <GridCell width = "1-3">
                    <DropDown label = "Border Crossing health Check"
                              options = {this.borderCrossingHealthCheckOptions}
                              value = {this.state.borderCrossingHealthCheck}
                              onchange = {(value) => this.setState({borderCrossingHealthCheck: value})}/>
                </GridCell>
                <GridCell width = "1-3">
                    {borderCustoms}
                </GridCell>
            </Grid>
        );
    }

    renderHealthCertificateItem(item){
        return(
            <Grid>
                <GridCell width="1-1" noMargin = {true}>
                    <span className = "uk-text-truncate uk-text-bold">{item.name}</span>
                </GridCell>
            </Grid>
        );
    }
}

HealthCertificates.contextTypes = {
    translator: PropTypes.object
};