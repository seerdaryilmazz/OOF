import * as axios from 'axios';
import _ from 'lodash';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Notify, TextInput } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { convertLocationsWithPostalCodes } from "../Helper";
import { withAuthorization } from '../security';
import { AuthorizationService, Kartoteks, ProjectService } from '../services';
import { TemplateListOwner } from '../template/ListTemplate';
import { TemplateListCustomization } from '../template/order/ListTemplate';

const SecuredCreateButton = withAuthorization(Button, ["order.create"], {hideWhenNotAuthorized: true});

export class SelectTemplate extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.loadTemplateFields();
    }

    loadTemplateFields(){
        axios.all([
            ProjectService.listDistinctField("customer", "MULTI_PARTY", "ACTIVE"),
            AuthorizationService.getAuthorizedCompanies()
        ]).then(axios.spread((customers, authorizedCompanies) =>{
            let filteredCompanies = _.filter(customers.data, c=>_.find(authorizedCompanies.data, {id: c.id}));
            this.setState({
                authorizedCompanies: authorizedCompanies.data,
                templateCustomers: _.sortBy(filteredCompanies , "name"),
            })
        }))
    }

    handleClickTemplate(template){
        AuthorizationService.checkAuthorizedUserForOrder(template.customer.id).then(response=>{
            this.context.router.push(`/ui/order/create-order?templateId=${template.id}`);
        }).catch(error => Notify.showError(error));
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }
    updateTemplateOwner(value){
        let state = _.cloneDeep(this.state);
        state.owner = value;
        this.setState(state, () => {
            Kartoteks.getCompanyLocations(this.state.owner.id).then(response => {
                let locations = _.filter(response.data, i=> {
                    return 0 <= _.findIndex(this.state.templateLocations, l=> _.isEqual(i.id, l.id))
                });
                this.setState({ownerLocations: locations.map(item => convertLocationsWithPostalCodes(item))});
            })
        });
    }
    clearTemplateOwner(){
        let state = _.cloneDeep(this.state);
        state.owner = null;
        state.ownerLocations = [];
        this.setState(state);
    }

    handleSearch() {
        let filter = {
            customerId: this.state.customer ? this.state.customer.id : null,
            ownerId: this.state.owner ? this.state.owner.id : null,
            ownerLocationId: this.state.ownerLocation ? this.state.ownerLocation.id : null,
            name: this.state.name,
            type:"MULTI_PARTY",
            status: 'ACTIVE',
        };
        ProjectService.search(filter).then(response => {
            let filteredTemplates = _.filter(response.data, c=>_.find(this.state.authorizedCompanies, {id: c.customer.id}));
            this.setState({templates: filteredTemplates});
        }).catch(error => Notify.showError(error));
    }

    renderOrderTemplate(template){
        return (
            <li key = {template.id}>
                <div className="md-list-content">
                    <Grid>
                        <GridCell width = "1-1">
                            <h2 style = {{display: "inline", marginRight: "16px"}}>{template.name}</h2>
                            <SecuredCreateButton label="create order" flat = {true} size="small" style="success"
                                    onclick = {() => this.handleClickTemplate(template)} />
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
                {this.state.templates.map(template => this.renderOrderTemplate(template))}
            </ul>
        );
    }

    render(){

        return(
            <div>
                <PageHeader title="Select Template" translate={true}/>
                <Card>
                    <Grid divider = {true}>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-3">
                                    <DropDown   label = "Customer" placeholder="Search for company..." 
                                                onchange = {(value) => this.updateState("customer", value)}
                                                value={this.state.customer} options={this.state.templateCustomers} 
                                                labelField="name"/> 
                                </GridCell>
                                <GridCell width="1-3">
                                    <TextInput label = "Template Name" value = {this.state.name}
                                               uppercase = {true}
                                               onchange = {(value) => this.updateState("name", value)} />
                                </GridCell>
                                <GridCell width="1-3">
                                    <div className = "uk-margin-top">
                                        <Button label="search" style = "success" size = "small"
                                            onclick = {() => this.handleSearch()} />
                                    </div>
                                </GridCell>
                                <GridCell width="1-3" />

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
SelectTemplate.contextTypes = {
    router: React.PropTypes.object.isRequired,
    translator: React.PropTypes.object
};