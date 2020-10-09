import React from "react";
import _ from "lodash";
import * as axios from 'axios';

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, Span} from 'susam-components/basic';
import {withAuthorization} from '../security';

import {ImportQueueService, CompanyService} from '../services/KartoteksService';
import {CompanyWizard} from './wizard/CompanyWizard';
import {UpdateListPopulator} from './wizard/UpdateListPopulator';
import {CompanyContactUpdateConfig} from './wizard/contacts/CompanyContactUpdateList';

const SecuredCompanyWizard = withAuthorization(CompanyWizard, "kartoteks.company.merge-with-queue");

export class MergeCompanyWithQueue extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    isContactHasUpdate(contactFromQueue, currentContact){
        let populator = new UpdateListPopulator(currentContact, contactFromQueue, currentContact);
        let updateList = populator.populate(CompanyContactUpdateConfig);
        return updateList.length > 0;
    }
    findMatchingContact(contactsFromQueue, currentContact){
        return _.filter(contactsFromQueue, item => {
            return item.firstName.trim() == currentContact.firstName && item.lastName.trim() == currentContact.lastName;
        });
    }

    componentDidMount(){
        axios.all([
            ImportQueueService.getCompanyFromQueue(this.props.params.queueId),
            CompanyService.getCompany(this.props.params.companyId)]).then(
                axios.spread((queueResponse, companyResponse) => {
                    let queueCompany = queueResponse.data;
                    let company = companyResponse.data;
                    queueCompany.companyLocations.forEach(item => {
                        if(item.id){
                            item._updated = true;
                        }else{
                            item._new = true;
                        }
                    });
                    if(queueCompany.companyContacts){
                        queueCompany.companyContacts.forEach(item => {
                            if(item.id){
                                item._updated = true;
                            }else{
                                item._new = true;
                            }
                        });
                        if(company.companyContacts){
                            company.companyContacts.forEach(item => {
                                let matchingContacts = this.findMatchingContact(queueCompany.companyContacts, item);
                                matchingContacts.forEach(matchingContact => {
                                    let hasUpdate = this.isContactHasUpdate(matchingContact, item);
                                    if(!hasUpdate){
                                        matchingContact._remove = true;
                                    }
                                });
                            });
                            _.remove(queueCompany.companyContacts, {_remove: true});
                        }
                    }
                    if(queueCompany.sectors){
                        queueCompany.sectors.forEach(item => item._new = true);
                    }
                    if(queueCompany.roles){
                        queueCompany.roles.forEach(item => item._new = true);
                    }
                    if(queueCompany.activeRelations){
                        queueCompany.activeRelations.forEach(item => item._new = true);
                    }
                    this.setState({companyToMerge: queueCompany, companyToEdit: company});
        })).catch(error => {
            console.log(error);
            Notify.showError(error);
        });

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
        if(this.state.companyToEdit){
            title = this.state.companyToEdit.name;
        }
        if(this.state.busy){
            return <Loader size="L" title="Saving Company"/>;
        }

        return (
            <div>
                <PageHeader title = {title}/>
                <SecuredCompanyWizard companyToEdit = {this.state.companyToEdit}
                               companyToMerge = {this.state.companyToMerge}
                               mode = "MergeCompanyWithQueue"
                               onfinish = {(company, onSuccess) => this.completeQueueItem(company, onSuccess)}/>

            </div>
        );
    }
}
