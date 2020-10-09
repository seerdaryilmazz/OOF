import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, Span} from 'susam-components/basic';
import {withAuthorization} from '../security';

import {CompanyService} from '../services/KartoteksService';

import {CompanyWizard} from './wizard/CompanyWizard';

const SecuredCompanyWizard = withAuthorization(CompanyWizard, ["kartoteks.company.edit-company", "kartoteks.company.edit-temp-company"]);

export class EditCompany extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {companyToMerge: {}};
    }

    componentDidMount(){
        CompanyService.getCompany(this.props.params.companyId).then(response => {
            this.setState({companyToEdit: response.data});
        }).catch(error => {
            console.log(error);
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
        CompanyService.saveCompany(company).then(response => {
            Notify.showSuccess("Company saved successfully");
            onSuccess(response);
        }).catch(error => {
            console.log(JSON.stringify(company, null, 3));
            Notify.showError(error);
            this.setState({busy: false});
        });
    }

    getOrigin() {
        if (this.props.location.query && this.props.location.query.origin) {
            return this.props.location.query.origin;
        } else {
            return null;
        }
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
                <SecuredCompanyWizard
                            companyToEdit = {this.state.companyToEdit}
                            companyToMerge = {this.state.companyToMerge}
                            mode = "EditCompany"
                            origin = {this.getOrigin()}
                            onfinish = {(company, onSuccess) => this.saveCompany(company, onSuccess)}/>

            </div>
        );
    }
}
