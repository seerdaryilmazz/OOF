import * as axios from 'axios';
import React from 'react';
import ReactDOM from "react-dom";
import { Notify } from 'susam-components/basic';
import { Modal } from 'susam-components/layout';
import { LoaderWrapper } from 'susam-components/layout/Loader';
import { ResponsiveFrame } from 'susam-components/oneorder/ResponsiveFrame';
import uuid from 'uuid';
import { newPromise } from '../../Helper';
import { LocationService, OrderTemplateService, ProjectService } from '../../services';

const icons = {
    adr: "adr",
    frigo: "frigo",
    certificate: "certificate",
    package: "package",
    goods: "goods",
    customs: "customs",
    workingHours: "workingHours",
    booking: "booking",
    vehicle: "vehicle",
    equipment: "equipment"
}
const statuses = {
    active: "#1976d2",
    defined: "black",
    inactive: "silver"
}

const warehouseTypes = {
    customerWarehouse: 'customerWarehouse',
    warehouse: 'warehouse'
}

function getIcon(icon, status, onclick) {
    if (icons.adr === icon) {
        return wrapWithLink(<i className="mdi mdi-alert-octagon" style={{ fontSize: "28px", color: status }} data-uk-tooltip="{pos:'bottom'}" title="Dangerous Goods Definition" />, onclick);
    } else if (icons.frigo === icon) {
        return wrapWithLink(<i className="mdi mdi-thermometer" style={{ fontSize: "28px", color: status }} data-uk-tooltip="{pos:'bottom'}" title="Temperature Controlled Definition" />, onclick);
    } else if (icons.certificate === icon) {
        return wrapWithLink(<i className="mdi mdi-certificate" style={{ fontSize: "28px", color: status }} data-uk-tooltip="{pos:'bottom'}" title="Certificated Goods Definition" />, onclick);
    } else if (icons.goods === icon) {
        return wrapWithLink(<i className="material-icons" style={{ padding: "6px 0", fontSize: "28px", color: status }} data-uk-tooltip="{pos:'bottom'}" title="Definition of Goods">text_format</i>, onclick);
    } else if (icons.package === icon) {
        return wrapWithLink(<i className="uk-icon-cubes" style={{ padding: "6px 0", fontSize: "20px", color: status }} data-uk-tooltip="{pos:'bottom'}" title="Package Details" />, onclick);
    } else if (icons.customs === icon) {
        return wrapWithLink(<i className="material-icons" style={{ padding: "6px 0", fontSize: "28px", color: status }} data-uk-tooltip="{pos:'bottom'}" title="Company Customs Rule">closed_caption</i>, onclick);
    } else if (icons.workingHours === icon) {
        return wrapWithLink(<i className="material-icons" style={{ padding: "6px 0", fontSize: "28px", color: status }} data-uk-tooltip="{pos:'bottom'}" title="Working Hours Definition">date_range</i>, onclick);
    } else if (icons.booking === icon) {
        return wrapWithLink(<i className="material-icons" style={{ padding: "6px 0", fontSize: "28px", color: status }} data-uk-tooltip="{pos:'bottom'}" title="Appointment Usage">alarm</i>, onclick);
    } else if (icons.vehicle === icon) {
        return wrapWithLink(<i className="mdi mdi-truck-trailer" style={{ fontSize: "28px", color: status }} data-uk-tooltip="{pos:'bottom'}" title="Vehicle Requirement" />, onclick);
    } else if (icons.equipment === icon) {
        return wrapWithLink(<i className="mdi mdi-screwdriver" style={{ fontSize: "28px", color: status }} data-uk-tooltip="{pos:'bottom'}" title="Equipment Requirement" />, onclick);
    } else {
        return null;
    }
}

function isCompany(company) {
    return 'COMPANY' === company.type;
}

function wrapWithLink(icon, onclick) {
    return (
        <a href="javascript:;" style={{ cursor: "pointer" }} onClick={onclick}>
            {icon}
        </a>);
}

