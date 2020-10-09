import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { round } from '../Helper';
import { ProjectService } from '../services';
import { CreateOrderSteps } from './CreateOrderSteps';
import { CreateOrderSummary } from './CreateOrderSummary';
import { Stepper } from './Stepper';
import { AdrDetailsList } from './steps/AdrDetailsList';
import { LoadingAppointment, UnloadingAppointment } from './steps/Appointment';
import { DefinitionOfGoodsList } from './steps/DefinitionOfGoodsList';
import { DocumentList } from './steps/DocumentList';
import { EquipmentRequirementList } from './steps/EquipmentRequirementList';
import * as Steps from "./steps/OrderSteps";
import { ShipmentUnitDetailsList } from "./steps/ShipmentUnitDetailslList";
import { ShipmentUnitTotals } from './steps/ShipmentUnitTotals';
import { AdrDetailsListValidator } from "./steps/validation/AdrDetailsValidator";
import * as Validator from "./steps/validation/CommonValidator";
import { CustomsAgentAndLocationValidator, CustomsArrivalTRValidator, CustomsDepartureTRValidator } from "./steps/validation/CustomsValidator";
import { DocumentListValidator } from "./steps/validation/DocumentValidator";
import { EquipmentRequirementListValidator } from "./steps/validation/EquipmentRequirementValidator";
import { HealthCertificateValidator } from "./steps/validation/HealthCertificateValidator";
import { PartyValidator, ManufacturerValidator } from "./steps/validation/OrderParticipantValidator";
import { ShipmentUnitTotalsValidator } from "./steps/validation/ShipmentUnitTotalsValidator";
import { ShipmentUnitListValidator } from "./steps/validation/ShipmentUnitValidator";
import { VehicleRequirementsValidator } from "./steps/validation/VehicleRequirementsValidator";
import { ValueOfGoods } from './steps/ValueOfGoods';
import { VehicleRequirements } from './steps/VehicleRequirements';

const VEHICLE_FEATURE_HANGING_LOAD = "SUITABLE_FOR_HANGING_LOADS";
const VEHICLE_FEATURE_FRIGO = "FRIGO";
const VEHICLE_FEATURE_CURTAIN_SIDE = "CURTAIN_SIDER";

