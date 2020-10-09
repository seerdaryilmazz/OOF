import React from 'react';
import { Notify } from 'susam-components/basic';
import { ProjectService } from '../../services';
import { EditTemplate } from './EditTemplate';
import { ListTemplate } from './ListTemplate';

export class OrderTemplateManagement extends React.Component {
    constructor(props){
        super(props);
        this.state = {}
    }

    initializeTemplate() {
        return {
            customer: this.state.customer,
            ownerCompany: {},
            ownerLocation: {},
            defaults: {},
            consigneeCustomizations: [],
            senderCustomizations: [],
            type: "MULTI_PARTY"
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
        if(this.validate()){
            ProjectService.saveTemplate(this.state.templateToEdit).then(response => {
                Notify.showSuccess("Template saved");
                this.setState({templateToEdit: null});
            }).catch(error => Notify.showError(error));
        }
    }

    validate(){
        if(this.hasCustomization(this.state.templateToEdit.senderCustomizations) || this.hasCustomization(this.state.templateToEdit.consigneeCustomizations)){
            Notify.showError("There is only one Sender or Consignee option. It cannot be customized");
            return false;
        }
        return true;
    }

    hasCustomization(customizations){
        let isCustomized = false;
        customizations.forEach(customization =>{
            for(let key in customization.customizedDefaults) {
                if(customization.customizedDefaults.hasOwnProperty(key) && customization.customizedDefaults[key]){
                    isCustomized = true
                }
            }
        });
        return customizations.length === 1 && isCustomized;
    }
    
    render(){
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