function modalContent(icon, data, state) {
    let content = {
        src: null,
        component: null
    }

    if (icons.adr === icon) {
        content.src = `/ui/order/modal-sender-template?sender=${data.company.id}&type=ADR`
    } else if (icons.frigo === icon) {
        content.src = `/ui/order/modal-sender-template?sender=${data.company.id}&type=Frigo`
    } else if (icons.certificate === icon) {
        content.src = `/ui/order/modal-sender-template?sender=${data.company.id}&type=Certificate`
    } else if (icons.goods === icon) {
        content.src = `/ui/order/modal-sender-template?sender=${data.company.id}&type=Goods`
    } else if (icons.package === icon) {
        content.src = `/ui/order/modal-sender-template?sender=${data.company.id}&type=Package`
    } else if (icons.customs === icon) {
        content.src = `/ui/order/modal-customs-rules?companyId=${data.company.id}&party=${state.party}`
    } else if (icons.workingHours === icon) {
        if (state.warehouseType === warehouseTypes.customerWarehouse) {
            content.src = `/ui/management/modal-customerwarehouse?id=${state.warehouse.id}`
        } else if (state.warehouseType === warehouseTypes.warehouse) {
            content.src = `/ui/management/modal-warehouse?id=${state.warehouse.id}`
        } else {
            content.src = `/ui/management/modal-customerwarehouse?locationId=${data.handlingLocation.id}&locationType=${data.handlingCompany.type}`
        }
    } else if (icons.booking === icon) {
        if (state.warehouseType === warehouseTypes.customerWarehouse) {
            content.src = `/ui/management/modal-customerwarehouse?id=${state.warehouse.id}`
        } else if (!state.warehouseType) {
            content.src = `/ui/management/modal-customerwarehouse?locationId=${data.handlingLocation.id}&locationType=${data.handlingCompany.type}`
        }
    } else if (icons.vehicle === icon || icons.equipment === icon) {
        if (state.warehouseType !== warehouseTypes.warehouse) {
            content.src = `/ui/management/modal-customerwarehouses-rules?locationId=${data.handlingLocation.id}`
        }
    }
    return content;
}

