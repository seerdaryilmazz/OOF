import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Span } from 'susam-components/basic';
import { Card, Grid, GridCell } from 'susam-components/layout';
import uuid from 'uuid';
import * as Customs from '../Customs';



export class CreateOrderSummary extends TranslatingComponent{
    formatter = new Intl.NumberFormat('tr-TR', {
        maximumFractionDigits: 2, minimumFractionDigits: 2
    });
    formatterNoFraction = new Intl.NumberFormat('tr-TR', {
        maximumFractionDigits: 0, minimumFractionDigits: 0
    });

    handleSubsidiaryChange(value){
        this.props.onSubsidiaryChange(value);
    }

    renderLabel(label, value, unit){
        if(!value){
            return null;
        }
        return(
            <GridCell width = "1-3">
                <Span label={label} value = {`${value} ${unit}`}/>
            </GridCell>
        );
    }
    renderParty(party){
        if(!party){
            return null;
        }
        let handlingCompanyComponent = _.get(party, "company.id") !== _.get(party, "handlingCompany.id") && <div className = "uk-text-muted">{_.get(party, "handlingCompany.name")}</div>;
        let companyLocationComponent = _.get(party, "companyLocation.id") !== _.get(party, "handlingLocation.id") && <div className = "uk-text-truncate uk-text-small">{_.get(party, "companyLocation.name")}</div>;
        return (
            <div style = {{position: "relative"}}>
                <div className = "uk-text-bold">
                    <div className = "uk-text-truncate">{_.get(party, "company.name")}</div>
                    {companyLocationComponent}
                </div>
                <div style = {{clear: "both"}}>
                    <div style = {{width: "24px", float: "left", marginRight: "8px"}}>
                        <i className = "material-icons" >place</i>
                    </div>
                    <div style = {{marginLeft: "32px", width: "90%"}}>
                        <span className = "uk-text-truncate">{handlingCompanyComponent}</span>
                        <span className = "uk-text-truncate">{_.get(party, "handlingLocation.name")}</span>
                    </div>
                </div>
            </div>
        );
    }
    getAppointmentDate(appointment){
        if(!appointment || !appointment.startDateTime){
            return "";
        }
        let result = "";
        let [startDate, startTime, startTimezone] = appointment.startDateTime.split(" ");
        if(appointment.endDateTime){
            let [endDate, endTime, endTimezone] = appointment.endDateTime.split(" ");
            if(endDate === startDate){
                result = startDate + " " + startTime + "-" + endTime;
            }else{
                result = startDate + " " + startTime + "-" + endDate + " " + endTime;
            }
        }else{
            result = startDate + " " + startTime;
        }
        return result + " " + startTimezone;

    }

    renderWithLatestReadyDate(readyDate){
        if(!readyDate || !readyDate.value){
            return "";
        }
        let result = "";
        let [startDate, startTime, startTimezone] = readyDate.value.split(" ");
        if(readyDate.latest){
            let [endDate, endTime, endTimezone] = readyDate.latest.split(" ");
            if(endDate === startDate){
                result = startDate + " " + startTime + "-" + endTime;
            }else{
                result = startDate + " " + startTime + "-" + endDate + " " + endTime;
            }
        }else{
            result = startDate + " " + startTime;
        }
        return result + " " + startTimezone;
    }

