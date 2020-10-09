import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { NumericInput } from 'susam-components/advanced';
import { Button, DropDown, Form, Notify, TextInput } from 'susam-components/basic';
import { CardSubHeader, Grid, GridCell, Loader, Modal } from 'susam-components/layout';
import { getAdrPackageUnits } from '../Helper';
import { OrderService } from "../services";


export class AdrClassDetails extends TranslatingComponent{

    state = {adrClassDetails: {}};

    componentDidMount(){
        this.loadAdrPackageTypes();
        //this.loadMissingAdrUNIdDetails(this.props.shipment.adrDetails);
    }
    componentWillReceiveProps(nextProps){
        this.loadMissingAdrUNIdDetails(nextProps.shipment.adrDetails);
        this.loadSenderTemplateUnIds(nextProps.senderTemplate);
    }
    loadAdrPackageTypes(){
        OrderService.getAdrPackageTypes().then(response => {
            this.setState({adrPackageTypes: response.data});
        }).catch(error => Notify.showError(error));
    }
    loadSenderTemplateUnIds(senderTemplate){
        if(this.props.editable && senderTemplate && senderTemplate.unIds){
            let idList = _.cloneDeep(senderTemplate.unIds);
            _.remove(idList, item => this.state.adrClassDetails[item]);
            this.loadAdrUNIdDetails(idList);
        }
    }
    loadMissingAdrUNIdDetails(adrDetails){
        if(!adrDetails || adrDetails.length === 0){
            return;
        }
        let idList = this.findMissingAdrUNIds(adrDetails);
        this.loadAdrUNIdDetails(idList);
    }
    findMissingAdrUNIds(adrDetails){
        let idList = adrDetails.map(item => item.adrClassDetailsId);
        _.remove(idList, item => this.state.adrClassDetails[item]);
        return idList;
    }
    loadAdrUNIdDetails(idList){
        if(idList.length === 0){
            return;
        }
        OrderService.getAdrUNIdDetails(idList)
            .then(response => {
                let adrClassDetails = _.cloneDeep(this.state.adrClassDetails);
                response.data.forEach(item => {
                    adrClassDetails[item.id] = item;
                })
                this.setState({adrClassDetails: adrClassDetails});
            }).catch(error => Notify.showError(error));
    }
    getAdrClassDetailsFromState(adrClassDetailsId){
        return this.state.adrClassDetails[adrClassDetailsId];
    }
    handleClickEditAdrDetails(adrDetailsId){
        this.setState({adrDetailsToEdit: _.cloneDeep(_.find(this.props.shipment.adrDetails, {id: adrDetailsId}))},
            () => {
                let adrClassDetails = this.getAdrClassDetailsFromState(this.state.adrDetailsToEdit.adrClassDetailsId);
                this.setState({unNumberToSearch: adrClassDetails.unNumber}, () => {
                    this.handleSearchAdrType(adrClassDetails.unNumber);
                    this.showEditModal();
                });
            });
    }
    handleClickDeleteAdrDetails(adrDetailsId){
        UIkit.modal.confirm("Are you sure ?", () => this.handleDeleteAdrDetails(adrDetailsId));
    }
    handleDeleteAdrDetails(adrDetailsId){
        this.props.onDelete && this.props.onDelete(adrDetailsId);
    }
    validate(){
        if(!this.form.validate()){
            return false;
        }
        if(!this.state.adrDetailsToEdit.adrClassDetailsId){
            Notify.showError("Please select ADR class details");
            return false;
        }

        return true;
    }
    handleClickSaveAdrDetails(){
        if(!this.validate()){
            return;
        }
        this.props.onSave && this.props.onSave(this.state.adrDetailsToEdit);
        this.hideEditModal();
    }
    handleClickAddAdrDetails(){
        if(!this.props.canAddAdrDetails){
            Notify.showError("TR arrival customs location can not be used for dangerous goods");
            return;
        }
        this.setState({adrDetailsToEdit: {}}, () => this.showEditModal());
    }
    handleUpdateSearchUnNumber(value){
        this.setState({unNumberToSearch: value}, () => {
            if(value.length === 4){
                this.handleSearchAdrType(value);
            }
        });
    }
    handleSearchAdrType(unNumber){
        OrderService.searchAdrClassDetails(unNumber)
            .then(response => this.setState({adrSearchResults: response.data}))
            .catch(error => Notify.showError(error));
    }
    handleClickAdrSearchResult(value){
        this.updateState("adrClassDetailsId", value.id);
    }
    hideEditModal(){
        this.setState({adrDetailsToEdit: null, adrSearchResults: null, unNumberToSearch: null}, () => this.editModal.close());
    }
    showEditModal(){
        this.editModal.open();
    }
    updateState(key, value){
        let adrDetailsToEdit = _.cloneDeep(this.state.adrDetailsToEdit);
        adrDetailsToEdit[key] = value;
        this.setState({adrDetailsToEdit: adrDetailsToEdit});
    }
    render(){
        if(!this.props.shipment){
            return null;
        }
        let toolbar = this.props.editable ? [{
            iconClass: "uk-icon-plus",
            title: "Add item",
            onClick: () => this.handleClickAddAdrDetails()

        }] : null;
        return(
            <div>
                <Grid>
                    <GridCell width = "1-1" noMargin = {true}>
                        <CardSubHeader title="Dangerous" toolbar = {toolbar} />
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
        let {shipment} = this.props;
        if(!shipment.adrDetails || shipment.adrDetails.length === 0){
            return (
                <GridCell width = "1-1">
                    <span key = "no-data" className="uk-text-muted" style = {{marginTop: "12px"}}>
                        {super.translate("No ADR details")}
                    </span>
                </GridCell>
            );
        }

        let adrClasses = [];
        shipment.adrDetails.forEach(item => {
            let adrClassDetails = this.getAdrClassDetailsFromState(item.adrClassDetailsId);
            if (adrClassDetails) {
                adrClasses.push(adrClassDetails.adrClass);
            }
        });
        let lines = [];
        lines.push(
            <GridCell key = "adr-class" width = "1-1">
                <span>ADR Class</span>
                <span className="uk-text-bold uk-margin-small-left">{_.uniq(adrClasses).join(",")}</span>
            </GridCell>
        );
        shipment.adrDetails.forEach(item => {
            let adrClassDetails = this.getAdrClassDetailsFromState(item.adrClassDetailsId);
            lines.push(this.renderAdrClassDetails(item.id, adrClassDetails));
            lines.push(
                <GridCell key = {item.id} width = "1-1">
                    <span title = "Quantity" data-uk-tooltip="{pos:'bottom'}">{item.quantity}</span>
                    <span className="uk-margin-small-left" title = "Package Type" data-uk-tooltip="{pos:'bottom'}">{item.packageType.name}</span>
                    <span className="uk-margin-left" title = "Inner Quantity" data-uk-tooltip="{pos:'bottom'}">{item.innerQuantity}</span>
                    <span className="uk-margin-small-left" title = "Inner Package Type" data-uk-tooltip="{pos:'bottom'}">{item.innerPackageType ? item.innerPackageType.name : ""}</span>
                    <span className="uk-margin-left" title = "Amount" data-uk-tooltip="{pos:'bottom'}">{item.amount}</span>
                    <span className="uk-margin-small-left" title = "Unit" data-uk-tooltip="{pos:'bottom'}">{item.unit.name}</span>
                </GridCell>
            );
        });
        return lines;
    }
    renderAdrClassDetails(adrDetailsId, adrClassDetails){
        if(!adrClassDetails){
            return <span key = {adrDetailsId + "-adr-details"}>{super.translate("ADR class details not found")}</span>
        }
        let style = {marginRight: "8px"}
        return (
            <GridCell key = {adrDetailsId + "-adr-details"} width = "1-1">
                {this.renderEditButtons(adrDetailsId)}
                <div className = "uk-text-bold">{adrClassDetails.unNumber}</div>
                <div>{adrClassDetails.description}</div>
                <div className = "uk-text-muted">
                    <span style={style} title = "Danger Code" data-uk-tooltip="{pos:'bottom'}">{adrClassDetails.hazardIdentification}</span>
                    <span style={style} title = "Packing Group" data-uk-tooltip="{pos:'bottom'}">{adrClassDetails.packingGroup}</span>
                    <span style={style} title = "Classification Code" data-uk-tooltip="{pos:'bottom'}">{adrClassDetails.classificationCode}</span>
                    <span style={style} title = "Transport & Tunnel Category" data-uk-tooltip="{pos:'bottom'}">{adrClassDetails.transportTunnelCategory}</span>
                    <span style={style} title = "Labels" data-uk-tooltip="{pos:'bottom'}">{adrClassDetails.labels}</span>
                </div>
            </GridCell>
        );
    }
    renderEditButtons(adrDetailsId){
        if(!this.props.editable){
            return null;
        }
        return (
            <div style = {{float: "right"}}>
                <Button label = "Edit" size = "mini" flat = {true} style = "success" onclick = {() => this.handleClickEditAdrDetails(adrDetailsId)} />
                <Button label = "Delete" size = "mini" flat = {true} style = "danger" onclick = {() => this.handleClickDeleteAdrDetails(adrDetailsId)} />
            </div>
        );
    }
    renderEditModal(){
        let actions = [
            {label:"Close", action:() => this.hideEditModal()},
            {label: "Save", buttonStyle: "primary", action:() => this.handleClickSaveAdrDetails()}
        ];

        return (
            <Modal title = "Edit ADR Details" ref = {c => this.editModal = c} medium = {true} minHeight = {300}
                   closeOtherOpenModals = {false}
                   actions={actions}>
                {this.renderEditModalContent()}
            </Modal>
        );

    }
    renderEditModalContent(){
        if(!this.state.adrDetailsToEdit){
            return null;
        }
        let unNumberSearch =
            <GridCell width = "1-3">
                <TextInput id = "adrUnNumber" label = "ADR UN Number" value = {this.state.unNumberToSearch}
                           onchange = {(value) => this.handleUpdateSearchUnNumber(value)} />
            </GridCell>;
        if(this.props.senderTemplate && this.props.senderTemplate.unIds.length > 0){
            unNumberSearch  = null;
        }

        let adrSearchResults = [];
        if(this.state.adrSearchResults){
            adrSearchResults = this.state.adrSearchResults.map(item => this.renderAdrSearchResult(item));
        } else if(this.props.senderTemplate && this.props.senderTemplate.unIds){
            adrSearchResults = this.props.senderTemplate.unIds.map(item => {
                let adrClassDetails = this.state.adrClassDetails[item];
                return this.renderAdrSearchResult(adrClassDetails);
            });
        }

        return (
            <Form ref = {c => this.form = c}>
                <Grid>
                    <GridCell width = "1-1">
                        <Grid>
                            {unNumberSearch}
                            <GridCell width = "1-1">
                                <ul className="md-list">{adrSearchResults}</ul>
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width = "1-6">
                        <NumericInput id = "quantity" label="Quantity" digitsOptional = {true} digits = {0} required = {true}
                                      value={this.state.adrDetailsToEdit.quantity} onchange={(value) => {this.updateState("quantity", value)}}/>
                    </GridCell>
                    <GridCell width = "1-6">
                        <DropDown id = "packageType" label="Package Type" options = {this.state.adrPackageTypes} required = {true} translate={true}
                                  value={this.state.adrDetailsToEdit.packageType} onchange={(value) => {this.updateState("packageType", value)}}/>
                    </GridCell>
                    <GridCell width = "1-6">
                        <NumericInput id = "innerQuantity" label="Inner Quantity" digitsOptional = {true} digits = {0}
                                      value={this.state.adrDetailsToEdit.innerQuantity} onchange={(value) => {this.updateState("innerQuantity", value)}}/>
                    </GridCell>
                    <GridCell width = "1-6">
                        <DropDown id = "innerPackageType" label="Inner Package Type" options = {this.state.adrPackageTypes} translate={true}
                                  value={this.state.adrDetailsToEdit.innerPackageType} onchange={(value) => {this.updateState("innerPackageType", value)}}/>
                    </GridCell>
                    <GridCell width = "1-6">
                        <NumericInput id = "adr-amount" label="Amount" digitsOptional = {true} digits = {2} units = {this.units} required = {true}
                                      value={this.state.adrDetailsToEdit.amount} onchange={(value) => {this.updateState("amount", value)}}/>
                    </GridCell>
                    <GridCell width = "1-6">
                        <DropDown id = "adr-unit" label="Unit" options = {getAdrPackageUnits()} required = {true} translate={true}
                                  value={this.state.adrDetailsToEdit.unit} onchange={(value) => {this.updateState("unit", value)}}/>
                    </GridCell>
                </Grid>
            </Form>

        );
    }
    renderAdrClassListItem(item){
        if(!item){
            return null;
        }
        let style = {marginRight: "8px"}
        return(
            <div className="md-list-content" >
                    <span className="md-list-heading">
                        <span style = {style}>{item.unNumber}</span>
                        <span style = {style}>{`${super.translate("Danger Code")}: ${item.hazardIdentification}`}</span>
                        <span style = {style}>{`${super.translate("Packing")}: ${item.packingGroup}`}</span>
                        <span style = {style}>{`${super.translate("lassification")}: ${item.classificationCode}`}</span>
                        <span style = {style}>{`${super.translate("Transport&Tunnel")}: ${item.transportTunnelCategory}`}</span>
                        <span style = {style}>{`${super.translate("Labels")}: ${item.labels}`}</span>
                    </span>
                <span className="uk-text-small uk-text-muted">{item.description}</span>
            </div>
        );
    }
    renderAdrSearchResult(item){
        let selected = this.state.adrDetailsToEdit.adrClassDetailsId === item.id;
        let listItemClassName = selected ? "md-bg-blue-50" : "";
        return(
            <li key = {item.id} className = {listItemClassName} onClick = {() => this.handleClickAdrSearchResult(item)} style = {{cursor: "pointer"}}>
                {this.renderAdrClassListItem(item)}
            </li>
        );
    }
}

AdrClassDetails.contextTypes = {
    translator: PropTypes.object
};