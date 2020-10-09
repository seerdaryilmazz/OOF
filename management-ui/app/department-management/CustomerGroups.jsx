import React from "react";
import ReactDOM from "react-dom";
import { Button, TextInput, Notify} from "susam-components/basic";
import { Card } from "susam-components/layout/Card";
import { Modal } from 'susam-components/layout/Modal';
import { CardHeader } from "susam-components/layout/Header";
import { CustomerGroupService } from "../services/AuthorizationService";
import { CustomerGroup } from "./CustomerGroup";
import { PortfolioForm } from "./PortfolioForm";
import {AuthorizationService} from "../services";


const MODAL_CONTENT = {
    ADD_NEW_PORTFOLIO: "ADD_NEW_PORTFOLIO",
    CREATE_NEW_PORTFOLIO: "CREATE_NEW_PORTFOLIO",
    EDIT_PORTFOLIO: "EDIT_PORTFOLIO"
}

export class CustomerGroups extends React.Component {

    static NODE_TYPE_CUSTOMER_GROUP = "CustomerGroup";

    constructor(props) {
        super(props);
        this.state = {
            customerGroups: []
        }
    }

    componentDidMount() {
        this.loadCustomerGroups(this.props.team);
    }

    componentDidUpdate(prevProps, prevState) {
        this.acc && UIkit.accordion(ReactDOM.findDOMNode(this.acc),{showfirst: false}).update();
        if (prevProps.team !== this.props.team) {
            this.loadCustomerGroups(this.props.team);
        }
    }

    loadCustomerGroups(value) {
        if (value) {
            CustomerGroupService.getByInheritedEntity(value).then(response => {
                this.setState({ customerGroups: response.data });
            }).catch(error => {
                Notify.showError(error);
            });
        } else {
            this.setState({ customerGroups: [] });
        }
    }

    handleDeleteCustomerGroup(value, index){
        Notify.confirm("Selected relation belongs to portfolio will be deleted. Are you sure?", () => {
            AuthorizationService.getNode(value.id, CustomerGroups.NODE_TYPE_CUSTOMER_GROUP).then((response) => {
                return AuthorizationService.deleteInheritRelation(this.props.team.id, response.data.id);
            }).then((response) => {
                Notify.showSuccess(value.name + " is deleted");
                this.loadCustomerGroups(this.props.team);
                this.props.onPortfolioChange &&  this.props.onPortfolioChange(this.props.team);
            }).catch(error => {
                Notify.showError(error);
            });
        });
    }

    handleEditCustomerGroup(value, index){
        this.setState({
            selectedCustomerGroup: value
        });
        this.openModal(MODAL_CONTENT.EDIT_PORTFOLIO);
    }

    onCompanyFilterChange(value) {
        let companies = this.props.customerGroup.companies;
        if (!_.isEmpty(value)) {
            companies = _.filter(this.props.customerGroup.companies, i => i.name.includes(value.toLocaleUpperCase(navigator.language)));
        }
        this.setState({ companies: companies, companyFilter: value })
    }


    renderCustomerGroups(customerGroup) {
        return (<div key={customerGroup.id}>
            <h3 className="uk-accordion-title">{customerGroup.name}</h3>
            <div className="uk-accordion-content">
                <TextInput value={this.state.companyFilter} onchange={(value) => this.onCompanyFilterChange(value)} placeholder="Filter Company..." />
                <i className="uk-icon-search" style={{ float: "right", position: "relative", top: "-24px", right: "8px", zIndex: "999" }} />
                <ul className="md-list">
                    {customerGroup.companies.map(i => <li key={i.id}>{i.name}</li>)}
                </ul>
            </div>
        </div>);
    }

    renderModalTitle(contentType){
        if (contentType === MODAL_CONTENT.ADD_NEW_PORTFOLIO) {
            return "Add New Portfolio";
        } else if (contentType === MODAL_CONTENT.CREATE_NEW_PORTFOLIO) {
            return "Create New Portfolio";
        }
        else if (contentType === MODAL_CONTENT.EDIT_PORTFOLIO) {
            return "Edit Portfolio";
        }
        return null;
    }