    renderReadyDate(shipment){
        let dateTime = shipment.haveLoadingAppointment ? this.getAppointmentDate(shipment.loadingAppointment) : this.renderWithLatestReadyDate(shipment.readyDateTime);
        return(
            <div style = {{clear: "both"}}>
                <div style = {{width: "24px", float: "left", marginRight: "8px"}}>
                    <i className = "material-icons" >date_range</i>
                </div>
                <div style = {{marginLeft: "32px"}}>
                    <span>{dateTime ? dateTime : super.translate("Ready date not provided")}</span>
                    {shipment.haveLoadingAppointment ? <i className="material-icons uk-margin-small-left" style={{ color: "red" }}
                                                          title = {super.translate("Has appointment")} data-uk-tooltip="{pos:'bottom'}">alarm</i> : ""}
                </div>
            </div>
        );
    }
    renderDeliveryDate(shipment){
        let dateTime = shipment.haveUnloadingAppointment ? this.getAppointmentDate(shipment.unloadingAppointment) : shipment.deliveryDateTime;
        return(
            <div style = {{clear: "both"}}>
                <div style = {{width: "24px", float: "left", marginRight: "8px"}}>
                    <i className = "material-icons" >date_range</i>
                </div>
                <div style = {{marginLeft: "32px"}}>
                    <span>{dateTime ? dateTime : super.translate("Delivery date not provided")}</span>
                    {shipment.haveUnloadingAppointment ? <i className="material-icons uk-margin-small-left" style={{ color: "red" }}
                                                            title={super.translate("Has Appointment")} data-uk-tooltip="{pos:'bottom'}">alarm</i> : ""}
                </div>
            </div>
        );
    }

    renderOrderNumberLabel(orderNumbers, label){
        if(!orderNumbers){
            return;
        }

        let tooltip = "";
        orderNumbers.split("\n").filter(i=>i).forEach(t=>tooltip = tooltip + t  + "<br />");

        return (
            <label className = "md-color-blue-600" data-uk-tooltip="{pos:'bottom'}" title={tooltip}>
                <label style={{textTransform: "capitalize", padding:"2px 16px"}} >
                    {super.translate(label)}
                </label>
            </label>
        );
    }

    renderOrderNumbers(shipment, partyType){
        let orderNumber = null;
        let bookingOrderNumber = null;
        if("sender" === partyType) {
            orderNumber = this.renderOrderNumberLabel(shipment.senderOrderNumbers, "#sender")
            bookingOrderNumber = this.renderOrderNumberLabel(shipment.loadingOrderNumbers, "#loading")
        } else if("consignee" === partyType) {
            orderNumber = this.renderOrderNumberLabel(shipment.consigneeOrderNumbers, "#consignee")
            bookingOrderNumber = this.renderOrderNumberLabel(shipment.unloadingOrderNumbers, "#unloading")
        }
        
        return <div style = {{clear: "both"}}> {orderNumber} {bookingOrderNumber} </div>;
    }
    
    renderSender(shipment){
        return (
            <div>
                <div style = {{width: "36px", float: "left", marginRight: "8px"}}>
                    <i className="material-icons md-36">file_upload</i>
                </div>
                <div style = {{marginLeft: "44px", width: "90%"}}>
                    {shipment.sender ? this.renderParty(shipment.sender) : super.translate("Not Selected")}
                    {this.renderReadyDate(shipment)}
                    {this.renderOrderNumbers(shipment, "sender")}
                </div>

            </div>
        );
    }
    renderConsignee(shipment){
        return (
            <div>
                <div style = {{width: "36px", float: "left", marginRight: "8px"}}>
                    <i className="material-icons md-36">file_download</i>
                </div>
                <div style = {{marginLeft: "44px", width: "90%"}}>
                    {shipment.consignee ? this.renderParty(shipment.consignee) : super.translate("Not Selected")}
                    {this.renderDeliveryDate(shipment)}
                    {this.renderOrderNumbers(shipment, "consignee")}
                </div>
            </div>
        );
    }

    renderManufacturer(shipment){
        if(_.isEmpty(shipment.manufacturer)){
            return;
        }
        let tooltip = _.get(shipment.manufacturer.company, 'name') +  "<br />"
                        + _.get(shipment.manufacturer.companyLocation,'name') + "<br />"
        return (
            <label className = "md-color-blue-600" data-uk-tooltip="{pos:'bottom'}" title={tooltip}>
                <label style={{textTransform: "capitalize", padding:"2px 16px"}} >
                    {super.translate("Manufacturer")}
                </label>
            </label>
        );
    }