export class SenderPartyRules extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            party: "sender",
            loadStatus: true,
            senderTemplate: null,
            customs: null,
            warehouseType: null,
            warehouse: null,
            requirements: null,
            modalContent: {
                src: null,
                component: null
            }
        }
    }

    componentDidMount() {
        this.loadRules(this.props.data);
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.data, this.props.data)) {
            this.loadRules(this.props.data);
        }
    }

    loadRules(data) {
        axios.all([
            isCompany(data.handlingCompany) ? ProjectService.searchSenderTemplates(data.company.id, data.handlingCompany.id, data.handlingLocation.id) : newPromise({}),
            ProjectService.getSenderCustomsForCompanyAndLocation(data.company.id, data.handlingLocation.id, data.handlingCompany.type),
            isCompany(data.handlingCompany) ? LocationService.getWarehouseDetails(data.handlingLocation.id) : newPromise({}),
            LocationService.getCustomerWarehouseDetailsByType(data.handlingLocation.id, data.handlingCompany.type),
            isCompany(data.handlingCompany) ? OrderTemplateService.getCustomerWarehouseRule(data.handlingLocation.id) : newPromise({})
        ]).then(axios.spread((senderTemplate, customs, warehouse, customerWarehouse, requirements) => {
            this.setState({
                loadStatus: false,
                senderTemplate: senderTemplate.data,
                customs: customs.data,
                warehouseType: warehouse.data ? warehouseTypes.warehouse : customerWarehouse.data ? warehouseTypes.customerWarehouse : null,
                warehouse: warehouse.data || customerWarehouse.data,
                requirements: requirements.data,
                modalContent: {
                    src: null,
                    component: null
                }
            });
        })).catch(error => Notify.showError(error));
    }

    icon(icon, status, isModalDisable) {
        return getIcon(icon, status, isModalDisable ? null : () => this.openModal(icon));
    }

    openModal(icon) {
        let content = modalContent(icon, this.props.data, this.state);
        if (content.src || content.component) {
            this.setState({
                modalContent: content
            }, () => this.modal.open())
        }
    }

    adjustSenderTemplateItems() {
        let t = this.state.senderTemplate;
        let result = [];
        if (t) {
            if (t.existDangerousGoodsDefinition) {
                if (t.shouldDangerousGoodsBeAsked) {
                    result.push(this.icon(icons.adr, statuses.active));
                } else {
                    result.push(this.icon(icons.adr, statuses.defined));
                }
            } else {
                result.push(this.icon(icons.adr, statuses.inactive));
            }

            if (t.existTemperatureControlledGoodsDefinition) {
                if (t.shouldTemperatureControlledGoodsBeAsked) {
                    result.push(this.icon(icons.frigo, statuses.active));
                } else {
                    result.push(this.icon(icons.frigo, statuses.defined));
                }
            } else {
                result.push(this.icon(icons.frigo, statuses.inactive));
            }

            if (t.existCertificatedGoodsDefinition) {
                if (t.shouldCertificatedGoodsBeAsked) {
                    result.push(this.icon(icons.certificate, statuses.active));
                } else {
                    result.push(this.icon(icons.certificate, statuses.defined));
                }
            } else {
                result.push(this.icon(icons.certificate, statuses.inactive));
            }

            if (t.existGoodsDefinition) {
                result.push(this.icon(icons.goods, statuses.active));
            } else {
                result.push(this.icon(icons.goods, statuses.inactive));
            }

            if (t.existPackageDetailsDefinition) {
                result.push(this.icon(icons.package, statuses.active));
            } else {
                result.push(this.icon(icons.package, statuses.inactive));
            }
        } else {
            result.push(this.icon(icons.adr, statuses.inactive));
            result.push(this.icon(icons.frigo, statuses.inactive));
            result.push(this.icon(icons.certificate, statuses.inactive));
            result.push(this.icon(icons.goods, statuses.inactive));
            result.push(this.icon(icons.package, statuses.inactive));
        }
        return result;
    }

    adjustCustomsItems() {
        let t = this.state.customs;
        let result = [];
        if (!_.isEmpty(t)) {
            result.push(this.icon(icons.customs, statuses.active));
        } else {
            result.push(this.icon(icons.customs, statuses.inactive));
        }
        return result;
    }

    adjustBookingTimeItems() {
        let t = this.state.warehouse;
        let result = [];
        if (t) {
            if (_.isNil(t.establishment) || _.isEmpty(t.establishment.workingHours) || _.isEmpty(t.establishment.workingHours.flatMap(t => t.timeWindows))) {
                result.push(this.icon(icons.workingHours, statuses.inactive));
            } else {
                result.push(this.icon(icons.workingHours, statuses.active));
            }

            if (!t.bookingLoading || 'NEVER' === t.bookingLoading.bookingOption.code) {
                result.push(this.icon(icons.booking, statuses.defined));
            } else if (t.bookingLoading && 'ALWAYS' === t.bookingLoading.bookingOption.code) {
                result.push(this.icon(icons.booking, statuses.active));
            } else {
                result.push(this.icon(icons.booking, statuses.inactive));
            }
        } else {
            result.push(this.icon(icons.workingHours, statuses.inactive));
            result.push(this.icon(icons.booking, statuses.inactive));
        }
        return result;
    }

    adjustRequirementsItems() {
        let modalDisable = !isCompany(this.props.data.handlingCompany);

        let t = this.state.requirements;
        let result = [];
        if (t) {
            if (t.carrierRule && !_.isEmpty(t.carrierRule.requiredLoading)) {
                result.push(this.icon(icons.vehicle, statuses.active, modalDisable));
            } else {
                result.push(this.icon(icons.vehicle, statuses.inactive, modalDisable));
            }

            if (!_.isEmpty(t.equipmentRule)) {
                result.push(this.icon(icons.equipment, statuses.active, modalDisable));
            } else {
                result.push(this.icon(icons.equipment, statuses.inactive, modalDisable));
            }
        } else {
            result.push(this.icon(icons.vehicle, statuses.inactive, modalDisable));
            result.push(this.icon(icons.equipment, statuses.inactive, modalDisable));
        }
        return result;
    }

    renderItems() {
        let icons = [];
        icons = icons.concat(this.adjustCustomsItems());
        icons = icons.concat(this.adjustBookingTimeItems());
        icons = icons.concat(this.adjustRequirementsItems());
        icons = icons.concat(this.adjustSenderTemplateItems());
        return (
            <ul style={{ listStyleType: "none", margin: "-8px 0px", padding: "0", overflow: "hidden" }}>
                {icons.map(icon => <li style={{ float: "left" }} key={uuid.v4()}>{icon}</li>)}
            </ul>
        );
    }

    render() {
        return (
            <div>
                <LoaderWrapper busy={this.state.loadStatus} size="S">
                    {this.renderItems()}
                </LoaderWrapper>
                <RuleModal ref={c => this.modal = c} onclose={() => this.loadRules(this.props.data)} content={this.state.modalContent} />
            </div>
        );
    }
}


