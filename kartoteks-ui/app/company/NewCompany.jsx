import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, Loader} from "susam-components/layout";
import {Notify} from 'susam-components/basic';
import {withAuthorization} from '../security';

import {CompanyService} from '../services/KartoteksService';

import {CompanyWizard} from './wizard/CompanyWizard';

const SecuredCompanyWizard = withAuthorization(CompanyWizard, "kartoteks.company.create-company");

export class NewCompany extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {companyToEdit: {}, companyToMerge: {}};
    }

    componentDidMount(){

    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    saveCompany(company, onSuccess){
        this.setState({busy: true});
        let isModeCrm = (this.props.route.options || {}).mode === 'crm';
        CompanyService.saveCompany(company).then(response => {
            if(isModeCrm){
                const serializedData = JSON.stringify(response.data);
                parent.postMessage(serializedData, "*");
            }else{
                Notify.showSuccess("Company saved successfully");
                onSuccess(response);
            }
        }).catch(error => {
            console.log(JSON.stringify(company, null, 3));
            Notify.showError(error);
            this.setState({busy: false});
        });
    }

    getOrigin() {
        let isModeCrm = (this.props.route.options || {}).mode === 'crm';
        let origin = isModeCrm ? "CRM" : null;
        return origin;
    }

    render(){
        if(this.state.busy){
            return <Loader size="L" title="Saving Company"/>;
        }
        let pageHeader = (this.props.route.options || {}).mode !== 'crm' && <PageHeader title = "New Company"/>;
        return (
            <div>
                {pageHeader}
                <SecuredCompanyWizard companyToEdit = {this.state.companyToEdit}
                                      companyToMerge = {this.state.companyToMerge}
                                      mode="NewCompany"
                                      origin={this.getOrigin()}
                                      onfinish = {(company, onSuccess) => this.saveCompany(company, onSuccess)}/>
            </div>
        );
    }
}
