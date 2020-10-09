import * as axios from 'axios';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Chip } from 'susam-components/advanced';
import { Button, Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, PageHeader } from 'susam-components/layout';
import { OrderService, ProjectService } from '../services';
import { ProjectForm } from './ProjectForm';
import { ProjectTemplateConsignee } from "./ProjectTemplateConsignee";
import { ProjectTemplateSender } from "./ProjectTemplateSender";
import { TemplateList } from './TemplateList';




export class TemplateManagement extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.loadData();
    }
    initializeTemplate(customer){
        return {customer: customer};
    }
    loadData(){
        axios.all([OrderService.getServiceTypes(),
            OrderService.getIncoTerms(),
            OrderService.getTruckLoadTypes()])
            .then(axios.spread((serviceTypes, incoterms, truckLoadTypes) => {
                let state = _.cloneDeep(this.state);
                state.serviceTypes = serviceTypes.data;
                state.incoterms = incoterms.data;
                state.truckLoadTypes = truckLoadTypes.data;
                this.setState(state);
            })).catch(error => {
            Notify.showError(error);
        });
    }



    handleEditTemplate(template){
        this.setState({templateToEdit: template, template: {}}, () => {
            ProjectService.getTemplateForProject(template).then(response => {
                if(response.data){
                    this.setState({template: response.data});
                }
            }).catch(error => {
                Notify.showError(error);
            });
        })

    }

    handleCreateNewTemplate(customer){
        this.setState({templateToEdit: this.initializeTemplate(customer), template: {}});
    }
    handleUpdateTemplate(template){
        this.setState({templateToEdit: template});
    }
    handleSaveTemplate(){
        ProjectService.saveProject(this.state.templateToEdit).then(response => {
            Notify.showSuccess("Template saved");
            this.setState({templateToEdit: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleUpdateTemplate(key, value){
        let template = _.cloneDeep(this.state.template);
        template[key] = value;
        this.setState({template: template});
    }

    handleSaveTemplate(){
        ProjectService.saveTemplateForProject(this.state.templateToEdit, this.state.template).then(response => {
            Notify.showSuccess("Template saved");
            this.setState({templateToEdit: null, template: null});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleCancelTemplate(){
        this.setState({templateToEdit: null, template: null});
    }

    renderTemplate(){
        if(!this.state.templateToEdit || !this.state.templateToEdit.id){
            return null;
        }
        return (
            <Grid>
                <GridCell width = "1-3">
                    <Chip label="Service Types" options = {this.state.serviceTypes}
                          valueField="code" value = {this.state.template.serviceTypes}
                          onchange = {(value) => this.handleUpdateTemplate("serviceTypes", value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <Chip label="Truck Load Types" options = {this.state.truckLoadTypes}
                          valueField="code" value = {this.state.template.truckLoadTypes}
                          onchange = {(value) => this.handleUpdateTemplate("truckLoadTypes", value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <Chip label="Incoterms" options = {this.state.incoterms}
                          valueField="code" value = {this.state.template.incoterms}
                          onchange = {(value) => this.handleUpdateTemplate("incoterms", value)} />
                </GridCell>
                <GridCell width = "1-2">
                    <ProjectTemplateSender project = {this.state.templateToEdit}
                                           senders = {this.state.template.senderLocations}
                                           onChange = {(value) => this.handleUpdateTemplate("senderLocations", value)}/>
                </GridCell>
                <GridCell width = "1-2">
                    <ProjectTemplateConsignee project = {this.state.templateToEdit}
                                           consignees = {this.state.template.consigneeLocations}
                                           onChange = {(value) => this.handleUpdateTemplate("consigneeLocations", value)}/>
                </GridCell>
                <GridCell width = "1-1">
                    <div className="uk-align-left">
                        <Button label="cancel" size = "small"
                                onclick = {() => this.handleCancelTemplate()} />
                    </div>
                    <div className="uk-align-right">
                        <Button label="save template" style = "primary" size = "small"
                            onclick = {() => this.handleSaveTemplate()} />
                    </div>
                </GridCell>
            </Grid>
        );
    }


    render(){
        if(!this.state.templateToEdit){
            return <TemplateList/>
        }
        let projectName = this.state.templateToEdit.name || "";
        return(
            <div>
                <PageHeader title={`${super.translate("Template")}: ${projectName}`} />
                <Card>
                    <Grid>
                        <GridCell width="1-1">
                            <ProjectForm project = {this.state.templateToEdit}
                                         onChange = {(project) => this.handleUpdateTemplate(project)}
                                         onSave = {() => this.handleSaveTemplate()}/>
                        </GridCell>
                        <GridCell width="1-1">
                            {this.renderTemplate()}
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }
}

TemplateManagement.contextTypes = {
    translator: PropTypes.object
};