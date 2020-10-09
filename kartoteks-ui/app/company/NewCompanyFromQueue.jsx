import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, Span} from 'susam-components/basic';
import {withAuthorization} from '../security';

import {ImportQueueService} from '../services/KartoteksService';

import {CompanyWizard} from './wizard/CompanyWizard';

const SecuredCompanyWizard = withAuthorization(CompanyWizard, "kartoteks.company.create-company");

export class NewCompanyFromQueue extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        ImportQueueService.getCompanyFromQueue(this.props.params.queueId).then(response => {
            let companyToMerge = response.data;
            companyToMerge.companyLocations.forEach(item => item._new = true);
            companyToMerge.companyContacts.forEach(item => item._new = true);
            companyToMerge.sectors.forEach(item => item._new = true);
            companyToMerge.roles.forEach(item => item._new = true);
            companyToMerge.activeRelations.forEach(item => item._new = true);
            let companyToEdit = _.cloneDeep(companyToMerge);
            companyToEdit.companyLocations = [];
            companyToEdit.companyContacts = [];
            this.setState({companyToMerge: companyToMerge, companyToEdit: companyToEdit});
        }).catch(error => {
            Notify.showError(error);
        })

    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    completeQueueItem(company, onSuccess){
        this.setState({busy: true});
        ImportQueueService.completeQueueItem(this.props.params.queueId, company).then(response => {
            Notify.showSuccess("Company saved successfully");
            onSuccess(response);
        }).catch(error => {
            Notify.showError(error);
            this.setState({busy: false});
        });
    }

    render(){
        let title = "";
        if(this.state.companyToMerge){
            title = this.state.companyToMerge.name;
        }
        if(this.state.busy){
            return <Loader size="L" title="Saving Company"/>;
        }

        return (
            <div>
                <PageHeader title = {title}/>
                <SecuredCompanyWizard companyToEdit = {this.state.companyToEdit}
                               companyToMerge = {this.state.companyToMerge}
                               mode = "NewCompanyFromQueue"
                               onfinish = {(company, onSuccess) => this.completeQueueItem(company, onSuccess)}/>
            </div>
        );
    }
}
