import * as axios from "axios";
import _ from "lodash";
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import { Grid, GridCell, Loader, LoaderWrapper, PageHeader } from 'susam-components/layout';
import uuid from "uuid";
import { TemplateAndCustomizations } from '../create-order/Template';
import { isCustomsTypeNeedsLoadTypeCheck } from '../Customs';
import { withAuthorization } from '../security';
import { OrderService } from "../services";
import { AuthorizationService } from "../services/AuthorizationService";
import { LocationService } from '../services/LocationService';
import { ProjectService } from "../services/ProjectService";
import { DocumentModal } from "./DocumentModal";
import { OrderShipment } from "./OrderShipment";
import { ServiceType } from "./ServiceType";
import { TruckLoadType } from './TruckLoadType';



const SecuredEditButton = withAuthorization(Button, ["order.edit"], {hideWhenNotAuthorized: true});
export class Order extends TranslatingComponent{

    state = {savingStatus: {}};

    constructor(props){
        super(props);
    }

    componentDidMount(){
        this.loadOrder();
        this.loadDocumentTypes();
    }

    loadOrder(){
        let call = null;
        if(this.props.shipmentCode){
            call = ()=>OrderService.getShipmentByShipmentCode(this.props.shipmentCode);
        } else {
            call = ()=>OrderService.getOrderById(this.props.params.id);
        }
        call().then(response => {
            console.log("order", JSON.stringify(response.data, null, 4));
            this.setState({
                order: response.data,
                selectedShipment: this.props.shipmentCode ?
                    _.find(response.data.shipments, { code: this.props.shipmentCode }) :
                    response.data.shipments[0]
            }, () => this.loadCountryAndCustoms());
        }).catch(error => Notify.showError(error));
    }

    loadDocumentTypes(){
        OrderService.getDocumentTypesFiltered(null, 'HEALTH_CERTIFICATE,DANGEROUS_GOODS').then(response => {
            this.setState({documentTypes: response.data});
        }).catch(error => Notify.showError(error));
    }

    handleClickOrderDocuments(){
        OrderService.getOrderDocuments(this.state.order.id).then(response => {
            this.setState({orderDocuments: response.data}, () => this.orderDocuments.open());
        }).catch(error => Notify.showError(error));
    }
    handleSelectShipment(shipment){
        this.setState({selectedShipment: shipment}, () => this.loadCountryAndCustoms());
    }

    handleClickEditOrder(){
        if(_.isEqual("CONFIRMED",this.state.order.status.code)){
            Notify.showInformation("The order was sent to Quadro. It cannot be edited.");
            return;
        }
        if(_.isEqual("CANCELLED",this.state.order.status.code)){
            Notify.showInformation(this.state.order.status.name + " order can not edit!");
            return;
        }
        AuthorizationService.checkAuthorizedUserForOrder(this.state.order.customer.id).then(response => {
            this.setState(prevState=>({editable: !prevState.editable}), () => this.loadTemplates());
        }).catch(error => {Notify.showError(error); console.log(error)});
    }
    
    loadTemplates(){
        this.loadTemplate();
        this.loadSenderTemplate();
        this.loadSenderWarehouseRules();
    }

    loadSenderTemplate() {
        this.state.order.shipments.forEach(eachShipment => {
            if (eachShipment.sender.handlingCompanyType.code === 'COMPANY') {
                ProjectService.searchSenderTemplates(
                    eachShipment.sender.company.id,
                    eachShipment.sender.handlingCompany.id,
                    eachShipment.sender.handlingLocation.id)
                    .then(response => {
                        if (response.data) {
                            let senderTemplates = _.cloneDeep(this.state.senderTemplates) || {};
                            let templateKey = `${eachShipment.id}`;
                            senderTemplates[templateKey] = response.data;
                            senderTemplates[templateKey].packageDetails.forEach(details => {
                                details._key = uuid.v4();
                            });
                            this.setState({ senderTemplates: senderTemplates });
                        }
                    }).catch(error => Notify.showError(error));
            }
        });
    }

