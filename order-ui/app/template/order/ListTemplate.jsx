import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Checkbox, DropDown, Notify, RadioGroup } from 'susam-components/basic';
import { Card, Grid, GridCell, LoaderWrapper, PageHeader } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import uuid from 'uuid';
import { withAuthorization } from '../../security';
import { ProjectService } from '../../services';

const SecuredCreateButton = withAuthorization(Button, ["order.create-template"], {hideWhenNotAuthorized: true});
const SecuredEditButton = withAuthorization(Button, ["order.edit-template"], {hideWhenNotAuthorized: true});

export class ListTemplate extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.loadTemplateCustomers();
        if(this.props.customer){
            this.loadTemplatesOfCustomer();
        }
    }

    componentDidUpdate(prevProps, prevState){
        if(!_.isEqual(this.props.customer, prevProps.customer) || !_.isEqual(this.state.loadInactiveTemplates, prevState.loadInactiveTemplates)){
            this.loadTemplatesOfCustomer();
        }
    }

    loadTemplateCustomers(){
        ProjectService.listDistinctField("customer", "MULTI_PARTY").then(response=>{
            this.setState({templateCustomers: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    loadTemplatesOfCustomer(){
        if(!this.props.customer){
            return;
        }
        let status = null;
        if(!this.state.loadInactiveTemplates){
            status = 'ACTIVE';
        }
        this.setState({busy: true});
        ProjectService.getTemplatesForCustomer(this.props.customer.id, "MULTI_PARTY", status).then(response => {
            let templates = response.data;
            templates.forEach(template => {
                if(template.senderCustomizations){
                    template.senderCustomizations.forEach(item => item._key = uuid.v4());
                }
            });
            templates.forEach(template => {
                if(template.consigneeCustomizations){
                    template.consigneeCustomizations.forEach(item => item._key = uuid.v4());
                }
            });
            this.setState({templates: templates, busy: false});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handleClickTemplate(template){
        this.props.onEdit && this.props.onEdit(template);
    }
    handleCreateNewTemplate(){
        this.props.onCreate && this.props.onCreate(this.state.customer);
    }

    handleSelectCustomer(customer){
        this.props.onCustomerSelect(customer);
    }

    handleTemplateUpdateStatus(id, status){
        ProjectService.updateTemplateStatus(id, status).then(response => {
            this.loadTemplatesOfCustomer();
        }).catch(error => {
            Notify.showError(error);
        })
    }

    renderTemplate(template){
        let statusButtonStyle = {
            ACTIVE : {
                label: "deactivate",
                style: "danger",
                onclick: (id)=>Notify.confirm('Template will be deactivated. Are you sure?', ()=>this.handleTemplateUpdateStatus(id, 'INACTIVE'))
            }, 
            INACTIVE : {
                label: "activate",
                style: "primary",
                onclick: (id)=>Notify.confirm('Template will be activated. Are you sure?', ()=>this.handleTemplateUpdateStatus(id, 'ACTIVE'))
            }
        }
        return (
            <li key = {template.id}>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width = "1-1">
                            <h2 style = {{display: "inline", marginRight: "16px"}}>{template.name}</h2>
                            {template.status.id === 'ACTIVE' ?
                            <SecuredEditButton label="edit" flat = {true} size="small" style="success"
                                    onclick = {() => this.handleClickTemplate(template)} /> : null}
                            <SecuredEditButton label={statusButtonStyle[template.status.id].label} 
                                    flat={true} size="small"
                                    style={statusButtonStyle[template.status.id].style}
                                    onclick={()=>statusButtonStyle[template.status.id].onclick(template.id)} />
                        </GridCell>
                        <TemplateListOwner template = {template} />
                        <TemplateListCustomization customizations = {template.senderCustomizations} title="Sender & Locations" />
                        <TemplateListCustomization customizations = {template.consigneeCustomizations} title="Consignee & Locations" />
                    </Grid>
                </div>
            </li>
        );
    }

    renderList(){
        if(!this.state.templates){
            return null;
        }
        if(this.state.templates.length === 0){
            return <div>{super.translate("There are no templates for this customer")}</div>;
        }

        return (
            <ul className="md-list">
                {this.state.templates.map(template => this.renderTemplate(template))}
            </ul>
        );
    }

    render(){
        let customerList = this.state.searchInTemplateCustomer && this.state.searchInTemplateCustomer.id
            ? <DropDown label = "Customer" placeholder="Search for company..." onchange = {value => this.handleSelectCustomer(value)} value={this.props.customer} options={this.state.templateCustomers} labelField="name"/> 
            : <CompanySearchAutoComplete label = "Customer" value = {this.props.customer} onchange = {(value) => this.handleSelectCustomer(value)} />
        return(
            <div>
                <PageHeader title="Templates" translate={true} />
                <Card>
                    <Grid divider = {true}>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-1">
                                    <RadioGroup options={[{id:false, name: "All Companies"}, {id: true, name: "Template Customers"}, ]} 
                                        value={ this.state.searchInTemplateCustomer || {id: false }}
                                        inline={true} onchange={value=>this.setState({searchInTemplateCustomer: value})}/>
                                </GridCell>
                                <GridCell width="1-3">
                                    {customerList}
                                </GridCell>
                                <GridCell width="2-3">
                                    <div className = "uk-margin-top">
                                        <SecuredCreateButton label="Create new Template" size="small" style="success"
                                                onclick = {() => this.handleCreateNewTemplate()} />
                                    </div>
                                </GridCell>
                                <GridCell width="1-1">  
                                    <Checkbox label="Inactive Templates" value={this.state.loadInactiveTemplates}
                                        onchange={value => this.setState({loadInactiveTemplates: value })} />
                                </GridCell>
                                <GridCell width="1-1">
                                    <LoaderWrapper busy = {this.state.busy}>
                                        {this.renderList()}
                                    </LoaderWrapper>
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
    render(){
        if(!this.props.template){
            return null;
        }
        return (
            <GridCell width ="1-3">
                <div className = "md-color-blue-600">{super.translate("Template Owner")}</div>
                <div className = "uk-text-truncate uk-text-bold">
                    {this.props.template.ownerCompany.name}
                </div>
                <div className = "uk-text-truncate" style = {{opacity: .8}}>
                    {this.props.template.ownerLocation.name}
                </div>
            </GridCell>
        );
    }
}

export class TemplateListCustomization extends TranslatingComponent{
    state = {};

    handleToggleShowAllClick(){
        this.setState({showAllCustomizations: !this.state.showAllCustomizations});
    }

    render(){
        let {customizations} = this.props;
        if(!customizations){
            return null;
        }

        let customizationCountToShow = 3;
        let customizationsToShow = this.state.showAllCustomizations ? customizations : customizations.slice(0, customizationCountToShow);
        let showAllTitle = this.state.showAllCustomizations ? "Show Less" : "Show All";
        let showAllButton = customizations.length <= customizationCountToShow ? null :
            <Button label = {showAllTitle} size = "mini" flat = {true} style = "success"
                    onclick = {() => this.handleToggleShowAllClick()} />


        return(
            <GridCell width ="1-3">
                <div className = "md-color-blue-600">
                    {super.translate(this.props.title)}
                </div>
                <ul className = "md-list">
                    {
                        customizationsToShow.map(customization => {
                            let companyLocation = (customization.companyLocation) && !_.isEqual(customization.companyLocation.id, customization.handlingLocation.id) && <div className="uk-text-truncate uk-text-small">{customization.companyLocation.name}</div>;
                            let handlingCompany = (customization.handlingCompany && !_.isEqual(customization.company.id, customization.handlingCompany.id)) && <div className="uk-text-truncate uk-text-small">{customization.handlingCompany.name}</div>;
                            return (
                                <li key = {uuid.v4()}>
                                    <div className="uk-text-bold">
                                        <div className = "uk-text-truncate">
                                            {customization.company.name}
                                        </div>
                                        {companyLocation}
                                    </div>
                                    <div>
                                        <div className = "uk-text-truncate" style = {{opacity: .8}}>
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

TemplateListCustomization.contextTypes = {
    translator: PropTypes.object
};