export class ConsigneePartyRules extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            party: "consignee",
            loadStatus: true,
            customs: null,
            warehouseType: null,
            warehouse: null,
            requirements: null,
            modalContent: {
                src: null,
                component: null
            }
        }
    }

    componentDidMount() {
        this.loadRules(this.props.data);
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.data, this.props.data)) {
            this.loadRules(this.props.data);
        }
    }

    loadRules(data) {
        axios.all([
            ProjectService.getConsigneeCustomsForCompanyAndLocation(data.company.id, data.handlingLocation.id, data.handlingCompany.type),
            isCompany(data.handlingCompany) ? LocationService.getWarehouseDetails(data.handlingLocation.id) : newPromise({}),
            LocationService.getCustomerWarehouseDetailsByType(data.handlingLocation.id, data.handlingCompany.type),
            isCompany(data.handlingCompany) ? OrderTemplateService.getCustomerWarehouseRule(data.handlingLocation.id) : newPromise({})
        ]).then(axios.spread((customs, warehouse, customerWarehouse, requirements) => {
            this.setState({
                loadStatus: false,
                customs: customs.data,
                warehouseType: warehouse.data ? warehouseTypes.warehouse : customerWarehouse.data ? warehouseTypes.customerWarehouse : null,
                warehouse: warehouse.data || customerWarehouse.data,
                requirements: requirements.data,
                modalContent: {
                    src: null,
                    component: null
                }
            })
        })).catch(error => Notify.showError(error))
    }

    icon(icon, status, isModalDisable) {
        return getIcon(icon, status, isModalDisable ? null : () => this.openModal(icon));
    }

    openModal(icon) {
        let content = modalContent(icon, this.props.data, this.state);
        if (content.src || content.component) {
            this.setState({
                modalContent: content
            }, () => this.modal.open())
        }
    }

    adjustCustomsItems() {
        let t = this.state.customs;
        let result = [];
        if (!_.isEmpty(t)) {
            result.push(this.icon(icons.customs, statuses.active));
        } else {
            result.push(this.icon(icons.customs, statuses.inactive));
        }
        return result;
    }

    adjustBookingTimeItems() {
        let t = this.state.warehouse;
        let result = [];
        if (t) {
            if (_.isNil(t.establishment) || _.isEmpty(t.establishment.workingHours) || _.isEmpty(t.establishment.workingHours.flatMap(t => t.timeWindows))) {
                result.push(this.icon(icons.workingHours, statuses.inactive));
            } else {
                result.push(this.icon(icons.workingHours, statuses.active));
            }

            if (!t.bookingUnloading || 'NEVER' === t.bookingUnloading.bookingOption.code) {
                result.push(this.icon(icons.booking, statuses.defined));
            } else if (t.bookingUnloading && 'ALWAYS' === t.bookingUnloading.bookingOption.code) {
                result.push(this.icon(icons.booking, statuses.active));
            } else {
                result.push(this.icon(icons.booking, statuses.inactive));
            }
        } else {
            result.push(this.icon(icons.workingHours, statuses.inactive));
            result.push(this.icon(icons.booking, statuses.inactive));
        }
        return result;
    }

    adjustRequirementsItems() {
        let modalDisable = !isCompany(this.props.data.handlingCompany);

        let t = this.state.requirements;
        let result = [];
        if (t) {
            if (t.carrierRule && !_.isEmpty(t.carrierRule.requiredUnloading)) {
                result.push(this.icon(icons.vehicle, statuses.active, modalDisable));
            } else {
                result.push(this.icon(icons.vehicle, statuses.inactive, modalDisable));
            }
        } else {
            result.push(this.icon(icons.vehicle, statuses.inactive, modalDisable));
        }
        return result;
    }

    renderItems() {
        let icons = [];
        icons = icons.concat(this.adjustCustomsItems());
        icons = icons.concat(this.adjustBookingTimeItems());
        icons = icons.concat(this.adjustRequirementsItems());
        return (
            <ul style={{ listStyleType: "none", margin: "-8px 0px", padding: "0", overflow: "hidden" }}>
                {icons.map(icon => <li style={{ float: "left" }} key={uuid.v4()}>{icon}</li>)}
            </ul>
        );
    }

    render() {
        return (
            <div>
                <LoaderWrapper busy={this.state.loadStatus} size="S">
                    {this.renderItems()}
                </LoaderWrapper>
                <RuleModal ref={c => this.modal = c} onclose={() => this.loadRules(this.props.data)} content={this.state.modalContent} />
            </div>
        );
    }
}

class RuleModal extends React.Component {
    constructor(props) {
        super(props);
    }

    onOpenModal() {
        $("div.uk-modal-dialog.uk-modal-dialog-blank", ReactDOM.findDOMNode(this.modal)).removeClass("uk-height-viewport").css({ "top": "0", "min-height": "100%" });
    }

    open() {
        this.modal.open();
    }
    close() {
        this.modal.close();
    }

    render() {
        let { src, component } = this.props.content;

        let content = null;
        if (!_.isEmpty(src)) {
            content = <ResponsiveFrame
                src={src}
                style={{ width: "100%", height: "88vh", border: "6px #00000016 solid" }}
                onSuccess={this.props.content.onSuccess ? this.props.content.onSuccess : () => this.close()}
                onError={this.props.content.onError ? this.props.content.onError : error => console.log("error", error)}
                onCancel={this.props.content.onCancel ? this.props.content.onSuccess : () => this.close()}
            />
        } else if (!_.isEmpty(component)) {
            content = component;
        }

        return (
            <Modal ref={c => this.modal = c}
                actions={[{ label: "Close", action: () => this.close() }]}
                onopen={() => this.onOpenModal()}
                onclose={this.props.onclose && this.props.onclose}
                fullscreen={true}
                large={true}>
                {content}
            </Modal>
        )
    }
}
