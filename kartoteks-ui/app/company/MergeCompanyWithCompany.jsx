import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, Span} from 'susam-components/basic';
import {withAuthorization} from '../security';

import {CompanyService} from '../services/KartoteksService';

import {CompanyWizard} from './wizard/CompanyWizard';

const SecuredCompanyWizard = withAuthorization(CompanyWizard, "kartoteks.company.merge-with-company");

export class MergeCompanyWithCompany extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        CompanyService.getCompany(this.props.params.companyToMergeId).then(response => {
            let company = response.data;
            company.companyLocations.forEach(item => item._new = true);
            company.companyContacts.forEach(item => item._new = true);
            company.sectors.forEach(item => item._new = true);
            company.roles.forEach(item => item._new = true);
            company.activeRelations.forEach(item => item._new = true);
            this.setState({companyToMerge: company});
        }).catch(error => {
            Notify.showError(error);
        });

        CompanyService.getCompany(this.props.params.companyId).then(response => {
            this.setState({companyToEdit: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    saveCompany(company, onSuccess){
        this.setState({busy: true});
        CompanyService.mergeCompanyWithCompany(company, this.state.companyToMerge).then(response => {
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
                               mode = "MergeCompanyWithCompany"
                               onfinish = {(company, onSuccess) => this.saveCompany(company, onSuccess)}/>

            </div>
        );
    }
}