    loadTemplate() {
        if (!this.state.order.templateId) {
            Notify.showError("This order have no template associated with it");
            return;
        }
        ProjectService.getTemplateById(this.state.order.templateId).then(response => {
            let template = new TemplateAndCustomizations(response.data);
            console.log("loadTemplate", response.data);

            let index = 0;
            this.state.order.shipments.forEach(shipment => {
                if (response.data.type === "PIVOT_PARTY") {
                    let customization = _.find(response.data.customizations, item => {
                        let shipmentParty = response.data.pivot.type === "SENDER" ? shipment.consignee : shipment.sender;

                        return item.company.id === shipmentParty.company.id
                            && item.handlingCompany.id === shipmentParty.handlingCompany.id
                            && item.handlingLocation.id === shipmentParty.handlingLocation.id;
                    });
                    template.setCustomization(shipment.id, customization);
                    index++;
                    if(index === this.state.order.shipments.length){
                        this.setState({ template: template });
                    }
                } else if (response.data.type === "MULTI_PARTY") {
                    let sender = _.set(_.cloneDeep(shipment.sender), 'handlingCompany.type', shipment.sender.handlingCompanyType.code);
                    let consignee = _.set(_.cloneDeep(shipment.consignee), 'handlingCompany.type', shipment.consignee.handlingCompanyType.code);

                    ProjectService.getTemplateRules(this.state.order.templateId, sender, consignee).then(response =>{
                        template.setCustomization(shipment.id, _.first(response.data.customizations));
                        index++;
                        if(index === this.state.order.shipments.length){
                            this.setState({ template: template });
                        }
                    }).catch(error=>Notify.showError(error));
                }

            });
        }).catch(error => Notify.showError(error));
    }
    
    loadCountryAndCustoms(){
        let senderCountryCode = this.state.selectedShipment.sender.handlingLocationCountryCode;
        let consigneeCountryCode = this.state.selectedShipment.consignee.handlingLocationCountryCode;
        axios.all([
            LocationService.getCountry(senderCountryCode),
            LocationService.getCountry(consigneeCountryCode),
            LocationService.getWarehouseDetails(this.state.selectedShipment.sender.handlingLocation.id),
            LocationService.getCustomerWarehouseDetails(this.state.selectedShipment.sender.handlingLocation.id)
        ]).then(axios.spread((senderCountryResponse, consigneeCountryResponse, warehouse, customerWarehouse) => {
            let senderEUMember = senderCountryResponse.data.euMember;
            let consigneeEUMember = consigneeCountryResponse.data.euMember;
            let showCustomsInfo = senderCountryCode !== consigneeCountryCode && !(senderEUMember && consigneeEUMember);
            this.setState({showCustomsInfo: showCustomsInfo, senderWarehouse: warehouse.data || customerWarehouse.data}, () => {
                this.loadWarehouseCustomsDetails();
            });
        })).catch(error => Notify.showError(error));
    }

    loadWarehouseCustomsDetails(){
        if(!this.state.showCustomsInfo){
            return;
        }
        if(!this.state.selectedShipment.arrivalCustoms){
            return;
        }
        if(!this.state.selectedShipment.arrivalCustoms.customsLocation){
            this.setState({dangerousSupported: true, temperatureControlledSupported: true});
        }else{
            let locationId = this.state.selectedShipment.arrivalCustoms.customsLocation.id;
            LocationService.getCustomsLocationById(locationId).then(response => {
                this.setState({
                    dangerousSupported: !isCustomsTypeNeedsLoadTypeCheck(response.data.customsType) || response.data.usedForDangerousGoods,
                    temperatureControlledSupported: !isCustomsTypeNeedsLoadTypeCheck(response.data.customsType) || response.data.usedForTempControlledGoods
                });
            }).catch(error => Notify.showError(error));
        }
    }

    loadSenderWarehouseRules() {
        if (this.state.selectedShipment.sender.handlingCompanyType.code === 'CUSTOMS') {
            this.setState({ equipmentRequirementsByWarehouse: {} });
        } else if(this.state.selectedShipment.sender.handlingCompanyType.code === 'COMPANY') {
            ProjectService.executeWarehouseRulesForLocation(this.state.selectedShipment.sender.handlingLocation.id).then(response => {
                if (response.data.requiredEquipments) {
                    let requirementsByWarehouse =
                        Object.keys(response.data.requiredEquipments).map(key => {
                            return {
                                equipment: key,
                                count: response.data.requiredEquipments[key]
                            };
                        });
                    this.setState({ equipmentRequirementsByWarehouse: requirementsByWarehouse });
                }
            }).catch(error => Notify.showError(error));
        }
    }

