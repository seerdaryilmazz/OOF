import React from 'react';
import _ from 'lodash';
import uuid from 'uuid';

import {Grid, GridCell, PageHeader, Card} from 'susam-components/layout'
import {Span, Button, Notify} from 'susam-components/basic'
import {TranslatingComponent} from 'susam-components/abstract'
import {CompanySearchAutoComplete} from 'susam-components/oneorder'

import {ProjectService} from '../services';

export class TemplateList extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    handleSelectCustomer(customer){

    }

    getProjectTemplate(project){

    }

    handleClickProject(project){
        this.props.onEdit && this.props.onEdit(project);
    }

    handleCreateNewTemplate(){
        this.props.onCreate && this.props.onCreate(this.state.customer);
    }

    renderTemplate(project){
        if(!project.template){
            return null;
        }
        return (
            <div>
                <Grid smallGutter = {true}>
                    <GridCell width="1-3">
                        <Grid smallGutter = {true}>
                            <GridCell width="1-3">
                                <Span label="Service Types" value = {project.template.serviceTypes.map(item => item.name).join(",")} />
                            </GridCell>
                            <GridCell width="1-3">
                                <Span label="Truck Load Types" value = {project.template.truckLoadTypes.map(item => item.name).join(",")} />
                            </GridCell>
                            <GridCell width="1-3">
                                <Span label="Incoterms" value = {project.template.incoterms.map(item => item.name).join(",")} />
                            </GridCell>
                        </Grid>
                    </GridCell>
                    <GridCell width="1-3">
                        <div className="uk-text-italic">{super.translate("Senders & Locations")}</div>
                        <ul className="md-list">
                            {
                                project.template.senderLocations.map(item => {
                                    return (
                                        <li key = {uuid.v4()}>
                                            <div className = "uk-text-bold" style = {{marginRight: "8px"}}>{item.senderCompany.name}</div>
                                            <span className = "uk-text-small uk-text-muted" style = {{marginRight: "8px"}}>{item.loadingCompany.name}</span>
                                            <span className = "uk-text-small uk-text-muted">{item.loadingLocation.name}</span>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </GridCell>
                    <GridCell width="1-3">
                        <div className="uk-text-italic">{super.translate("Consignees & Locations")}</div>
                        <ul className="md-list">
                            {
                                project.template.consigneeLocations.map(item => {
                                    return (
                                        <li key = {uuid.v4()}>
                                            <div className = "uk-text-bold" style = {{marginRight: "8px"}}>{item.consigneeCompany.name}</div>
                                            <span className = "uk-text-small uk-text-muted" style = {{marginRight: "8px"}}>{item.unloadingCompany.name}</span>
                                            <span className = "uk-text-small uk-text-muted">{item.unloadingLocation.name}</span>
                                        </li>
                                    );
                                })
                            }
                        </ul>
                    </GridCell>
                </Grid>
            </div>
        );
    }

    renderProject(project){
        return (
            <li key = {project.id}>
                <div className="md-list-content">
                    <div className="uk-text-large">
                        <span style = {{marginRight: "8px"}}>{project.name}</span>
                        <Button label="edit" flat = {true} size="small" style="success"
                                onclick = {() => this.handleClickProject(project)} />
                    </div>
                    {this.renderTemplate(project)}
                </div>
            </li>
        );
    }

    renderList(){
        if(!this.state.projects){
            return null;
        }
        if(this.state.projects.length === 0){
            return <div>{super.translate("There are no projects for this customer")}</div>;
        }

        return (
            <ul className="md-list">
                {this.state.projects.map(project => this.renderProject(project))}
            </ul>
        );
    }

    render(){

        return(
            <div>
                <PageHeader title="Templates" translate={true} />
                <Card>
                    <Grid divider = {true}>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-3">
                                    <CompanySearchAutoComplete label = "Customer" value = {this.state.customer}
                                                               onchange = {(value) => this.handleSelectCustomer(value)} />
                                </GridCell>
                                <GridCell width="1-6">
                                    <div className = "uk-margin-top">
                                        <Button label="Create new Template" size="small" style="success"
                                                onclick = {() => this.handleCreateNewTemplate()} />
                                    </div>
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