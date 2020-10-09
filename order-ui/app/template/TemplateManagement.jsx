import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { ProjectService } from '../services/ProjectService';
import { EditTemplate } from './EditTemplate';
import { ListTemplate } from './ListTemplate';




export class TemplateManagement extends TranslatingComponent {

    state = {};

    initializeTemplate() {
        return {
            customer: this.state.customer,
            ownerCompany: {},
            ownerLocation: {},
            defaults: {},
            pivot: {company: {}, handlingCompany: {}, handlingLocation: {}},
            customizations: [],
            type: "PIVOT_PARTY"
        };
    }
    componentDidMount(){
        if(this.props.params.id){
            ProjectService.getTemplateById(this.props.params.id).then(response => {
                this.setState({templateToEdit: response.data});
            }).catch(error => Notify.showError(error));
        }
    }
    handleSave(){
        ProjectService.saveTemplate(this.state.templateToEdit).then(response => {
            Notify.showSuccess("Template saved");
            this.setState({templateToEdit: null});
        }).catch(error => Notify.showError(error));
    }

    render() {
        if (!this.state.templateToEdit) {
            return <ListTemplate customer = {this.state.customer}
                                 onEdit = {(template) => this.setState({templateToEdit: template})}
                                 onCustomerSelect = {(customer) => this.setState({customer: customer})}
                                 onCreate = {() => this.setState({templateToEdit: this.initializeTemplate()})}/>
        }else{
            return <EditTemplate template = {this.state.templateToEdit}
                                 onBack = {() => this.setState({templateToEdit: null})}
                                 onChange = {(template) => this.setState({templateToEdit: template})}
                                 onSave = {() => this.handleSave()}/>
        }
    }
}