    refreshShipmentInState(shipment, afterRefresh){
        let state = _.cloneDeep(this.state);
        let shipmentIndex = _.findIndex(state.order.shipments, {id: shipment.id});
        if(shipmentIndex >= 0){
            state.order.shipments[shipmentIndex] = shipment;
        }
        state.selectedShipment = shipment;
        this.setState(state, () => afterRefresh && afterRefresh());
    }

    handleClickTemplateName(){
        window.open(`/ui/order/templates/${this.state.order.templateId}`,`_blank`);
    }

    handleSaveStatus(request){
        this.setState({savingStatus: {status: true}},()=>
        OrderService.updateStatus(this.state.order.id, request).then(response => {
            Notify.showSuccess("Order " + request.status.code);
            this.setState({
                    order: response.data,
                    selectedShipment: _.find(response.data.shipments, {id: this.state.selectedShipment.id})
            });
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}, editable: false})));
    }

    handleSaveServiceType(request){
        this.setState({savingStatus: {serviceType: true}});
        OrderService.updateServiceType(this.state.order.id, request).then(response => {
            Notify.showSuccess("Order service type saved");
            this.setState({
                    order: response.data,
                    selectedShipment: _.find(response.data.shipments, {id: this.state.selectedShipment.id})
            });
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleSaveTruckLoadType(request){
        this.setState({savingStatus: {truckLoadType: true}});
        OrderService.updateTruckLoadType(this.state.order.id, request).then(response => {
            Notify.showSuccess("Order truck load type saved");
            this.setState({
                order: response.data,
                selectedShipment: _.find(response.data.shipments, {id: this.state.selectedShipment.id})
            });
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleSaveReadyDate(request){
        this.setState({savingStatus: {readyDate: true}});
        OrderService.updateReadyDate(this.state.selectedShipment.id, request).then(response => {
            Notify.showSuccess("Ready date saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleSaveLoadingAppointment(request){
        this.setState({savingStatus: {readyDate: true}});
        OrderService.updateLoadingAppointment(this.state.selectedShipment.id, request).then(response => {
            Notify.showSuccess("Loading appointment saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleDeleteUnloadingAppointment(){
        this.setState({savingStatus: {deliveryDate: true}});
        OrderService.deleteUnloadingAppointment(this.state.selectedShipment.id).then(response => {
            Notify.showSuccess("Unloading appointment deleted")
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleSaveUnloadingAppointment(value){
        this.setState({savingStatus: {deliveryDate: true}});
        let request = {
            unloadingAppointment: value
        };
        OrderService.updateUnloadingAppointment(this.state.selectedShipment.id, request).then(response => {
            Notify.showSuccess("Unloading appointment saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleDeleteDocument(document){
        this.setState({savingStatus: {orderDocuments: true}});
        OrderService.deleteOrderDocument(this.state.order.id, document.id).then(response => {
            let order = _.cloneDeep(this.state.order);
            order.documents = response.data;
            this.setState({order: order}, () => Notify.showSuccess("Document deleted"));
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleSaveDocument(documents){
        this.setState({savingStatus: {orderDocuments: true}});
        OrderService.saveOrderDocuments(this.state.order.id, documents).then(response => {
            let order = _.cloneDeep(this.state.order);
            order.documents = response.data;
            this.setState({order: order}, () => Notify.showSuccess("Document saved"));
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleSaveIncoterm(value){
        this.setState({savingStatus: {incoterm: true}});
        OrderService.updateIncoterm(this.state.selectedShipment.id, value).then(response => {
            Notify.showSuccess("Incoterm saved")
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSavePaymentMethod(value){
        this.setState({savingStatus: {paymentMethod: true}});
        OrderService.updatePaymentMethod(this.state.selectedShipment.id, value).then(response => {
            Notify.showSuccess("Payment method saved")
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveInsurance(value){
        this.setState({savingStatus: {insurance: true}});
        if(value){
            OrderService.setInsurance(this.state.selectedShipment.id).then(response => {
                Notify.showSuccess("Insurance saved");
                this.refreshShipmentInState(response.data);
            }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
        }else{
            OrderService.removeInsurance(this.state.selectedShipment.id).then(response => {
                Notify.showSuccess("Insurance removed");
                this.refreshShipmentInState(response.data);
            }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
        }
    }
    handleSaveValueOfGoods(value){
        this.setState({savingStatus: {valueOfGoods: true}});
        OrderService.updateValueOfGoods(this.state.selectedShipment.id, value).then(response => {
            Notify.showSuccess("Value of goods saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveShipmentUnits(request){
        this.setState({savingStatus: {shipmentUnits: true}});
        OrderService.updateShipmentUnits(this.state.selectedShipment.id, request).then(response => {
            Notify.showSuccess("Shipment units saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveDefinitionOfGoods(request){
        this.setState({savingStatus: {definitionOfGoods: true}});
        OrderService.updateShipmentDefinitionOfGoods(this.state.selectedShipment.id, request).then(response => {
            Notify.showSuccess("Definition of Goods saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveAdrDetails(adrDetails){
        this.setState({savingStatus: {shipmentAdr: true}});
        OrderService.saveShipmentAdrDetails(this.state.selectedShipment.id, adrDetails).then(response => {
            Notify.showSuccess("Shipment ADR saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleDeleteAdrDetails(adrDetailsId){
        this.setState({savingStatus: {shipmentAdr: true}});
        OrderService.deleteShipmentAdrDetails(this.state.selectedShipment.id, adrDetailsId).then(response => {
            Notify.showSuccess("Shipment ADR deleted");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveDepartureCustomsDetails(customsDetails){
        this.setState({savingStatus: {departureCustoms: true}});
        OrderService.saveDepartureCustoms(this.state.selectedShipment.id, customsDetails).then(response => {
            Notify.showSuccess("Shipment departure customs saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveArrivalCustomsDetails(customsDetails){
        this.setState({savingStatus: {arrivalCustoms: true}});
        OrderService.saveArrivalCustoms(this.state.selectedShipment.id, customsDetails).then(response => {
            Notify.showSuccess("Shipment arrival customs saved");
            this.refreshShipmentInState(response.data, () => this.loadWarehouseCustomsDetails());
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveVehicleRequirements(requirements){
        this.setState({savingStatus: {vehicleRequirements: true}});
        OrderService.saveVehicleRequirements(this.state.selectedShipment.id, requirements).then(response => {
            Notify.showSuccess("Shipment vehicle requirements saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveEquipmentRequirement(requirement){
        this.setState({savingStatus: {equipmentRequirements: true}});
        OrderService.saveEquipmentRequirement(this.state.selectedShipment.id, requirement).then(response => {
            Notify.showSuccess("Shipment equipment requirement saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleDeleteEquipmentRequirement(requirementId){
        this.setState({savingStatus: {equipmentRequirements: true}});
        OrderService.deleteEquipmentRequirement(this.state.selectedShipment.id, requirementId).then(response => {
            Notify.showSuccess("Shipment equipment requirement deleted");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveHealthCertificates(certificates){
        this.setState({savingStatus: {HealthCertificates: true}});
        OrderService.saveHealthCertificates(this.state.selectedShipment.id, certificates).then(response => {
            Notify.showSuccess("Shipment health certificates saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    handleSaveTemperatureLimits(limits){
        this.setState({savingStatus: {temperatureLimits: true}});
        OrderService.saveTemperatureLimits(this.state.selectedShipment.id, limits).then(response => {
            Notify.showSuccess("Shipment temperature limits saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }
    
    handleSaveManufacturer(manufacturer){
        this.setState({savingStatus: {manufacturer: true}});
        OrderService.saveManufacturer(this.state.selectedShipment.id, manufacturer).then(response => {
            Notify.showSuccess("Shipment manufacturer is saved");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    handleDeleteManufacturer(){
        this.setState({savingStatus: {manufacturer: true}});
        OrderService.deleteManufacturer(this.state.selectedShipment.id).then(response => {
            Notify.showSuccess("Shipment manufacturer is deleted");
            this.refreshShipmentInState(response.data);
        }).catch(error => Notify.showError(error)).then(() => this.setState({savingStatus: {}}));
    }

    renderServiceType(){
        return(
            <ServiceType value = {this.state.order.serviceType}
                         editable = {this.state.editable}
                         template = {this.state.template}
                         shipments = {this.state.order.shipments}
                         customer = {this.state.order.customer}
                         truckLoadType = {this.state.order.truckLoadType}
                         timezone = {this.state.selectedShipment.consignee.handlingLocationTimezone}
                         busy = {this.state.savingStatus.serviceType}
                         onSave = {value => this.handleSaveServiceType(value)}/>
        );
    }
    renderCustomerName(){
        return <h3>{this.state.order.customer.name}</h3>;
    }
    renderOriginalCustomerName(){
        if(!this.state.order.originalCustomer){
            return null;
        }
        return <h3 className="heading_c_thin">Original Customer: {this.state.order.originalCustomer.name}</h3>;
    }
    renderTruckLoadType(){
        return(
            <TruckLoadType value = {this.state.order.truckLoadType}
                           editable = {this.state.editable}
                           template = {this.state.template}
                           shipments = {this.state.order.shipments}
                           customer = {this.state.order.customer}
                           serviceType = {this.state.order.serviceType}
                           timezone = {this.state.selectedShipment.consignee.handlingLocationTimezone}
                           busy = {this.state.savingStatus.truckLoadType}
                           onSave = {value => this.handleSaveTruckLoadType(value)}/>
        );
    }

    renderOrderDocuments(){

        return <Button label={`Order Documents`} flat = {true} style = "primary"
                       onclick = {() => this.handleClickOrderDocuments()} />
    }
    renderShipmentTabs(){
        return this.state.order.shipments.map(shipment => {
            let className = "";
            if(this.state.selectedShipment &&
                shipment.id === this.state.selectedShipment.id){
                className = "uk-active";
            }
            return(
                <li key={shipment.id} className={className} aria-expanded="true">
                    <a href="javascript:;" onClick = {() => this.handleSelectShipment(shipment)}>{shipment.code}</a>
                </li>
            );
        });
    }
    renderTemplateName(){
        if(!this.state.order.templateName){
            return null;
        }
        return <Button label = {`Template: ${this.state.order.templateName}`} style = "primary" flat = {true}
                       onclick = {() => this.handleClickTemplateName()}/>
    }

    renderHeader() {
        let order = this.state.order;
        let styles = {
            "CREATED": {
                line: { borderBottom: "4px solid red" },
                text: { color: "red", textTransform: "capitalize", fontSize: "1.3em" }
            },
            "CONFIRMED": {
                line: { borderBottom: "4px solid green" },
                text: { color: "green", textTransform: "capitalize", fontSize: "1.3em" }
            },
            "CANCELLED": {
                line: { borderBottom: "4px solid grey" },
                text: { color: "grey", textTransform: "capitalize", fontSize: "1.3em" }
            }
        }
        let title = `${super.translate("Order")} ${order.countryCode}#${order.code}`;
        return (
            <Grid style={styles[order.status.code].line}>
                <GridCell width="7-10" noMargin={true}>
                    <PageHeader title={title} />
                </GridCell>
                <GridCell width="2-10" noMargin={true} style={{textAlign: "right"}}>
                    {this.renderConfirmButton()}
                </GridCell>
                <GridCell width="1-10" noMargin={true} style={{textAlign: "right"}}>
                    <span lang={navigator.language} style={styles[order.status.code].text}>{super.translate(order.status.name).toLocaleLowerCase(navigator.language)}</span>
                </GridCell>
            </Grid>
        )
    }
    renderConfirmButton(){
        if(!_.isEqual("CREATED",this.state.order.status.code)){
            return null;
        }
        if(!this.state.editable){
            return null;
        }
        return(
            <LoaderWrapper busy={this.state.savingStatus.status} size="S">
                <div>
                        <Button label = "cancel" style = "muted" 
                                onclick = {() =>  Notify.confirm("Order will be cancelled, Are you sure?", ()=>this.handleSaveStatus({status:{code:"CANCELLED"}}))}/>
                        <Button label = "confirm" style = "success" 
                                onclick = {() =>  Notify.confirm("Order will be confirmed, Are you sure?", ()=>this.handleSaveStatus({status:{code:"CONFIRMED"}}))}/>
                </div>
            </LoaderWrapper>
        );
    }

    render(){
        if(!this.state.order){
            return <Loader title = "Loading order" />
        }
        return (
            <div>
                {this.renderHeader()}
                <Grid>
                    <GridCell width = "1-1">
                        {this.renderCustomerName()}
                        {this.renderOriginalCustomerName()}
                    </GridCell>
                    <GridCell width = "1-4">
                        <Grid>
                            <GridCell width = "2-5" noMargin = {true}>
                                {this.renderServiceType()}
                            </GridCell>
                            <GridCell width = "2-5" noMargin = {true}>
                                {this.renderTruckLoadType()}
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width = "1-4">
                    </GridCell>
                    <GridCell width = "1-4">
                        {this.renderOrderDocuments()}
                    </GridCell>
                    <GridCell width = "1-4">
                        {this.renderTemplateName()}
                    </GridCell>
                    <GridCell width = "4-5">
                        <ul className="uk-subnav uk-subnav-pill">
                            {this.renderShipmentTabs()}
                        </ul>
                    </GridCell>
                    <GridCell width = "1-5">
                        <div className="uk-align-right">
                            <SecuredEditButton label = "Edit Order" style = "success" onclick = {() => this.handleClickEditOrder()} />
                        </div>
                    </GridCell>
                    <GridCell width = "1-1">
                        <OrderShipment editable = {this.state.editable}
                                       shipment = {this.state.selectedShipment}
                                       order = {this.state.order}
                                       template = {this.state.template}
                                       senderTemplate = {this.state.senderTemplates && this.state.senderTemplates[`${this.state.selectedShipment.id}`]}
                                       savingStatus = {this.state.savingStatus}
                                       dangerousSupported = {this.state.dangerousSupported}
                                       temperatureControlledSupported = {this.state.temperatureControlledSupported}
                                       equipmentRequirementsByWarehouse = {this.state.equipmentRequirementsByWarehouse}
                                       showCustomsInfo = {this.state.showCustomsInfo}
                                       senderWarehouse = {this.state.senderWarehouse}
                                       manufacturerOptions = {this.state.template && this.state.template.getManufacturerOptions(this.state.selectedShipment.sender)}
                                       onSaveReadyDate = {(value) => this.handleSaveReadyDate(value)}
                                       onSaveLoadingAppointment = {(value) => this.handleSaveLoadingAppointment(value)}
                                       onSaveUnloadingAppointment = {(value) => this.handleSaveUnloadingAppointment(value)}
                                       onDeleteUnloadingAppointment = {(value) => this.handleDeleteUnloadingAppointment(value)}
                                       onSaveIncoterm = {(value) => this.handleSaveIncoterm(value)}
                                       onSavePaymentMethod = {(value) => this.handleSavePaymentMethod(value)}
                                       onSaveInsurance = {(value) => this.handleSaveInsurance(value)}
                                       onSaveValueOfGoods = {(amount, currency) => this.handleSaveValueOfGoods(amount, currency)}
                                       onSaveUnitDetails = {request => this.handleSaveShipmentUnits(request)}
                                       onSaveAdrDetails = {(shipmentAdrDetails) => this.handleSaveAdrDetails(shipmentAdrDetails)}
                                       onDeleteAdrDetails = {(shipmentAdrDetailsId) => this.handleDeleteAdrDetails(shipmentAdrDetailsId)}
                                       onSaveDepartureCustoms = {customsDetails => this.handleSaveDepartureCustomsDetails(customsDetails)}
                                       onSaveArrivalCustoms = {customsDetails => this.handleSaveArrivalCustomsDetails(customsDetails)}
                                       onSaveVehicleRequirements = {requirements => this.handleSaveVehicleRequirements(requirements)}
                                       onSaveEquipmentRequirement = {requirement => this.handleSaveEquipmentRequirement(requirement)}
                                       onDeleteEquipmentRequirement = {requirementId => this.handleDeleteEquipmentRequirement(requirementId)}
                                       onSaveHealthCertificates = {certificates => this.handleSaveHealthCertificates(certificates)}
                                       onSaveTemperatureLimits = {limits => this.handleSaveTemperatureLimits(limits)}
                                       onSaveDefinitionOfGoods = {definitionOfGoods => this.handleSaveDefinitionOfGoods(definitionOfGoods)}
                                       onSaveManufacturer = {manufacturer => this.handleSaveManufacturer(manufacturer)} 
                                       onDeleteManufacturer = {() => this.handleDeleteManufacturer()} 
                                       />
                    </GridCell>
                </Grid>
                <DocumentModal ref = {c => this.orderDocuments = c} editable = {this.state.editable}
                               data = {this.state.order.documents} type = "Order"
                               documentTypes = {this.state.documentTypes}
                               busy = {this.state.savingStatus.orderDocuments}
                               onDelete = {document => this.handleDeleteDocument(document)}
                               onSave = {document => this.handleSaveDocument(document)}/>
            </div>
        );
    }
}
Order.contextTypes = {
    translator: PropTypes.object,
    router: React.PropTypes.object.isRequired
};