    renderModalActions() {
        let contentType = this.state.contentType;
        let actions = [];

        if (contentType === MODAL_CONTENT.ADD_NEW_PORTFOLIO) {
            actions.push({ label: "Cancel", action: () => this.modal.close(), buttonStyle: "mute" });
            actions.push({label: "Save", action: () => this.handleAddRelation(), buttonStyle: "primary" });
        }

        return actions;
    }

    renderModal() {
        if (this.state.contentType === MODAL_CONTENT.ADD_NEW_PORTFOLIO) {
            return <PortfolioForm
                        mode={this.state.contentType}
                        onChange={value => this.handlePortfolioChange(value)} />
        }
        else if (this.state.contentType === MODAL_CONTENT.CREATE_NEW_PORTFOLIO || this.state.contentType === MODAL_CONTENT.EDIT_PORTFOLIO) {
            return <PortfolioForm
                        mode={this.state.contentType}
                        selectedCustomerGroup={this.state.selectedCustomerGroup}
                        onChange={item => this.handleSaveOrUpdateCustomerGroup(item)} />
        }
    }

    handleSaveOrUpdateCustomerGroup(item) {
        item.id ?
        CustomerGroupService.update(item.id, item).then(response => {
            Notify.showSuccess(item.name + " is updated");
            this.modal.close();
            this.loadCustomerGroups(this.props.team);
        }).catch(error => {
            Notify.showError(error);
        })
        :
        CustomerGroupService.create(item).then(response => {
            Notify.showSuccess(item.name + " is created");
            this.handlePortfolioChange(response.data);
            this.handleAddRelation();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handlePortfolioChange(value) {
        let node = {
            externalId: value.id,
            name: value.name,
            type: CustomerGroups.NODE_TYPE_CUSTOMER_GROUP
        };
        this.setState({
            node: node,
            selectedNode: this.props.team
        });
    }

    openModal(contentType) {
        this.setState({contentType: contentType}, () => this.modal.open());
    }

    handleCreateCustomerGroup() {
        this.setState({
            selectedCustomerGroup: {name:null, companies:[]}
        });
        this.openModal(MODAL_CONTENT.CREATE_NEW_PORTFOLIO);
    }

    handleAddRelation() {
        let inherit = {
            to: this.state.node,
            from: this.state.selectedNode
        };

        AuthorizationService.mergeInheritRelation(inherit).then(response => {
            this.loadCustomerGroups(this.props.team);
            this.props.onPortfolioChange &&  this.props.onPortfolioChange(this.state.selectedNode);
            this.modal.close();
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    render() {
        return (
            <Card>
                <CardHeader title={this.props.title} />
                <ul style={{ margin: "0", padding: "0" }}>
                    <li style={{ display: "inline" }}><Button style="success" flat={true} label="Add New Portfolio" size="small" onclick={() => this.openModal(MODAL_CONTENT.ADD_NEW_PORTFOLIO)} /></li>
                    <li style={{ display: "inline" }}><Button style="success" flat={true} label="Create New Portfolio" size="small" onclick={() => this.handleCreateCustomerGroup()}></Button></li>
                </ul>
                <div className="uk-accordion" data-uk-accordion="" ref={c => this.acc = c}>
                    {this.state.customerGroups.map((customerGroup, index)=><CustomerGroup   customerGroup={customerGroup}
                                                                                            key={customerGroup.id}
                                                                                            index = {index}
                                                                                            onDelete={(value, index)=>this.handleDeleteCustomerGroup(value, index)}
                                                                                            onEdit={(value, index)=>this.handleEditCustomerGroup(value, index)} />)}
                </div>
                <Modal
                    title={this.renderModalTitle(this.state.contentType)}
                    actions={this.renderModalActions()}
                    ref={c => this.modal = c}>
                    {this.renderModal()}
                </Modal>
            </Card>
        );
    }
}