    renderValueOfGoodsPaymentTypeAndIncoterm(shipment){

        let paymentType = _.get(shipment, "paymentType.code") || "";
        let incoterm = _.get(shipment, "incoterm.name") || "";
        let currency = _.get(shipment.valueOfGoods, "unit.code") || "";
        let valueOfGoods = shipment.valueOfGoods && shipment.valueOfGoods.amount && shipment.valueOfGoods.unit ?
            this.formatter.format(shipment.valueOfGoods.amount) + " " + currency : super.translate("Value of goods not provided");
        let incotermBadge = incoterm ?
            <i className = "uk-badge uk-badge-warning uk-margin-small-right"
               title = {_.get(shipment, "incoterm.name")} data-uk-tooltip="{pos:'bottom'}">{incoterm}</i> : null;
        let paymentBadge = paymentType ?
            <i className = "uk-badge uk-badge-primary uk-margin-small-right"
               title = {super.translate(_.get(shipment, "paymentType.name"))} data-uk-tooltip="{pos:'bottom'}">{paymentType}</i> : null;
        let insuredIcon = null;
        if(shipment.insured){
            insuredIcon = <i className = "mdi mdi-24px mdi-file-document-box uk-margin-left uk-text-muted"
                             data-uk-tooltip="{pos:'bottom'}" title={super.translate("Insured by Ekol")}/>;
        }
        return (
            <div>
                {incotermBadge}
                {paymentBadge}
                <span className = "uk-text-large" title = {super.translate("Value of Goods")} data-uk-tooltip="{pos:'bottom'}"> {valueOfGoods}</span>
                {insuredIcon}
                <div className = "uk-float-right">
                    {this.renderLoadRequirementsAndSpecs(shipment)}
                </div>
            </div>
        );
    }
    renderLoadRequirementsAndSpecs(shipment){
        let temperature = _.find(shipment.loadRequirements, {id: "FRIGO"}) ?
            <i className = "mdi mdi-24px mdi-thermometer uk-margin-right uk-text-muted"
               data-uk-tooltip="{pos:'bottom'}" title={super.translate("Temperature Controlled")}/> : null;
        let adr = _.find(shipment.loadRequirements, {id: "ADR"}) ?
            <i className = "mdi mdi-24px mdi-alert-octagon uk-margin-right uk-text-muted"
               data-uk-tooltip="{pos:'bottom'}" title={super.translate("ADR")}/> : null;
        let certificate = _.find(shipment.loadRequirements, {id: "CERTIFICATE"}) ?
            <i className = "mdi mdi-24px mdi-certificate uk-margin-right uk-text-muted"
               data-uk-tooltip="{pos:'bottom'}" title={super.translate("Health Certificated")}/> : null;
        let heavyLoad = shipment.isHeavyLoad ?
            <i className = "mdi mdi-24px mdi-weight-kilogram uk-margin-right uk-text-muted"
               data-uk-tooltip="{pos:'bottom'}" title={super.translate("Heavy Load")}/> : null;
        let valuableLoad = shipment.isValuableLoad ?
            <i className = "mdi mdi-24px mdi-currency-usd uk-margin-right uk-text-muted"
               data-uk-tooltip="{pos:'bottom'}" title={super.translate("Valuable Load")}/> : null;
        let hasLongLoad = _.findIndex(shipment.shipmentUnitDetails, {isLongLoad: true}) >= 0;
        let longLoad = null;
        if(hasLongLoad){
            longLoad = <i className = "mdi mdi-24px mdi-arrow-expand uk-margin-right uk-text-muted"
                          data-uk-tooltip="{pos:'bottom'}" title={super.translate("Long Load")}/>
        }
        let hasOversizeLoad = _.findIndex(shipment.shipmentUnitDetails, {isOversizeLoad: true}) >= 0;
        let oversizeLoad = null;
        if(hasOversizeLoad){
            oversizeLoad = <i className = "mdi mdi-24px mdi-star-circle uk-margin-right uk-text-muted"
                              data-uk-tooltip="{pos:'bottom'}" title={super.translate("Oversize")}/>
        }
        let hasHangingLoad = _.findIndex(shipment.shipmentUnitDetails, {isHangingLoad: true}) >= 0;
        let hangingLoad = null;
        if(hasHangingLoad){
            hangingLoad = <i className = "mdi mdi-24px mdi-hanger uk-margin-right uk-text-muted"
                              data-uk-tooltip="{pos:'bottom'}" title={super.translate("Hanging Load")}/>
        }
        return(
            <div>
                {temperature}
                {adr}
                {certificate}
                {heavyLoad}
                {valuableLoad}
                {longLoad}
                {oversizeLoad}
                {hangingLoad}
            </div>
        );
    }
    renderLoadTotals(shipment){
        if(!shipment.shipmentTotals){
            return null;
        }
        let packageTypes = _.reject(shipment.shipmentTotals.packageTypes, i=>_.isEmpty(i));
        let type = packageTypes && packageTypes.length == 1 ?
            packageTypes.map(type => type.name).map(name => <div key = {name} className = "uk-text-small">{super.translate(name)}</div>) :
            packageTypes && packageTypes.length > 1 ?
            <div key = "type-unknown" className = "uk-text-small">{super.translate("Package")}</div>:
            <div key = "type-unknown" className = "uk-text-small">{super.translate("Unknown")}</div>;
        let weight =
            <div className = "uk-float-left uk-margin-right">
                <i className = "mdi mdi-24px mdi-weight-kilogram uk-margin-small-right uk-text-muted"
                   title={super.translate("Gross Weight")} data-uk-tooltip="{pos:'bottom'}" />
                <span className = "heading_a">
                    {shipment.shipmentTotals.grossWeight ? (this.formatterNoFraction.format(shipment.shipmentTotals.grossWeight) + " kg") : super.translate("N/A")}
                    </span>
            </div>;
        let volume =
            <div className = "uk-float-left uk-margin-right">
                <i className = "mdi mdi-24px mdi-cube-outline uk-margin-small-right uk-text-muted"
                   title={super.translate("Volume")} data-uk-tooltip="{pos:'bottom'}" />
                <span className = "heading_a">
                    {shipment.shipmentTotals.volume ? (this.formatter.format(shipment.shipmentTotals.volume) + " m³") : super.translate("N/A")}
                    </span>
            </div>;
        let ldm =
            <div className = "uk-float-left uk-margin-right">
                <i className = "mdi mdi-24px mdi-cube-unfolded uk-margin-small-right uk-text-muted"
                   title={super.translate("LDM")} data-uk-tooltip="{pos:'bottom'}"/>
                <span className = "heading_a">
                    {shipment.shipmentTotals.ldm ? (this.formatter.format(shipment.shipmentTotals.ldm) + " ldm") : super.translate("N/A")}
                    </span>
            </div>;
        return(
            <div>
                <div className = "uk-float-left uk-margin-large-right">
                    <span className = "heading_a">{shipment.shipmentTotals.totalQuantity || "0"}</span>
                    {type}
                </div>
                {weight}
                {volume}
                {ldm}
            </div>
        );

    }
    renderLoadUnits(shipment){
        if(!shipment.shipmentUnitDetails || shipment.shipmentUnitDetails.length === 0){
            return null;
        }
        return(
            <ul className="md-list md-list-addon">
                {shipment.shipmentUnitDetails.map(item => this.renderLoadUnitItem(item))}
            </ul>
        );
    }
    renderLoadUnitItem(shipmentUnit){

        let width = shipmentUnit.width ?
            <span className = "uk-margin-small-right">
                <span className = "uk-text-muted">{`${super.translate("Width")}:`} </span>
                <span className = "uk-text-bold">{shipmentUnit.width + " cm."}</span>
            </span> :
            null;
        let length = shipmentUnit.length ?
            <span className = "uk-margin-small-right">
                <span className = "uk-text-muted">{`${super.translate("Length")}:`} </span>
                <span className = "uk-text-bold">{shipmentUnit.length + " cm."}</span>
            </span> :
            null;
        let height = shipmentUnit.height ?
            <span className = "uk-margin-small-right">
                <span className = "uk-text-muted">{`${super.translate("Height")}:`} </span>
                <span className = "uk-text-bold">{shipmentUnit.height + " cm."}</span>
            </span> :
            null;
        let stackability = shipmentUnit.stackability ?
            <span className = "uk-margin-small-right">
                <span className = "uk-text-muted">{`${super.translate("Stackability")}:`} </span>
                <span className = "uk-text-bold">{_.isNumber(shipmentUnit.stackability.name)?shipmentUnit.stackability.name:super.translate(shipmentUnit.stackability.name)}</span>
            </span> :
            null;
        let quantity = shipmentUnit.quantity || "0";
        let packageType = shipmentUnit.packageType ? super.translate(shipmentUnit.packageType.name) : super.translate("Unknown");
        return(
            <li key = {uuid.v4()}>
                <div className="md-list-addon-element" style = {{textAlign: "inherit"}}>
                    <span className = "heading_a">{quantity}</span>
                    <div className = "uk-text-small">{packageType}</div>
                </div>
                <div>
                    <div>{width}{length}{height}</div>
                    <div>{stackability}</div>
                </div>
            </li>
        );

    }
    renderVehicleRequirements(shipment){
        if(!shipment.vehicleRequirements){
            return null;
        }
        let loadingRequirements = [];
        if(_.find(shipment.requirements, {id: "VEHICLE"})){
            loadingRequirements = loadingRequirements.concat(shipment.vehicleRequirements.requiredForLoading);
        }
        loadingRequirements = loadingRequirements.concat(shipment.vehicleRequirements.requiredByWarehouseForLoading);
        loadingRequirements = loadingRequirements.concat(shipment.vehicleRequirements.requiredByLoad);

        let unloadingRequirements = [];
        if(_.find(shipment.requirements, {id: "VEHICLE"})){
            unloadingRequirements = unloadingRequirements.concat(shipment.vehicleRequirements.requiredForUnloading);
        }
        unloadingRequirements = unloadingRequirements.concat(shipment.vehicleRequirements.requiredByWarehouseForUnloading);
        unloadingRequirements = unloadingRequirements.concat(shipment.vehicleRequirements.requiredByLoad);

        loadingRequirements = _.uniqWith(loadingRequirements, (item1, item2) => item1.code === item2.code);
        unloadingRequirements = _.uniqWith(unloadingRequirements, (item1, item2) => item1.code === item2.code);
        if(loadingRequirements.length === 0 && unloadingRequirements.length === 0){
            return null;
        }
        let requiredForLoading = loadingRequirements.length > 0 ?
            <GridCell width = "1-2">
                <Span label = "Required for Loading"
                      value = {loadingRequirements.map(item => super.translate(item.name)).join(",")}/>
            </GridCell> : null;

        let requiredForUnloading = unloadingRequirements.length > 0 ?
            <GridCell width = "1-2">
                <Span label = "Required for Unloading"
                      value = {unloadingRequirements.map(item => super.translate(item.name)).join(",")}/>
            </GridCell> : null;
        return(
            <div>
                <Grid>
                    {requiredForLoading}
                    {requiredForUnloading}
                </Grid>
            </div>
        );
    }
    renderEquipmentRequirements(shipment){
        let requiredByWarehouse = _.filter(shipment.equipmentRequirements, item => !_.isNil(item.equipmentCountRequiredByWarehouse));
        if(!_.find(shipment.requirements, {id: "EQUIPMENT"}) && requiredByWarehouse.length > 0){
            return(
                <div>
                    {_.filter(requiredByWarehouse, item => item.equipmentType)
                        .map(item => this.renderEquipmentRequirementItem(item.equipmentType, item.equipmentCountRequiredByWarehouse))}
                </div>
            );
        }else if(!_.find(shipment.requirements, {id: "EQUIPMENT"}) || !shipment.equipmentRequirements || shipment.equipmentRequirements.length === 0){
            return null;
        }
        return(
            <div>
                {_.filter(shipment.equipmentRequirements, item => item.equipmentType)
                    .map(item => this.renderEquipmentRequirementItem(item.equipmentType, item.equipmentCount))}
            </div>
        );
    }
    renderEquipmentRequirementItem(type, count){
        return(
            <div key = {type.id} className = "uk-float-left uk-margin-right">
                <div className = "uk-text-muted" style = {{textAlign: "center"}}>{super.translate(type.name)}</div>
                <div className = "heading_a" style = {{textAlign: "center"}}>{count}</div>
            </div>
        );
    }
    renderDepartureCustoms(shipment){
        if(!shipment.departureCustoms){
            return null;
        }
        let customsDetails = null;
        if(shipment.sender.handlingLocationCountry === "TR"){
            customsDetails = this.renderDepartureCustomsTR(shipment);
        }else{
            customsDetails = this.renderCustomsDefault(shipment.departureCustoms);
        }

        return (
            <div>
                <span className = "label">{super.translate("Departure Customs")}</span>
                {customsDetails}
            </div>
        );
    }
    renderCustomsDefault(customsDetails){
        return(

            <div>
                <div className = "uk-text-bold">
                    {customsDetails.customsAgentLocation ? customsDetails.customsAgentLocation.name : super.translate("Location not selected")}</div>
                <div className = "uk-text-muted">
                    {customsDetails.customsAgent ? customsDetails.customsAgent.name : super.translate("Agent not selected")}</div>
            </div>

        );
    }
    renderDepartureCustomsTR(shipment){
        return(
            <div>
                <div className = "uk-text-bold">
                    {shipment.departureCustoms.customsOffice ? shipment.departureCustoms.customsOffice.name : super.translate("Customs office not selected")}</div>
                <div className = "uk-text-muted">
                    {shipment.departureCustoms.customsAgent ? shipment.departureCustoms.customsAgent.name : super.translate("Agent not selected")}</div>
            </div>
        );
    }
    renderArrivalCustoms(shipment){
        if(!shipment.arrivalCustoms){
            return null;
        }
        let customsDetails = null;
        if(shipment.consignee.handlingLocationCountry === "TR"){
            customsDetails = this.renderArrivalCustomsTR(shipment);
        }else{
            customsDetails = this.renderCustomsDefault(shipment.arrivalCustoms);
        }

        return (
            <div>
                <span className = "label">{super.translate("Arrival Customs")}</span>
                {customsDetails}
            </div>
        );
    }
    renderArrivalCustomsTR(shipment){
        let customsLocation =
                <div className = "uk-text-bold uk-text-truncate">
                    {shipment.arrivalCustoms.customsLocation ? shipment.arrivalCustoms.customsLocation.name : super.translate("Customs location not selected")}
                </div>;
        if(Customs.isCustomsTypeFreeZone(shipment.arrivalCustoms.customsType)){
            customsLocation = null;
        }
        return(
            <div style = {{position: "relative"}}>
                <div className = "uk-text-bold uk-text-truncate">
                    {shipment.arrivalCustoms.customsOffice ? shipment.arrivalCustoms.customsOffice.name : super.translate("Customs office not selected")}</div>
                <div className = "uk-text-muted uk-text-small uk-text-truncate">
                    {shipment.arrivalCustoms.customsType ? super.translate(shipment.arrivalCustoms.customsType.name) : ""}</div>
                {customsLocation}
                <div className = "uk-text-truncate">
                    {shipment.arrivalCustoms.customsAgent ? shipment.arrivalCustoms.customsAgent.name : super.translate("Customs agent not selected")}</div>
            </div>
        );
    }
    renderCustoms(shipment){
        if(!shipment.askCustomsInfo){
            return null;
        }
        return (
            <div className="md-card-content" style={{borderBottom: "1px solid rgba(0, 0, 0, 0.12)"}}>
                <Grid>
                    <GridCell width = "1-2" noMargin = {true}>
                        {this.renderDepartureCustoms(shipment)}
                    </GridCell>
                    <GridCell width = "1-2" noMargin = {true}>
                        {this.renderArrivalCustoms(shipment)}
                    </GridCell>
                </Grid>
            </div>
        );
    }
    renderDefinitionOfGoods(shipment) {
        let goods = <div className="md-card-content" style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.12)" }}>
                        <Grid>{shipment.definitionOfGoods.map(item => {
                            let code =  <GridCell width="1-3" noMargin={true}>HS: {item.code}</GridCell>
                            let name =  <GridCell width="2-3" noMargin={true}>{item.name}</GridCell>
                            return [code,name];
                        })}</Grid>
                    </div>
        return _.isEmpty(shipment.definitionOfGoods) ? null : goods;
    }

    renderShipment(shipment){
        return(
            <GridCell width = "1-1" key = {shipment.index || uuid.v4()}>
                <div className="md-card">
                    <div className="md-card-toolbar">
                        <div className="md-card-toolbar-actions">
                            <Button flat={true} style="danger" size="small" label="Delete"></Button>
                        </div>
                        <h3 className="md-card-toolbar-heading-text">
                            {`${super.translate("Shipment")} #${shipment.index+1}`} 
                            {this.renderOrderNumberLabel(shipment.customerOrderNumbers, "#customer")}
                        </h3>
                    </div>
                    <div className="md-card-content"
                         style={{backgroundColor: "rgba(0,0,0,.045)", borderBottom: "1px solid rgba(0, 0, 0, 0.12)"}}>
                        <Grid>
                            <GridCell width = "1-1" noMargin = {true}>
                                {this.renderSender(shipment)}
                            </GridCell>
                            <GridCell width = "1-1">
                                {this.renderConsignee(shipment)}
                            </GridCell>
                            <GridCell width = "1-4">
                                {this.renderManufacturer(shipment)}
                            </GridCell>
                        </Grid>
                    </div>
                    <div className="md-card-content" style={{borderBottom: "1px solid rgba(0, 0, 0, 0.12)"}}>
                        <Grid>
                            <GridCell width = "1-1" noMargin = {true}>
                                {this.renderValueOfGoodsPaymentTypeAndIncoterm(shipment)}
                            </GridCell>
                            <GridCell width = "1-1">
                                {this.renderLoadTotals(shipment)}
                            </GridCell>
                            <GridCell width = "1-1">
                                {this.renderLoadUnits(shipment)}
                            </GridCell>
                        </Grid>
                    </div>
                    {this.renderDefinitionOfGoods(shipment)}
                    {this.renderCustoms(shipment)}
                    <div className="md-card-content" style={{borderBottom: "1px solid rgba(0, 0, 0, 0.12)"}}>
                        <Grid>
                            <GridCell width = "1-1" noMargin = {true}>
                                {this.renderVehicleRequirements(shipment)}
                            </GridCell>
                            <GridCell width = "1-1">
                                {this.renderEquipmentRequirements(shipment)}
                            </GridCell>
                        </Grid>
                    </div>


                </div>
            </GridCell>
        );
    }
    render(){
        let {order} = this.props;
        let truckLoadType = null;
        if(order.truckLoadType){
            truckLoadType =
                <i className="uk-badge" style = {{float: "right", marginLeft: "12px"}}>
                {order.truckLoadType ? super.translate(order.truckLoadType.name) : ""}
                </i>;
        }
        let serviceType = null;
        if(order.serviceType){
            serviceType =
                <i className="uk-badge uk-badge-success" style = {{float: "right", marginLeft: "12px"}}>
                {order.serviceType ? super.translate(order.serviceType.name) : ""}
                </i>;
        }
        let originalCustomer = null;
        if(order.originalCustomer){
            originalCustomer =
                <div style = {{marginTop: "8px", clear: "both"}}>
                    {order.originalCustomer ? order.originalCustomer.name : ""}
                </div>;
        }
        let subsidiary = null;
        if(order.subsidiary){
            subsidiary = <DropDown options = {this.props.subsidiaries} value = {order.subsidiary}
                                   onchange = {(value) => this.handleSubsidiaryChange(value)}/>;
        }
        return(
            <Grid>
                <GridCell width = "1-1" noMargin = {true}>
                    <Card>
                        <div style = {{minHeight: "78px"}}>
                            {subsidiary}
                            <div className="uk-text-large" style = {{marginTop: "16px"}}>{order.customer ? order.customer.name : ""}</div>
                            {truckLoadType}
                            {serviceType}
                            {originalCustomer}
                        </div>
                    </Card>
                </GridCell>
                {order.shipments.map(shipment => this.renderShipment(shipment))}
            </Grid>
        );
    }
}

CreateOrderSummary.contextTypes = {
    translator: PropTypes.object
};