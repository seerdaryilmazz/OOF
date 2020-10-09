import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Checkbox, DropDown, Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import uuid from 'uuid';
import { withAuthorization } from '../security';
import { ProjectService } from '../services';

const SecuredCreateButton = withAuthorization(Button, ["order.create-template"], { hideWhenNotAuthorized: true });
const SecuredEditButton = withAuthorization(Button, ["order.edit-template"], { hideWhenNotAuthorized: true });

export class ListTemplate extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.loadTemplateCustomers();
        if (this.props.customer) {
            this.loadTemplatesOfCustomer(this.props.customer);
        }
    }

    componentWillReceiveProps(nextProps) {
        let currentCustomerId = _.get(this.props, "customer.id");
        let nextCustomerId = _.get(nextProps, "customer.id");
        if (currentCustomerId != nextCustomerId) {
            this.loadTemplatesOfCustomer(nextProps.customer);
        }
    }

    loadTemplateCustomers() {
        ProjectService.listDistinctField("customer", "PIVOT_PARTY").then(response => {
            this.setState({ templateCustomers: response.data });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadTemplatesOfCustomer(customer) {
        ProjectService.getTemplatesForCustomer(customer.id, "PIVOT_PARTY").then(response => {
            let templates = response.data;
            templates.forEach(template => {
                if (template.customizations) {
                    template.customizations.forEach(item => item._key = uuid.v4());
                }
            });
            this.setState({ templates: templates });
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleClickTemplate(template) {
        this.props.onEdit && this.props.onEdit(template);
    }
    handleCreateNewTemplate() {
        this.props.onCreate && this.props.onCreate(this.state.customer);
    }

    handleSelectCustomer(customer) {
        this.props.onCustomerSelect(customer);
    }

    renderTemplate(template) {
        return (
            <li key={template.id}>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width="1-1">
                            <h2 style={{ display: "inline", marginRight: "16px" }}>{template.name}</h2>
                            <SecuredEditButton label="edit" flat={true} size="small" style="success"
                                onclick={() => this.handleClickTemplate(template)} />
                        </GridCell>
                        <TemplateListOwner template={template} />
                        <TemplateListPivot template={template} />
                        <TemplateListCustomization template={template} />
                    </Grid>
                </div>
            </li>
        );
    }

    renderList() {
        if (!this.state.templates) {
            return null;
        }
        if (this.state.templates.length === 0) {
            return <div>{super.translate("There are no templates for this customer")}</div>;
        }

        return (
            <ul className="md-list">
                {this.state.templates.map(template => this.renderTemplate(template))}
            </ul>
        );
    }

    render() {
        let customerList = this.state.searchInTemplateCustomer
            ? <DropDown label="Customer" placeholder="Search for company..." onchange={value => this.handleSelectCustomer(value)} value={this.props.customer} options={this.state.templateCustomers} labelField="name" />
            : <CompanySearchAutoComplete label="Customer" value={this.props.customer} onchange={(value) => this.handleSelectCustomer(value)} />
        return (
            <div>
                <PageHeader title="Templates" />
                <Card>
                    <Grid divider={true}>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-3">
                                    {customerList}
                                </GridCell>
                                <GridCell width="2-3">
                                    <div className="uk-margin-top">
                                        <SecuredCreateButton label="Create new Template" size="small" style="success"
                                            onclick={() => this.handleCreateNewTemplate()} />
                                    </div>
                                </GridCell>
                                <GridCell width="1-1">
                                    <Checkbox
                                        label="Search In Template Customers"
                                        value={this.state.searchInTemplateCustomer}
                                        onchange={value => this.setState({ searchInTemplateCustomer: value })} />
                                </GridCell>
                                <GridCell width="1-1">
                                    {this.renderList()}
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}

export class TemplateListOwner extends TranslatingComponent {
    render() {
        if (!this.props.template) {
            return null;
        }
        return (
            <GridCell width="1-3">
                <div className="md-color-blue-600">{super.translate("Template Owner")}</div>
                <div className="uk-text-truncate uk-text-bold">
                    {this.props.template.ownerCompany.name}
                </div>
                <div className="uk-text-truncate" style={{ opacity: .8 }}>
                    {this.props.template.ownerLocation.name}
                </div>
            </GridCell>
        );
    }
}

export class TemplateListPivot extends TranslatingComponent {
    render() {
        if (!this.props.template) {
            return null;
        }
        let { type, company, handlingCompany, companyLocation, handlingLocation } = this.props.template.pivot;
        let companyLocationDiv = (companyLocation && !_.isEqual(companyLocation.id, handlingLocation.id)) && <div className="uk-text-truncate uk-text-small">{companyLocation.name} </div>;
        let handlingCompanyDiv = (handlingCompany && !_.isEqual(company.id, handlingCompany.id)) && <div className="uk-text-truncate uk-text-small">{handlingCompany.name} </div>;
        return (
            <GridCell width="1-3">
                <div className="md-color-blue-600">
                    {type === "SENDER" ? super.translate("Sender & Locations") : super.translate("Consignee & Locations")}
                </div>
                <div className="uk-text-bold">
                    <div className="uk-text-truncate">
                        {company.name}
                    </div>
                    {companyLocationDiv}
                </div>
                <div>
                    <div className="uk-text-truncate" style={{ opacity: .8 }}>
                        {handlingLocation.name}
                    </div>
                    {handlingCompanyDiv}
                </div>
            </GridCell>
        );

    }
}
export class TemplateListCustomization extends TranslatingComponent {
    state = {};

    handleToggleShowAllClick() {
        this.setState({ showAllCustomizations: !this.state.showAllCustomizations });
    }

    render() {
        let { template } = this.props;
        if (!template) {
            return null;
        }

        let customizationCountToShow = 3;
        let customizationsToShow = this.state.showAllCustomizations ? template.customizations :
            template.customizations.slice(0, customizationCountToShow);
        let showAllTitle = this.state.showAllCustomizations ? "Show Less" : "Show All";
        let showAllButton = template.customizations.length <= customizationCountToShow ? null :
            <Button label={showAllTitle} size="mini" flat={true} style="success"
                onclick={() => this.handleToggleShowAllClick()} />


        return (
            <GridCell width="1-3">
                <div className="md-color-blue-600">
                    {template.pivot.type === "SENDER" ? super.translate("Consignee & Locations") : super.translate("Sender & Locations")}
                </div>
                <ul className="md-list">
                    {
                        customizationsToShow.map(customization => {
                            let companyLocation = (customization.companyLocation && !_.isEqual(customization.companyLocation.id, customization.handlingLocation.id)) && <div className="uk-text-truncate uk-text-small">{customization.companyLocation.name}</div>;
                            let handlingCompany = (customization.handlingCompany && !_.isEqual(customization.company.id, customization.handlingCompany.id)) && <div className="uk-text-truncate uk-text-small">{customization.handlingCompany.name}</div>;
                            return (
                                <li key={uuid.v4()}>
                                    <div className="uk-text-bold">
                                        <div className="uk-text-truncate">
                                            {customization.company.name}
                                        </div>
                                        {companyLocation}
                                    </div>
                                    <div>
                                        <div className="uk-text-truncate" style={{ opacity: .8 }}>
                                            {customization.handlingLocation.name}
                                        </div>
                                        {handlingCompany}
                                    </div>
                                </li>
                            );
                        })
                    }
                </ul>
                {showAllButton}
            </GridCell>
        );

    }
}

ListTemplate.contextTypes = {
    router: React.PropTypes.object.isRequired,
    translator: PropTypes.object
};

TemplateListOwner.contextTypes = {
    translator: PropTypes.object
};

TemplateListPivot.contextTypes = {
    translator: PropTypes.object
};

TemplateListCustomization.contextTypes = {
    translator: PropTypes.object
};