export class CreateOrderForm extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            rate: 0,
            stepIndex: 0
        };
    }

    componentDidMount() {
        this.createOrderSteps(this.props);
    }
    componentWillReceiveProps(nextProps) {
        this.createOrderSteps(nextProps);
    }

    nextStep() {
        this.setStep(this.state.stepIndex + 1);
    }
    prevStep() {
        let prevStepIndex = this.state.stepIndex - 1;
        this.setStep(prevStepIndex >= 0 ? prevStepIndex : 0);
    }
    setStep(index) {
        if (index > this.state.stepIndex) {
            this.state.steps[this.state.stepIndex].onInactive && this.state.steps[this.state.stepIndex].onInactive();
        }
        this.setState({ stepIndex: index });
    }
    getStepIdForShipment(id, shipmentIndex) {
        return `shipments[${shipmentIndex}].${id}`;
    }
    getTotalUnitsLdm(shipment) {
        let total = "";
        if (shipment.shipmentUnitDetails) {
            total = _.reduce(shipment.shipmentUnitDetails, (sum, unitDetails) => {
                return round(sum + (unitDetails.ldm ? unitDetails.ldm : 0), 2);
            }, 0);
        }
        return total;
    }
    getTotalUnitsVolume(shipment) {
        let total = "";
        if (shipment.shipmentUnitDetails) {
            total = _.reduce(shipment.shipmentUnitDetails, (sum, unitDetails) => {
                return round(sum + (unitDetails.volume ? unitDetails.volume : 0), 2);
            }, 0);
        }
        return total;
    }
    getTotalUnitsQuantity(shipment) {
        let total = "";
        if (shipment.shipmentUnitDetails) {
            total = _.reduce(shipment.shipmentUnitDetails, (sum, unitDetails) => {
                return round(sum + (unitDetails.quantity ? parseInt(unitDetails.quantity) : 0), 2);
            }, 0);
        }
        return total;
    }

    getUnitsPackageTypes(shipment) {
        let { shipmentUnitDetails } = shipment;
        let types = [];
        if (shipmentUnitDetails) {
            let packageTypes = _.filter(shipmentUnitDetails, item => item.packageType)
                .map(details => _.find(this.props.lookup.packageTypes, { code: details.packageType.code }));
            types = _.uniqBy(packageTypes, item => item.id);
        }
        return types;
    }

    handleTruckLoadTypeChange(shipmentIndex) {
        this.getRequestedDeliveryDate(shipmentIndex);
        this.cleanShipmentUnitDetailsIfNecessary(shipmentIndex);
    }

    cleanShipmentUnitDetailsIfNecessary(shipmentIndex) {
        let order = this.props.order;
        let shipment = order.shipments[shipmentIndex];
        if (shipment.askForShipmentUnits &&
            shipment.askForShipmentUnits.code === "FOR_LTL" &&
            order.truckLoadType.code === "FTL") {
            this.handleChange(`shipments[${shipmentIndex}].shipmentUnitDetails`, []);
        }
    }

    getRequestedDeliveryDate(shipmentIndex) {
        let order = this.props.order;
        let shipment = order.shipments[shipmentIndex];
        let readyDate = shipment.haveLoadingAppointment && shipment.loadingAppointment ?
            shipment.loadingAppointment.startDateTime : (shipment.readyDateTime && shipment.readyDateTime.value);
        if (order.customer && order.truckLoadType && order.serviceType && readyDate && shipment.sender && shipment.consignee) {
            let [readyDateDate, readyDateTime, readyDateTimezone] = readyDate.split(" ");
            let request = {
                customerId: order.customer.id,
                loadType: order.truckLoadType.code,
                serviceType: order.serviceType.code,
                readyDate: readyDateDate + " " + readyDateTime,
                loadingLocationId: shipment.sender.handlingLocation.id,
                unloadingLocationId: shipment.consignee.handlingLocation.id,
            };
            ProjectService.calculateDeliveryDate(request).then(response => {
                if (response.data.deliveryDate) {
                    this.handleChange(`shipments[${shipmentIndex}].deliveryDateTime`,
                        response.data.deliveryDate + " " + shipment.consignee.handlingLocationTimezone);
                }
            }).catch(error => Notify.showError(error));
        } else {
            this.handleChange(`shipments[${shipmentIndex}].deliveryDateTime`, null);
        }
    }

    handleChange(key, value) {
        console.log(key, value);
        let order = _.cloneDeep(this.props.order);
        _.set(order, key, value);
        this.props.onChange(order);
    }

    handleOrderNumbersValue(key, shipmentIndex, value, orderNumberKey) {
        this.handleChange(key, value);
        if (!value) {
            this.handleChange(`shipments[${shipmentIndex}].${orderNumberKey}`, null);
        }
    }

    handleAddNewShipment(key, shipmentIndex, value) {
        this.handleChange(key, value);
        if (value) {
            this.props.onCreateNewShipment();
        } else {
            this.props.onDeleteShipment(shipmentIndex + 1);
        }
    }
    
    handleManufacturerOptionChange(key, shipmentIndex, value, manufacturers){
        this.handleChange(`shipments[${shipmentIndex}].haveManufacturer`, value);
        if (!value) {
            this.handleChange(`shipments[${shipmentIndex}].manufacturer`, null);
        } else if(1 === manufacturers.length){
            this.handleChange(`shipments[${shipmentIndex}].manufacturer`, _.first(manufacturers));
        }
    }

    handleSenderChange(key, shipmentIndex, value) {
        if (this.props.template && this.props.template.customizations && this.props.template.customizations.length > 0) {
            this.props.onCustomizationChange && this.props.onCustomizationChange(shipmentIndex, value);
        } else {
            this.props.onSenderChange && this.props.onSenderChange(shipmentIndex, value);
        }
    }
    handleConsigneeChange(key, shipmentIndex, value) {
        if (this.props.template && this.props.template.customizations && this.props.template.customizations.length > 0) {
            this.props.onCustomizationChange && this.props.onCustomizationChange(shipmentIndex, value);
        } else {
            this.props.onConsigneeChange && this.props.onConsigneeChange(shipmentIndex, value);
        }
    }
    handleHaveShipmentUnitDetailsChange(key, shipmentIndex, value) {
        this.handleChange(key, value);
        if (!value) {
            this.handleChange(`shipments[${shipmentIndex}].shipmentUnitDetails`, []);
        }

    }
    handleChangeLoadingAppointmentOption(key, shipmentIndex, value) {
        this.handleChange(`shipments[${shipmentIndex}].haveLoadingAppointment`, value);
        if (value) {
            this.handleChange(`shipments[${shipmentIndex}].readyDateTime`, null);
        } else {
            this.handleChange(`shipments[${shipmentIndex}].loadingAppointment`, null);
        }
    }
    handleShipmentUnitDetailsChange(key, shipmentIndex, value) {
        let order = _.cloneDeep(this.props.order);
        _.set(order, key, value);
        let emptyTotals = {
            totalQuantity: 0,
            ldm: 0,
            volume: 0,
            packageTypes: [],
            hasEdited: {}
        };
        let shipmentTotals = order.shipments[shipmentIndex].shipmentTotals || emptyTotals;
        let totalUnitsQuantity = this.getTotalUnitsQuantity(order.shipments[shipmentIndex]);
        if (!shipmentTotals.hasEdited.totalQuantity) {
            shipmentTotals.totalQuantity = totalUnitsQuantity;
        }
        let totalUnitsLdm = this.getTotalUnitsLdm(order.shipments[shipmentIndex]);
        if (!shipmentTotals.hasEdited.ldm) {
            shipmentTotals.ldm = totalUnitsLdm;
        }
        let totalUnitsVolume = this.getTotalUnitsVolume(order.shipments[shipmentIndex]);
        if (!shipmentTotals.hasEdited.volume) {
            shipmentTotals.volume = totalUnitsVolume;
        }
        shipmentTotals.packageTypes = this.getUnitsPackageTypes(order.shipments[shipmentIndex]);
        order.shipments[shipmentIndex].shipmentTotals = shipmentTotals;

        if (_.find(order.shipments[shipmentIndex].shipmentUnitDetails, { isHangingLoad: true })) {
            this.addToLoadVehicleRequirements(order.shipments[shipmentIndex], VEHICLE_FEATURE_HANGING_LOAD);
        } else {
            this.removeFromLoadVehicleRequirements(order.shipments[shipmentIndex], VEHICLE_FEATURE_HANGING_LOAD);
        }

        this.props.onChange(order);
    }
    handleDefinitionOfGoodsChange(key, shipmentIndex, value) {
        let order = _.cloneDeep(this.props.order);
        _.set(order, key, value);
        order.shipments[shipmentIndex].definitionOfGoods = value;
        this.props.onChange(order);
    }
    handleLoadRequirementsChange(key, shipmentIndex, value) {
        let order = _.cloneDeep(this.props.order);
        _.set(order, key, value);

        if (_.find(value, { id: "FRIGO" })) {
            this.addToLoadVehicleRequirements(order.shipments[shipmentIndex], VEHICLE_FEATURE_FRIGO);
        } else {
            this.removeFromLoadVehicleRequirements(order.shipments[shipmentIndex], VEHICLE_FEATURE_FRIGO);
        }
        this.props.onLoadRequirementsChange(shipmentIndex, order);
    }

    removeFromLoadVehicleRequirements(shipment, code) {
        let requiredByLoad = _.cloneDeep(shipment.vehicleRequirements.requiredByLoad);
        _.remove(requiredByLoad, { code: code });
        shipment.vehicleRequirements.requiredByLoad = requiredByLoad;
    }
    addToLoadVehicleRequirements(shipment, code) {
        let requiredByLoad = _.cloneDeep(shipment.vehicleRequirements.requiredByLoad);
        if (!_.find(requiredByLoad, { code: code })) {
            requiredByLoad.push(
                _.find(this.props.lookup.vehicleFeatures, { code: code }));
        }
        shipment.vehicleRequirements.requiredByLoad = requiredByLoad;
    }
    handleEquipmentRequirementChange(key, shipmentIndex, value) {
        let order = _.cloneDeep(this.props.order);
        _.set(order, key, value);
        this.props.onEquipmentRequirementsChange(shipmentIndex, order);
    }

    handleHealthCertificateChange(key, shipmentIndex, value) {
        let order = _.cloneDeep(this.props.order);
        _.set(order, key, value);
        let certificateTypes = order.shipments[shipmentIndex].certificateTypes;
        if (certificateTypes) {
            certificateTypes.uploadTypes = [];
        } else {
            certificateTypes = { uploadTypes: [] };
        }
        value.forEach(certificate => {
            if (certificate.types) {
                certificate.types.forEach(item => {
                    if (!_.find(certificateTypes.uploadTypes, { id: item.id })) {
                        certificateTypes.uploadTypes.push(item);
                    }
                });
            }
        });
        order.shipments[shipmentIndex].certificateTypes = certificateTypes;
        this.props.onChange(order);
    }

    handleInactivateShipmentUnitDetails(shipmentIndex) {
        let shipment = this.props.order.shipments[shipmentIndex];
        shipment.shipmentUnitDetails.forEach((details, index) => {
            ProjectService.executeLoadSpecRulesForPackage(details.width, details.length, details.height).then(response => {
                let order = _.cloneDeep(this.props.order);
                order.shipments[shipmentIndex].shipmentUnitDetails[index].isLongLoad = response.data.longLoad;
                order.shipments[shipmentIndex].shipmentUnitDetails[index].isOversizeLoad = response.data.oversizeLoad;
                if (response.data.longLoad) {
                    this.addToLoadVehicleRequirements(order.shipments[shipmentIndex], VEHICLE_FEATURE_CURTAIN_SIDE);
                } else {
                    this.removeFromLoadVehicleRequirements(order.shipments[shipmentIndex], VEHICLE_FEATURE_CURTAIN_SIDE);
                }

                this.props.onChange(order);
            })
        })
    }
    handleInactivateShipmentUnitTotals(shipmentIndex) {
        let order = _.cloneDeep(this.props.order);
        let shipment = order.shipments[shipmentIndex];
        if (shipment.shipmentTotals) {
            ProjectService.executeLoadSpecRulesForShipment(shipment.shipmentTotals.grossWeight,
                shipment.shipmentTotals.ldm,
                shipment.valueOfGoods ? shipment.valueOfGoods.amount : null).then(response => {
                    shipment.isHeavyLoad = response.data.heavyLoad;
                    shipment.isValuableLoad = response.data.valuableLoad;
                    this.props.onChange(order);
                });
        }
    }
    handleInactivateValueOfGoods(shipmentIndex) {
        this.handleInactivateShipmentUnitTotals(shipmentIndex);
    }
    handleInactivateDefinitionOfGoods(shipmentIndex) {
        let order = _.cloneDeep(this.props.order);
        let shipment = order.shipments[shipmentIndex];
        shipment.definitionOfGoods = _.filter(shipment.definitionOfGoods, (o) => { return !_.isEmpty(o) });

        let duplicated = _.filter(shipment.definitionOfGoods, (item, index, it) => { return _.find(it, item, index + 1) });
        duplicated.forEach(item => {
            let ix = _.findLastIndex(shipment.definitionOfGoods, item);
            shipment.definitionOfGoods.splice(ix, 1);
        });
        this.props.onChange(order);
    }

    render() {
        return (
            <div>
                <PageHeader title="New Order" translate={true} />
                <Grid>
                    <GridCell width="1-10" style={{ width: "5%" }}>
                        <Stepper steps={this.state.steps}
                            order={this.props.order}
                            activeIndex={this.state.stepIndex}
                            onActiveIndexChange={count=>this.setState({rate: count.rate})}
                            onStepClick={(stepIndex) => this.setState({ stepIndex: stepIndex })} />
                    </GridCell>
                    <GridCell width="6-10" style={{ width: "65%" }}>
                        <Card>
                            <div className="md-card-toolbar" data-toolbar-progress={this.state.rate} data-toolbar-progress-steps={true} 
                                style={{background: `rgba(0, 0, 0, 0) -webkit-linear-gradient(left, rgb(220, 237, 200) ${this.state.rate}%, rgb(255, 255, 255) ${this.state.rate}%) repeat scroll 0% 0%`}}>
                                <h3 className="md-card-toolbar-heading-text">{`${super.translate("Progress")}: ${this.state.rate}%`}</h3>
                            </div>
                            <CreateOrderSteps index={this.state.stepIndex}
                                order={this.props.order}
                                steps={this.state.steps}
                                onChange={(key, value) => this.handleChange(key, value)}
                                onSave={() => this.props.onSave()}
                                onPrev={() => this.prevStep()}
                                onNext={() => this.nextStep()}
                                onStep={(index) => this.setStep(index)}>
                            </CreateOrderSteps>
                        </Card>
                    </GridCell>
                    <GridCell width="3-10">
                        <CreateOrderSummary order={this.props.order} subsidiaries={this.props.lookup.subsidiaries}
                            onSubsidiaryChange={(value) => this.handleChange("subsidiary", value)} />
                    </GridCell>
                </Grid>
            </div>
        );
    }

    createOrderSteps(props) {
        let steps = [];
        let template = props.template;
        if (template && template.customizations.length !== 1) {
            if (template.pivot && template.pivot.type === "SENDER") {
                steps.push({
                    title: "Please select a consignee",
                    id: this.getStepIdForShipment("consignee", 0),
                    component: () => <Steps.Party options={template.customizations}
                        customer={template.customer}
                        showSearchInput={true}
                        size={6} />,
                    onChange: (key, value) => this.handleConsigneeChange(key, 0, value),
                    onInactive: () => this.getRequestedDeliveryDate(0),
                    validate: (value) => {
                        return PartyValidator.validate(value, props.order.truckLoadType, props.order.serviceType, props.order.shipments[0].sender)
                    }
                });
            } else if (template.pivot && template.pivot.type === "CONSIGNEE") {
                steps.push({
                    title: "Please select a sender",
                    id: this.getStepIdForShipment("sender", 0),
                    component: () => <Steps.Party options={template.customizations}
                        customer={template.customer}
                        showSearchInput={true}
                        size={6} />,
                    onChange: (key, value) => this.handleSenderChange(key, 0, value),
                    onInactive: () => this.getRequestedDeliveryDate(0),
                    validate: (value) => {
                        return PartyValidator.validate(value, props.order.truckLoadType, props.order.serviceType, props.order.shipments[0].consignee)
                    }
                });
            }
        }

        if (props.order.customerIsPartner && props.order.originalCustomers.length !== 1) {
            steps.push({
                title: "Please select original customer",
                id: "originalCustomer",
                component: () => <Steps.OriginalCustomerStep options={props.order.originalCustomers} />,
                validate: Validator.IdValidator.validate
            });
        }
        props.order.shipments.forEach((item, index) => {
            steps = steps.concat(this.createShipmentSteps(props, index));
        });

        if (props.order.shipments.length > 1) {
            steps.push({
                title: "Please upload order based documents",
                id: "orderDocuments",
                component: () => <DocumentList types={props.lookup.documentTypes} />,
                validate: DocumentListValidator.validate
            });
        }
        if (props.order.allowOrderReplication) {
            steps.push({
                title: "Do you want to replicate order ?",
                id: "replicateOrder",
                component: () => <Steps.YesNoButtonStep />
            });
            if (props.order.replicateOrder) {
                let numberOfReplicationsOptions = Array.from(new Array(18), (x, i) => i + 2).map(item => {
                    return { id: item, name: item };
                });
                steps.push({
                    title: "How many copies in total would you like ?",
                    id: "numberOfReplications",
                    component: () => <Steps.DropDownSelectionStep options={numberOfReplicationsOptions} />
                });
            }
        }

        // let valid = false;
        // steps.push({
        //     title: "",
        //     id: "save",
        //     component: () => <Steps.ActionButtonStep disabled = {!valid} onClick = {() => props.onSave()} />
        // });
        this.setState({ steps: steps });
    }

    createShipmentSteps(props, shipmentIndex) {
        let shipment = props.order.shipments[shipmentIndex];
        let template = props.template;
        let steps = [];
        if (shipmentIndex > 0 && template && template.customizations.length !== 1) {
            if (template.pivot && template.pivot.type === "SENDER") {
                steps.push({
                    title: "Please select a consignee",
                    id: this.getStepIdForShipment("consignee", shipmentIndex),
                    component: () => <Steps.Party options={template.customizations}
                        customer={template.customer}
                        showSearchInput={true}
                        searchFields={['company.name', 'handlingCompany.name', 'handlingLocation.name']}
                        size={6} />,
                    onChange: (key, value) => this.handleConsigneeChange(key, shipmentIndex, value),
                    onInactive: () => this.getRequestedDeliveryDate(shipmentIndex),
                    validate: (value) => {
                        return PartyValidator.validate(value, props.order.truckLoadType, props.order.serviceType, shipment.sender)
                    }
                });
            }
            if (template.pivot && template.pivot.type === "CONSIGNEE") {
                steps.push({
                    title: "Please select a sender",
                    id: this.getStepIdForShipment("sender", shipmentIndex),
                    component: () => <Steps.Party options={template.customizations}
                        customer={template.customer}
                        showSearchInput={true}
                        searchFields={['company.name', 'handlingCompany.name', 'handlingLocation.name']}
                        size={6} />,
                    onChange: (key, value) => this.handleSenderChange(key, shipmentIndex, value),
                    onInactive: () => this.getRequestedDeliveryDate(shipmentIndex),
                    validate: (value) => {
                        return PartyValidator.validate(value, props.order.truckLoadType, props.order.serviceType, shipment.consignee)
                    }
                });
            }
        }

        if (shipmentIndex === 0) {
            if (props.order.truckLoadTypes.length > 1) {
                steps.push({
                    title: "Please select truck load type",
                    id: "truckLoadType",
                    component: () => <Steps.LookupStep options={props.order.truckLoadTypes} />,
                    onInactive: () => this.handleTruckLoadTypeChange(shipmentIndex),
                    validate: Validator.CodeValidator.validate
                });
            }
            if (props.order.serviceTypes.length > 1) {
                steps.push({
                    title: "Please select service type",
                    id: "serviceType",
                    component: () => <Steps.LookupStep options={props.order.serviceTypes} />,
                    onInactive: () => this.getRequestedDeliveryDate(shipmentIndex),
                    validate: Validator.CodeValidator.validate
                });
            }
        }
        if(shipment.sender && shipment.sender.manufacturerOption && shipment.sender.manufacturerOption.code !== 'DONT_ASK'){
            if('ASK' === shipment.sender.manufacturerOption.code){
                steps.push({
                    title: "Do you have Manufacturer Company Info?",
                    id: this.getStepIdForShipment("haveManufacturer", shipmentIndex),
                    component: () => <Steps.YesNoButtonStep />,
                    onChange: (key,value)=> this.handleManufacturerOptionChange(key, shipmentIndex, value, shipment.sender.manufacturers)
                })
            } 
            if((shipment.haveManufacturer || 'REQUIRED' === shipment.sender.manufacturerOption.code) && 1 !== shipment.sender.manufacturers.length){
                steps.push({
                    title: "Please select a manufacturer",
                    id: this.getStepIdForShipment("manufacturer", shipmentIndex),
                    component: () => <Steps.Manufacturer options={shipment.sender.manufacturers}
                        showSearchInput={true} searchFields={['company.name', 'location.name']} size={6} />,
                    validate: (value) => ManufacturerValidator.validate(value)
                });
            }
        }
        if (shipment.askCustomerOrderNumbers) {
            steps.push({
                title: "Do you have customer order numbers?",
                id: this.getStepIdForShipment("haveCustomerOrderNumbers", shipmentIndex),
                component: () => <Steps.YesNoButtonStep />,
                onChange: (key, value) => this.handleOrderNumbersValue(key, shipmentIndex, value, "customerOrderNumbers")
            });
            if (shipment.haveCustomerOrderNumbers) {
                steps.push({
                    title: "Please enter customer order numbers",
                    id: this.getStepIdForShipment("customerOrderNumbers", shipmentIndex),
                    component: () => <Steps.OrderNumbersStep />,
                    validate: Validator.EmptyValidator.validate
                });
            }
        }
        if (!template) {
            steps.push({
                title: "Please select a sender",
                id: this.getStepIdForShipment("sender", shipmentIndex),
                component: () => <Steps.Party customer={props.order.customer} />,
                onChange: (key, value) => this.handleSenderChange(key, shipmentIndex, value),
                onInactive: () => this.getRequestedDeliveryDate(shipmentIndex),
                validate: (value) => {
                    return PartyValidator.validate(value, props.order.truckLoadType, props.order.serviceType)
                }
            });

        }
        if (shipment.askSenderOrderNumbers) {
            steps.push({
                title: "Do you have sender order numbers?",
                id: this.getStepIdForShipment("haveSenderOrderNumbers", shipmentIndex),
                component: () => <Steps.YesNoButtonStep />,
                onChange: (key, value) => this.handleOrderNumbersValue(key, shipmentIndex, value, "senderOrderNumbers")
            });
            if (shipment.haveSenderOrderNumbers) {
                steps.push({
                    title: "Please enter sender order numbers",
                    id: this.getStepIdForShipment("senderOrderNumbers", shipmentIndex),
                    component: () => <Steps.OrderNumbersStep />,
                    validate: Validator.EmptyValidator.validate
                });
            }
        }

        if (shipment.askForLoadingAppointment) {
            steps.push({
                title: "Do you have loading appointment ?",
                id: this.getStepIdForShipment("haveLoadingAppointment", shipmentIndex),
                component: () => <Steps.YesNoButtonStep />,
                onChange: (key, value) => this.handleChangeLoadingAppointmentOption(key, shipmentIndex, value)
            });

        }
        if (shipment.haveLoadingAppointment) {
            steps.push({
                title: "Please enter loading appointment date",
                id: this.getStepIdForShipment("loadingAppointment", shipmentIndex),
                component: () => <LoadingAppointment
                    workingHours={_.get(shipment, "sender.handlingLocationDetail.establishment.workingHours")}
                    timezone={_.get(shipment, "sender.handlingLocationTimezone")} />,
                onInactive: () => this.getRequestedDeliveryDate(shipmentIndex),
                validate: Validator.AppointmentDateValidator.validate
            });
        } else {
            steps.push({
                title: "Please enter ready date",
                id: this.getStepIdForShipment("readyDateTime", shipmentIndex),
                component: () => <Steps.SelectReadyDateStep
                    workingHours={_.get(shipment, "sender.handlingLocationDetail.establishment.workingHours")}
                    timezone={_.get(shipment, "sender.handlingLocationTimezone")} />,
                onInactive: () => this.getRequestedDeliveryDate(shipmentIndex),
                validate: Validator.ReadyDateValidator.validate
            });
        }
        if (!template) {
            steps.push({
                title: "Please select a consignee",
                id: this.getStepIdForShipment("consignee", shipmentIndex),
                component: () => <Steps.Party customer={props.order.customer} />,
                onChange: (key, value) => this.handleConsigneeChange(key, shipmentIndex, value),
                validate: (value) => {
                    return PartyValidator.validate(value, props.order.truckLoadType, props.order.serviceType)
                }
            });
        }
        if (shipment.askConsigneeOrderNumbers) {
            steps.push({
                title: "Do you have consignee order numbers?",
                id: this.getStepIdForShipment("haveConsigneeOrderNumbers", shipmentIndex),
                component: () => <Steps.YesNoButtonStep />,
                onChange: (key, value) => this.handleOrderNumbersValue(key, shipmentIndex, value, "consigneeOrderNumbers")
            });
            if (shipment.haveConsigneeOrderNumbers) {
                steps.push({
                    title: "Please enter consignee order numbers",
                    id: this.getStepIdForShipment("consigneeOrderNumbers", shipmentIndex),
                    component: () => <Steps.OrderNumbersStep />,
                    validate: Validator.EmptyValidator.validate
                });
            }
        }

        if (shipment.askForUnloadingAppointment) {
            steps.push({
                title: "Do you have unloading appointment ?",
                id: this.getStepIdForShipment("haveUnloadingAppointment", shipmentIndex),
                component: () => <Steps.YesNoButtonStep />
            });
        }
        if (shipment.haveUnloadingAppointment) {
            steps.push({
                title: "Please enter unloading appointment date",
                id: this.getStepIdForShipment("unloadingAppointment", shipmentIndex),
                component: () => <UnloadingAppointment deliveryDateTime={shipment.deliveryDateTime}
                    readyDate={shipment.loadingAppointment ? shipment.loadingAppointment.startDateTime : shipment.readyDateTime}
                    timezone={_.get(shipment, "consignee.handlingLocationTimezone")} />,
                validate: value =>
                    Validator.AppointmentDateValidator.validate(value,
                        shipment.loadingAppointment ?
                            (shipment.loadingAppointment.endDateTime ?
                                shipment.loadingAppointment.endDateTime : shipment.loadingAppointment.startDateTime
                            ) : shipment.readyDateTime, shipment.deliveryDateTime)
            });
        }
        if (props.order.shipments[shipmentIndex].lookup.incoterms.length > 1) {
            steps.push({
                title: "Please select incoterm",
                id: this.getStepIdForShipment("incoterm", shipmentIndex),
                component: () => <Steps.LookupStep options={props.order.shipments[shipmentIndex].lookup.incoterms} />,
                validate: Validator.CodeValidator.validate
            });
        }

        steps.push({
            title: "Please enter value of goods",
            id: this.getStepIdForShipment("valueOfGoods", shipmentIndex),
            component: () => <ValueOfGoods units={props.order.shipments[shipmentIndex].lookup.currencies} />,
            onInactive: () => this.handleInactivateValueOfGoods(shipmentIndex),
            validate: Validator.AmountWithUnitValidator.validate
        });

        if (props.order.shipments[shipmentIndex].lookup.paymentTypes.length > 1) {
            steps.push({
                title: "Please select payment type",
                id: this.getStepIdForShipment("paymentType", shipmentIndex),
                component: () => <Steps.LookupStep options={props.order.shipments[shipmentIndex].lookup.paymentTypes} />,
                validate: Validator.CodeValidator.validate
            });
        }
        if (props.order.shipments[shipmentIndex].askForInsurance) {
            steps.push({
                title: "Will the shipment be insured by Ekol ?",
                id: this.getStepIdForShipment("insured", shipmentIndex),
                component: () => <Steps.YesNoButtonStep />
            });
        }
        let askForShipmentUnits = true;
        if (props.order.shipments[shipmentIndex].askForShipmentUnits) {
            if (props.order.shipments[shipmentIndex].askForShipmentUnits.code === "NEVER") {
                askForShipmentUnits = false;
            } else if (props.order.shipments[shipmentIndex].askForShipmentUnits.code === "FOR_LTL") {
                askForShipmentUnits = props.order.truckLoadType ? (props.order.truckLoadType.code === "LTL") : false;
            }
        }
        if (askForShipmentUnits) {
            steps.push({
                title: "Do you have shipment unit details ?",
                id: this.getStepIdForShipment("haveShipmentUnitDetails", shipmentIndex),
                component: () => <Steps.YesNoButtonStep />,
                onChange: (key, value) => this.handleHaveShipmentUnitDetailsChange(key, shipmentIndex, value)
            });
        }
        if (askForShipmentUnits && shipment.haveShipmentUnitDetails) {
            steps.push({
                title: "Please add a shipment unit",
                id: this.getStepIdForShipment("shipmentUnitDetails", shipmentIndex),
                component: () => <ShipmentUnitDetailsList packageTypes={props.lookup.packageTypes}
                    options={shipment.lookup.packageDetails} />,
                onChange: (key, value) => this.handleShipmentUnitDetailsChange(key, shipmentIndex, value),
                onInactive: () => this.handleInactivateShipmentUnitDetails(shipmentIndex),
                validate: ShipmentUnitListValidator.validate
            });
        }
        steps.push({
            title: "Please enter total values for shipment",
            id: this.getStepIdForShipment("shipmentTotals", shipmentIndex),
            component: () => <ShipmentUnitTotals haveShipmentUnitDetails={shipment.haveShipmentUnitDetails ? true : false}
                packageTypes={shipment.haveShipmentUnitDetails ? this.getUnitsPackageTypes(props.order.shipments[shipmentIndex]) : props.lookup.packageTypes} />,
            onInactive: () => this.handleInactivateShipmentUnitTotals(shipmentIndex),
            validate: (value) => {
                return ShipmentUnitTotalsValidator.validate(value,
                    this.getTotalUnitsLdm(props.order.shipments[shipmentIndex]),
                    this.getTotalUnitsVolume(props.order.shipments[shipmentIndex]),
                    this.getTotalUnitsQuantity(props.order.shipments[shipmentIndex]),
                    this.getUnitsPackageTypes(props.order.shipments[shipmentIndex]))
            }

        });
        steps.push({
            title: "Please enter Definition of Goods and HS Codes",
            id: this.getStepIdForShipment("definitionOfGoods", shipmentIndex),
            component: () => <DefinitionOfGoodsList options={shipment.lookup.goods} />,
            onInactive: () => setTimeout(() => this.handleInactivateDefinitionOfGoods(shipmentIndex), 0),
            onChange: (key, value) => this.handleDefinitionOfGoodsChange(key, shipmentIndex, value)
        });
        if (shipment.lookup.loadRequirements.length > 0) {
            steps.push({
                title: "Does shipment contain temperature controlled, dangerous or certified goods ?",
                id: this.getStepIdForShipment("loadRequirements", shipmentIndex),
                component: () => <Steps.LoadRequirementsStep options={shipment.lookup.loadRequirements} />,
                onChange: (key, value) => this.handleLoadRequirementsChange(key, shipmentIndex, value),
                validate: Validator.ListValidator.validate
            });
        }
        if (_.isArray(shipment.loadRequirements) &&
            _.find(shipment.loadRequirements, { id: "FRIGO" })) {
            steps.push({
                title: "Please enter temperature limits",
                id: this.getStepIdForShipment("temperatureLimits", shipmentIndex),
                component: () => <Steps.NumberRange />,
                validate: Validator.TemperatureValidator.validate
            });
        }
        if (_.isArray(shipment.loadRequirements) &&
            _.find(shipment.loadRequirements, { id: "ADR" })) {
            steps.push({
                title: "Please enter ADR Details",
                id: this.getStepIdForShipment("adrDetails", shipmentIndex),
                component: () => <AdrDetailsList options={shipment.lookup.adrUnDetails} adrPackageTypes={props.lookup.adrPackageTypes} />,
                validate: AdrDetailsListValidator.validate
            });
            steps.push({
                title: "Please upload ADR documents",
                id: this.getStepIdForShipment("adrDocuments", shipmentIndex),
                component: () => <DocumentList types={props.lookup.adrDocumentTypes} />,
                validate: DocumentListValidator.validate
            });
        }
        if (_.isArray(shipment.loadRequirements) &&
            _.find(shipment.loadRequirements, { id: "CERTIFICATE" })) {
            let certificateTypes = shipment.lookup.certificateTypes.length > 0 ?
                shipment.lookup.certificateTypes : props.lookup.certificateTypes;

            steps.push({
                title: "Please upload health certificates",
                id: this.getStepIdForShipment("healthDocuments", shipmentIndex),
                component: () => <DocumentList types={certificateTypes} />,
                onChange: (key, value) => this.handleHealthCertificateChange(key, shipmentIndex, value),
                validate: DocumentListValidator.validate
            });

            steps.push({
                title: "Please select health certificate types",
                id: this.getStepIdForShipment("certificateTypes", shipmentIndex),
                component: () => <Steps.CertificateDocumentTypeStep options={certificateTypes} />,
                validate: HealthCertificateValidator.validate
            });
            if (shipment.askHealthCheckAtBorder) {
                steps.push({
                    title: "Will there be a health check at border crossing ?",
                    id: this.getStepIdForShipment("healthCheckAtBorderCrossing", shipmentIndex),
                    component: () => <Steps.YesNoDontKnowButtonStep />
                });
                if (shipment.healthCheckAtBorderCrossing) {
                    steps.push({
                        title: "Do you have any specific border information on the certificate ?",
                        id: this.getStepIdForShipment("haveCertificateBorderInformation", shipmentIndex),
                        component: () => <Steps.YesNoButtonStep />
                    });
                    if (shipment.haveCertificateBorderInformation) {
                        let customs = shipment.lookup.healthCheckCustoms.length > 0 ?
                            shipment.lookup.healthCheckCustoms : props.lookup.borderCustoms;
                        steps.push({
                            title: "Please enter border crossing",
                            id: this.getStepIdForShipment("borderCustoms", shipmentIndex),
                            component: () => <Steps.DropDownSelectionStep options={customs} />,
                            validate: Validator.IdValidator.validate
                        });
                    }
                }
            }
        }

        if (shipment.askCustomsInfo) {
            let askDepartureCustoms = !(shipment.sender.customsDefinitions && shipment.sender.customsDefinitions.length === 1);
            let askArrivalCustoms = !(shipment.consignee.filteredCustomsDefinitions && shipment.consignee.filteredCustomsDefinitions.length === 1);
            if (shipment.askDepartureCustoms && askDepartureCustoms) {
                if (shipment.sender.handlingLocationCountry === "TR") {
                    steps.push({
                        title: "Please select customs info for departure",
                        id: this.getStepIdForShipment("departureCustoms", shipmentIndex),
                        component: () => <Steps.CustomsDepartureTR customsOffices={props.lookup.customsOffices}
                            options={shipment.sender.customsDefinitions} />,
                        validate: CustomsDepartureTRValidator.validate
                    });
                } else {
                    steps.push({
                        title: "Please select customs info for departure",
                        id: this.getStepIdForShipment("departureCustoms", shipmentIndex),
                        component: () => <Steps.CustomsAgentAndLocation options={shipment.sender.customsDefinitions} />
                    });
                }
            }
            if (askArrivalCustoms) {
                if (shipment.consignee.handlingLocationCountry === "TR") {
                    let hasDangerousGoods = _.isArray(shipment.loadRequirements) && _.find(shipment.loadRequirements, { id: "ADR" });
                    let hasTempControlledGoods = _.isArray(shipment.loadRequirements) && _.find(shipment.loadRequirements, { id: "FRIGO" });
                    steps.push({
                        title: "Please select customs info for arrival",
                        id: this.getStepIdForShipment("arrivalCustoms", shipmentIndex),
                        component: () => <Steps.CustomsArrivalTR customsOffices={props.lookup.customsOffices}
                            customsTypes={props.lookup.customsTypes}
                            hasDangerousGoods={hasDangerousGoods}
                            hasTempControlledGoods={hasTempControlledGoods}
                            options={shipment.consignee.filteredCustomsDefinitions} />,
                        validate: CustomsArrivalTRValidator.validate
                    });
                } else {
                    steps.push({
                        title: "Please select customs info for arrival",
                        id: this.getStepIdForShipment("arrivalCustoms", shipmentIndex),
                        component: () => <Steps.CustomsAgentAndLocation
                            options={shipment.consignee.customsDefinitions} />,
                        validate: CustomsAgentAndLocationValidator.validate
                    });
                }
            }
        }
        steps.push({
            title: "Is there a shipment based vehicle or equipment need ?",
            id: this.getStepIdForShipment("requirements", shipmentIndex),
            component: () => <Steps.RequirementsStep vehicleRequirements={shipment.vehicleRequirements}
                equipmentRequirements={shipment.equipmentRequirements} />,
            onChange: (key, value) => this.handleEquipmentRequirementChange(key, shipmentIndex, value),
            validate: Validator.ListValidator.validate
        });
        if (_.isArray(shipment.requirements) &&
            _.find(shipment.requirements, { id: "VEHICLE" })) {
            steps.push({
                title: "Please select vehicle requirements",
                id: this.getStepIdForShipment("vehicleRequirements", shipmentIndex),
                component: () => <VehicleRequirements featuresLoading={props.lookup.vehicleFeaturesLoading}
                    featuresLoadingByWarehouse={shipment.vehicleRequirements.requiredByWarehouseForLoading}
                    featuresUnloading={props.lookup.vehicleFeaturesUnloading}
                    featuresUnloadingByWarehouse={shipment.vehicleRequirements.requiredByWarehouseForUnloading}
                    featuresRequiredByLoad={shipment.vehicleRequirements.requiredByLoad} />,
                validate: VehicleRequirementsValidator.validate
            });
        }
        if (_.isArray(shipment.requirements) &&
            _.find(shipment.requirements, { id: "EQUIPMENT" })) {
            steps.push({
                title: "Please select equipment requirements",
                id: this.getStepIdForShipment("equipmentRequirements", shipmentIndex),
                component: () => <EquipmentRequirementList types={props.lookup.equipmentTypes} />,
                validate: EquipmentRequirementListValidator.validate
            });
        }

        steps.push({
            title: "Please upload shipment based documents",
            id: this.getStepIdForShipment("shipmentDocuments", shipmentIndex),
            component: () => <DocumentList types={props.lookup.documentTypes} />,
            validate: DocumentListValidator.validate
        });
        if (props.order.allowMultipleShipments) {
            steps.push({
                title: "Do you want to add new shipment ?",
                id: this.getStepIdForShipment("newShipment", shipmentIndex),
                component: () => <Steps.YesNoButtonStep />,
                onChange: (key, value) => this.handleAddNewShipment(key, shipmentIndex, value)
            });
        }

        return steps;
    }
}

CreateOrderForm.contextTypes = {
    translator: PropTypes.object
};